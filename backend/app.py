from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import os
from dotenv import load_dotenv
from src.DBHelper import DBHelper
from utils import get_clip_score
load_dotenv()

app = Flask(__name__)
CORS(app)

db_helper = DBHelper(
    url=os.getenv('SUPABASE_URL'),
    key=os.getenv('SUPABASE_KEY')
)

PROMPTS = [
    ("a red car", "not a red car"),
    ("a fluffy cat", "not a fluffy cat"),
    ("a snowy mountain", "not a snowy mountain")
]

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

@app.route('/api/create-quest', methods=['POST'])
def create_quest():
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
    
    if host_id not in user_ids:
        user_ids.append(host_id)
    
    participants_data = []

    score = get_clip_score(image, prompt)
    
    for user_id in user_ids:
        participant = {
            'questid': quest_id,
            'userid': user_id,
            'score': None,
            'timetaken': None,
            'photo': None
        }
        participants_data.append(participant)
    
    host = {
        'questid': quest_id,
        'userid': host_id,
        'score': score,
        'timetaken': time,
        'photo': image
    }
    participants_data.append(host)
    db_helper.insert_participants(participants_data)
    
    return jsonify({
        'message': 'Quest created successfully',
        'questId': quest_id
    }), 201

@app.route('/api/get-prompt', methods=['GET'])
def get_prompt():
    prompt_pair = random.choice(PROMPTS)
    
    return jsonify({
        'prompt': prompt_pair[0],
        'not_prompt': prompt_pair[1]
    }), 200

@app.route('/api/complete-quest', methods=['POST'])
def complete_quest():
    data = request.get_json()
    quest_id = data.get('questId')
    user_id = data.get('userId')
    photo = data.get('photo')
    time = data.get('time')
    
    quest = get_quest_details(quest_id)
    score = get_clip_score(photo, quest['prompt']),
    update_data = {
        'score': score,
        'timetaken': time,
        'photo': photo
    }
    
    db_helper.update_participants(quest_id, update_data, user_id)
    
    return jsonify({
        'message': 'Quest completed successfully',
        'score': score
    }), 200

@app.route('/api/quest-details/<int:quest_id>', methods=['GET'])
def get_quest_details(quest_id):
    # TODO: Call DBHelper to get quest details
    
    return jsonify({
        'questId': quest_id,
        'prompt': None,
        'hostId': None,
        'date': None,
        'participants': []
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
