import { Quest, QuestDetails } from "@/types/types"

const url = process.env.NEXT_PUBLIC_URL || "http://127.0.0.1:5000"

export async function register(userId: string, password: string) {
    const response = await fetch(url + "/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ userId: userId, password }),
    })
    return response.json()
}

export async function login(userId: string, password: string) {
    const response = await fetch(url + "/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ userId: userId, password }),
    })
    return response.json()
}

export async function getPendingQuests(userId: string) : Promise<Quest[]> {
    const response = await fetch(url + `/api/pending-quests?userId=${userId}`,{
        method: "GET"
        })
    const data = await response.json();

    return data.quests;
}

export async function getCompletedQuests(userId: string): Promise<Quest[]> {
    const response = await fetch(url + `/api/completed-quests?userId=${userId}`,{
        method: "GET"
        })
    const data = await response.json();
    
    return data.quests;
}

export async function createQuest(prompt: string, hostId: string, userIds: string[], image: any, time: number) {
    const response = await fetch(url + "/api/create-quest", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ prompt: prompt, hostId: hostId, userIds: userIds, photo: image, time: time }),
    })
    return response.json()
}

export async function getPrompt() {
    const response = await fetch(url + "/api/get-prompt", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
        },
    })
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
}

export async function completeQuest(questId: string, userId: string, image: any, time: number) {
    const response = await fetch(url + "/api/complete-quest", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ questId: questId, userId: userId, photo: image, time: time }),
    })
    return response.json()
}

export async function getQuestDetails(questId: string): Promise<QuestDetails> {
    const response = await fetch(url + `/api/quest-details/${questId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
        },
    })
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
}

export async function getUser(userId: string): Promise<boolean> {
    try {
        const response = await fetch(`${url}/api/get-user?userId=${encodeURIComponent(userId)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
        
        if (response.status === 200) {
            return true
        } else if (response.status === 404) {
            return false
        } else {
            return false
        }
    } catch (error) {
        console.error("Error checking user:", error)
        return false
    }
}
