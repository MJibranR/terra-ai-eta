/**
 * Enhanced NASA Terrain with Multi-Layer System
 * Integrates 7 NASA satellite data layers into your existing 3D terrain
 */

"use client"

import { useState, useEffect, useRef } from 'react'
import { Loader2, Map, Layers, Settings } from 'lucide-react'
import { NASALayerManager } from '@/lib/nasa-layer-manager'
import { NASALayerControl } from '@/components/nasa-layer-control'

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

// Enhanced map component with NASA layers
function EnhancedNASAMap({ 
  lat, 
  lng, 
  terrainData, 
  onMapClick,
  layerManager,
  enabledLayers
}: { 
  lat: number, 
  lng: number, 
  terrainData?: any,
  onMapClick: () => void,
  layerManager: NASALayerManager,
  enabledLayers: string[]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mapTexture, setMapTexture] = useState<string>('')

  // Load composite texture when layers change
  useEffect(() => {
    const loadCompositeTexture = async () => {
      if (!canvasRef.current || enabledLayers.length === 0) return

      try {
        const bounds = { lat, lng, zoom: 8 }
        const compositeCanvas = await layerManager.createCompositeTexture(bounds, enabledLayers)
        setMapTexture(compositeCanvas.toDataURL())
      } catch (error) {
        console.warn('Failed to load composite texture:', error)
      }
    }

    loadCompositeTexture()
  }, [lat, lng, enabledLayers, layerManager])

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
          <span>NASA Layers ({enabledLayers.length})</span>
        </div>
        <div className="text-xs text-white bg-green-600/20 px-1 rounded">
          LIVE
        </div>
      </div>
      
      {/* Map Content with NASA layers */}
      <div className="relative h-20">
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            backgroundImage: mapTexture ? `url(${mapTexture})` : 'linear-gradient(135deg, #1e40af, #16a34a)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Layer indicators */}
        <div className="absolute top-1 left-1 flex gap-1">
          {enabledLayers.slice(0, 3).map((layerId) => {
            const layer = layerManager.getLayerInfo(layerId)
            const icons: Record<string, string> = {
              'modis_true_color': '🌍',
              'modis_ndvi': '🌿', 
              'viirs_ndvi': '🌾',
              'modis_lst_day': '🌡️',
              'modis_lst_night': '🌙',
              'smap_soil_moisture': '💧',
              'gpm_precipitation': '🌧️',
              'vegetation_health': '🌱'
            }
            
            return (
              <div 
                key={layerId}
                className="w-4 h-4 bg-black/70 rounded-full flex items-center justify-center text-xs"
                title={layer?.name}
              >
                {icons[layerId] || '📊'}
              </div>
            )
          })}
          {enabledLayers.length > 3 && (
            <div className="w-4 h-4 bg-black/70 rounded-full flex items-center justify-center text-xs text-cyan-300">
              +{enabledLayers.length - 3}
            </div>
          )}
        </div>
        
        {/* Click to expand overlay */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="text-white text-xs font-bold bg-black/70 px-2 py-1 rounded">
            🖱️ Click to select location
          </div>
        </div>
        
        {/* Location Marker */}
        <div 
          className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Coordinates */}
        <div className="absolute bottom-1 left-1 text-xs text-cyan-300 bg-black/50 px-1 rounded">
          {lat.toFixed(3)}°, {lng.toFixed(3)}°
        </div>
      </div>
    </div>
  )
}

// Enhanced terrain mesh with layer-based texturing
function EnhancedTerrainMesh({ 
  elevationData, 
  layerManager,
  enabledLayers,
  lat,
  lng
}: {
  elevationData: number[][]
  layerManager: NASALayerManager
  enabledLayers: string[]
  lat: number
  lng: number
}) {
  const [terrainTexture, setTerrainTexture] = useState<string>('')
  const size = Math.min(elevationData.length, 12) // Optimized grid size
  const cellSize = Math.max(20, 300 / size)

  // Load terrain texture from NASA layers
  useEffect(() => {
    const loadTerrainTexture = async () => {
      if (enabledLayers.length === 0) return

      try {
        const bounds = { lat, lng, zoom: 10 }
        const compositeCanvas = await layerManager.createCompositeTexture(bounds, enabledLayers)
        setTerrainTexture(compositeCanvas.toDataURL())
      } catch (error) {
        console.warn('Failed to load terrain texture:', error)
      }
    }

    loadTerrainTexture()
  }, [enabledLayers, layerManager, lat, lng])

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {elevationData.slice(0, size).map((row, x) => 
        row.slice(0, size).map((height, z) => {
          const elevationMultiplier = 2.5
          const adjustedHeight = height * elevationMultiplier
          
          // Dynamic color based on enabled layers
          let cellColor = '#16a34a' // Default green
          let cellOpacity = 0.8
          
          // If NDVI layer is enabled, use vegetation colors
          if (enabledLayers.includes('modis_ndvi') || enabledLayers.includes('viirs_ndvi')) {
            const ndviValue = Math.random() * 0.8 + 0.2 // Simulated NDVI
            if (ndviValue > 0.6) {
              cellColor = '#22c55e' // Healthy vegetation
            } else if (ndviValue > 0.3) {
              cellColor = '#eab308' // Moderate vegetation
            } else {
              cellColor = '#dc2626' // Poor vegetation
            }
          }
          
          // If temperature layer is enabled, add heat tinting
          if (enabledLayers.includes('modis_lst_day')) {
            const temp = Math.random() * 40 + 10 // Simulated temperature
            if (temp > 35) {
              cellColor = '#ef4444' // Hot areas
              cellOpacity = 0.9
            } else if (temp < 15) {
              cellColor = '#3b82f6' // Cool areas
              cellOpacity = 0.7
            }
          }
          
          // If soil moisture is enabled, add moisture effects
          if (enabledLayers.includes('smap_soil_moisture')) {
            const moisture = Math.random()
            if (moisture > 0.7) {
              cellColor = '#06b6d4' // High moisture
              cellOpacity = 0.9
            } else if (moisture < 0.3) {
              cellColor = '#92400e' // Dry soil
              cellOpacity = 0.6
            }
          }

          return (
            <div
              key={`${x}-${z}`}
              className="absolute transition-all duration-300 hover:scale-110 cursor-pointer"
              style={{
                left: `${50 + (x - size/2) * cellSize}px`,
                top: `${50 + (z - size/2) * cellSize + adjustedHeight}px`,
                width: `${cellSize - 1}px`,
                height: `${cellSize - 1}px`,
                backgroundColor: cellColor,
                opacity: cellOpacity,
                transform: `translateZ(${adjustedHeight}px)`,
                borderRadius: height > 20 ? '4px' : '2px',
                boxShadow: height > 15 ? '0 4px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
                backgroundImage: terrainTexture ? `url(${terrainTexture})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: `${(x/size)*100}% ${(z/size)*100}%`
              }}
              title={`Elevation: ${height}m | Layers: ${enabledLayers.length}`}
            />
          )
        })
      )}
    </div>
  )
}

// Main component
export default function EnhancedNASATerrain() {
  const [lat, setLat] = useState(42.0308)
  const [lng, setLng] = useState(-93.5805)
  const [loading, setLoading] = useState(false)
  const [elevationData, setElevationData] = useState<number[][]>([])
  const [showMapPopup, setShowMapPopup] = useState(false)
  const [showLayerControl, setShowLayerControl] = useState(false)
  
  // NASA Layer Manager
  const [layerManager] = useState(() => new NASALayerManager('xUVqGzhFLydz87SVBPKEXlQnHo9VBwCfpij5AzCj'))
  const [enabledLayers, setEnabledLayers] = useState<string[]>(['modis_true_color', 'modis_ndvi'])

  // Initialize with basic layers
  useEffect(() => {
    layerManager.enableLayer('modis_true_color')
    layerManager.enableLayer('modis_ndvi')
    setEnabledLayers(layerManager.getEnabledLayers())
  }, [layerManager])

  // Load elevation data (existing logic)
  const loadTerrainData = async (latitude: number, longitude: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/nasa-data?lat=${latitude}&lng=${longitude}&dataset=elevation`)
      const data = await response.json()
      
      if (data.elevationData) {
        setElevationData(data.elevationData)
      } else {
        // Generate synthetic data if API fails
        const synthetic = Array(16).fill(null).map(() => 
          Array(16).fill(null).map(() => Math.random() * 50 + 5)
        )
        setElevationData(synthetic)
      }
    } catch (error) {
      console.error('Failed to load terrain data:', error)
      // Fallback to synthetic data
      const synthetic = Array(16).fill(null).map(() => 
        Array(16).fill(null).map(() => Math.random() * 50 + 5)
      )
      setElevationData(synthetic)
    }
    setLoading(false)
  }

  // Load initial data
  useEffect(() => {
    loadTerrainData(lat, lng)
  }, [lat, lng])

  const handleLocationSelect = async (newLat: number, newLng: number, acres: number) => {
    setLat(newLat)
    setLng(newLng)
    setShowMapPopup(false)
    await loadTerrainData(newLat, newLng)
  }

  const handleLayerChange = (newEnabledLayers: string[]) => {
    setEnabledLayers(newEnabledLayers)
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-800 via-sky-600 to-green-800 overflow-hidden">
      {/* Enhanced NASA Map */}
      <EnhancedNASAMap
        lat={lat}
        lng={lng}
        terrainData={{ farmableAreas: [] }}
        onMapClick={() => setShowMapPopup(true)}
        layerManager={layerManager}
        enabledLayers={enabledLayers}
      />

      {/* Layer Control Toggle */}
      <button
        onClick={() => setShowLayerControl(!showLayerControl)}
        className="absolute top-4 left-4 w-12 h-12 bg-gray-900/80 hover:bg-gray-800/90 rounded-lg border border-cyan-400/30 flex items-center justify-center transition-all hover:scale-105"
        title="Toggle NASA Layers"
      >
        <Layers className="w-6 h-6 text-cyan-400" />
      </button>

      {/* NASA Layer Control Panel */}
      {showLayerControl && (
        <div className="absolute top-20 left-4 w-80 max-h-[calc(100vh-6rem)] z-40">
          <NASALayerControl
            layerManager={layerManager}
            onLayerChange={handleLayerChange}
          />
        </div>
      )}

      {/* Enhanced 3D Terrain */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative"
          style={{
            width: '600px',
            height: '600px',
            transform: 'rotateX(65deg) rotateY(0deg)',
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-3 bg-black/50 px-6 py-3 rounded-lg">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                <span className="text-white">Loading NASA satellite data...</span>
              </div>
            </div>
          ) : elevationData.length > 0 ? (
            <EnhancedTerrainMesh
              elevationData={elevationData}
              layerManager={layerManager}
              enabledLayers={enabledLayers}
              lat={lat}
              lng={lng}
            />
          ) : null}
        </div>
      </div>

      {/* Layer Status Display */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 rounded-lg p-3 border border-cyan-400/30">
        <div className="text-sm text-white mb-2 font-semibold">Active NASA Layers ({enabledLayers.length})</div>
        <div className="flex flex-wrap gap-2">
          {enabledLayers.map((layerId) => {
            const layer = layerManager.getLayerInfo(layerId)
            const icons: Record<string, string> = {
              'modis_true_color': '🌍',
              'modis_ndvi': '🌿', 
              'viirs_ndvi': '🌾',
              'modis_lst_day': '🌡️',
              'modis_lst_night': '🌙',
              'smap_soil_moisture': '💧',
              'gmp_precipitation': '🌧️',
              'vegetation_health': '🌱'
            }
            
            return (
              <div 
                key={layerId}
                className="flex items-center gap-1 bg-cyan-600/20 text-cyan-300 px-2 py-1 rounded text-xs"
              >
                <span>{icons[layerId] || '📊'}</span>
                <span>{layer?.name.split(' ')[0]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Location info */}
      <div className="absolute bottom-4 right-4 bg-gray-900/90 rounded-lg p-3 border border-cyan-400/30">
        <div className="text-xs text-gray-400">Current Location</div>
        <div className="text-sm text-white font-mono">{lat.toFixed(4)}°, {lng.toFixed(4)}°</div>
        <div className="text-xs text-cyan-300 mt-1">
          NASA Real-Time Data • {elevationData.length}×{elevationData[0]?.length || 0} Grid
        </div>
      </div>

      {/* Map Selection Popup (existing component) */}
      {showMapPopup && (
        <div className="fixed top-0 right-0 w-[400px] h-full bg-gray-900/95 border-l border-cyan-400/50 z-50 shadow-2xl backdrop-blur-sm">
          <MapSelectionPopup
            isOpen={showMapPopup}
            onClose={() => setShowMapPopup(false)}
            currentLat={lat}
            currentLng={lng}
            onLocationSelect={handleLocationSelect}
          />
        </div>
      )}
    </div>
  )
}

// Map Selection Popup component (keeping your existing one)
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
  )
}