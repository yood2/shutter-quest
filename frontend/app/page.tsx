"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function Page() {
  const router = useRouter()
  const { userId, logout } = useAuth()

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="mx-auto max-w-md w-full space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground">Shutter Quest</h1>
          <Button 
            onClick={logout}
            variant="ghost"
            size="sm"
          >
            Logout
          </Button>
        </div>
        
        {userId && (
          <p className="text-sm text-muted-foreground text-center">
            Welcome, {userId}!
          </p>
        )}
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => router.push("/create")}
            size="lg"
            className="w-full"
          >
            Create Quest
          </Button>
          
          <Button 
            onClick={() => router.push("/pending")}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Pending Quests
          </Button>
          
          <Button 
            onClick={() => router.push("/completed")}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Completed Quests
          </Button>
        </div>
      </div>
    </main>
  )
}