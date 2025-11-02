"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Box, Plane, Sphere, Text } from '@react-three/drei'
import { Suspense, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Animated farm field component
function FarmField({ position, cropType = 'corn', growth = 0.5 }: { 
  position: [number, number, number]
  cropType?: string 
  growth?: number 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  const colors = {
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
            ref={i === 0 ? meshRef : undefined}
            args={[0.2, growth * 2, 0.2]}
            position={[x, growth, z]}
          >
            <meshStandardMaterial color={colors[cropType as keyof typeof colors] || colors.corn} />
          </Box>
        )
      })}
    </group>
  )
}

// NASA data overlay component
function NASADataOverlay({ farmData }: { farmData?: any }) {
  return (
    <group position={[0, 4, 0]}>
      <Text
        color="#06b6d4"
        fontSize={0.5}
        maxWidth={200}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        NASA Farm Data
        {farmData?.location?.name && `\n${farmData.location.name}`}
      </Text>
    </group>
  )
}

// Weather indicator
function WeatherIndicator({ temperature = 22, humidity = 65 }: { temperature?: number, humidity?: number }) {
  return (
    <group position={[-6, 2, 0]}>
      <Sphere args={[0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.2} />
      </Sphere>
      <Text
        position={[0, -0.8, 0]}
        color="#f59e0b"
        fontSize={0.3}
        textAlign="center"
        anchorX="center"
      >
        {temperature}°C
      </Text>
    </group>
  )
}

// Soil moisture indicator
function SoilMoistureIndicator({ moisture = 45 }: { moisture?: number }) {
  return (
    <group position={[6, 2, 0]}>
      <Sphere args={[0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.2} />
      </Sphere>
      <Text
        position={[0, -0.8, 0]}
        color="#06b6d4"
        fontSize={0.3}
        textAlign="center"
        anchorX="center"
      >
        {moisture}%
      </Text>
    </group>
  )
}

// Main 3D Farm Scene
function Farm3DScene({ farmData, activeLayers, onFieldClick }: {
  farmData?: any
  activeLayers?: string[]
  onFieldClick?: (fieldId: string) => void
}) {
  const [selectedField, setSelectedField] = useState<string | null>(null)

  const handleFieldClick = (fieldId: string) => {
    setSelectedField(fieldId)
    onFieldClick?.(fieldId)
  }

  return (
    <>
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
      <FarmField 
        position={[-4, 0, -4]} 
        cropType="corn" 
        growth={0.8}
      />
      <FarmField 
        position={[4, 0, -4]} 
        cropType="wheat" 
        growth={0.6}
      />
      <FarmField 
        position={[-4, 0, 4]} 
        cropType="soybeans" 
        growth={0.7}
      />
      <FarmField 
        position={[4, 0, 4]} 
        cropType="cotton" 
        growth={0.5}
      />

      {/* NASA Data Overlay */}
      <NASADataOverlay farmData={farmData} />
      
      {/* Weather and Soil Indicators */}
      <WeatherIndicator 
        temperature={farmData?.realTimeData?.temperature?.[0]?.value || 22}
      />
      <SoilMoistureIndicator 
        moisture={farmData?.realTimeData?.soilMoisture?.[0]?.value * 100 || 45}
      />

      {/* Ground */}
      <Plane
        args={[20, 20]}
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
    </>
  )
}

// Loading fallback
function Loading3D() {
  return (
    <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-xl">
      <div className="text-center text-white">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-semibold mb-2">Loading 3D Farm Scene...</p>
        <p className="text-sm text-gray-300">Initializing NASA data visualization</p>
      </div>
    </div>
  )
}

// Main Working Farm 3D Component
export function WorkingFarm3D({ farmData, activeLayers, onFieldClick }: {
  farmData?: any
  activeLayers?: string[]
  onFieldClick?: (fieldId: string) => void
}) {
  return (
    <div className="w-full h-96 rounded-xl overflow-hidden">
      <Suspense fallback={<Loading3D />}>
        <Canvas
          camera={{ position: [8, 6, 8], fov: 60 }}
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <Farm3DScene 
            farmData={farmData}
            activeLayers={activeLayers}
            onFieldClick={onFieldClick}
          />
        </Canvas>
      </Suspense>
    </div>
  )
}

export default WorkingFarm3D