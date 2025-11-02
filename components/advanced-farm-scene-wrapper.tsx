"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Dynamically import the actual scene component with no SSR
const Scene = dynamic(() => import('./advanced-farm-scene-inner'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-xl border border-blue-500/20">
      <div className="text-center text-white">
        <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-400" />
        <p className="text-lg font-semibold mb-2">Loading Advanced Farm Scene...</p>
        <p className="text-sm text-gray-300">Initializing 3D environment</p>
      </div>
    </div>
  )
})

export default function AdvancedFarmScene(props: any) {
  return (
    <Suspense fallback={null}>
      <Scene {...props} />
    </Suspense>
  )
}