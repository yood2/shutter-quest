"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CameraButton } from "@/app/pending/[questId]/components/camera-button"
import { getPendingQuests, completeQuest } from "@/utils/api"
import { useRouter } from "next/navigation"
import { use, useState, useEffect } from "react"
import { Quest } from "@/types/types"
import { useAuth } from "@/contexts/AuthContext"

export default function QuestDetailsPage({ params }: { params: Promise<{ questId: string }> }) {
  const router = useRouter()
  const { questId } = use(params)
  const { userId } = useAuth()
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [quest, setQuest] = useState<Quest | null>(null)
  const [loading, setLoading] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchQuest = async () => {
      if (!userId) return
      try {
        const quests = await getPendingQuests(userId)
        const foundQuest = quests.find(q => q.questId === Number(questId))
        setQuest(foundQuest || null)
      } catch (error) {
        console.error("Failed to fetch quest:", error)
        setQuest(null)
      } finally {
        setLoading(false)
      }
    }
    fetchQuest()
  }, [questId, userId])

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData)
  }

  const handleSubmit = async () => {
    if (!capturedImage || !userId) return
    setSubmitting(true)
    try {
      const base64Image = capturedImage.split(',')[1]
      await completeQuest(questId, userId, base64Image, elapsedTime)
      router.push("/completed")
    } catch (error) {
      console.error("Failed to complete quest:", error)
      alert("Failed to complete quest. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
        <div className="mx-auto max-w-md w-full">
          <p
            className="text-center text-[#3e2723] text-2xl animate-pulse"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Reading Scroll...
          </p>
        </div>
      </main>
    )
  }

  if (!quest) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
        <div className="mx-auto max-w-md w-full text-center">
          <h1 className="mb-6 text-2xl font-bold text-foreground">Quest Not Found</h1>
          <Button variant="outline2" onClick={() => router.push("/pending")}>
            Back to Pending Quests
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
      <div className="mx-auto max-w-md w-full">
        <Button
          variant="outline2"
          className="mb-4"
          onClick={() => router.push("/pending")}
        >
          ← Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Quest Details</span>
              <span className="text-m font-normal">
                {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
              </span>
            </CardTitle>
            <CardDescription>
              The Oracle demands to see:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="p-6 bg-[#f4dcb3] border-[4px] border-black shadow-[inset_0_0_0_4px_rgba(0,0,0,0.05)] relative"
              style={{ imageRendering: "pixelated" }}
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-black/20" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-black/20" />
              <p
                className="text-4xl text-center leading-none text-[#3e2723]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {quest.prompt}
              </p>
            </div>

            <div className="pt-4 flex flex-col items-center space-y-4">
              <div
                className="w-full aspect-[4/3] bg-[#d7ba8d] border-[4px] border-black overflow-hidden relative shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                style={{ imageRendering: "pixelated" }}
              >
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-[#3e2723]/40 text-2xl text-center px-6"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    [ The Oracle Awaits... ]
                  </div>
                )}

                {!capturedImage && (
                  <>
                    <div className="absolute top-4 left-4 w-4 h-4 border-l-[3px] border-t-[3px] border-black/30" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-r-[3px] border-b-[3px] border-black/30" />
                  </>
                )}
              </div>

              <div className="w-full flex gap-2">
                <CameraButton onImageCapture={handleImageCapture} />
                <Button
                  onClick={handleSubmit}
                  disabled={!capturedImage || submitting}
                  className="flex-1"
                >
                  {submitting ? "Submitting..." : "Submit Proof"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}