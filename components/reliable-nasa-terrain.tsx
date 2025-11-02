// components/reliable-nasa-terrain.tsx
/**
 * NASA Real Terrain Farm 3D Component
 * Uses actual NASA elevation data and satellite imagery for realistic 3D terrain
 */

"use client"

interface FarmField {
  x: number
  z: number
  crop: string
  color: string
  label: string
  name: string
  health: number
  elevation?: number
  suitability?: number
}

import { useState, useEffect } from 'react'
import { Loader2, Map, Layers } from 'lucide-react'

// Lightweight map popup for location and area selection - positioned as sidebar
function MapSelectionPopup({ 
  isOpen, 
  onClose, 
  currentLat, 
  currentLng, 
  onLocationSelect 
}: {
  isOpen: boolean
  onClose: () => void
  currentLat: number
  currentLng: number
  onLocationSelect: (lat: number, lng: number, acres: number) => void
}) {
  const [selectedLat, setSelectedLat] = useState(currentLat)
  const [selectedLng, setSelectedLng] = useState(currentLng)
  const [acres, setAcres] = useState(100)

  if (!isOpen) return null

  return (
    <div className="fixed top-0 right-0 w-[400px] h-full bg-gray-900/95 border-l border-cyan-400/50 z-50 shadow-2xl backdrop-blur-sm">
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-b border-cyan-400/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center">
              🗺️
            </div>
            <h3 className="text-xl font-bold text-white">Select Farm Location</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-600/20 hover:bg-red-600/40 flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Location Selection */}
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2">
              📍 Quick Locations
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { name: 'Iowa Farmland', lat: 42.0308, lng: -93.5805 },
                { name: 'California Valley', lat: 36.7783, lng: -119.4179 },
                { name: 'Nebraska Plains', lat: 41.4925, lng: -99.9018 },
                { name: 'Texas Panhandle', lat: 35.2211, lng: -101.8313 }
              ].map((location) => (
                <button
                  key={location.name}
                  onClick={() => {
                    setSelectedLat(location.lat)
                    setSelectedLng(location.lng)
                  }}
                  className="text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300 transition-colors"
                >
                  📍 {location.name}
                </button>
              ))}
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Latitude</label>
              <input
                type="number"
                step="0.001"
                value={selectedLat.toFixed(3)}
                onChange={(e) => setSelectedLat(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Longitude</label>
              <input
                type="number"
                step="0.001"
                value={selectedLng.toFixed(3)}
                onChange={(e) => setSelectedLng(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>

          {/* Farm Size */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Farm Size: {acres} acres</label>
            <input
              type="range"
              min="10"
              max="500"
              value={acres}
              onChange={(e) => setAcres(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10 acres</span>
              <span>{(acres * 0.4047).toFixed(1)} hectares</span>
              <span>500 acres</span>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <div className="text-sm text-blue-300">
              <div className="font-semibold mb-2 flex items-center gap-2">
                🛰️ What happens next?
              </div>
              <ul className="space-y-1 text-xs">
                <li>• NASA SRTM elevation data will be loaded</li>
                <li>• Terrain visualization will update in real-time</li>
                <li>• Farmable areas will be analyzed</li>
                <li>• Weather and soil data will be fetched</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={() => onLocationSelect(selectedLat, selectedLng, acres)}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-white font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              🚀 Start Farming Here
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Map component for location visualization
function NASATerrainMap({ lat, lng, terrainData, onMapClick }: { 
  lat: number, 
  lng: number, 
  terrainData?: any,
  onMapClick: () => void
}) {
  const [mapMode, setMapMode] = useState<'satellite' | 'terrain' | 'elevation'>('satellite')
  
  return (
    <div 
      className="absolute top-4 right-4 w-48 h-32 bg-black/50 rounded-lg overflow-hidden border border-cyan-400/30 cursor-pointer hover:border-cyan-400/60 transition-all hover:scale-105"
      onClick={onMapClick}
      title="Click to open location selector"
    >
      {/* Map Header */}
      <div className="flex items-center justify-between p-2 bg-black/70">
        <div className="flex items-center gap-1 text-xs text-cyan-300">
          <Map className="w-3 h-3" />
          <span>NASA Map</span>
        </div>
        <div className="flex gap-1">
          {(['satellite', 'terrain', 'elevation'] as const).map((mode) => (
            <button
              key={mode}
              onClick={(e) => {
                e.stopPropagation()
                setMapMode(mode)
              }}
              className={`px-1 py-0.5 text-xs rounded transition-colors ${
                mapMode === mode 
                  ? 'bg-cyan-400 text-black' 
                  : 'bg-gray-600 text-white hover:bg-gray-500'
              }`}
            >
              {mode[0].toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      {/* Map Content */}
      <div className="relative h-20 bg-gradient-to-br from-blue-800 to-green-800">
        {/* Click to expand overlay */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="text-white text-xs font-bold bg-black/70 px-2 py-1 rounded">
            🖱️ Click to select location
          </div>
        </div>
        
        {/* Coordinate Grid */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '12px 12px'
          }}
        />
        
        {/* Location Marker */}
        <div 
          className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Farmable Areas on Map */}
        {terrainData?.farmableAreas?.slice(0, 4).map((area: any, i: number) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-green-400 rounded-full border border-white opacity-80"
            style={{
              left: `${45 + (i % 2) * 10}%`,
              top: `${45 + Math.floor(i / 2) * 10}%`,
              transform: 'translate(-50%, -50%)'
            }}
            title={`Farmable Area ${i + 1}`}
          />
        ))}
        
        {/* Map Info */}
        <div className="absolute bottom-1 left-1 text-xs text-cyan-300 bg-black/50 px-1 rounded">
          {lat.toFixed(3)}°, {lng.toFixed(3)}°
        </div>
        
        {/* Map Mode Indicator */}
        <div className="absolute bottom-1 right-1 text-xs text-white bg-black/50 px-1 rounded">
          {mapMode === 'satellite' && '🛰️'}
          {mapMode === 'terrain' && '🗻'}
          {mapMode === 'elevation' && '📐'}
        </div>
      </div>
    </div>
  )
}

// Enhanced NASA Terrain Mesh with dramatic 3D elevation
function NASATerrainMesh({ elevationData, satelliteImage }: {
  elevationData: number[][]
  satelliteImage?: string
}) {
  const size = Math.min(elevationData.length, 16) // Limit grid size for performance
  const cellSize = Math.max(15, 400 / size) // Larger cells, fewer total elements
  
  console.log('NASATerrainMesh rendering optimized grid:', size, 'x', size)
  
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Main terrain mesh */}
      {elevationData.slice(0, size).map((row, x) => 
        row.slice(0, size).map((height, z) => {
          // Simplified height calculation
          const elevationMultiplier = 3 // Reduced for performance
          const adjustedHeight = height * elevationMultiplier
          
          // Simplified height-based colors
          let heightColor = '#16a34a' // Default green
          
          if (height > 30) {
            heightColor = '#8b5cf6' // Purple for high peaks
          } else if (height > 15) {
            heightColor = '#f59e0b' // Orange for medium hills
          }
          
          const heightOpacity = Math.min(0.9, 0.7 + (height / 100))
          
          return (
            <div
              key={`terrain-${x}-${z}`}
              className="absolute cursor-pointer"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                transform: `
                  translateX(${(x - size/2) * cellSize}px) 
                  translateZ(${(z - size/2) * cellSize}px) 
                  translateY(${-adjustedHeight}px)
                  rotateX(-65deg)
                `,
                background: heightColor,
                opacity: heightOpacity,
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1px',
                boxShadow: height > 20 
                  ? `0 ${Math.floor(height/3)}px ${Math.floor(height/2)}px rgba(0,0,0,0.4)` 
                  : `0 2px 4px rgba(0,0,0,0.2)`
              }}
              title={`Elevation: ${height.toFixed(0)}m`}
            />
          )
        })
      )}
    </div>
  )
}

// Helper functions for crop visualization
function getCropColor(crop: string): string {
  const colors: Record<string, string> = {
    corn: 'bg-green-400',
    wheat: 'bg-yellow-400', 
    soybeans: 'bg-green-500',
    cotton: 'bg-white',
    rice: 'bg-blue-300',
    coffee: 'bg-amber-600',
    sugarcane: 'bg-green-600'
  }
  return colors[crop] || 'bg-green-400'
}

function getCropEmoji(crop: string): string {
  const emojis: Record<string, string> = {
    corn: '🌽',
    wheat: '🌾',
    soybeans: '🫘',
    cotton: '🌱',
    rice: '🌾',
    coffee: '☕',
    sugarcane: '🎋'
  }
  return emojis[crop] || '🌱'
}

// Generate local elevation grid as fallback
function generateLocalElevationGrid(lat: number, lng: number) {
  const size = 32
  const grid: number[][] = []
  
  // Use coordinate-based patterns for realistic terrain
  const seed = Math.abs(lat * lng * 1000) % 1000
  
  for (let x = 0; x < size; x++) {
    grid[x] = []
    for (let z = 0; z < size; z++) {
      // Base elevation from coordinates
      let elevation = Math.abs(lat) * 1.5
      
      // Add terrain variation using coordinate-based noise
      const noiseX = (x + seed) * 0.2
      const noiseZ = (z + seed) * 0.2
      
      elevation += Math.sin(noiseX) * Math.cos(noiseZ) * 25
      elevation += Math.sin(noiseX * 2) * Math.cos(noiseZ * 2) * 12
      elevation += Math.sin(noiseX * 4) * Math.cos(noiseZ * 4) * 6
      
      // Add random peaks
      if (Math.random() > 0.9) {
        elevation += Math.random() * 20
      }
      
      // Ensure non-negative elevation
      grid[x][z] = Math.max(0, elevation)
    }
  }
  
  console.log('Generated local elevation grid:', grid.length, 'x', grid[0]?.length)
  return grid
}

// Enhanced CSS 3D Farm with NASA terrain visualization - STATIC VERSION
function NASAFarm3D({ farmData, activeLayers, onFieldClick }: {
  farmData?: any
  activeLayers?: string[]
  onFieldClick?: (fieldId: string) => void
}) {
  const [hoveredField, setHoveredField] = useState<string | null>(null)
  const [terrainData, setTerrainData] = useState<any>(null)
  const [nasaImagery, setNasaImagery] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [cacheInfo, setCacheInfo] = useState<any>(null)
  const [showMapPopup, setShowMapPopup] = useState(false)
  const [currentLocation, setCurrentLocation] = useState({ 
    lat: farmData?.location?.lat || 40.7128, 
    lng: farmData?.location?.lng || -74.0060 
  })

  // Fetch NASA terrain and imagery data
  useEffect(() => {
    const fetchNASAData = async () => {
      setLoading(true)
      try {
        const lat = currentLocation.lat
        const lng = currentLocation.lng
        
        // Fetch 3D terrain data from NASA
        const response = await fetch(`/api/nasa-data?action=terrain-3d&lat=${lat}&lng=${lng}`)
        
        if (!response.ok) {
          throw new Error(`API response failed: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('NASA API Response:', data)
        
        if (data.success) {
          console.log('Using NASA terrain data:', data.data)
          setTerrainData(data.data)
          setCacheInfo(data.cache)
          if (data.data.imagery?.imageUrl) {
            setNasaImagery(data.data.imagery.imageUrl)
          }
        } else if (data.fallback) {
          console.log('Using fallback terrain data:', data.fallback)
          setTerrainData(data.fallback)
          setCacheInfo(null)
        } else {
          console.warn('No terrain data available, generating local fallback')
          // Generate local fallback terrain
          const fallbackTerrain = {
            elevation: {
              elevationGrid: generateLocalElevationGrid(lat, lng)
            },
            farmableAreas: [],
            recommendedCrops: ['corn', 'wheat', 'soybeans']
          }
          setTerrainData(fallbackTerrain)
        }
      } catch (error) {
        console.error('Failed to fetch NASA terrain data:', error)
        // Always generate local fallback terrain when API fails
        const lat = currentLocation.lat
        const lng = currentLocation.lng
        const fallbackTerrain = {
          elevation: {
            elevationGrid: generateLocalElevationGrid(lat, lng)
          },
          farmableAreas: [],
          recommendedCrops: ['corn', 'wheat', 'soybeans'],
          source: 'Local Fallback'
        }
        setTerrainData(fallbackTerrain)
        console.log('Generated local fallback terrain due to API error')
      } finally {
        setLoading(false)
      }
    }

    fetchNASAData()
  }, [farmData?.location, currentLocation])

  // Handle location selection from map popup
  const handleLocationSelect = async (lat: number, lng: number, acres: number) => {
    console.log(`Selected location: ${lat}, ${lng} with ${acres} acres`)
    setCurrentLocation({ lat, lng })
    setShowMapPopup(false)
    
    // Update farm data with new location
    if (farmData) {
      farmData.location = { lat, lng, name: `Farm at ${lat.toFixed(3)}, ${lng.toFixed(3)}`, acres }
    }
    
    // Trigger terrain data refresh for new location
    setLoading(true)
    setTerrainData(null)
    setCacheInfo(null)
  }

  const temp = farmData?.realTimeData?.temperature?.[0]?.value || 22
  const moisture = (farmData?.realTimeData?.soilMoisture?.[0]?.value || 0.45) * 100
  const ndvi = farmData?.realTimeData?.vegetation?.[0]?.ndvi || 0.7

  if (loading) {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-xl overflow-hidden perspective-1000 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-400" />
          <div className="text-sm">Loading NASA terrain data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`terrain-container relative w-full h-96 bg-gradient-to-br from-blue-900/20 via-green-900/10 to-yellow-900/20 rounded-xl overflow-hidden perspective-1000 ${showMapPopup ? 'mr-[400px]' : ''} transition-all duration-300`}>
      {/* 3D Farm Scene with NASA terrain - Static View */}
      <div 
        className="absolute inset-0 flex items-center justify-center transform-gpu"
        style={{
          transform: `rotateX(65deg) rotateY(0deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* NASA Terrain with real elevation data */}
        {terrainData?.elevation?.elevationGrid ? (
          <>
            <NASATerrainMesh 
              elevationData={terrainData.elevation.elevationGrid}
              satelliteImage={nasaImagery}
            />
            {/* Debug info */}
            <div className="absolute top-2 left-2 text-xs text-cyan-300 bg-black/50 px-2 py-1 rounded">
              Terrain: {terrainData.elevation.elevationGrid.length}×{terrainData.elevation.elevationGrid[0]?.length} 
              {terrainData.source ? ` • ${terrainData.source}` : ''}
            </div>
          </>
        ) : (
          <>
            <div 
              className="absolute w-96 h-96 bg-gradient-to-br from-green-800/30 to-brown-800/30 rounded-2xl border border-green-500/20 shadow-2xl"
              style={{ 
                transform: 'translateZ(-30px)',
                backgroundImage: nasaImagery ? `url(${nasaImagery})` : `
                  linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: nasaImagery ? 'cover' : '20px 20px',
                backgroundPosition: 'center'
              }}
            />
            {/* Debug info for missing terrain */}
            <div className="absolute top-2 left-2 text-xs text-red-400 bg-black/50 px-2 py-1 rounded">
              No Terrain Data • terrainData: {terrainData ? 'exists' : 'null'} • loading: {loading.toString()}
            </div>
          </>
        )}

        {/* Real NASA Farmable Areas */}
        {terrainData?.farmableAreas?.slice(0, 8).map((field: FarmField, i: number) => {
          const fieldData = {
            x: field.x,
            z: field.z,
            crop: terrainData.recommendedCrops?.[i % terrainData.recommendedCrops.length] || 'corn',
            color: getCropColor(terrainData.recommendedCrops?.[i % terrainData.recommendedCrops.length] || 'corn'),
            label: getCropEmoji(terrainData.recommendedCrops?.[i % terrainData.recommendedCrops.length] || 'corn'),
            name: `${terrainData.recommendedCrops?.[i % terrainData.recommendedCrops.length] || 'Corn'} Field`,
            health: Math.floor(85 + (field.suitability || 0) * 15),
            elevation: field.elevation || 0
          }

          return (
            <div
              key={i}
              className={`absolute w-20 h-20 ${fieldData.color} rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-2xl shadow-xl border-2 ${
                hoveredField === fieldData.crop 
                  ? 'scale-125 border-cyan-400 shadow-cyan-400/50' 
                  : 'border-white/20 hover:scale-110 hover:border-white/40'
              }`}
              style={{
                transform: `translateX(${fieldData.x}px) translateZ(${fieldData.z}px) rotateX(-65deg) translateY(${-(fieldData.elevation || 0) * 0.5 - 10}px)`,
                boxShadow: hoveredField === fieldData.crop 
                  ? '0 20px 40px rgba(6, 182, 212, 0.4)' 
                  : '0 10px 20px rgba(0, 0, 0, 0.3)'
              }}
              onClick={() => onFieldClick?.(fieldData.crop)}
              onMouseEnter={() => setHoveredField(fieldData.crop)}
              onMouseLeave={() => setHoveredField(null)}
              title={`${fieldData.name} - Health: ${fieldData.health}% - NASA validated`}
            >
              <div className="text-3xl mb-1">{fieldData.label}</div>
              <div className="text-xs text-black/70 font-bold">{fieldData.health}%</div>
            </div>
          )
        })}

        {/* Simplified Data Indicators */}
        <div
          className="absolute w-12 h-12 bg-orange-500 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-md"
          style={{
            transform: `translateX(-100px) translateY(-50px) translateZ(30px) rotateX(-65deg)`
          }}
        >
          <div className="text-lg">🌡️</div>
          <div className="text-xs">{temp.toFixed(0)}°</div>
        </div>
        
        <div
          className="absolute w-12 h-12 bg-blue-500 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-md"
          style={{
            transform: `translateX(100px) translateY(-50px) translateZ(30px) rotateX(-65deg)`
          }}
        >
          <div className="text-lg">💧</div>
          <div className="text-xs">{moisture.toFixed(0)}%</div>
        </div>

        {/* NDVI Indicator */}
        <div
          className="absolute w-12 h-12 bg-green-500 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-md"
          style={{
            transform: `translateX(0px) translateY(-70px) translateZ(40px) rotateX(-65deg)`
          }}
        >
          <div className="text-lg">🛰️</div>
          <div className="text-xs">{ndvi.toFixed(1)}</div>
        </div>

        {/* NASA Satellite - Static Position */}
        <div
          className="absolute w-6 h-8 bg-gradient-to-b from-gray-300 to-gray-600 rounded-md"
          style={{
            transform: `translateX(80px) translateZ(80px) rotateX(-65deg) translateY(-15px)`
          }}
          title="NASA Satellite - Monitoring"
        >
          <div className="text-sm text-center">🛰️</div>
        </div>
      </div>

      {/* NASA Terrain Map */}
      <NASATerrainMap 
        lat={currentLocation.lat} 
        lng={currentLocation.lng} 
        terrainData={terrainData}
        onMapClick={() => setShowMapPopup(true)}
      />

      {/* Map Selection Popup */}
      <MapSelectionPopup
        isOpen={showMapPopup}
        onClose={() => setShowMapPopup(false)}
        currentLat={currentLocation.lat}
        currentLng={currentLocation.lng}
        onLocationSelect={handleLocationSelect}
      />

      {/* Enhanced UI Overlays */}
      <div className="absolute top-4 left-4 glass-light px-4 py-2 rounded-lg">
        <h3 className="glass-text-primary font-semibold text-lg">NASA Real Terrain</h3>
        {farmData?.location?.name && (
          <p className="glass-text-secondary text-sm">📍 {farmData.location.name}</p>
        )}
        <div className="text-xs text-green-400 mt-1">
          🛰️ {terrainData?.elevation ? 'SRTM Elevation Data' : 'Simulated Terrain'}
        </div>
        <div className="text-xs text-cyan-400 mt-1">
          🗺️ Static View • {cacheInfo?.hit ? `Cached (${cacheInfo.age}s old)` : 'Live Data'}
        </div>
        {farmData?.location?.acres && (
          <div className="text-xs text-yellow-400 mt-1">
            🌾 {farmData.location.acres} acres selected
          </div>
        )}
        {cacheInfo?.hit && (
          <div className="text-xs text-blue-400 mt-1">
            ⚡ Cache Hit #{cacheInfo.hits} • TTL: {cacheInfo.ttl}s
          </div>
        )}
      </div>

      {/* Real-time NASA Data Panel */}
      <div className="absolute top-40 right-4 space-y-2">
        <div className="glass-light px-3 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-orange-400">🌡️</span>
            <span className="glass-text-primary text-sm">{temp.toFixed(1)}°C</span>
          </div>
        </div>
        <div className="glass-light px-3 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">💧</span>
            <span className="glass-text-primary text-sm">{moisture.toFixed(0)}%</span>
          </div>
        </div>
        <div className="glass-light px-3 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-green-400">🌱</span>
            <span className="glass-text-primary text-sm">NDVI {ndvi.toFixed(2)}</span>
          </div>
        </div>
        <div className="glass-light px-3 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">🛰️</span>
            <span className="glass-text-primary text-sm">{terrainData?.farmableAreas?.length || 0} sites</span>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="glass-light px-3 py-1 rounded-lg">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="glass-text-secondary">
              Static View | NASA Terrain Visualization
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="absolute bottom-4 left-4">
        <div className="glass-light px-3 py-2 rounded-lg">
          <p className="glass-text-secondary text-xs">🗺️ Static terrain view • Click farmable areas • NASA real terrain data</p>
          {showMapPopup && (
            <div className="text-xs text-cyan-400 mt-1 animate-pulse">
              🗺️ Location selection active
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setShowMapPopup(true)}
              className="text-xs px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 rounded transition-colors"
              title="Select new location and acres"
            >
              🗺️ Select Location
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-xs px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 rounded transition-colors"
              title="Refresh terrain data"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => fetch('/api/nasa-data?action=cache-stats').then(r => r.json()).then(console.log)}
              className="text-xs px-2 py-1 bg-green-600/20 hover:bg-green-600/40 rounded transition-colors"
              title="View cache statistics"
            >
              📊 Cache Stats
            </button>
          </div>
        </div>
      </div>

      {/* Field Details Overlay */}
      {hoveredField && terrainData?.farmableAreas?.length > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-panel p-4 rounded-xl border border-cyan-400/50 shadow-lg shadow-cyan-400/20 z-10">
          <div className="text-center">
            <div className="text-3xl mb-2">
              {getCropEmoji(hoveredField)}
            </div>
            <div className="font-semibold text-cyan-300 mb-1">
              NASA Validated Farmland
            </div>
            <div className="text-sm text-gray-300 mb-2">
              Crop: <span className="text-green-400 font-bold">{hoveredField}</span>
            </div>
            <div className="text-xs text-gray-400 bg-black/30 rounded px-2 py-1">
              🛰️ Real SRTM elevation + Landsat imagery
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Loading component
function Farm3DLoading() {
  return (
    <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-xl border border-blue-500/20">
      <div className="text-center text-white">
        <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-400" />
        <h3 className="text-lg font-semibold mb-2">Loading NASA Terrain</h3>
        <p className="text-sm text-gray-300">Fetching SRTM elevation + satellite imagery...</p>
      </div>
    </div>
  )
}

// Main component with Three.js fallback to NASA CSS 3D
interface ReliableNASAFarm3DProps {
  farmData?: any
  activeLayers?: string[]
  onFieldClick?: (fieldId: string) => void
}

export default function ReliableNASAFarm3D({ farmData, activeLayers, onFieldClick }: ReliableNASAFarm3DProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <Farm3DLoading />
  }

  // Always use CSS 3D with NASA terrain data for now
  return (
    <NASAFarm3D 
      farmData={farmData}
      activeLayers={activeLayers}
      onFieldClick={onFieldClick}
    />
  )
}