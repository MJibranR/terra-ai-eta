"use client"

import { useEffect, useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Box, Plane, Sphere, Text } from '@react-three/drei'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Satellite, Loader2, MapPin, Droplets, Sprout, Thermometer } from 'lucide-react'
import { directNASAFetcher } from '@/lib/direct-nasa-api'

interface DirectNASAData {
  satelliteImage?: string
  availableAssets?: any[]
  apodData?: any
  weatherData?: any
  loading: boolean
  error?: string
  coordinates: { lat: number, lon: number }
  lastUpdated?: string
}

// 3D Farm Field Component using NASA data
function NASAFarmField({ 
  position, 
  nasaData, 
  cropType = 'corn',
  onClick 
}: { 
  position: [number, number, number]
  nasaData: DirectNASAData
  cropType: string
  onClick: () => void 
}) {
  const [hovered, setHovered] = useState(false)

  // Use satellite imagery as texture if available
  const fieldColor = nasaData.satelliteImage ? '#4ade80' : getCropColor(cropType)
  
  return (
    <Box
      position={position}
      args={[1.5, 0.2, 1.5]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial 
        color={hovered ? '#60a5fa' : fieldColor}
        roughness={0.6}
        metalness={0.1}
      />
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {cropType}
      </Text>
    </Box>
  )
}

// NASA Data Indicators in 3D space
function NASADataIndicators({ nasaData }: { nasaData: DirectNASAData }) {
  return (
    <group position={[0, 2, 0]}>
      {/* Satellite indicator */}
      <Sphere position={[-2, 0, 0]} args={[0.1]}>
        <meshStandardMaterial color="#3b82f6" emissive="#1e40af" />
      </Sphere>
      
      {/* Weather indicator */}
      <Sphere position={[0, 0, 0]} args={[0.1]}>
        <meshStandardMaterial color="#10b981" emissive="#047857" />
      </Sphere>
      
      {/* Assets indicator */}
      <Sphere position={[2, 0, 0]} args={[0.1]}>
        <meshStandardMaterial color="#f59e0b" emissive="#d97706" />  
      </Sphere>
      
      {/* Data status text */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        NASA Live Data: {nasaData.loading ? 'Loading...' : 'Active'}
      </Text>
    </group>
  )
}

// Main 3D Scene with direct NASA integration
function Direct3DScene({ nasaData, onFieldClick }: { 
  nasaData: DirectNASAData
  onFieldClick: (fieldId: string) => void 
}) {
  const fields = [
    { id: 'field-1', position: [-2, 0, -2] as [number, number, number], crop: 'Corn' },
    { id: 'field-2', position: [2, 0, -2] as [number, number, number], crop: 'Soybeans' },
    { id: 'field-3', position: [-2, 0, 2] as [number, number, number], crop: 'Wheat' },
    { id: 'field-4', position: [2, 0, 2] as [number, number, number], crop: 'Cotton' },
  ]

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Ground plane */}
      <Plane
        args={[10, 10]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
      >
        <meshStandardMaterial color="#1e293b" />
      </Plane>

      {/* NASA Farm Fields */}
      {fields.map((field, index) => (
        <NASAFarmField
          key={field.id}
          position={field.position}
          nasaData={nasaData}
          cropType={field.crop}
          onClick={() => onFieldClick(field.id)}
        />
      ))}

      {/* NASA Data Indicators */}
      <NASADataIndicators nasaData={nasaData} />

      {/* Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0, 0]}
      />

      <Environment preset="sunset" />
    </>
  )
}

// Helper function for crop colors
function getCropColor(crop: string): string {
  const colors: { [key: string]: string } = {
    'Corn': '#f59e0b',
    'Soybeans': '#10b981', 
    'Wheat': '#eab308',
    'Cotton': '#f3f4f6'
  }
  return colors[crop] || '#4ade80'
}

// Main Direct NASA Farm 3D Component
export default function DirectNASAFarm3D({ 
  coordinates = { lat: 40.7128, lng: -74.0060 },
  onFieldClick
}: {
  coordinates?: { lat: number, lng: number }
  onFieldClick?: (fieldId: string) => void
}) {
  const [nasaData, setNasaData] = useState<DirectNASAData>({
    loading: true,
    coordinates: { lat: coordinates.lat, lon: coordinates.lng }
  })

  // Fetch direct NASA data
  useEffect(() => {
    const fetchNASAData = async () => {
      setNasaData(prev => ({ ...prev, loading: true, error: undefined }))
      
      try {
        console.log('🚀 Fetching comprehensive NASA agricultural data...')
        
        // Use the direct NASA fetcher for comprehensive data
        const results = await directNASAFetcher.getComprehensiveAgriculturalData(
          coordinates.lat, 
          coordinates.lng
        )

        if (results.success) {
          setNasaData(prev => ({
            ...prev,
            satelliteImage: results.satelliteImage,
            availableAssets: results.availableAssets,
            apodData: results.apod,
            weatherData: results.agriculturalTech, // Using tech data as weather for now
            loading: false,
            lastUpdated: new Date().toISOString(),
            error: results.errors?.length ? `Some APIs failed: ${results.errors.join(', ')}` : undefined
          }))
        } else {
          throw new Error(`All NASA APIs failed: ${results.errors?.join(', ')}`)
        }

      } catch (error) {
        console.error('❌ NASA API Error:', error)
        setNasaData(prev => ({
          ...prev,
          loading: false,
          error: `Failed to fetch NASA data: ${error}`
        }))
      }
    }

    fetchNASAData()
  }, [coordinates.lat, coordinates.lng])

  const handleFieldClick = (fieldId: string) => {
    console.log('NASA Field clicked:', fieldId)
    onFieldClick?.(fieldId)
  }

  return (
    <div className="space-y-4">
      {/* NASA Data Status */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant={nasaData.satelliteImage ? "default" : "secondary"}>
          <Satellite className="w-3 h-3 mr-1" />
          Earth Imagery: {nasaData.satelliteImage ? 'Loaded' : 'Loading...'}
        </Badge>
        <Badge variant={nasaData.availableAssets ? "default" : "secondary"}>
          <MapPin className="w-3 h-3 mr-1" />
          Assets: {nasaData.availableAssets?.length || 0} available
        </Badge>
        <Badge variant={nasaData.apodData ? "default" : "secondary"}>
          <Sprout className="w-3 h-3 mr-1" />
          APOD: {nasaData.apodData?.title ? 'Active' : 'Loading...'}
        </Badge>
      </div>

      {/* Error Display */}
      {nasaData.error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
          <p className="text-red-300 text-sm">{nasaData.error}</p>
        </div>
      )}

      {/* 3D Visualization */}
      <div className="w-full h-96 rounded-xl overflow-hidden border border-blue-500/30 bg-black/20">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-400" />
              <div className="text-sm">Loading NASA 3D Scene...</div>
            </div>
          </div>
        }>
          <Canvas
            camera={{ position: [5, 4, 5], fov: 60 }}
            shadows
            dpr={[1, 2]}
            gl={{ antialias: true }}
          >
            <Direct3DScene 
              nasaData={nasaData}
              onFieldClick={handleFieldClick}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* NASA API Data Display */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Satellite Imagery Info */}
        <Card className="bg-black/40 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-300">🛰️ Earth Imagery</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-300">
            <div>Coordinates: {coordinates.lat.toFixed(3)}, {coordinates.lng.toFixed(3)}</div>
            <div>Status: {nasaData.satelliteImage ? 'Image Loaded' : 'Loading...'}</div>
            <div>Source: NASA Planetary API</div>
          </CardContent>
        </Card>

        {/* Available Assets */}
        <Card className="bg-black/40 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-300">📡 Available Assets</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-300">
            <div>Count: {nasaData.availableAssets?.length || 0}</div>
            <div>Type: Landsat/Sentinel</div>
            <div>Coverage: {nasaData.availableAssets?.length ? 'Available' : 'Checking...'}</div>
          </CardContent>
        </Card>

        {/* APOD Data */}
        <Card className="bg-black/40 border-purple-500/30">
          <CardHeader className="pb-2">    
            <CardTitle className="text-sm text-purple-300">🌌 NASA APOD</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-300">
            <div>Title: {nasaData.apodData?.title?.substring(0, 30) || 'Loading...'}...</div>
            <div>Date: {nasaData.apodData?.date || 'N/A'}</div>
            <div>Type: {nasaData.apodData?.media_type || 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      {nasaData.lastUpdated && (
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date(nasaData.lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}