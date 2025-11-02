"use client"

import { useEffect, useState, Suspense } from 'react'
import { Loader2, Satellite } from 'lucide-react'

// Loading component
function Farm3DLoading() {
  return (
    <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-xl border border-blue-500/20">
      <div className="text-center text-white">
        <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-400" />
        <p className="text-lg font-semibold mb-2">Loading 3D Farm Scene...</p>
        <p className="text-sm text-gray-300">Initializing Three.js and NASA data</p>
      </div>
    </div>
  )
}

// Three.js Farm Scene Component
function ThreeFarmScene({ farmData, activeLayers, onFieldClick }: {
  farmData?: any
  activeLayers?: string[]
  onFieldClick?: (fieldId: string) => void
}) {
  const [Canvas, setCanvas] = useState<any>(null)
  const [drei, setDrei] = useState<any>(null)
  const [THREE, setTHREE] = useState<any>(null)

  useEffect(() => {
    let mounted = true

    // Dynamically load all Three.js dependencies
    const loadThreeJS = async () => {
      try {
        // Load Three.js first
        const threeModule = await import('three')
        if (!mounted) return

        // Make Three available globally (required by some libraries)
        if (typeof window !== 'undefined') {
          (window as any).THREE = threeModule
        }

        // Load React Three Fiber
        const fiberModule = await import('@react-three/fiber')
        if (!mounted) return

        // Load React Three Drei
        const dreiModule = await import('@react-three/drei')
        if (!mounted) return

        // Set all modules
        setTHREE(threeModule)
        setCanvas(fiberModule.Canvas)
        setDrei(dreiModule)
      } catch (error) {
        console.error('Failed to load Three.js:', error)
      }
    }

    loadThreeJS()

    return () => {
      mounted = false
    }
  }, [])

  if (!Canvas || !drei || !THREE) {
    return <Farm3DLoading />
  }

  // Now we can safely create 3D components
  const { OrbitControls, Environment, Box, Plane, Sphere, Text } = drei

  // Farm Field Component
  function FarmField({ position, cropType = 'corn', growth = 0.8 }: { 
    position: [number, number, number]
    cropType?: string 
    growth?: number 
  }) {
    const colors: Record<string, string> = {
      corn: '#4ade80',
      wheat: '#fbbf24', 
      soybeans: '#22c55e',
      cotton: '#f8fafc'
    }

    return (
      <group position={position}>
        {/* Field base */}
        <Plane
          args={[4, 4]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial color="#8b5cf6" />
        </Plane>
        
        {/* Crops */}
        {Array.from({ length: 16 }, (_, i) => {
          const x = (i % 4) - 1.5
          const z = Math.floor(i / 4) - 1.5
          return (
            <Box
              key={i}
              args={[0.2, growth * 2, 0.2]}
              position={[x, growth, z]}
              onClick={() => onFieldClick?.(`field-${position.join('-')}-crop-${i}`)}
            >
              <meshStandardMaterial color={colors[cropType] || colors.corn} />
            </Box>
          )
        })}
      </group>
    )
  }

  // NASA Data Display
  function NASADataDisplay() {
    return (
      <group position={[0, 6, 0]}>
        {Text && (
          <Text
            color="#06b6d4"
            fontSize={0.8}
            maxWidth={200}
            lineHeight={1}
            letterSpacing={0.02}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
          >
            NASA Farm Visualization
            {farmData?.location?.name && `\n📍 ${farmData.location.name}`}
            {activeLayers && `\n🛰️ Active Layers: ${activeLayers.length}`}
          </Text>
        )}
      </group>
    )
  }

  // Weather and Soil Indicators  
  function DataIndicators() {
    const temp = farmData?.realTimeData?.temperature?.[0]?.value || 22
    const moisture = (farmData?.realTimeData?.soilMoisture?.[0]?.value || 0.45) * 100

    return (
      <group>
        {/* Temperature */}
        <group position={[-8, 3, 0]}>
          <Sphere args={[0.4]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
          </Sphere>
          {Text && (
            <Text
              position={[0, -1, 0]}
              color="#f59e0b"
              fontSize={0.4}
              textAlign="center"
              anchorX="center"
            >
              🌡️ {temp.toFixed(1)}°C
            </Text>
          )}
        </group>

        {/* Soil Moisture */}
        <group position={[8, 3, 0]}>
          <Sphere args={[0.4]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.3} />
          </Sphere>
          {Text && (
            <Text
              position={[0, -1, 0]}
              color="#06b6d4"
              fontSize={0.4}
              textAlign="center"
              anchorX="center"
            >
              💧 {moisture.toFixed(0)}%
            </Text>
          )}
        </group>
      </group>
    )
  }

  // Main 3D Scene
  return (
    <div className="w-full h-96 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [12, 8, 12], fov: 60 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Farm Fields */}
          <FarmField position={[-5, 0, -5]} cropType="corn" growth={0.8} />
          <FarmField position={[5, 0, -5]} cropType="wheat" growth={0.6} />
          <FarmField position={[-5, 0, 5]} cropType="soybeans" growth={0.7} />
          <FarmField position={[5, 0, 5]} cropType="cotton" growth={0.5} />

          {/* NASA Data Overlay */}
          <NASADataDisplay />
          
          {/* Data Indicators */}
          <DataIndicators />

          {/* Ground */}
          <Plane
            args={[25, 25]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.1, 0]}
          >
            <meshStandardMaterial color="#1e293b" />
          </Plane>

          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0, 0]}
          />

          {/* Environment */}
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Main Export Component
export function SafeThreeFarm({ farmData, activeLayers, onFieldClick }: {
  farmData?: any
  activeLayers?: string[]
  onFieldClick?: (fieldId: string) => void
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <Farm3DLoading />
  }

  return (
    <ThreeFarmScene 
      farmData={farmData}
      activeLayers={activeLayers}
      onFieldClick={onFieldClick}
    />
  )
}

export default SafeThreeFarm