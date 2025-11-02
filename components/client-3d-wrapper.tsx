"use client"

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Loading component
const Loading3D = () => (
  <div className="glass-container h-96 flex items-center justify-center">
    <div className="neon-loader"></div>
    <span className="glass-text-secondary ml-4">Loading 3D Visualization...</span>
  </div>
)

// Dynamically import 3D components to avoid SSR issues
const SafeFarm3DEnhanced = dynamic(
  () => import('@/components/safe-farm-3d-enhanced').then(mod => ({ default: mod.SafeFarm3D })),
  {
    ssr: false,
    loading: Loading3D
  }
)

interface Client3DWrapperProps {
  farmData?: any
  className?: string
}

export function Client3DWrapper({ farmData, className = "" }: Client3DWrapperProps) {
  return (
    <div className={`relative ${className}`}>
      <Suspense fallback={<Loading3D />}>
        <SafeFarm3DEnhanced farmData={farmData} />
      </Suspense>
    </div>
  )
}

export default Client3DWrapper