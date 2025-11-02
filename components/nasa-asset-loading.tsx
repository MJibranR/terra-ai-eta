/**
 * NASA Asset Loading Status Component
 * Shows progress and attribution for NASA 3D Resources
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Satellite, Download, Check, AlertCircle, ExternalLink } from 'lucide-react'
import { NASA_LIVE_TERRAIN_LAYERS, nasaLiveAssetManager } from '@/lib/nasa-live-assets'

interface NASAAssetLoadingProps {
  onAssetsReady?: (ready: boolean) => void
}

const NASAAssetLoading: React.FC<NASAAssetLoadingProps> = ({ onAssetsReady }) => {
  const [loadingStatus, setLoadingStatus] = useState<{
    [assetId: string]: 'pending' | 'loading' | 'loaded' | 'error'
  }>({})
  const [overallProgress, setOverallProgress] = useState(0)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const loadAssets = async () => {
      const liveAssets = NASA_LIVE_TERRAIN_LAYERS.slice(0, 4) // Load first 4 live terrain layers
      const total = liveAssets.length
      let loaded = 0

      // Initialize loading status
      const initialStatus: any = {}
      liveAssets.forEach(asset => {
        initialStatus[asset.id] = 'pending'
      })
      setLoadingStatus(initialStatus)

      // Load live NASA assets sequentially
      for (const asset of liveAssets) {
        setLoadingStatus(prev => ({ ...prev, [asset.id]: 'loading' }))
        
        try {
          // Load live terrain texture from NASA GIBS
          await nasaLiveAssetManager.loadLiveTerrainTexture(asset.id)
          console.log(`✅ Loaded live NASA asset: ${asset.name}`)
          
          setLoadingStatus(prev => ({ ...prev, [asset.id]: 'loaded' }))
          loaded++
        } catch (error) {
          console.warn(`⚠️ Failed to load live NASA asset ${asset.id}:`, error)
          setLoadingStatus(prev => ({ ...prev, [asset.id]: 'error' }))
          loaded++ // Count errors as completed for progress
        }
        
        setOverallProgress((loaded / total) * 100)
      }

      onAssetsReady?.(true)
    }

    loadAssets()
  }, [onAssetsReady])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'loaded':
        return <Check className="w-3 h-3 text-green-400" />
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400" />
      default:
        return <div className="w-3 h-3 border border-gray-500 rounded-full" />
    }
  }

  const getAssetDescription = (asset: any) => {
    if ('category' in asset) {
      return asset.description
    } else {
      return `${asset.name} - ${asset.resolution} texture`
    }
  }

  return (
    <Card className="bg-black/80 backdrop-blur-xl border border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <Satellite className="w-4 h-4 text-blue-400" />
          NASA 3D Resources Integration
          <Badge variant="secondary" className="ml-2 text-xs">
            {Math.round(overallProgress)}% Loaded
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Authentic NASA models and textures</span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-400 hover:text-blue-300"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        {/* Asset Loading Details */}
        {showDetails && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <div className="text-xs font-medium text-blue-300 mb-2">
              Loading Status:
            </div>
            
            {/* 3D Models */}
            <div className="text-xs text-gray-400 mb-1">Satellite Models:</div>
            {NASA_LIVE_TERRAIN_LAYERS.slice(0, 3).map(asset => (
              <div key={asset.id} className="flex items-center gap-2 text-xs py-1">
                {getStatusIcon(loadingStatus[asset.id])}
                <span className="flex-1 text-gray-300">{asset.name}</span>
                <Badge className="bg-purple-600/20 text-purple-300 text-[10px]">
                  {asset.coverage}
                </Badge>
              </div>
            ))}

            {/* Terrain Textures */}
            <div className="text-xs text-gray-400 mb-1 mt-3">Terrain Textures:</div>
            {NASA_LIVE_TERRAIN_LAYERS.slice(3, 4).map(texture => (
              <div key={texture.id} className="flex items-center gap-2 text-xs py-1">
                {getStatusIcon(loadingStatus[texture.id])}
                <span className="flex-1 text-gray-300">{texture.name}</span>
                <Badge className="bg-green-600/20 text-green-300 text-[10px]">
                  {texture.resolution}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
          <div className="text-center">
            <div className="text-blue-400 font-bold">3</div>
            <div className="text-gray-400">Satellites</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-bold">2</div>
            <div className="text-gray-400">Textures</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-bold">Live</div>
            <div className="text-gray-400">Data</div>
          </div>
        </div>

        {/* Attribution and Source */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-400">
              Source: NASA 3D Resources Repository
            </div>
            <a
              href="https://github.com/nasa/NASA-3D-Resources"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
            >
              <ExternalLink className="w-3 h-3" />
              View Repo
            </a>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">
            NASA/JPL-Caltech • NASA GSFC • NASA ARC
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default NASAAssetLoading