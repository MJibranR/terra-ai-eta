"use client"

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

// Enhanced CSS 3D Farm with realistic visualization
function CSS3DFarm({ farmData, activeLayers, onFieldClick }: {
  farmData?: any
  activeLayers?: string[]
  onFieldClick?: (fieldId: string) => void
}) {
  const [rotation, setRotation] = useState(0)
  const [hoveredField, setHoveredField] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.3)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const temp = farmData?.realTimeData?.temperature?.[0]?.value || 22
  const moisture = (farmData?.realTimeData?.soilMoisture?.[0]?.value || 0.45) * 100
  const ndvi = farmData?.realTimeData?.vegetation?.[0]?.ndvi || 0.7

  const fields = [
    { x: -80, z: -80, crop: 'corn', color: 'bg-green-400', label: '🌽', name: 'Corn Field', health: 85 },
    { x: 80, z: -80, crop: 'wheat', color: 'bg-yellow-400', label: '🌾', name: 'Wheat Field', health: 92 },
    { x: -80, z: 80, crop: 'soybeans', color: 'bg-green-500', label: '🫘', name: 'Soybean Field', health: 78 },
    { x: 80, z: 80, crop: 'cotton', color: 'bg-white', label: '🌱', name: 'Cotton Field', health: 88 }
  ]

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-900/20 via-green-900/10 to-yellow-900/20 rounded-xl overflow-hidden perspective-1000">
      {/* 3D Farm Scene */}
      <div 
        className="absolute inset-0 flex items-center justify-center transform-gpu"
        style={{
          transform: `rotateX(65deg) rotateY(${rotation}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Enhanced Ground with grid pattern */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-br from-green-800/30 to-brown-800/30 rounded-2xl border border-green-500/20 shadow-2xl"
          style={{ 
            transform: 'translateZ(-30px)',
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Farm Fields with enhanced interaction */}
        {fields.map((field, i) => (
          <div
            key={i}
            className={`absolute w-20 h-20 ${field.color} rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-2xl shadow-xl border-2 ${
              hoveredField === field.crop 
                ? 'scale-125 border-cyan-400 shadow-cyan-400/50' 
                : 'border-white/20 hover:scale-110 hover:border-white/40'
            }`}
            style={{
              transform: `translateX(${field.x}px) translateZ(${field.z}px) rotateX(-65deg) translateY(-10px)`,
              boxShadow: hoveredField === field.crop 
                ? '0 20px 40px rgba(6, 182, 212, 0.4)' 
                : '0 10px 20px rgba(0, 0, 0, 0.3)'
            }}
            onClick={() => onFieldClick?.(field.crop)}
            onMouseEnter={() => setHoveredField(field.crop)}
            onMouseLeave={() => setHoveredField(null)}
            title={`${field.name} - Health: ${field.health}% - Click to analyze`}
          >
            <div className="text-3xl mb-1">{field.label}</div>
            <div className="text-xs text-black/70 font-bold">{field.health}%</div>
          </div>
        ))}

        {/* Enhanced Data Indicators with animation */}
        <div
          className="absolute w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-xl animate-pulse"
          style={{
            transform: 'translateX(-120px) translateY(-60px) translateZ(40px) rotateX(-65deg)'
          }}
        >
          <div className="text-2xl">🌡️</div>
          <div className="text-xs">{temp.toFixed(1)}°</div>
        </div>
        
        <div
          className="absolute w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-xl animate-pulse"
          style={{
            transform: 'translateX(120px) translateY(-60px) translateZ(40px) rotateX(-65deg)'
          }}
        >
          <div className="text-2xl">💧</div>
          <div className="text-xs">{moisture.toFixed(0)}%</div>
        </div>

        {/* NDVI Indicator */}
        <div
          className="absolute w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-xl animate-pulse"
          style={{
            transform: 'translateX(0px) translateY(-80px) translateZ(60px) rotateX(-65deg)'
          }}
        >
          <div className="text-2xl">🌱</div>
          <div className="text-xs">{ndvi.toFixed(2)}</div>
        </div>

        {/* Farm Equipment */}
        <div
          className="absolute w-8 h-12 bg-gradient-to-b from-red-600 to-red-800 rounded-lg shadow-lg"
          style={{
            transform: `translateX(${Math.sin(rotation * 0.02) * 50}px) translateZ(${Math.cos(rotation * 0.02) * 50}px) rotateX(-65deg) translateY(-5px)`
          }}
          title="Farm Tractor"
        >
          <div className="text-lg text-center">🚜</div>
        </div>
      </div>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 glass-light px-4 py-2 rounded-lg">
        <h3 className="glass-text-primary font-semibold text-lg">NASA Farm Visualization</h3>
        {farmData?.location?.name && (
          <p className="glass-text-secondary text-sm">📍 {farmData.location.name}</p>
        )}
      </div>

      {/* Data Panel */}
      <div className="absolute top-4 right-4 space-y-2">
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
            <span className="text-cyan-400">🛰️</span>
            <span className="glass-text-primary text-sm">{activeLayers?.length || 0} layers</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="absolute bottom-4 left-4">
        <div className="glass-light px-3 py-2 rounded-lg">
          <p className="glass-text-secondary text-xs">🖱️ Click crops to analyze • Auto-rotating view</p>
        </div>
      </div>

      {/* Field Details Overlay */}
      {hoveredField && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-panel p-4 rounded-xl border border-cyan-400/50 shadow-lg shadow-cyan-400/20 z-10">
          <div className="text-center">
            <div className="text-3xl mb-2">
              {fields.find(f => f.crop === hoveredField)?.label}
            </div>
            <div className="font-semibold text-cyan-300 mb-1">
              {fields.find(f => f.crop === hoveredField)?.name}
            </div>
            <div className="text-sm text-gray-300 mb-2">
              Health: <span className="text-green-400 font-bold">{fields.find(f => f.crop === hoveredField)?.health}%</span>
            </div>
            <div className="text-xs text-gray-400 bg-black/30 rounded px-2 py-1">
              🛰️ Click for NASA satellite analysis
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
        <h3 className="text-lg font-semibold mb-2">Loading 3D Farm</h3>
        <p className="text-sm text-gray-300">Initializing visualization...</p>
      </div>
    </div>
  )
}

// Main Reliable Farm 3D Component
interface ReliableFarm3DProps {
  farmData?: any
  activeLayers?: string[]
  onFieldClick?: (fieldId: string) => void
}

export default function ReliableFarm3D({ farmData, activeLayers, onFieldClick }: ReliableFarm3DProps) {
  const [isClient, setIsClient] = useState(false)
  const [useCSS3D, setUseCSS3D] = useState(true) // Always use CSS 3D for reliability

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleFieldClick = (fieldId: string) => {
    console.log('Field clicked:', fieldId)
    onFieldClick?.(fieldId)
  }

  if (!isClient) {
    return <Farm3DLoading />
  }

  return (
    <CSS3DFarm 
      farmData={farmData}
      activeLayers={activeLayers}
      onFieldClick={handleFieldClick}
    />
  )
}