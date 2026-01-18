from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import os
from dotenv import load_dotenv
from src.DBHelper import DBHelper
from utils import *
from prompts import PROMPTS
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

db_helper = DBHelper(
    url=os.getenv('SUPABASE_URL'),
    key=os.getenv('SUPABASE_KEY')
)

def _check_and_distribute_points(quest_id):
    quest_data = db_helper.get_quest_details(str(quest_id))
    
    if not quest_data or not quest_data.get('participants'):
        return

    participants = quest_data.get('participants', [])
    
    # Check if all participants have a score
    all_scored = all(p.get('score') is not None for p in participants)
    
    if all_scored:
        winner_id = None
        best_score = -1
        best_time = float('inf')

        for p in participants:
            p_score = p.get('score')
            p_time = p.get('timetaken')
            
            if p_score is not None:
                if p_score > best_score:
                    best_score = p_score
                    best_time = p_time
                    winner_id = p.get('userid')
                elif p_score == best_score and p_time < best_time:
                    best_time = p_time
                    winner_id = p.get('userid')
        
        if winner_id:
            db_helper.increment_points(winner_id, 1)
            print(f"Awarded 1 point to winner: {winner_id} for quest: {quest_id}")

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    user_id = data.get('userId')
    password = data.get('password')

    if not user_id or not password:
        return jsonify({
            'message': 'userID and password are required'
        }), 400

    user_data = {
        'userid': user_id,
        'password': password
    }

    if db_helper.get_user(user_id):
        return jsonify({
            'message': 'User already exists'
        }), 400
    
    result = db_helper.insert_user(user_data)
    
    return jsonify({
        'message': 'User registered successfully',
        'userId': result.get('userid')
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user_id = data.get('userId')
    password = data.get('password')

    if not user_id or not password:
        return jsonify({
            'message': 'userID and password are required'
        }), 400

    user = db_helper.get_user(user_id)
    
    if not user:
        return jsonify({
            'message': 'Invalid userID or password'
        }), 401
    
    if user.get('password') != password:
        return jsonify({
            'message': 'Invalid userID or password'
        }), 401
    
    return jsonify({
        'message': 'Login successful'
    }), 200

@app.route('/api/get-user', methods=['GET'])
def get_user():
    user_id = request.args.get('userId')
    user = db_helper.get_user(user_id)
    if user:
        return jsonify({
            'message': 'User exists'
        }), 200
    else:
        return jsonify({
            'message': 'User does not exist'
        }), 404
        
@app.route('/api/pending-quests', methods=['GET'])
def get_pending_quests():
    user_id = request.args.get('userId')

    if not user_id:
        return jsonify({
            'message': 'userId is required'
        }), 400

    participant_rows = db_helper.get_quests_pending(user_id)
    
    if not participant_rows:
        return jsonify({'quests': []}), 200
    
    quest_ids = [row['questid'] for row in participant_rows]
    
    formatted_quests = []
    for quest_id in quest_ids:
        quest = db_helper.get_quest(quest_id)
        if quest:
            formatted_quests.append({
                'questId': quest.get('questid'),
                'prompt': quest.get('prompt'),
                'hostId': quest.get('hostid')
            })
    
    return jsonify({'quests': formatted_quests}), 200

@app.route('/api/completed-quests', methods=['GET'])
def get_completed_quests():
    user_id = request.args.get('userId')

    if not user_id:
        return jsonify({
            'message': 'userId is required'
        }), 400

    participant_rows = db_helper.get_quests_completed(user_id)
    
    if not participant_rows:
        return jsonify({'quests': []}), 200
    
    quest_ids = [row['questid'] for row in participant_rows]
    
    formatted_quests = []
    for quest_id in quest_ids:
        quest = db_helper.get_quest(quest_id)
        if quest:
            formatted_quests.append({
                'questId': quest.get('questid'),
                'prompt': quest.get('prompt'),
                'hostId': quest.get('hostid')
            })
    
    return jsonify({'quests': formatted_quests}), 200

@app.route('/api/create-quest', methods=['POST', 'OPTIONS'])
def create_quest():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        host_id = data.get('hostId')
        user_ids = data.get('userIds')
        image = data.get('image') 
        time = data.get('time')
        
        import time as time_module
        
        quest_data = {
            'prompt': prompt,
            'datecreated': int(time_module.time()),
            'hostid': host_id
        }
        
        quest_result = db_helper.insert_quest(quest_data)
        quest_id = quest_result.get('questid')
        
        participants_data = []

        score = get_clip_score(image, prompt)
        
        for user_id in user_ids:
            participant = {
                'questid': quest_id,
                'userid': user_id,
                'score': None,
                'timetaken': None
            }
            participants_data.append(participant)
        
        host = {
            'questid': quest_id,
            'userid': host_id,
            'score': score,
            'timetaken': time
        }
        participants_data.append(host)
        db_helper.insert_participants(participants_data)
        write_image(image, quest_id, host_id)
        
        return jsonify({
            'message': 'Quest created successfully',
            'questId': quest_id,
            'score': score,
            'timetaken': time
        }), 201
    except Exception as e:
        print(f"Error in create_quest: {str(e)}")
        return jsonify({
            'message': 'Failed to create quest',
            'error': str(e)
        }), 500

@app.route('/api/get-prompt', methods=['GET'])
def get_prompt():
    prompt = random.choice(PROMPTS)
    
    return jsonify({
        'prompt': prompt
    }), 200

@app.route('/api/complete-quest', methods=['POST'])
def complete_quest():
    data = request.get_json()
    quest_id = data.get('questId')
    user_id = data.get('userId')
    photo = data.get('image')
    time = data.get('time')
    
    quest = db_helper.get_quest_details(quest_id)
    if not quest:
        return jsonify({'message': 'Quest not found'}), 404

    score = get_clip_score(photo, quest['prompt'])
    update_data = {
        'score': score,
        'timetaken': time,
    }
    
    db_helper.update_participants(quest_id, update_data, user_id)
    write_image(photo, quest_id, user_id)
    _check_and_distribute_points(quest_id)
    
    return jsonify({
        'message': 'Quest completed successfully',
        'score': score
    }), 200

@app.route('/api/quest-details/<int:quest_id>', methods=['GET'])
def get_quest_details(quest_id):
    # 1. Call DBHelper (Convert int to str because DBHelper expects str)
    quest_data = db_helper.get_quest_details(str(quest_id))
    
    # 2. Handle case where quest is not found
    if not quest_data:
        return jsonify({"error": "Quest not found"}), 404

    # 3. Map Participants from DB format to Frontend format
    #    DB: timetaken -> Frontend: time
    #    DB: userid    -> Frontend: userId
    #    DB: questid   -> Frontend: questId
    mapped_participants = []
    
    # We need to calculate the winner. 
    # Logic: Highest score wins. If tie, lowest time wins.
    winner_id = None
    best_score = -1
    best_time = float('inf')

    raw_participants = quest_data.get('participants', [])

    for p in raw_participants:
        # Create the participant object for frontend
        mapped_p = {
            'questId': p.get('questid'),
            'userId': p.get('userid'),
            'score': p.get('score'),
            'time': p.get('timetaken')
        }
        mapped_participants.append(mapped_p)

        # Logic to determine winner
        # Skip if score is None (participant hasn't finished)
        p_score = p.get('score')
        p_time = p.get('timetaken')
        
        if p_score is not None:
            # Check for higher score OR (equal score AND faster time)
            if p_score > best_score:
                best_score = p_score
                best_time = p_time
                winner_id = p.get('userid')
            elif p_score == best_score and p_time < best_time:
                best_time = p_time
                winner_id = p.get('userid')

    # 4. Construct final object matching QuestDetails interface
    response_data = {
        'questId': quest_data.get('questid'),
        'prompt': quest_data.get('prompt'),
        'hostId': quest_data.get('hostid'),
        'date': quest_data.get('datecreated'), # Mapping datecreated -> date
        'winner': winner_id,                   # Calculated field
        'participants': mapped_participants
    }
    
    return jsonify(response_data), 200

@app.route('/api/get-points', methods=['GET'])
def get_points():
    user_id = request.args.get('userId')

    if not user_id:
        return jsonify({
            'message': 'userId is required'
        }), 400

    points = db_helper.get_points(user_id)
    
    if points is None:
        return jsonify({
            'message': 'User not found or has no points'
        }), 404
    
    return jsonify({
        'points': points
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
