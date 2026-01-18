"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { X } from "lucide-react"
import { Participant, QuestDetails } from "@/types/types"
import { getQuestDetails, getImage } from "@/utils/api"
import { useRouter } from "next/navigation"
import { use, useState, useEffect } from "react"

export default function QuestDetailsPage({ params }: { params: Promise<{ questId: string }> }) {
  const router = useRouter()
  const { questId } = use(params)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [quest, setQuest] = useState<QuestDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchQuest = async () => {
      try {
        const questData = await getQuestDetails(questId)
        setQuest(questData)
      } catch (error) {
        console.error("Failed to fetch quest:", error)
        setQuest(null)
      } finally {
        setLoading(false)
      }
    }
    fetchQuest()
  }, [questId])

  useEffect(() => {
    if (selectedParticipant) {
      const fetchImage = async () => {
        setIsImageLoading(true)
        try {
          const imageBase64 = await getImage(questId, selectedParticipant.userId)
          setSelectedImage(`data:image/jpeg;base64,${imageBase64}`)
        } catch (error) {
          console.error("Failed to fetch image:", error)
          setSelectedImage(null)
        } finally {
          setIsImageLoading(false)
        }
      }
      fetchImage()
    }
  }, [selectedParticipant, questId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-6">
        <div className="mx-auto max-w-md">
          <p className="text-center text-muted-foreground">Loading quest...</p>
        </div>
      </main>
    )
  }

  if (!quest) {
    return (
      <main className="min-h-screen bg-background px-4 py-6">
        <div className="mx-auto max-w-md">
          <h1 className="mb-6 text-2xl font-bold text-foreground">Quest Not Found</h1>
          <Button onClick={() => router.push("/completed")}>
            Back to Completed Quests
          </Button>
        </div>
      </main>
    )
  }

  const participants = quest.participants || []
  const winner = quest.winner

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-md">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/completed")}
        >
          ← Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Prompt: {quest.prompt}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adventurer</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Time (s)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant, index) => {
                    const isWinner = participant.userId === winner
                    return (
                      <TableRow
                        key={index}
                        className={`cursor-pointer ${isWinner ? 'bg-green-100 hover:bg-green-200 dark:bg-green-950 dark:hover:bg-green-900' : ''}`}
                        onClick={() => setSelectedParticipant(participant)}
                      >
                        <TableCell>{participant.userId}{isWinner && ' 🏆'}</TableCell>
                        <TableCell>{participant.score ?? 'N/A'}</TableCell>
                        <TableCell>{participant.time ?? 'N/A'}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={!!selectedParticipant} onOpenChange={(open) => {
          if (!open) {
            setSelectedParticipant(null);
            setSelectedImage(null);
          }
        }}>
          <AlertDialogContent className="max-w-2xl">
            <button
              onClick={() => setSelectedParticipant(null)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            <AlertDialogHeader>
              <AlertDialogTitle>{selectedParticipant?.userId}&apos;s Photo</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="flex flex-col items-center space-y-4">
              {isImageLoading ? (
                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Loading image...</p>
                </div>
              ) : selectedImage ? (
                <img
                  src={selectedImage}
                  alt={`${selectedParticipant?.userId}'s submission`}
                  className="max-w-full h-auto rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">No photo available</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 w-full text-sm">
                <div>
                  <p className="font-semibold">Score:</p>
                  <p>{selectedParticipant?.score}</p>
                </div>
                <div>
                  <p className="font-semibold">Time:</p>
                  <p>{selectedParticipant?.time}s</p>
                </div>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  )
}