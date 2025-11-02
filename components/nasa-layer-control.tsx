/**
 * NASA Layer Control Panel - Interactive layer management for 3D terrain
 * Allows users to toggle and adjust NASA satellite data layers
 */

"use client"

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Settings, Info, Layers } from 'lucide-react'
import { NASALayerManager, NASA_LAYERS } from '@/lib/nasa-layer-manager'

interface LayerControlProps {
  layerManager: NASALayerManager
  onLayerChange: (enabledLayers: string[]) => void
}

export function NASALayerControl({ layerManager, onLayerChange }: LayerControlProps) {
  const [layers, setLayers] = useState(layerManager.getAllLayers())
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const handleToggleLayer = (layerId: string) => {
    const layer = layerManager.getLayerInfo(layerId)
    if (!layer) return

    if (layer.enabled) {
      layerManager.disableLayer(layerId)
    } else {
      layerManager.enableLayer(layerId)
    }

    setLayers([...layerManager.getAllLayers()])
    onLayerChange(layerManager.getEnabledLayers())
  }

  const handleOpacityChange = (layerId: string, opacity: number) => {
    layerManager.setLayerOpacity(layerId, opacity)
    setLayers([...layerManager.getAllLayers()])
    onLayerChange(layerManager.getEnabledLayers())
  }

  const getLayerIcon = (layerId: string) => {
    switch (layerId) {
      case 'modis_true_color': return '🌍'
      case 'modis_ndvi': return '🌿'
      case 'viirs_ndvi': return '🌾'
      case 'modis_lst_day': return '🌡️'
      case 'modis_lst_night': return '🌙'
      case 'smap_soil_moisture': return '💧'
      case 'gpm_precipitation': return '🌧️'
      case 'vegetation_health': return '🌱'
      default: return '📊'
    }
  }

  const getUpdateFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'realtime': return 'text-red-400'
      case 'daily': return 'text-green-400'
      case '8day': return 'text-blue-400'
      case '16day': return 'text-purple-400'
      case 'monthly': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-700">
        <Layers className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white">NASA Data Layers</h3>
        <div className="ml-auto text-xs text-gray-400">
          {layerManager.getEnabledLayers().length} active
        </div>
      </div>

      {/* Layer List */}
      <div className="space-y-3">
        {layers.map((layer) => (
          <div key={layer.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            {/* Layer Header */}
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => handleToggleLayer(layer.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  layer.enabled 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-600 text-gray-400'
                }`}
              >
                {layer.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getLayerIcon(layer.id)}</span>
                  <span className="font-medium text-white">{layer.name}</span>
                  {layer.apiKey && (
                    <span className="text-xs bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded">
                      🔐 API Key
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{layer.description}</p>
              </div>

              <button
                onClick={() => setShowDetails(showDetails === layer.id ? null : layer.id)}
                className="w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
              >
                <Info className="w-3 h-3 text-gray-300" />
              </button>
            </div>

            {/* Opacity Slider */}
            {layer.enabled && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400">Opacity</span>
                  <span className="text-xs text-cyan-400">{Math.round(layer.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={layer.opacity}
                  onChange={(e) => handleOpacityChange(layer.id, parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            )}

            {/* Layer Details */}
            {showDetails === layer.id && (
              <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Update:</span>
                    <span className={`ml-1 font-medium ${getUpdateFrequencyColor(layer.updateFrequency)}`}>
                      {layer.updateFrequency}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Format:</span>
                    <span className="ml-1 text-white font-medium">{layer.dataFormat.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Service:</span>
                    <span className="ml-1 text-cyan-300 font-medium">{layer.tileService.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Z-Index:</span>
                    <span className="ml-1 text-white font-medium">{layer.zIndex}</span>
                  </div>
                </div>

                {/* Implementation Guide */}
                <div className="mt-3 p-2 bg-gray-700/30 rounded text-xs">
                  <div className="text-cyan-300 font-medium mb-1">🔧 How to Use:</div>
                  {layer.id === 'modis_true_color' && (
                    <p className="text-gray-300">Base terrain texture - realistic Earth surface imagery. Always enabled for realistic ground visualization.</p>
                  )}
                  {layer.id === 'modis_ndvi' && (
                    <p className="text-gray-300">Vegetation overlay - Shows plant health in green tones. Blend with base layer to highlight growing areas.</p>
                  )}
                  {layer.id === 'viirs_ndvi' && (
                    <p className="text-gray-300">High-resolution vegetation - Switch to this when zooming into specific farm regions for detailed crop analysis.</p>
                  )}
                  {layer.id === 'modis_lst_day' && (
                    <p className="text-gray-300">Daytime heat map - Red/orange for hot areas, blue for cool. Use for heat stress analysis.</p>
                  )}
                  {layer.id === 'modis_lst_night' && (
                    <p className="text-gray-300">Nighttime temperatures - Animate between day/night for thermal simulation.</p>
                  )}
                  {layer.id === 'smap_soil_moisture' && (
                    <p className="text-gray-300">Soil water content - Blue overlay for wet areas. Critical for irrigation planning.</p>
                  )}
                  {layer.id === 'gpm_precipitation' && (
                    <p className="text-gray-300">Real-time rainfall - Animated precipitation overlay. Updates every 30 minutes.</p>
                  )}
                  {layer.id === 'vegetation_health' && (
                    <p className="text-gray-300">Plant stress indicator - Combined temperature + vegetation health. Green=healthy, red=stressed.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Presets */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-sm font-medium text-gray-300 mb-2">🎯 Quick Presets</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              // Basic View: True Color + NDVI
              layerManager.disableLayer('viirs_ndvi')
              layerManager.disableLayer('modis_lst_day')
              layerManager.disableLayer('modis_lst_night')
              layerManager.disableLayer('smap_soil_moisture')
              layerManager.disableLayer('gpm_precipitation')
              layerManager.disableLayer('vegetation_health')
              layerManager.enableLayer('modis_true_color')
              layerManager.enableLayer('modis_ndvi')
              setLayers([...layerManager.getAllLayers()])
              onLayerChange(layerManager.getEnabledLayers())
            }}
            className="px-3 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-300 rounded text-xs transition-colors"
          >
            🌿 Basic View
          </button>
          <button
            onClick={() => {
              // Climate View: All weather layers
              layerManager.enableLayer('modis_true_color')
              layerManager.enableLayer('modis_lst_day')
              layerManager.enableLayer('smap_soil_moisture')
              layerManager.enableLayer('gpm_precipitation')
              layerManager.disableLayer('modis_ndvi')
              layerManager.disableLayer('viirs_ndvi')
              layerManager.disableLayer('vegetation_health')
              setLayers([...layerManager.getAllLayers()])
              onLayerChange(layerManager.getEnabledLayers())
            }}
            className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded text-xs transition-colors"
          >
            🌧️ Climate
          </button>
        </div>
      </div>
    </div>
  )
}

// Add custom CSS for slider styling
export const LayerControlStyles = `
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #06b6d4;
  cursor: pointer;
  border: 2px solid #1f2937;
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #06b6d4;
  cursor: pointer;
  border: 2px solid #1f2937;
}
`