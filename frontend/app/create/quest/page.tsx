"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CameraButton } from "@/app/pending/[questId]/components/camera-button"
import { getPrompt } from "@/utils/api"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function CreateQuestPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [prompt, setPrompt] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [invitedUsers, setInvitedUsers] = useState<string[]>([])
    const [elapsedTime, setElapsedTime] = useState(0)

    // Timer effect - starts when component mounts
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime((prev) => prev + 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        // Get invited users from query params
        const invitedUsersParam = searchParams.get('invitedUsers')
        if (invitedUsersParam) {
            try {
                const users = JSON.parse(decodeURIComponent(invitedUsersParam))
                setInvitedUsers(users)
            } catch (error) {
                console.error("Failed to parse invited users:", error)
            }
        }

        const fetchPrompt = async () => {
            try {
                const response = await getPrompt()
                setPrompt(response.prompt)
            } catch (error) {
                console.error("Failed to fetch prompt:", error)
                setPrompt("Failed to load prompt")
            } finally {
                setLoading(false)
            }
        }

        fetchPrompt()
    }, [searchParams])

    const handleImageCapture = (imageData: string) => {
        setCapturedImage(imageData)
    }

    const handleCreateQuest = () => {
        if (!capturedImage) return
        console.log("Creating quest with image:", capturedImage.substring(0, 50) + "...")
        console.log("Inviting users:", invitedUsers)
        // TODO: Implement quest creation logic
    }

    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
            <div className="mx-auto max-w-md w-full">
                <Button 
                    variant="ghost" 
                    className="mb-4"
                    onClick={() => router.push("/create")}
                >
                    ← Back
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Create Quest</span>
                            <span className="text-sm font-normal">
                                {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                            </span>
                        </CardTitle>
                        <CardDescription>
                            Take a photo of the prompt
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <p className="text-center text-muted-foreground">Loading prompt...</p>
                        ) : (
                            <>
                                <div className="p-6 bg-muted rounded-lg">
                                    <p className="text-lg font-medium text-center">{prompt}</p>
                                </div>
                            </>
                        )}

                        

                        {invitedUsers.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Invited Users:</p>
                                <div className="flex flex-wrap gap-2">
                                    {invitedUsers.map((userId) => (
                                        <span 
                                            key={userId} 
                                            className="text-xs bg-muted px-2 py-1 rounded"
                                        >
                                            {userId}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

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
                                    onClick={handleCreateQuest}
                                    disabled={!capturedImage || loading}
                                    className="flex-1"
                                >
                                    Submit Quest
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
