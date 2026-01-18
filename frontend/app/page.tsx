"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useRef } from "react"
import { getPoints } from "@/utils/api"

/**
 * Main RPG Menu Page
 * Refactored to utilize the Bulletin Board Card as the primary container.
 * Points are displayed within a themed status panel.
 */

export default function Page() {
  const router = useRouter()
  const { userId, logout, points, setPoints } = useAuth()
  const prevPointsRef = useRef(points);

  useEffect(() => {
    if (points > prevPointsRef.current) {
      const audio = new Audio('/increase.mp3');
      audio.play().catch(error => {
        console.log('Audio autoplay prevented:', error);
      });
    }
    prevPointsRef.current = points;
  }, [points]);

  useEffect(() => {
    if (userId) {
      const fetchPoints = async () => {
        try {
          const userPoints = await getPoints(userId)
          setPoints(userPoints)
        } catch (error) {
          console.error("Failed to fetch points:", error)
          setPoints(-1)
        }
      }

      fetchPoints()
      const interval = setInterval(fetchPoints, 30000)

      return () => clearInterval(interval)
    }
  }, [userId, setPoints])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md w-full">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between border-b-4 border-black/10">
            <CardTitle className="text-4xl">Shutter Quest</CardTitle>
            <Button 
              onClick={logout}
              variant="outline"
              size="xs"
              className="text-xl"
            >
              Logout
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            {/* User Status Panel */}
            {userId && (
              <div 
                className="bg-[#e6ccb2] border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] text-center"
                style={{ imageRendering: "pixelated" }}
              >
                <p 
                    className="text-2xl tracking-tighter opacity-80 leading-none mb-1" 
                    style={{ fontFamily: "var(--font-heading)" }}
                >
                  Adventurer: {userId}
                </p>
                <p 
                    className="text-4xl text-[#5d4037] leading-none" 
                    style={{ fontFamily: "var(--font-body)" }}
                >
                  {points} Gold Points
                </p>
              </div>
            )}
            
            {/* Navigation Menu */}
            <div className="flex flex-col gap-4">
              <Button 
                onClick={() => router.push("/create")}
                size="lg"
                className="w-full text-3xl"
              >
                Create Quest
              </Button>
              
              <Button 
                onClick={() => router.push("/pending")}
                variant="outline"
                size="lg"
                className="w-full text-3xl"
              >
                Pending Quests
              </Button>
              
              <Button 
                onClick={() => router.push("/completed")}
                variant="outline"
                size="lg"
                className="w-full text-3xl"
              >
                Completed Quests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}