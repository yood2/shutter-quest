from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import os
import base64
from dotenv import load_dotenv
from src.DBHelper import DBHelper

load_dotenv()

def serialize_image_to_bytea(image_data):
    if image_data.startswith('data:image'):
        image_data = image_data.split(',')[1]
    
    binary_data = base64.b64decode(image_data)
    postgres_hex = "\\x" + binary_data.hex()
    
    return postgres_hex

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
    user_id = data.get('userID')
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
        'user_id': result.get('userid')
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user_id = data.get('userID')
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
    user_id = request.args.get('userID')

    if not user_id:
        return jsonify({
            'message': 'userID is required'
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
                'quest_id': quest.get('questid'),
                'prompt': quest.get('prompt'),
                'host_id': quest.get('hostid')
            })
    
    return jsonify({'quests': formatted_quests}), 200

@app.route('/api/completed-quests', methods=['GET'])
def get_completed_quests():
    user_id = request.args.get('userID')

    if not user_id:
        return jsonify({
            'message': 'userID is required'
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
                'quest_id': quest.get('questid'),
                'prompt': quest.get('prompt'),
                'host_id': quest.get('hostid')
            })
    
    return jsonify({'quests': formatted_quests}), 200

@app.route('/api/create-quest', methods=['POST'])
def create_quest():
    data = request.get_json()
    prompt = data.get('prompt')
    host_id = data.get('host_id')
    user_ids = data.get('user_ids')
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

    # TODO: Use CLIP for score (confidence score)

    serialized_image = serialize_image_to_bytea(image)
    
    for user_id in user_ids:
        participant = {
            'questid': quest_id,
            'userid': user_id,
            'score': None, # TODO
            'timetaken': time if user_id == host_id else None,
            'photo': serialized_image if user_id == host_id else None
        }
        participants_data.append(participant)
    
    db_helper.insert_participants(participants_data)
    
    return jsonify({
        'message': 'Quest created successfully',
        'quest_id': quest_id
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
    quest_id = data.get('quest_id')
    user_id = data.get('user_id')
    image = data.get('image')
    time = data.get('time')

    # TODO: Call DBHelper to update participant
    
    return jsonify({
        'message': 'Quest completed successfully',
        'score': None
    }), 200

@app.route('/api/quest-details/<int:quest_id>', methods=['GET'])
def get_quest_details(quest_id):
    # TODO: Call DBHelper to get quest details
    
    return jsonify({
        'quest_id': quest_id,
        'prompt': None,
        'host_id': None,
        'date': None,
        'participants': []
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
