"use client"

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Box, Plane, Text } from '@react-three/drei'
import { Loader2 } from 'lucide-react'

// Simple 3D Farm Field
function SimpleFarmField({ position, cropType, color }: {
  position: [number, number, number]
  cropType: string
  color: string
}) {
  return (
    <group position={position}>
      <Box args={[1.5, 0.3, 1.5]}>
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </Box>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {cropType}
      </Text>
    </group>
  )
}

// Simple 3D Scene that works immediately
function Simple3DScene() {
  const fields = [
    { position: [-2, 0, -2] as [number, number, number], crop: 'Corn', color: '#f59e0b' },
    { position: [2, 0, -2] as [number, number, number], crop: 'Soybeans', color: '#10b981' },
    { position: [-2, 0, 2] as [number, number, number], crop: 'Wheat', color: '#eab308' },
    { position: [2, 0, 2] as [number, number, number], crop: 'Cotton', color: '#f3f4f6' },
  ]

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Ground */}
      <Plane
        args={[12, 12]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.2, 0]}
      >
        <meshStandardMaterial color="#2d3748" />
      </Plane>

      {/* Farm Fields */}
      {fields.map((field, index) => (
        <SimpleFarmField
          key={index}
          position={field.position}
          cropType={field.crop}
          color={field.color}
        />
      ))}

      {/* NASA Data Indicator */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color="#3b82f6"
        anchorX="center"
        anchorY="middle"
      >
        NASA Farm Simulation
      </Text>

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

// Loading component
function LoadingScene() {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-900/20 to-green-900/20">
      <div className="text-center text-white">
        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-400" />
        <div className="text-sm">Loading 3D Farm Scene...</div>
      </div>
    </div>
  )
}

// Main Simple Working 3D Component
export default function SimpleWorking3D() {
  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-blue-500/30 bg-black/20">
      <Suspense fallback={<LoadingScene />}>
        <Canvas
          camera={{ position: [6, 4, 6], fov: 60 }}
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <Simple3DScene />
        </Canvas>
      </Suspense>
    </div>
  )
}