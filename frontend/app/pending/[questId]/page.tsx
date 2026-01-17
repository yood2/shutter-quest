"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CameraButton } from "@/app/pending/[questId]/components/camera-button"
import { getPendingQuests } from "@/utils/api"
import { useRouter } from "next/navigation"
import { use, useState } from "react"

export default function QuestDetailsPage({ params }: { params: Promise<{ questId: string }> }) {
  const router = useRouter()
  const { questId } = use(params)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  
  const quest = getPendingQuests("testUserId").find(q => q.questId === questId)

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData)
  }

  const handleSubmit = () => {
    if (!capturedImage) return
    console.log("Submitting quest with image:", capturedImage.substring(0, 50) + "...")
    // todo
  }

  if (!quest) {
    return (
      <main className="min-h-screen bg-background px-4 py-6">
        <div className="mx-auto max-w-md">
          <h1 className="mb-6 text-2xl font-bold text-foreground">Quest Not Found</h1>
          <Button onClick={() => router.push("/pending")}>
            Back to Pending Quests
          </Button>
        </div> 
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-md">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => router.push("/pending")}
        >
          ← Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Prompt: {quest.prompt}</CardTitle>
            <CardDescription>Take a photo of the above prompt!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="pt-4 flex flex-col items-center space-y-4">
              <div className="w-full aspect-[4/3] bg-muted rounded-lg border overflow-hidden">
                {capturedImage ? (
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No photo taken yet
                  </div>
                )}
              </div>
              <div className="w-full flex gap-2">
                <CameraButton onImageCapture={handleImageCapture} />
                <Button 
                  onClick={handleSubmit}
                  disabled={!capturedImage}
                  className="flex-1"
                >
                  Submit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}