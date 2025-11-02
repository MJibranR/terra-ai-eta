"use client"

import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  Sky, 
  useGLTF, 
  Instances, 
  Instance,
  Text3D,
  Center,
  Float
} from '@react-three/drei'
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing'
import { useRef, useState, useEffect, useMemo, Suspense } from 'react'
import { useControls } from 'leva'
import { NASA_GIBS_LAYERS } from '@/lib/nasa-gibs-config-safe'

// Make THREE available globally
if (typeof window !== 'undefined') {
  window.THREE = THREE
}

// Crop growth stages and types
const CROP_TYPES = {
  CORN: {
    name: 'Corn',
    color: '#4ade80',
    stages: ['Seedling', 'Growth', 'Mature', 'Harvest']
  },
  WHEAT: {
    name: 'Wheat',
    color: '#fbbf24',
    stages: ['Sprouting', 'Tillering', 'Heading', 'Ripening']
  }
}

function FarmScene({ data, ...props }) {
  const [scene, setScene] = useState(null)
  
  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputEncoding: THREE.sRGBEncoding
      }}
      camera={{ position: [20, 20, 20], fov: 60 }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <Sky sunPosition={[100, 20, 100]} />
        <Environment preset="sunset" />
        
        {/* Your existing scene components here */}
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 0, 0]}
        />
        
        <EffectComposer>
          <Bloom intensity={0.5} />
          <SSAO />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}

export default FarmScene