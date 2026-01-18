"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCompletedQuests } from "@/utils/api"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect } from "react"
import { Quest } from "@/types/types"
import { useState } from "react"


export default function CompletedPage() {
  const router = useRouter()
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const auth = useAuth();
  const handleQuestClick = (questId: number) => {
    router.push(`/completed/${questId}`)
  }

  const fetchData = async () => {
    if (auth.isAuthenticated && auth.userId) {
      const quests = await getCompletedQuests(auth.userId);
      console.log("Completed page: ");
      console.log(quests)
      setCompletedQuests(quests);
    }
  };  

  useEffect(() => {
    fetchData()
  }, []);
  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-md">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/")}
        >
          ← Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Completed Quests</CardTitle>
            <CardDescription>View your completed quests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {completedQuests.map((quest) => (
                <Button
                  key={quest.questId}
                  variant="outline"
                  className="w-full justify-start text-left bg-transparent"
                  onClick={() => handleQuestClick(quest.questId)}
                >
                  {quest.hostId}
                </Button>
              ))}

              {completedQuests.length === 0 && (
                <p className="text-center text-muted-foreground">No completed quests available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}