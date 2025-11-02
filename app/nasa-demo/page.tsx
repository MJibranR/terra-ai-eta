/**
 * NASA Layer Demo Page
 * Interactive demonstration of all 7 NASA satellite data layers
 */

"use client"

import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Info, ExternalLink } from 'lucide-react'
import { NASALayerManager } from '@/lib/nasa-layer-manager'

export default function NASALayerDemo() {
  const [layerManager] = useState(() => new NASALayerManager('xUVqGzhFLydz87SVBPKEXlQnHo9VBwCfpij5AzCj'))
  const [enabledLayers, setEnabledLayers] = useState<string[]>(['modis_true_color'])
  const [currentLocation, setCurrentLocation] = useState({ lat: 42.0308, lng: -93.5805, name: 'Iowa Farmland' })
  const [isAnimating, setIsAnimating] = useState(false)
  const [loadingLayer, setLoadingLayer] = useState<string | null>(null)
  
  // Test locations for demonstration
  const testLocations = [
    { lat: 42.0308, lng: -93.5805, name: 'Iowa Farmland', description: 'Corn and soybean fields' },
    { lat: 36.7783, lng: -119.4179, name: 'California Valley', description: 'Fruit orchards and vegetables' },
    { lat: 41.4925, lng: -99.9018, name: 'Nebraska Plains', description: 'Wheat and cattle ranching' },
    { lat: 35.2211, lng: -101.8313, name: 'Texas Panhandle', description: 'Cotton and grain farming' }
  ]

  // Initialize with basic layers
  useEffect(() => {
    layerManager.enableLayer('modis_true_color')
    setEnabledLayers(['modis_true_color'])
  }, [layerManager])

  const handleLayerToggle = async (layerId: string) => {
    setLoadingLayer(layerId)
    
    const layer = layerManager.getLayerInfo(layerId)
    if (!layer) return

    if (layer.enabled) {
      layerManager.disableLayer(layerId)
    } else {
      layerManager.enableLayer(layerId)
    }

    // Simulate loading time for demonstration
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setEnabledLayers(layerManager.getEnabledLayers())
    setLoadingLayer(null)
  }

  const handleLocationChange = (location: typeof testLocations[0]) => {
    setCurrentLocation(location)
    // In a real implementation, this would reload terrain data
  }

  const startAnimation = () => {
    setIsAnimating(true)
    // Cycle through locations every 3 seconds
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % testLocations.length
      setCurrentLocation(testLocations[index])
    }, 3000)

    // Stop after 4 cycles
    setTimeout(() => {
      clearInterval(interval)
      setIsAnimating(false)
    }, 12000)
  }

  const layerDescriptions = {
    'modis_true_color': 'Realistic satellite imagery showing the actual appearance of Earth from space',
    'modis_ndvi': 'Vegetation health indicator - green shows healthy plants, red shows stressed vegetation',
    'viirs_ndvi': 'High-resolution vegetation data for detailed crop analysis and field monitoring',
    'modis_lst_day': 'Daytime surface temperature - red areas are hot, blue areas are cool',
    'modis_lst_night': 'Nighttime surface temperature for thermal analysis and frost prediction',
    'smap_soil_moisture': 'Soil water content - blue indicates wet soil, brown indicates dry soil',
    'gpm_precipitation': 'Real-time rainfall data updated every 30 minutes for weather monitoring',
    'vegetation_health': 'Combined stress indicator using temperature, moisture, and vegetation health'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/50 border-b border-cyan-400/30 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
            NASA Satellite Data Layers - Live Demo
          </h1>
          <p className="text-gray-300 mb-4">
            Interactive demonstration of 7 NASA datasets integrated into 3D terrain visualization
          </p>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"/>
              <span>Live NASA Data</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">{enabledLayers.length}</span>
              <span>Active Layers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">{currentLocation.name}</span>
              <span>Current Location</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Layer Controls */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                🛰️ NASA Data Layers
                <span className="text-sm font-normal text-gray-400">({Object.keys(layerManager.getAllLayers()).length} available)</span>
              </h2>
              
              <div className="space-y-3">
                {layerManager.getAllLayers().map((layer) => {
                  const isLoading = loadingLayer === layer.id
                  const icons = {
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
                    <div key={layer.id} className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/30">
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() => handleLayerToggle(layer.id)}
                          disabled={isLoading}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            layer.enabled 
                              ? 'bg-green-600 text-white shadow-lg scale-110' 
                              : 'bg-gray-600 text-gray-400 hover:bg-gray-500'
                          } ${isLoading ? 'animate-pulse' : ''}`}
                        >
                          {isLoading ? '⏳' : (layer.enabled ? '✓' : '○')}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{icons[layer.id as keyof typeof icons]}</span>
                            <span className="font-medium text-white">{layer.name}</span>
                            {layer.apiKey && (
                              <span className="text-xs bg-yellow-600/20 text-yellow-300 px-1 py-0.5 rounded">
                                🔐
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {layerDescriptions[layer.id as keyof typeof layerDescriptions]}
                          </p>
                        </div>
                      </div>
                      
                      {layer.enabled && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-400">Opacity:</span>
                            <span className="text-xs text-cyan-400">{Math.round(layer.opacity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={layer.opacity}
                            onChange={(e) => {
                              layerManager.setLayerOpacity(layer.id, parseFloat(e.target.value))
                              setEnabledLayers([...layerManager.getEnabledLayers()])
                            }}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Location Controls */}
            <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                📍 Test Locations
              </h3>
              
              <div className="space-y-2 mb-4">
                {testLocations.map((location) => (
                  <button
                    key={location.name}
                    onClick={() => handleLocationChange(location)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      currentLocation.name === location.name
                        ? 'bg-cyan-600/20 border border-cyan-400/50 text-cyan-300'
                        : 'bg-gray-700/30 hover:bg-gray-600/40 text-gray-300'
                    }`}
                  >
                    <div className="font-medium">{location.name}</div>
                    <div className="text-xs text-gray-400">{location.description}</div>
                    <div className="text-xs text-green-400 mt-1">
                      {location.lat.toFixed(3)}°, {location.lng.toFixed(3)}°
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={startAnimation}
                disabled={isAnimating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {isAnimating ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Auto-cycling locations...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Location Tour
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Visualization Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-6 h-[600px] relative overflow-hidden">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🗺️ 3D Terrain Visualization
                <span className="text-sm font-normal text-gray-400">
                  ({currentLocation.name})
                </span>
              </h3>

              {/* Simulated 3D Terrain View */}
              <div className="relative w-full h-full bg-gradient-to-b from-sky-700 to-green-700 rounded-lg overflow-hidden">
                {/* Layer effect overlays */}
                {enabledLayers.includes('modis_true_color') && (
                  <div 
                    className="absolute inset-0 opacity-90"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 30% 40%, rgba(34, 197, 94, 0.8) 0%, transparent 50%),
                        radial-gradient(circle at 70% 60%, rgba(132, 204, 22, 0.6) 0%, transparent 50%),
                        radial-gradient(circle at 50% 30%, rgba(22, 163, 74, 0.7) 0%, transparent 40%)
                      `
                    }}
                  />
                )}
                
                {enabledLayers.includes('modis_ndvi') && (
                  <div 
                    className="absolute inset-0 opacity-60 animate-pulse"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 40% 50%, rgba(34, 197, 94, 0.9) 0%, transparent 30%),
                        radial-gradient(circle at 60% 70%, rgba(22, 163, 74, 0.8) 0%, transparent 25%)
                      `
                    }}
                  />
                )}

                {enabledLayers.includes('modis_lst_day') && (
                  <div 
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 65% 35%, rgba(239, 68, 68, 0.7) 0%, transparent 40%),
                        radial-gradient(circle at 25% 75%, rgba(59, 130, 246, 0.6) 0%, transparent 35%)
                      `
                    }}
                  />
                )}

                {enabledLayers.includes('smap_soil_moisture') && (
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.8) 0%, transparent 45%),
                        radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.6) 0%, transparent 40%)
                      `
                    }}
                  />
                )}

                {/* 3D Terrain Grid Effect */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    transform: 'perspective(500px) rotateX(60deg) scale(1.5)'
                  }}
                />

                {/* Location Marker */}
                <div 
                  className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-bounce"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />

                {/* Layer Status Overlay */}
                <div className="absolute top-4 left-4 bg-black/70 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-sm font-medium text-white mb-2">Active Layers</div>
                  <div className="flex flex-wrap gap-1">
                    {enabledLayers.map((layerId) => {
                      const layer = layerManager.getLayerInfo(layerId)
                      const icons = {
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
                          className="flex items-center gap-1 bg-cyan-600/20 text-cyan-300 px-2 py-1 rounded text-xs"
                          title={layer?.name}
                        >
                          <span>{icons[layerId as keyof typeof icons]}</span>
                          <span>{Math.round((layer?.opacity || 0) * 100)}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Location Info */}
                <div className="absolute bottom-4 right-4 bg-black/70 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-xs text-gray-400">Current Location</div>
                  <div className="text-sm font-medium text-white">{currentLocation.name}</div>
                  <div className="text-xs text-cyan-300">{currentLocation.lat.toFixed(4)}°, {currentLocation.lng.toFixed(4)}°</div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="mt-4 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-300 mb-1">Demo Information</div>
                  <p className="text-xs text-gray-300 mb-2">
                    This demo shows how NASA satellite data layers can be integrated into 3D terrain visualization. 
                    Toggle layers to see different data overlays, and switch locations to explore various farming regions.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <a 
                      href="/nasa-layers-guide" 
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Implementation Guide
                    </a>
                    <span>• 7 NASA datasets available</span>
                    <span>• Real-time updates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}