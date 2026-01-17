# DBHelper.py
from typing import Any, Dict, List, Optional
from supabase import create_client, Client

class DBHelper:
    client: Client

    def __init__(self, url: str, key: str) -> None:
        self.client = create_client(url, key)

    def insert_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.client.table("users").insert(user_data).execute()
        return response.data[0] if response.data else {}

    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        response = self.client.table("users").select("*").eq("id", user_id).execute()
        return response.data[0] if response.data else None

    def update_participants(self, quest_id: str, participant_updates: Dict[str, Any]) -> List[Dict[str, Any]]:
        response = self.client.table("participants").update(participant_updates).eq("quest_id", quest_id).execute()
        return response.data

    def insert_quest(self, quest_data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.client.table("quests").insert(quest_data).execute()
        return response.data[0] if response.data else {}

    def insert_participants(self, participants_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        response = self.client.table("participants").insert(participants_data).execute()
        return response.data

    def get_quest(self, quest_id: str) -> Optional[Dict[str, Any]]:
        response = self.client.table("quests").select("*").eq("id", quest_id).execute()
        return response.data[0] if response.data else None

    def get_quest_details(self, quest_id: str) -> Dict[str, Any]:
        # Assumes Foreign Key relation: participants.quest_id -> quests.id
        response = self.client.table("quests").select("*, participants(*)").eq("id", quest_id).execute()
        return response.data[0] if response.data else {}