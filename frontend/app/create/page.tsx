"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { getUser } from "@/utils/api"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CreatePage() {
    const router = useRouter()
    const [invitedUsers, setInvitedUsers] = useState<string[]>([])
    const [currentUserId, setCurrentUserId] = useState<string>("")
    const [addingUser, setAddingUser] = useState(false)
    const [userError, setUserError] = useState<string>("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleAddUser = async () => {
        if (!currentUserId.trim()) {
            setUserError("Please enter a user ID")
            return
        }

        if (invitedUsers.includes(currentUserId)) {
            setUserError("User already added")
            return
        }

        setAddingUser(true)
        setUserError("")

        try {
            const userExists = await getUser(currentUserId)
            
            if (userExists) {
                setInvitedUsers([...invitedUsers, currentUserId])
                setCurrentUserId("")
                setUserError("")
            } else {
                setUserError("User does not exist")
            }
        } catch (error) {
            setUserError("Error checking user")
            console.error("Error adding user:", error)
        } finally {
            setAddingUser(false)
        }
    }

    const handleRemoveUser = (userId: string) => {
        setInvitedUsers(invitedUsers.filter(id => id !== userId))
    }

    const handleStartQuestClick = () => {
        setIsDialogOpen(true)
    }

    const handleConfirm = () => {
        setIsDialogOpen(false)
        // Pass invited users to the quest page via state
        router.push(`/create/quest?invitedUsers=${encodeURIComponent(JSON.stringify(invitedUsers))}`)
    }

    const handleCancel = () => {
        setIsDialogOpen(false)
    }

    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
            <div className="mx-auto max-w-md w-full">
                <Button 
                    variant="outline2" 
                    className="mb-4"
                    onClick={() => router.push("/")}
                >
                    ← Back
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Invite Friends</CardTitle>
                        <CardDescription>Add friends to your quest before starting</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="w-full space-y-3">
                            <Label htmlFor="inviteUsers">Invite Users</Label>
                            
                            {/* Invited users list */}
                            {invitedUsers.length > 0 && (
                                <div className="space-y-2">
                                    {invitedUsers.map((userId) => (
                                        <div 
                                            key={userId} 
                                            className="flex items-center justify-between p-2 bg-muted rounded-md"
                                        >
                                            <span className="text-sm">{userId}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveUser(userId)}
                                                className="h-6 px-2"
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add user input */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        id="inviteUsers"
                                        type="text"
                                        placeholder="Enter user ID"
                                        value={currentUserId}
                                        onChange={(e) => {
                                            setCurrentUserId(e.target.value)
                                            setUserError("")
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleAddUser()
                                            }
                                        }}
                                    />
                                    {userError && (
                                        <p className="text-sm text-destructive mt-1">{userError}</p>
                                    )}
                                </div>
                                <Button
                                    onClick={handleAddUser}
                                    disabled={addingUser || !currentUserId.trim()}
                                    variant="outline"
                                >
                                    {addingUser ? "..." : "Add"}
                                </Button>
                            </div>
                        </div>

                        <Button 
                            onClick={handleStartQuestClick}
                            className="w-full"
                        >
                            Start Quest
                        </Button>
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
                            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </main>
    )
}