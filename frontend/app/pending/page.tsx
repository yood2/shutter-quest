"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getPendingQuests } from "@/utils/api"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useContext } from "react"
import { useEffect } from "react"
import { Quest } from "@/types/types"

export default function PendingPage() {
  const router = useRouter()
  const [selectedQuestId, setSelectedQuestId] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const auth = useAuth();
  const [pendingQuests, setPendingQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (auth.isAuthenticated && auth.userId) {
      setIsLoading(true);
      const quests = await getPendingQuests(auth.userId);
      console.log("Pending page: " );
      console.log(quests)
      setPendingQuests(quests);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData()
  }, [auth.isAuthenticated, auth.userId]);

  const handleQuestClick = (questId: number) => {
    setSelectedQuestId(questId)
    setIsDialogOpen(true)
  }

  const handleConfirm = () => {
    if (selectedQuestId) {
      router.push(`/pending/${selectedQuestId}`)
    }
    setIsDialogOpen(false)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setSelectedQuestId(null)
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-md">
        <Button
          variant="outline2"
          className="mb-4"
          onClick={() => router.push("/")}
        >
          ← Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Pending Quests</CardTitle>
            <CardDescription>Select a quest to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {isLoading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : (
                <>
                  {pendingQuests.map((quest) => (
                    <Button
                      key={quest.questId}
                      variant="outline"
                      className="w-full justify-start text-left bg-transparent"
                      onClick={() => handleQuestClick(quest.questId)}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span>Invited By: {quest.hostId}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(quest.date * 1000).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </Button>
                  ))}
                  {pendingQuests.length === 0 && (
                    <p className="text-center text-muted-foreground">No pending quests available</p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start Quest?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to start this quest? Once started, leaving the page will forfeit the quest!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>Start Quest</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  )
}