"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface Safe3DLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export function Safe3DLoader({ children, fallback, className = "" }: Safe3DLoaderProps) {
  const [isClient, setIsClient] = useState(false)
  const [threeLoaded, setThreeLoaded] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const loadThree = async () => {
      try {
        const THREE = await import("three")

        // ✅ safely attach THREE to window
        if (typeof window !== "undefined") {
          if (!window.THREE) {
            window.THREE = THREE
          }
        }

        setThreeLoaded(true)
      } catch (error) {
        console.error("Failed to load Three.js:", error)
      }
    }

    if (isClient) {
      loadThree()
    }
  }, [isClient])

  const defaultFallback = (
    <Card className={`bg-black/80 backdrop-blur-xl border border-blue-500/30 ${className}`}>
      <CardContent className="p-0">
        <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-xl">
          <div className="text-center text-white">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-400" />
            <p className="text-lg font-semibold mb-2">Loading 3D Environment...</p>
            <p className="text-sm text-gray-300">Initializing Three.js</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!isClient || !threeLoaded) {
    return fallback || defaultFallback
  }

  return <>{children}</>
}