"use client"

import { Button } from "@/components/ui/button"
import { getPendingQuests } from "@/utils/api"
import { useRouter } from "next/navigation"

const pendingQuests = getPendingQuests("testUserId")

export default function PendingPage() {
  const router = useRouter()

  const handleQuestClick = (questId: string) => {
    router.push(`/pending/${questId}`)
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Pending Quests</h1>

        <div className="flex flex-col gap-3">
          {pendingQuests.map((quest) => (
            <Button
              key={quest.questId}
              variant="outline"
              className="w-full justify-start text-left bg-transparent"
              onClick={() => handleQuestClick(quest.questId)}
            >
              {quest.hostId}
            </Button>
          ))}

          {pendingQuests.length === 0 && (
            <p className="text-center text-muted-foreground">No pending quests available</p>
          )}
        </div>
      </div>
    </main>
  )
}