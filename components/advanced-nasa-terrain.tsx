"use client"

import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  Sky, 
  useTexture,
  Text,
  Html,
  Cloud
} from '@react-three/drei'
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing'
import { NASA_LAYERS } from '@/lib/nasa-layers'
import { EnhancedNASAClient } from '@/lib/enhanced-nasa-client'

// Enhanced terrain mesh with multiple NASA data layers
function TerrainMesh({ nasaData, selectedLayers }: { 
  nasaData: any
  selectedLayers: string[] 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const uniforms = useRef({
    ndviData: { value: new THREE.DataTexture(new Float32Array(256 * 256), 256, 256, THREE.RedFormat) },
    soilData: { value: new THREE.DataTexture(new Float32Array(256 * 256), 256, 256, THREE.RedFormat) },
    tempData: { value: new THREE.DataTexture(new Float32Array(256 * 256), 256, 256, THREE.RedFormat) },
    precipData: { value: new THREE.DataTexture(new Float32Array(256 * 256), 256, 256, THREE.RedFormat) },
    time: { value: 0 }
  })

  // Custom shader material for terrain visualization
  const terrainMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms.current,
    vertexShader: /* glsl */`
      varying vec2 vUv;
      varying float vElevation;
      uniform sampler2D ndviData;
      uniform sampler2D soilData;

      void main() {
        vUv = uv;
        vec4 ndvi = texture2D(ndviData, uv);
        vec4 soil = texture2D(soilData, uv);
        
        // Combine elevation data from multiple sources
        vElevation = position.y + ndvi.r * 2.0 + soil.r * 1.0;
        vec3 newPosition = position;
        newPosition.y = vElevation;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      varying vec2 vUv;
      varying float vElevation;
      uniform sampler2D ndviData;
      uniform sampler2D soilData;
      uniform sampler2D tempData;
      uniform sampler2D precipData;
      uniform float time;

      void main() {
        vec4 ndvi = texture2D(ndviData, vUv);
        vec4 soil = texture2D(soilData, vUv);
        vec4 temp = texture2D(tempData, vUv);
        vec4 precip = texture2D(precipData, vUv);
        
        // Dynamic color based on multiple data layers
        vec3 color = mix(
          vec3(0.2, 0.5, 0.1), // Base terrain color
          vec3(0.4, 0.8, 0.3), // Healthy vegetation color
          ndvi.r
        );
        
        // Add moisture effect
        color = mix(color, vec3(0.2, 0.3, 0.8), soil.r * 0.5);
        
        // Temperature influence
        color = mix(color, vec3(0.8, 0.3, 0.2), temp.r * 0.3);
        
        // Precipitation visualization
        if(precip.r > 0.5) {
          color += vec3(0.1, 0.1, 0.3) * sin(time * 2.0);
        }
        
        gl_FragColor = vec4(color, 1.0);
      }
    `
  })

  useFrame((state) => {
    if (uniforms.current) {
      uniforms.current.time.value = state.clock.elapsedTime
    }
  })

  // Update textures when NASA data changes
  useEffect(() => {
    if (nasaData && nasaData.data) {
      const updateDataTexture = (data: number[][], texture: THREE.DataTexture) => {
        const pixels = new Float32Array(256 * 256)
        for (let i = 0; i < data.length; i++) {
          for (let j = 0; j < data[i].length; j++) {
            pixels[i * 256 + j] = data[i][j]
          }
        }
        texture.image.data = pixels
        texture.needsUpdate = true
      }

      updateDataTexture(nasaData.data.ndvi.grid, uniforms.current.ndviData.value)
      updateDataTexture(nasaData.data.soilMoisture.grid, uniforms.current.soilData.value)
      updateDataTexture(nasaData.data.temperature.grid, uniforms.current.tempData.value)
      updateDataTexture(nasaData.data.precipitation.grid, uniforms.current.precipData.value)
    }
  }, [nasaData])

  return (
    <mesh 
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]} 
      receiveShadow 
      castShadow
      material={terrainMaterial}
    >
      <planeGeometry args={[50, 50, 255, 255]} />
    </mesh>
  )
}

// Weather effects based on NASA data
function WeatherEffects({ nasaData }: { nasaData: any }) {
  const precipitation = nasaData?.data?.precipitation?.current || 0
  const cloudCount = Math.floor(precipitation * 10)

  return (
    <group>
      {[...Array(cloudCount)].map((_, i) => (
        <Cloud
          key={i}
          position={[
            (Math.random() - 0.5) * 40,
            10 + Math.random() * 10,
            (Math.random() - 0.5) * 40
          ]}
          opacity={0.5}
          speed={0.2}
        />
      ))}
    </group>
  )
}

// 3D Visualization overlays
function DataOverlays({ nasaData, position }: { nasaData: any; position: [number, number, number] }) {
  if (!nasaData?.data) return null

  return (
    <group position={position}>
      {Object.entries(NASA_LAYERS).map(([key, layer], i) => (
        <group key={key} position={[0, i * 1.2, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.5}
            color={layer.color}
          >
            {layer.name}: {nasaData.data[key.toLowerCase()]?.current.toFixed(2)}
          </Text>
        </group>
      ))}
    </group>
  )
}

// Main terrain component
export default function AdvancedNASATerrain({ 
  nasaData,
  selectedLayers = Object.keys(NASA_LAYERS)
}: {
  nasaData: any
  selectedLayers?: string[]
}) {
  if (!nasaData?.data) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-900 to-green-900 rounded-lg">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-bold">Loading NASA Data Layers</p>
          <p className="text-sm text-gray-300 mt-2">
            Initializing 7-Layer Terrain Visualization
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [20, 20, 20], fov: 60 }}
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping
        }}
      >
        <Sky sunPosition={[100, 10, 100]} turbidity={0.1} />
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[10, 10, 10]}
          intensity={1.5}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        <TerrainMesh nasaData={nasaData} selectedLayers={selectedLayers} />
        <WeatherEffects nasaData={nasaData} />
        <DataOverlays nasaData={nasaData} position={[-20, 10, 0]} />

        <OrbitControls
          maxPolarAngle={Math.PI / 2.2}
          minDistance={10}
          maxDistance={50}
        />

        <Environment preset="sunset" />
        
        <EffectComposer>
          <Bloom intensity={0.5} />
          <SSAO />
        </EffectComposer>
      </Canvas>
    </div>
  )
}