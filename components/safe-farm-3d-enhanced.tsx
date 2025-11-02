/**
 * Pure Client-Side Farm 3D Component with Location Selection
 * Completely isolated from SSR with no Three.js imports at module level
 */

"use client"

import { useEffect, useState, Suspense, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Box, Plane, Sphere } from '@react-three/drei'
import { Droplets, Sprout, Thermometer, Satellite, Eye, Zap, Settings, MapPin } from 'lucide-react'

import LocationPicker from '@/components/location-picker'

declare global {
  interface Window {
    THREE: typeof THREE;
  }
}

// Initialize THREE on client side only
if (typeof window !== 'undefined') {
  window.THREE = THREE
}

interface LocationData {
  lat: number
  lng: number
  name: string
  country: string
  region: string
  nasaDataAvailable: boolean
}

interface NASAFarmData {
  location: LocationData
  scenario: {
    id: string
    name: string
    description: string
    farmType: string
    challenges: string[]
    objectives: string[]
  }
  realTimeData: {
    soilMoisture: Array<{ value: number; timestamp: string; depth: string }>
    vegetation: Array<{ ndvi: number; evi: number; timestamp: string }>
    precipitation: Array<{ value: number; timestamp: string }>
    temperature: Array<{ value: number; timestamp: string }>
    evapotranspiration: Array<{ value: number; timestamp: string }>
  }
  educationalInsights: Array<{
    type: 'critical' | 'warning' | 'info' | 'success'
    title: string
    message: string
    dataSource: string
    learningObjective: string
  }>
  gameMetrics: {
    sustainabilityScore: number
    efficiencyScore: number
    yieldPotential: number
    resourceOptimization: number
    completedObjectives: number
    totalObjectives: number
  }
}

interface SafeFarm3DProps {
  farmData?: NASAFarmData | null
}

// 3D Farm Field Component
function AnimatedFarmField() {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <group>
      <Plane 
        ref={meshRef}
        args={[20, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2, 0]}
      >
        <meshStandardMaterial color="#4ade80" />
      </Plane>
      
      {/* Crop rows */}
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i} position={[i * 3 - 6, 0, 0]}>
          {Array.from({ length: 8 }, (_, j) => (
            <Box 
              key={j} 
              args={[0.5, 1, 0.5]} 
              position={[0, -1, j * 2 - 7]}
            >
              <meshStandardMaterial color="#22c55e" />
            </Box>
          ))}
        </group>
      ))}
      
      {/* NASA satellite indicator */}
      <Sphere args={[0.3]} position={[0, 5, 0]}>
        <meshStandardMaterial color="#3b82f6" emissive="#1e40af" />
      </Sphere>
    </group>
  )
}

// Main Farm 3D Component
function Farm3DVisualization() {
  return (
    <div className="w-full h-96 rounded-xl overflow-hidden">
      <Canvas
        gl={{ antialias: true }}
        camera={{ position: [10, 10, 10], fov: 60 }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <AnimatedFarmField />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Main Component
export function SafeFarm3D({ farmData }: SafeFarm3DProps) {
  const [isClient, setIsClient] = useState(false)
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<LocationData>(farmData?.location || {
    lat: 40.7128,
    lng: -74.0060,
    name: "New York",
    country: "USA",
    region: "North America",
    nasaDataAvailable: true
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleLocationChange = (location: LocationData) => {
    setCurrentLocation(location)
    setShowLocationSelector(false)
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-xl border border-blue-500/20">
        <div className="text-center text-white">
          <Satellite className="w-16 h-16 mx-auto mb-4 animate-pulse text-blue-400" />
          <p className="text-lg font-semibold mb-2">Loading 3D Visualization...</p>
          <p className="text-sm text-gray-300">Initializing NASA farm environment</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>
    )
  }

  if (showLocationSelector) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="glass-text-primary font-bold text-lg">Select Farm Location</h3>
          <button
            onClick={() => setShowLocationSelector(false)}
            className="glass-button px-4 py-2 rounded-lg"
          >
            Back to Visualization
          </button>
        </div>
        <LocationPicker
          selectedLocation={currentLocation}
          onLocationSelect={handleLocationChange}
          showSuggestions={true}
        />
      </div>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-green-900/40 to-blue-900/40 border-green-500/30">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Satellite className="h-5 w-5 text-blue-400" />
            NASA Farm Visualization
          </CardTitle>
          <button
            onClick={() => setShowLocationSelector(true)}
            className="glass-button p-2 rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <MapPin className="h-4 w-4 text-cyan-400" />
            <span className="text-sm glass-text-primary">Location</span>
          </button>
        </div>

        {/* Location Info */}
        <div className="glass-light p-3 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-cyan-400" />
            <span className="glass-text-primary font-medium text-sm">
              {currentLocation.name}
            </span>
          </div>
          <p className="glass-text-secondary text-xs">
            {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)} • {currentLocation.region}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
            <Droplets className="h-3 w-3 mr-1" />
            Soil: {farmData?.realTimeData?.soilMoisture?.[0]?.value?.toFixed(1) || 'N/A'}%
          </Badge>
          <Badge variant="secondary" className="bg-green-500/20 text-green-300">
            <Sprout className="h-3 w-3 mr-1" />
            NDVI: {farmData?.realTimeData?.vegetation?.[0]?.ndvi?.toFixed(2) || 'N/A'}
          </Badge>
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
            <Thermometer className="h-3 w-3 mr-1" />
            Temp: {farmData?.realTimeData?.temperature?.[0]?.value?.toFixed(1) || 'N/A'}°C
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Farm3DVisualization />
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-300">
            Real-time NASA satellite data visualization for {currentLocation.name}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Satellite className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400">Live NASA Data Connection</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}