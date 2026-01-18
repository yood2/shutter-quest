"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CameraButton } from "@/app/pending/[questId]/components/camera-button"
import { getPrompt, createQuest } from "@/utils/api"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"

export default function CreateQuestPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const auth = useAuth()
    const [prompt, setPrompt] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [invitedUsers, setInvitedUsers] = useState<string[]>([])
    const [elapsedTime, setElapsedTime] = useState(0)
    const [submitting, setSubmitting] = useState(false)

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

    const handleCreateQuest = async () => {
        if (!capturedImage || !auth.userId || !prompt) return

        setSubmitting(true)
        try {
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64Image = capturedImage.split(',')[1]

            console.log(base64Image)

            const response = await createQuest(
                prompt,
                auth.userId,
                invitedUsers,
                base64Image,
                elapsedTime
            )

            console.log("Quest created successfully:", response)

            // Redirect to home or pending quests page
            router.push("/")
        } catch (error) {
            console.error("Failed to create quest:", error)
            alert("Failed to create quest. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
            <div className="mx-auto max-w-md w-full">
                <Button
                    variant="outline2"
                    className="mb-4"
                    onClick={() => router.push("/create")}
                >
                    ← Back
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>New Quest</span>
                            <span className="text-m font-normal">
                                {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                            </span>
                        </CardTitle>
                        <CardDescription>
                            The Oracle demands to see: 
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <p
                                className="text-center text-[#3e2723] text-2xl animate-pulse"
                                style={{ fontFamily: "var(--font-body)" }}
                            >
                                Reading Scroll...
                            </p>
                        ) : (
                            <div
                                className="p-6 bg-[#f4dcb3] border-[4px] border-black shadow-[inset_0_0_0_4px_rgba(0,0,0,0.05)] relative"
                                style={{ imageRendering: "pixelated" }}
                            >
                                {/* Decorative corner accents */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-black/20" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-black/20" />

                                <p
                                    className="text-4xl text-center leading-none text-[#3e2723]"
                                    style={{ fontFamily: "var(--font-heading)" }}
                                >
                                    {prompt}
                                </p>
                            </div>
                        )}
                        {invitedUsers.length > 0 && (
                            <div className="space-y-3">
                                <p
                                    className="text-2xl tracking-tighter text-[#3e2723]"
                                    style={{ fontFamily: "var(--font-heading)" }}
                                >
                                    Current Party:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {invitedUsers.map((userId) => (
                                        <span
                                            key={userId}
                                            className="text-xl bg-[#5d4037] text-[#f4dcb3] px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                                            style={{ fontFamily: "var(--font-body)" }}
                                        >
                                            {userId}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 flex flex-col items-center space-y-4">
                            <div className="pt-4 flex flex-col items-center space-y-4">
                                <div
                                    className=
                                    "w-full aspect-[4/3] bg-[#d7ba8d] border-[4px] border-black overflow-hidden relative shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.2)]"
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

                                    {/* Viewfinder corners */}
                                    {!capturedImage && (
                                        <>
                                            <div className="absolute top-4 left-4 w-4 h-4 border-l-[3px] border-t-[3px] border-black/30" />
                                            <div className="absolute bottom-4 right-4 w-4 h-4 border-r-[3px] border-b-[3px] border-black/30" />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="w-full flex gap-2">
                                <CameraButton onImageCapture={handleImageCapture} />
                                <Button
                                    onClick={handleCreateQuest}
                                    disabled={!capturedImage || loading || submitting || !auth.userId}
                                    className="flex-1"
                                >
                                    {submitting ? "Creating..." : "Submit Quest"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
