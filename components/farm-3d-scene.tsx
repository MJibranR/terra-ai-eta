"use client"

import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Html, PerspectiveCamera } from '@react-three/drei'
import { Suspense, useRef, useEffect } from 'react'

// Make THREE available globally
if (typeof window !== 'undefined') {
  window.THREE = THREE
}

declare global {
  interface Window {
    THREE: typeof THREE;
  }
}

function Farm3DScene() {
  const scene = useRef()

  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputEncoding: THREE.sRGBEncoding
      }}
      camera={{ position: [0, 5, 10], fov: 75 }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls />
        <Environment preset="sunset" />
        {/* Add your 3D scene components here */}
      </Suspense>
    </Canvas>
  )
}

export default Farm3DScene