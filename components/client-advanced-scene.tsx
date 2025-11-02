/**
 * Client-Side Advanced Farm Scene Wrapper
 * Ensures advanced 3D components only render on the client
 */

"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Satellite } from "lucide-react"

// Import reliable 3D component with CSS fallback
import ReliableNASAFarm3D from "@/components/reliable-nasa-terrain"

interface ClientAdvancedSceneProps {
  activeLayers?: string[]
  farmData?: any
  onFieldClick?: (fieldId: string) => void
}

export default function ClientAdvancedScene({ activeLayers, farmData, onFieldClick }: ClientAdvancedSceneProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-xl border border-blue-500/20">
        <div className="text-center text-white">
          <Satellite className="w-16 h-16 mx-auto mb-4 animate-pulse text-blue-400" />
          <p className="text-lg font-semibold mb-2">Preparing 3D Environment...</p>
          <p className="text-sm text-gray-300">Client-side WebGL required</p>
        </div>
      </div>
    )
  }

  return (
    <ReliableNASAFarm3D 
      farmData={farmData}
      activeLayers={activeLayers}
      onFieldClick={onFieldClick}
    />
  )
}