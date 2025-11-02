"use client"

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function TestCube() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export function Simple3DTest() {
  return (
    <div className="h-96 w-full">
      <Suspense fallback={<div>Loading 3D...</div>}>
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <TestCube />
          <OrbitControls />
        </Canvas>
      </Suspense>
    </div>
  )
}

export default Simple3DTest