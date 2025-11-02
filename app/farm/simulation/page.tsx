/**
 * Real-Time NASA Farm Simulation - Responsive Ultra-High Resolution 3D
 * Fixed hydration error with proper SSR handling
 */

"use client"
import { useRef, useState, useEffect } from 'react'
import { Satellite, Sprout, Droplets, Thermometer, Cloud, Map, Layers, Smartphone, Tablet, Monitor } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3, 
  Play, 
  Pause,
  RotateCcw,
  Maximize2,
  RefreshCw,
  Target,
  Menu,
  X
} from 'lucide-react'

// Fixed responsive hook with SSR support
function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: 1200, // Default desktop size for SSR
    height: 800,
  })

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // During SSR, default to desktop to avoid hydration mismatch
  const isMobile = isMounted ? windowSize.width < 768 : false
  const isTablet = isMounted ? windowSize.width >= 768 && windowSize.width < 1024 : false
  const isDesktop = isMounted ? windowSize.width >= 1024 : true // Default to desktop for SSR
  const isLargeDesktop = isMounted ? windowSize.width >= 1536 : false

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isMounted,
    deviceIcon: isMobile ? <Smartphone className="w-4 h-4" /> : 
                 isTablet ? <Tablet className="w-4 h-4" /> : 
                 <Monitor className="w-4 h-4" />
  }
}

// Helper function to get consistent text across SSR and client
function getResolutionText(responsive: any) {
  if (!responsive.isMounted) {
    // During SSR, return a consistent default
    return "Ultra-HD Resolution • Enhanced 3D • Live Data"
  }

  return responsive.isLargeDesktop ? '4K Resolution • Multi-Source Fusion • Real-time Analytics' :
         responsive.isDesktop ? '2K Resolution • Enhanced 3D • Live Data' :
         responsive.isTablet ? 'HD Resolution • Responsive 3D • NASA Data' :
         'Mobile 3D • Touch Optimized • Live Data'
}

function getBadgeText(responsive: any) {
  if (!responsive.isMounted) {
    return "HD"
  }

  return responsive.isLargeDesktop ? '4K' : 
         responsive.isDesktop ? '2K' : 
         responsive.isTablet ? 'HD' : 'Mobile'
}

// Ultra-High Resolution 3D Terrain Component
function UltraHighRes3DTerrain({ 
  nasaData, 
  gameState, 
  onCellClick, 
  selectedAction,
  responsive 
}: {
  nasaData: any
  gameState: any
  onCellClick: (x: number, y: number) => void
  selectedAction: any
  responsive: any
}) {
  const terrainRef = useRef<HTMLDivElement>(null)
  
  // Adaptive grid size based on screen size - consistent between SSR and client
  const gridSize = !responsive.isMounted ? 12 : // Default for SSR
                   responsive.isMobile ? 8 : 
                   responsive.isTablet ? 10 : 
                   responsive.isLargeDesktop ? 16 : 12
  
  const cellSize = !responsive.isMounted ? 35 : // Default for SSR
                   responsive.isMobile ? 25 : 
                   responsive.isTablet ? 30 : 
                   responsive.isLargeDesktop ? 40 : 35

  if (!nasaData?.data) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-900 via-blue-800 to-green-900 rounded-lg">
        <div className="text-center text-white p-4">
          <Satellite className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-4 animate-spin text-blue-400" />
          <p className="text-base md:text-lg font-bold">🛰️ Fetching Ultra-HD NASA Data</p>
          <p className="text-xs md:text-sm text-gray-200 mt-2">10m Resolution • Multi-Source Fusion • Real-time Analytics</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 md:w-3 md:h-3 bg-purple-400 rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={terrainRef}
      className="relative w-full h-full bg-gradient-to-b from-sky-900 via-blue-800 to-green-900 rounded-lg overflow-hidden"
    >
      {/* 3D Terrain Grid with Enhanced Resolution */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `perspective(${!responsive.isMounted ? '1000px' : responsive.isMobile ? '800px' : '1000px'}) rotateX(60deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {Array.from({ length: gridSize }, (_, x) =>
          Array.from({ length: gridSize }, (_, y) => {
            // Enhanced data simulation with ultra-high resolution patterns
            const baseX = x / gridSize
            const baseY = y / gridSize
            
            // Multi-layer data simulation for ultra-high resolution
            const ndviValue = 0.3 + 0.5 * Math.sin(baseX * 8) * Math.cos(baseY * 8) + 
                            0.2 * Math.sin(baseX * 16 + baseY * 16)
            const moistureValue = 0.2 + 0.3 * Math.sin(baseX * 6 + 1) * Math.cos(baseY * 6 + 1)
            const tempValue = 20 + 10 * Math.sin(baseX * 4) + 5 * Math.cos(baseY * 4)
            const precipValue = Math.max(0, Math.sin(baseX * 12) * Math.cos(baseY * 12)) * 3

            // Ultra-detailed height mapping
            const height = 10 + (ndviValue * 30) + (moistureValue * 15) + 
                          (Math.sin(baseX * 20) * Math.cos(baseY * 20) * 8)

            // Advanced color grading for ultra-high resolution
            let cellColor = '#16a34a'
            let cellOpacity = 0.85

            // Micro-variations in vegetation health
            if (ndviValue > 0.7) {
              cellColor = '#22c55e' // Very healthy
              if (Math.sin(baseX * 32) > 0.8) cellColor = '#16a34a' // Micro-variation
            } else if (ndviValue > 0.5) {
              cellColor = '#eab308' // Moderate
              if (Math.cos(baseY * 28) > 0.7) cellColor = '#ca8a04' // Micro-variation
            } else {
              cellColor = '#ef4444' // Stressed
              if (Math.sin(baseX * 24 + baseY * 24) > 0.6) cellColor = '#dc2626' // Micro-variation
            }

            // Ultra-detailed moisture effects
            if (moistureValue > 0.25) {
              const moistureIntensity = Math.min(1, moistureValue * 2)
              // Use template literals for color mixing (fallback for browsers that don't support color-mix)
              cellColor = moistureIntensity > 0.5 ? '#06b6d4' : cellColor
              cellOpacity = 0.9 + moistureValue * 0.1
            } else if (moistureValue < 0.15) {
              cellColor = '#92400e'
              cellOpacity = 0.7
            }

            // Micro-temperature stress patterns
            if (tempValue > 32) {
              cellColor = '#dc2626'
            }

            const centerX = !responsive.isMounted ? 400 : responsive.windowSize.width * 0.4
            const centerY = !responsive.isMounted ? 300 : responsive.windowSize.height * 0.3

            return (
              <div key={`${x}-${y}`}>
                {/* Ultra-detailed terrain cell */}
                <div
                  className="absolute transition-all duration-500 hover:scale-125 hover:z-50 cursor-pointer border border-white/10 shadow-2xl"
                  style={{
                    left: `${centerX + (x - gridSize/2) * cellSize}px`,
                    top: `${centerY + (y - gridSize/2) * cellSize - height}px`,
                    width: `${cellSize - 1}px`,
                    height: `${cellSize - 1}px`,
                    backgroundColor: cellColor,
                    opacity: cellOpacity,
                    transform: `translateZ(${height}px) rotateX(2deg)`,
                    borderRadius: '4px',
                    boxShadow: `
                      0 ${height/3}px ${height/1.5}px rgba(0,0,0,0.6),
                      inset 0 1px 0 rgba(255,255,255,0.2),
                      inset 0 -1px 0 rgba(0,0,0,0.4)
                    `,
                    border: selectedAction ? '2px solid #00ffff' : '1px solid rgba(255,255,255,0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onClick={() => onCellClick(x, y)}
                  title={`Ultra-HD Analysis\nNDVI: ${ndviValue.toFixed(3)}\nMoisture: ${(moistureValue * 100).toFixed(1)}%\nTemp: ${tempValue.toFixed(1)}°C`}
                >
                  {/* Micro-crop indicators */}
                  {ndviValue > 0.5 && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-2 bg-green-300 rounded-full animate-pulse shadow-lg" />
                    </div>
                  )}
                  
                  {/* Soil texture overlay */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3)_0%,transparent_50%)] rounded" />
                </div>

                {/* Enhanced precipitation effects */}
                {precipValue > 0.5 && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${centerX + (x - gridSize/2) * cellSize}px`,
                      top: `${centerY * 0.7 + (y - gridSize/2) * cellSize}px`,
                      width: `${cellSize}px`,
                      height: `${cellSize}px`
                    }}
                  >
                    {Array.from({ length: Math.floor(precipValue * 4) }, (_, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-3 bg-cyan-300 opacity-80 animate-bounce rounded-full"
                        style={{
                          left: `${Math.random() * cellSize}px`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${0.5 + Math.random() * 1}s`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Responsive NASA Data Overlay */}
      <div className={`absolute top-2 left-2 ${!responsive.isMounted ? 'bg-black/70' : responsive.isMobile ? 'bg-black/90' : 'bg-black/70'} rounded-lg p-2 md:p-3 backdrop-blur-sm max-w-[90%]`}>
        <h3 className="text-white font-bold mb-1 md:mb-2 text-xs md:text-sm">🛰️ Ultra-HD NASA Data</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1 md:gap-2">
            <Sprout className="w-3 h-3 text-green-400" />
            <span className="text-gray-300 truncate">NDVI: {nasaData.data.ndvi.current.toFixed(3)}</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span className="text-gray-300 truncate">Soil: {(nasaData.data.soilMoisture.current * 100).toFixed(1)}%</span>
          </div>
          {(!responsive.isMounted || !responsive.isMobile) && (
            <>
              <div className="flex items-center gap-1 md:gap-2">
                <Thermometer className="w-3 h-3 text-orange-400" />
                <span className="text-gray-300">Temp: {nasaData.data.temperature.current.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Cloud className="w-3 h-3 text-cyan-400" />
                <span className="text-gray-300">Rain: {nasaData.data.precipitation.current.toFixed(1)}mm</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Responsive Game Status HUD */}
      <div className={`absolute top-2 right-2 ${!responsive.isMounted ? 'bg-black/70' : responsive.isMobile ? 'bg-black/90' : 'bg-black/70'} rounded-lg p-2 md:p-3 backdrop-blur-sm`}>
        <div className="text-white font-bold mb-1 text-xs md:text-sm">🎮 Farm Status</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-2">
            <span className="text-gray-300">Health:</span>
            <span className={`font-bold ${gameState.cropHealth > 70 ? 'text-green-400' : gameState.cropHealth > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {gameState.cropHealth}%
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-300">Money:</span>
            <span className="text-green-400 font-bold">${gameState.money}</span>
          </div>
          {(!responsive.isMounted || !responsive.isMobile) && (
            <>
              <div className="flex justify-between gap-2">
                <span className="text-gray-300">Day:</span>
                <span className="text-blue-400 font-bold">{gameState.day}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-gray-300">Weather:</span>
                <span className="text-cyan-400 font-bold capitalize">{gameState.weather}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Action Recommendations */}
      {nasaData.data.gameMetrics?.actionRecommendations?.length > 0 && (!responsive.isMounted || !responsive.isMobile) && (
        <div className="absolute bottom-2 left-2 bg-yellow-900/80 border border-yellow-500/50 rounded-lg p-2 md:p-3 backdrop-blur-sm max-w-md">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
            <span className="text-yellow-300 font-bold text-xs md:text-sm">NASA Recommendations</span>
          </div>
          <div className="space-y-1">
            {nasaData.data.gameMetrics.actionRecommendations.slice(0, 2).map((rec: string, i: number) => (
              <div key={i} className="text-xs text-yellow-200">{rec}</div>
            ))}
          </div>
        </div>
      )}

      {/* Resolution Indicator */}
      <div className="absolute bottom-2 right-2 bg-purple-900/70 border border-purple-500/50 rounded-lg p-2 backdrop-blur-sm">
        <div className="text-xs text-purple-300 font-bold">
          {getBadgeText(responsive)} • 10m
        </div>
      </div>
    </div>
  )
}

// Responsive Player Actions Panel
function ResponsivePlayerActions({ 
  gameState, 
  selectedAction, 
  onActionSelect, 
  onExecuteAction,
  nasaData,
  responsive 
}: {
  gameState: any
  selectedAction: any
  onActionSelect: (action: any) => void
  onExecuteAction: (action: any) => void
  nasaData: any
  responsive: any
}) {
  const actions = [
    {
      type: 'irrigate',
      cost: 50,
      effect: 'Increase soil moisture',
      nasaDataUsed: ['SMAP Soil Moisture', 'MODIS NDVI'],
      icon: '💧'
    },
    {
      type: 'fertilize',
      cost: 100,
      effect: 'Boost NDVI growth',
      nasaDataUsed: ['MODIS NDVI', 'MODIS LST'],
      icon: '🌱'
    },
    {
      type: 'plant',
      cost: 200,
      effect: 'Establish crops',
      nasaDataUsed: ['SMAP Moisture', 'GPM Precipitation'],
      icon: '🌾'
    },
    {
      type: 'harvest',
      cost: 75,
      effect: 'Collect crops',
      nasaDataUsed: ['MODIS NDVI', 'VIIRS NDVI'],
      icon: '🚜'
    }
  ]

  return (
    <Card className="bg-black/80 backdrop-blur-xl border border-blue-500/30">
      <CardHeader className={(!responsive.isMounted || responsive.isMobile) ? "pb-2" : ""}>
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <Target className="w-4 h-4 text-green-400" />
          Farm Actions
          <Badge className="ml-2 bg-green-600/20 text-green-300 text-xs">
            NASA-Guided
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className={(!responsive.isMounted || responsive.isMobile) ? "space-y-1" : "space-y-2"}>
        {actions.map((action) => {
          const canAfford = gameState.money >= action.cost
          const isSelected = selectedAction?.type === action.type
          
          return (
            <div key={action.type} className={`p-2 md:p-3 rounded-lg border transition-all cursor-pointer ${
              isSelected 
                ? 'border-cyan-400 bg-cyan-900/30' 
                : canAfford 
                  ? 'border-gray-600 hover:border-gray-500 bg-gray-800/30' 
                  : 'border-red-600/50 bg-red-900/20'
            }`}>
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{action.icon}</span>
                  <div>
                    <span className="font-medium text-white capitalize text-sm">{action.type}</span>
                    {(!responsive.isMounted || !responsive.isMobile) && (
                      <div className="text-xs text-gray-400">${action.cost}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(responsive.isMounted && responsive.isMobile) && (
                    <span className={`font-bold text-sm ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                      ${action.cost}
                    </span>
                  )}
                  <Button
                    size={(!responsive.isMounted || responsive.isMobile) ? "sm" : "default"}
                    onClick={() => isSelected ? onActionSelect(null) : onActionSelect(action)}
                    className={`${(!responsive.isMounted || responsive.isMobile) ? 'text-xs px-2' : ''} ${
                      isSelected ? 'bg-cyan-600' : canAfford ? 'bg-green-600' : 'bg-gray-600'
                    } hover:opacity-80`}
                    disabled={!canAfford}
                  >
                    {(!responsive.isMounted || responsive.isMobile) ? (isSelected ? '✓' : 'Select') : (isSelected ? 'Selected' : 'Select')}
                  </Button>
                </div>
              </div>
              
              {(!responsive.isMounted || !responsive.isMobile) && (
                <>
                  <p className="text-xs text-gray-400 mb-2">{action.effect}</p>
                  <div className="flex flex-wrap gap-1">
                    {action.nasaDataUsed.map((dataset) => (
                      <Badge key={dataset} className="bg-purple-600/20 text-purple-300 text-xs">
                        {dataset.split(' ')[0]}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
        
        {selectedAction && (
          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-cyan-300 mb-2">
              Tap terrain to {selectedAction.type}
            </p>
            <Button 
              size={(!responsive.isMounted || responsive.isMobile) ? "sm" : "default"}
              variant="outline" 
              onClick={() => onActionSelect(null)}
              className="w-full text-xs"
            >
              Cancel Action
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Mobile Navigation Drawer
function MobileNavDrawer({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-700 z-50 lg:hidden transform transition-transform">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-white font-bold">Farm Controls</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto h-full">
          {children}
        </div>
      </div>
    </>
  )
}

export default function ResponsiveFarmSimulationPage() {
  const responsive = useResponsive()
  
  // Game state
  const [gameState, setGameState] = useState({
    score: 0,
    money: 1000,
    cropHealth: 70,
    waterReserves: 500,
    season: 'Spring',
    day: 1,
    weather: 'sunny'
  })
  
  // NASA data and loading states
  const [nasaData, setNasaData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Player interaction states
  const [selectedAction, setSelectedAction] = useState<any>(null)
  const [gameSpeed, setGameSpeed] = useState<'paused' | 'normal' | 'fast'>('normal')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Mock NASA data for demonstration
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setNasaData({
        success: true,
        data: {
          ndvi: { current: 0.72, trend: 'increasing', status: 'good' },
          soilMoisture: { current: 0.28, trend: 'stable', status: 'good', irrigationRecommended: false },
          temperature: { current: 24.5, trend: 'stable', status: 'normal' },
          precipitation: { current: 0.8, trend: 'decreasing', status: 'normal' },
          gameMetrics: {
            cropHealth: 72,
            yieldPrediction: 180,
            droughtRisk: 'Low',
            actionRecommendations: [
              'Consider light irrigation in northern fields',
              'Optimal conditions for fertilizer application'
            ]
          }
        },
        timestamp: new Date()
      })
      setLoading(false)
    }
    
    loadData()
  }, [])

  const handleCellClick = (x: number, y: number) => {
    if (selectedAction) {
      console.log(`Applying ${selectedAction.type} to cell (${x}, ${y})`)
      // Handle action execution
      setSelectedAction(null)
      if (responsive.isMounted && responsive.isMobile) {
        setMobileNavOpen(false)
      }
    }
  }

  const handleExecuteAction = (action: any) => {
    if (gameState.money < action.cost) return
    setGameState(prev => ({ ...prev, money: prev.money - action.cost }))
    setSelectedAction(null)
    if (responsive.isMounted && responsive.isMobile) {
      setMobileNavOpen(false)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Mobile Header */}
      {responsive.isMounted && responsive.isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 z-30 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileNavOpen(true)}
                className="text-white"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-white font-bold text-sm">🌱 NASA Farm Sim</h1>
                <p className="text-blue-300 text-xs">Ultra-HD 3D</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600/20 text-green-300 text-xs">
                ${gameState.money}
              </Badge>
              <Button
                size="sm"
                onClick={() => setGameSpeed(gameSpeed === 'paused' ? 'normal' : 'paused')}
                className="bg-green-600 hover:bg-green-700"
              >
                {gameSpeed === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-0">
        {/* Desktop Header */}
        {(!responsive.isMounted || !responsive.isMobile) && (
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white mb-1">
                  🛰️ Ultra-HD NASA Farm Simulation
                </h1>
                <p className="text-blue-300 text-sm">
                  {getResolutionText(responsive)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-600/20 text-purple-300">
                  {responsive.deviceIcon}
                  <span className="ml-1">
                    {getBadgeText(responsive)}
                  </span>
                </Badge>
                <Button
                  size="sm"
                  onClick={() => setGameSpeed(gameSpeed === 'paused' ? 'normal' : 'paused')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {gameSpeed === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-2 md:p-4 overflow-hidden">
          <div className={`grid gap-3 md:gap-4 h-full ${
            (!responsive.isMounted || responsive.isMobile) ? 'grid-cols-1' :
            responsive.isTablet ? 'grid-cols-1 lg:grid-cols-4' :
            'grid-cols-1 xl:grid-cols-4'
          }`}>
            
            {/* Main 3D Scene - Always full width on mobile, responsive on larger screens */}
            <div className={`${
              (!responsive.isMounted || responsive.isMobile) ? 'col-span-1 h-96' :
              responsive.isTablet ? 'lg:col-span-3' :
              'xl:col-span-3'
            }`}>
              <Card className="bg-black/80 backdrop-blur-xl border border-blue-500/30 h-full">
                <CardHeader className={`${(!responsive.isMounted || responsive.isMobile) ? 'pb-2' : ''}`}>
                  <CardTitle className="flex items-center gap-2 text-white text-sm md:text-lg">
                    <Map className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                    {(!responsive.isMounted || responsive.isMobile) ? '3D Farm' : 'Ultra-High Resolution Farm Terrain'}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {getBadgeText(responsive)} NASA
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className={`p-0 ${
                  (!responsive.isMounted || responsive.isMobile) ? 'h-64' : 
                  responsive.isTablet ? 'h-96' : 
                  'h-full'
                }`}>
                  <UltraHighRes3DTerrain
                    nasaData={nasaData}
                    gameState={gameState}
                    onCellClick={handleCellClick}
                    selectedAction={selectedAction}
                    responsive={responsive}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Control Panels - Hidden on mobile, shown in drawer */}
            {(!responsive.isMounted || !responsive.isMobile) && (
              <div className="space-y-3 md:space-y-4 overflow-y-auto">
                <ResponsivePlayerActions
                  gameState={gameState}
                  selectedAction={selectedAction}
                  onActionSelect={setSelectedAction}
                  onExecuteAction={handleExecuteAction}
                  nasaData={nasaData}
                  responsive={responsive}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {responsive.isMounted && (
        <MobileNavDrawer isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)}>
          <div className="space-y-4">
            <ResponsivePlayerActions
              gameState={gameState}
              selectedAction={selectedAction}
              onActionSelect={setSelectedAction}
              onExecuteAction={handleExecuteAction}
              nasaData={nasaData}
              responsive={responsive}
            />
          </div>
        </MobileNavDrawer>
      )}

      {/* Mobile Bottom Bar */}
      {responsive.isMounted && responsive.isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 p-3 z-30">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div>Health: <span className="text-green-400">{gameState.cropHealth}%</span></div>
            <div>Day: <span className="text-blue-400">{gameState.day}</span></div>
            <div>Season: <span className="text-orange-400">{gameState.season}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}