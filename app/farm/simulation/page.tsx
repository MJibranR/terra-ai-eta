/**
 * Real-Time NASA Farm Simulation - Complete 3D Educational Experience
 * Integrates live NASA satellite data with interactive farming gameplay
 */

"use client"
import { useRef, useState, useEffect } from 'react'
import { Satellite, Sprout, Droplets, Thermometer, Cloud, Mountain, Map, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3, 
  Settings, 
  Play, 
  Pause,
  RotateCcw,
  Maximize2,
  Eye,
  AlertTriangle,
  TrendingUp,
  Info,
  RefreshCw,
  Target
} from 'lucide-react'
import FarmSidebar from '@/components/farm-sidebar'
import EnhancedRealTimeNASATerrain from '@/components/enhanced-real-time-nasa-terrain'
import NASAAssetLoading from '@/components/nasa-asset-loading'
import { enhancedAgriculturalDataFetcher } from '@/lib/enhanced-agricultural-data-fetcher'

// Game state interface
interface GameState {
  score: number
  money: number
  cropHealth: number
  waterReserves: number
  season: string
  day: number
  weather: string
  currentMission?: any
}

// Player action interface
interface PlayerAction {
  type: 'irrigate' | 'fertilize' | 'plant' | 'harvest'
  cost: number
  effect: string
  nasaDataUsed: string[]
}

// Real-time 3D terrain component with NASA data
function RealTimeNASATerrain({ 
  nasaData, 
  gameState, 
  onCellClick, 
  selectedAction 
}: {
  nasaData: any
  gameState: GameState
  onCellClick: (x: number, y: number) => void
  selectedAction: PlayerAction | null
}) {
  const terrainRef = useRef<HTMLDivElement>(null)
  
  if (!nasaData?.data) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-700 to-green-700 rounded-lg">
        <div className="text-center text-white">
          <Satellite className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-400" />
          <p className="text-lg font-bold">🛰️ Fetching Live NASA Data</p>
          <p className="text-sm text-gray-200 mt-2">MODIS NDVI • SMAP Moisture • GPM Precipitation • LST Temperature</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-100" />
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>
    )
  }

  const gridSize = 12
  const cellSize = 35

  return (
    <div 
      ref={terrainRef}
      className="relative w-full h-full bg-gradient-to-b from-sky-600 via-green-600 to-green-800 rounded-lg overflow-hidden"
    >
      {/* 3D Terrain Grid */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: 'perspective(1000px) rotateX(60deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        {nasaData.data.ndvi.grid.map((row: number[], x: number) =>
          row.map((ndviValue: number, y: number) => {
            const moistureValue = nasaData.data.soilMoisture.grid[x]?.[y] || 0.2
            const tempValue = nasaData.data.temperature.grid[x]?.[y] || 25
            const precipValue = nasaData.data.precipitation.grid[x]?.[y] || 0

            // Dynamic height based on NASA data
            const height = 15 + (ndviValue * 25) + (moistureValue * 10)

            // Color based on multiple NASA datasets
            let cellColor = '#16a34a' // Default green
            let cellOpacity = 0.8

            // NDVI-based coloring
            if (ndviValue > 0.7) cellColor = '#22c55e' // Healthy
            else if (ndviValue > 0.4) cellColor = '#eab308' // Moderate
            else cellColor = '#ef4444' // Stressed

            // SMAP moisture overlay
            if (moistureValue > 0.3) {
              cellColor = '#06b6d4' // High moisture
              cellOpacity = 0.9
            } else if (moistureValue < 0.15) {
              cellColor = '#92400e' // Dry soil
              cellOpacity = 0.6
            }

            // Temperature stress overlay
            if (tempValue > 35) {
              cellColor = '#dc2626' // Heat stress
              cellOpacity = 0.95
            }

            // Precipitation effects
            const showRain = precipValue > 1

            return (
              <div key={`${x}-${y}`}>
                {/* Terrain cell */}
                <div
                  className="absolute transition-all duration-300 hover:scale-110 cursor-pointer border border-white/20"
                  style={{
                    left: `${300 + (x - gridSize/2) * cellSize}px`,
                    top: `${300 + (y - gridSize/2) * cellSize - height}px`,
                    width: `${cellSize - 2}px`,
                    height: `${cellSize - 2}px`,
                    backgroundColor: cellColor,
                    opacity: cellOpacity,
                    transform: `translateZ(${height}px)`,
                    borderRadius: height > 25 ? '6px' : '3px',
                    boxShadow: `0 ${height/4}px ${height/2}px rgba(0,0,0,0.4)`,
                    border: selectedAction ? '2px solid cyan' : '1px solid rgba(255,255,255,0.1)'
                  }}
                  onClick={() => onCellClick(x, y)}
                  title={`NDVI: ${ndviValue.toFixed(2)} | Moisture: ${moistureValue.toFixed(2)} | Temp: ${tempValue.toFixed(1)}°C`}
                >
                  {/* Crop growth indicators */}
                  {ndviValue > 0.6 && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-3 bg-green-300 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Precipitation particles */}
                {showRain && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${300 + (x - gridSize/2) * cellSize}px`,
                      top: `${200 + (y - gridSize/2) * cellSize}px`,
                      width: `${cellSize}px`,
                      height: `${cellSize}px`
                    }}
                  >
                    {Array(3).fill(null).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-4 bg-blue-300 opacity-70 animate-bounce"
                        style={{
                          left: `${Math.random() * cellSize}px`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: '1s'
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

      {/* NASA Data Overlay Info */}
      <div className="absolute top-4 left-4 bg-black/70 rounded-lg p-3 backdrop-blur-sm">
        <h3 className="text-white font-bold mb-2 text-sm">🛰️ Live NASA Data</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <Sprout className="w-3 h-3 text-green-400" />
            <span className="text-gray-300">NDVI: {nasaData.data.ndvi.current.toFixed(2)} ({nasaData.data.ndvi.status})</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span className="text-gray-300">Moisture: {(nasaData.data.soilMoisture.current * 100).toFixed(0)}% ({nasaData.data.soilMoisture.status})</span>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="w-3 h-3 text-orange-400" />
            <span className="text-gray-300">Temp: {nasaData.data.temperature.current.toFixed(1)}°C ({nasaData.data.temperature.status})</span>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="w-3 h-3 text-cyan-400" />
            <span className="text-gray-300">Rain: {nasaData.data.precipitation.current.toFixed(1)}mm/hr ({nasaData.data.precipitation.status})</span>
          </div>
        </div>
      </div>

      {/* Game Status HUD */}
      <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-3 backdrop-blur-sm">
        <div className="text-white font-bold mb-2 text-sm">🎮 Farm Status</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-300">Health:</span>
            <span className={`font-bold ${gameState.cropHealth > 70 ? 'text-green-400' : gameState.cropHealth > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {gameState.cropHealth}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Money:</span>
            <span className="text-green-400 font-bold">${gameState.money}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Day:</span>
            <span className="text-blue-400 font-bold">{gameState.day}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Weather:</span>
            <span className="text-cyan-400 font-bold capitalize">{gameState.weather}</span>
          </div>
        </div>
      </div>

      {/* Action Recommendations */}
      {nasaData.data.gameMetrics.actionRecommendations.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-yellow-900/80 border border-yellow-500/50 rounded-lg p-3 backdrop-blur-sm max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 font-bold text-sm">NASA Data Recommendations</span>
          </div>
          <div className="space-y-1">
            {nasaData.data.gameMetrics.actionRecommendations.slice(0, 2).map((rec: string, i: number) => (
              <div key={i} className="text-xs text-yellow-200">{rec}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Educational NASA data panel
function NASADataEducation({ nasaData }: { nasaData: any }) {
  if (!nasaData?.educational) return null

  return (
    <Card className="bg-black/80 backdrop-blur-xl border border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <Info className="w-4 h-4 text-blue-400" />
          Learn About NASA Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-green-900/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sprout className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-medium text-sm">NDVI (Vegetation Health)</span>
          </div>
          <p className="text-xs text-gray-300">{nasaData.educational.ndviExplanation}</p>
        </div>
        
        <div className="bg-blue-900/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 font-medium text-sm">SMAP (Soil Moisture)</span>
          </div>
          <p className="text-xs text-gray-300">{nasaData.educational.smapExplanation}</p>
        </div>
        
        <div className="bg-orange-900/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 font-medium text-sm">LST (Temperature)</span>
          </div>
          <p className="text-xs text-gray-300">{nasaData.educational.lstExplanation}</p>
        </div>
        
        <div className="bg-cyan-900/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 font-medium text-sm">GPM (Precipitation)</span>
          </div>
          <p className="text-xs text-gray-300">{nasaData.educational.gpmExplanation}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Player actions panel
function PlayerActionsPanel({ 
  gameState, 
  selectedAction, 
  onActionSelect, 
  onExecuteAction,
  nasaData
}: {
  gameState: GameState
  selectedAction: PlayerAction | null
  onActionSelect: (action: PlayerAction | null) => void
  onExecuteAction: (action: PlayerAction) => void
  nasaData: any
}) {
  const actions: PlayerAction[] = [
    {
      type: 'irrigate',
      cost: 50,
      effect: 'Increases soil moisture, improves NDVI in dry areas',
      nasaDataUsed: ['SMAP Soil Moisture', 'MODIS NDVI']
    },
    {
      type: 'fertilize',
      cost: 100,
      effect: 'Boosts NDVI growth, may increase temperature stress',
      nasaDataUsed: ['MODIS NDVI', 'MODIS LST']
    },
    {
      type: 'plant',
      cost: 200,
      effect: 'Establish crops - success depends on soil and weather conditions',
      nasaDataUsed: ['SMAP Moisture', 'GPM Precipitation', 'MODIS LST']
    },
    {
      type: 'harvest',
      cost: 75,
      effect: 'Collect crops - yield based on NDVI health throughout season',
      nasaDataUsed: ['MODIS NDVI', 'VIIRS NDVI']
    }
  ]

  return (
    <Card className="bg-black/80 backdrop-blur-xl border border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <Target className="w-4 h-4 text-green-400" />
          Farm Actions
          <Badge className="ml-2 bg-green-600/20 text-green-300">NASA-Guided</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => {
          const canAfford = gameState.money >= action.cost
          const isSelected = selectedAction?.type === action.type
          
          return (
            <div key={action.type} className={`p-3 rounded-lg border transition-all cursor-pointer ${
              isSelected 
                ? 'border-cyan-400 bg-cyan-900/30' 
                : canAfford 
                  ? 'border-gray-600 hover:border-gray-500 bg-gray-800/30' 
                  : 'border-red-600/50 bg-red-900/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {action.type === 'irrigate' ? '💧' :
                     action.type === 'fertilize' ? '🌱' :
                     action.type === 'plant' ? '🌾' : '🚜'}
                  </span>
                  <span className="font-medium text-white capitalize">{action.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                    ${action.cost}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => isSelected ? onActionSelect(null) : onActionSelect(action)}
                    className={`${isSelected ? 'bg-cyan-600' : canAfford ? 'bg-green-600' : 'bg-gray-600'} hover:opacity-80`}
                    disabled={!canAfford}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">{action.effect}</p>
              <div className="flex flex-wrap gap-1">
                {action.nasaDataUsed.map((dataset) => (
                  <Badge key={dataset} className="bg-purple-600/20 text-purple-300 text-xs">
                    {dataset.split(' ')[0]}
                  </Badge>
                ))}
              </div>
              
              {/* Show relevant NASA data for this action */}
              {action.type === 'irrigate' && nasaData?.data?.soilMoisture && (
                <div className="mt-2 p-2 bg-blue-900/30 rounded text-xs">
                  <span className="text-blue-300">💧 Current soil moisture: {(nasaData.data.soilMoisture.current * 100).toFixed(0)}%</span>
                  {nasaData.data.soilMoisture.irrigationRecommended && (
                    <div className="text-yellow-300 mt-1">⚠️ NASA data suggests irrigation needed</div>
                  )}
                </div>
              )}
              
              {action.type === 'fertilize' && nasaData?.data?.ndvi && (
                <div className="mt-2 p-2 bg-green-900/30 rounded text-xs">
                  <span className="text-green-300">🌱 Current NDVI: {nasaData.data.ndvi.current.toFixed(2)}</span>
                  <div className="text-gray-300 mt-1">Trend: {nasaData.data.ndvi.trend}</div>
                </div>
              )}
            </div>
          )
        })}
        
        {selectedAction && (
          <div className="pt-3 border-t border-gray-700">
            <p className="text-xs text-cyan-300 mb-2">Click on terrain to apply {selectedAction.type}</p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onActionSelect(null)}
              className="w-full"
            >
              Cancel Action
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Scene controls
function SceneControls({ 
  isPlaying, 
  onPlayPause, 
  onReset,
  onFullscreen 
}: {
  isPlaying: boolean
  onPlayPause: () => void
  onReset: () => void
  onFullscreen: () => void
}) {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={onPlayPause}
        className="bg-green-600 hover:bg-green-700"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onReset}
        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onFullscreen}
        className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

// Real-time NASA metrics panel
function RealTimeNASAMetrics({ nasaData, gameState }: { nasaData: any, gameState: GameState }) {
  if (!nasaData?.data) return null

  const metrics = [
    {
      label: 'Vegetation Health (NDVI)',
      value: nasaData.data.ndvi.current.toFixed(2),
      status: nasaData.data.ndvi.status,
      trend: nasaData.data.ndvi.trend,
      color: nasaData.data.ndvi.current > 0.6 ? 'text-green-400' : nasaData.data.ndvi.current > 0.4 ? 'text-yellow-400' : 'text-red-400',
      icon: <Sprout className="w-4 h-4" />,
      source: 'MODIS Terra'
    },
    {
      label: 'Soil Moisture (SMAP)',
      value: `${(nasaData.data.soilMoisture.current * 100).toFixed(0)}%`,
      status: nasaData.data.soilMoisture.status,
      trend: nasaData.data.soilMoisture.trend,
      color: nasaData.data.soilMoisture.current > 0.25 ? 'text-blue-400' : 'text-orange-400',
      icon: <Droplets className="w-4 h-4" />,
      source: 'SMAP L4'
    },
    {
      label: 'Surface Temperature',
      value: `${nasaData.data.temperature.current.toFixed(1)}°C`,
      status: nasaData.data.temperature.status,
      trend: nasaData.data.temperature.trend,
      color: nasaData.data.temperature.current > 35 ? 'text-red-400' : nasaData.data.temperature.current > 25 ? 'text-orange-400' : 'text-blue-400',
      icon: <Thermometer className="w-4 h-4" />,
      source: 'MODIS LST'
    },
    {
      label: 'Precipitation (GPM)',
      value: `${nasaData.data.precipitation.current.toFixed(1)} mm/hr`,
      status: nasaData.data.precipitation.status,
      trend: nasaData.data.precipitation.trend,
      color: nasaData.data.precipitation.current > 2 ? 'text-cyan-400' : 'text-gray-400',
      icon: <Cloud className="w-4 h-4" />,
      source: 'GPM IMERG'
    }
  ]

  return (
    <Card className="bg-black/80 backdrop-blur-xl border border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <BarChart3 className="w-4 h-4 text-green-400" />
          Live NASA Satellite Data
          <Badge className="ml-2 bg-red-600/20 text-red-300">Real-time</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gray-800/30 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={metric.color}>{metric.icon}</div>
                <div className="text-xs font-medium text-white">{metric.label}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-sm font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <div className={`text-xs px-1 py-0.5 rounded ${
                  metric.trend === 'increasing' ? 'bg-green-600/20 text-green-300' :
                  metric.trend === 'decreasing' ? 'bg-red-600/20 text-red-300' :
                  'bg-gray-600/20 text-gray-300'
                }`}>
                  {metric.trend === 'increasing' ? '↗' : metric.trend === 'decreasing' ? '↘' : '→'}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mb-1">{metric.status}</div>
            <div className="text-xs text-blue-300">{metric.source}</div>
          </div>
        ))}
        
        {/* Game Metrics */}
        <div className="pt-3 border-t border-gray-700">
          <div className="text-xs font-medium text-cyan-300 mb-2">🎮 Game Impact</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-green-900/30 p-2 rounded">
              <div className="text-green-300">Health: {nasaData.data.gameMetrics.cropHealth}%</div>
            </div>
            <div className="bg-blue-900/30 p-2 rounded">
              <div className="text-blue-300">Yield: {nasaData.data.gameMetrics.yieldPrediction} bu/ac</div>
            </div>
            <div className="bg-orange-900/30 p-2 rounded col-span-2">
              <div className="text-orange-300">Drought Risk: {nasaData.data.gameMetrics.droughtRisk}</div>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            🛰️ Last NASA update: {new Date(nasaData.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FarmSimulationPage() {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
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
  const [enhancedData, setEnhancedData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [dataSource, setDataSource] = useState<'nasa' | 'enhanced'>('enhanced')
  
  // Player interaction states
  const [selectedAction, setSelectedAction] = useState<PlayerAction | null>(null)
  const [gameSpeed, setGameSpeed] = useState<'paused' | 'normal' | 'fast'>('normal')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [nasaAssetsReady, setNasaAssetsReady] = useState(false)
  
  // Current farm location
  const [currentLocation, setCurrentLocation] = useState({
    lat: 42.0308,
    lng: -93.5805,
    name: 'Iowa Farmland'
  })

  // Fetch enhanced NASA + Microsoft data
  const fetchEnhancedData = async () => {
    setLoading(true)
    try {
      console.log('🌍 Fetching enhanced agricultural data...')
      
      // Try enhanced data first (NASA + Microsoft Planetary Computer)
      const enhancedResponse = await fetch('/api/enhanced-agricultural-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          longitude: currentLocation.lng,
          latitude: currentLocation.lat,
          analysisType: 'comprehensive'
        })
      })
      
      if (enhancedResponse.ok) {
        const data = await enhancedResponse.json()
        setEnhancedData(data)
        setDataSource('enhanced')
        
        // Convert enhanced data to NASA format for backward compatibility
        const nasaCompatibleData = {
          success: true,
          data: {
            ndvi: {
              current: data.fusion?.combinedNDVI || data.nasa?.ndvi || 0.5,
              trend: data.nasa?.trends?.ndvi || 'stable',
              status: data.fusion?.combinedNDVI > 0.6 ? 'good' : 'warning'
            },
            soilMoisture: {
              current: data.nasa?.soilMoisture || 0.25,
              trend: data.nasa?.trends?.soilMoisture || 'stable',
              status: data.nasa?.soilMoisture > 0.2 ? 'good' : 'warning',
              irrigationRecommended: data.nasa?.soilMoisture < 0.15
            },
            precipitation: {
              current: data.nasa?.precipitation || 0,
              trend: data.nasa?.trends?.precipitation || 'stable',
              status: 'normal'
            },
            temperature: {
              current: data.nasa?.temperature || 22,
              trend: data.nasa?.trends?.temperature || 'stable',
              status: 'normal'
            },
            gameMetrics: {
              cropHealth: Math.round((data.fusion?.combinedNDVI || 0.5) * 100),
              recommendations: data.fusion?.recommendations || []
            }
          },
          metadata: data.metadata,
          enhanced: true,
          microsoft: data.microsoft,
          fusion: data.fusion
        }
        setNasaData(nasaCompatibleData)
        setLastUpdate(new Date())
        console.log('✅ Enhanced data loaded successfully')
        
        // Update game state based on enhanced data
        setGameState(prev => ({
          ...prev,
          cropHealth: Math.round((data.fusion?.combinedNDVI || 0.5) * 100)
        }))
      } else {
        throw new Error('Enhanced API not available')
      }
    } catch (error) {
      console.warn('⚠️ Enhanced data failed, falling back to NASA only:', error)
      
      // Fallback to NASA-only data
      try {
        const response = await fetch(`/api/nasa-live-data?lat=${currentLocation.lat}&lng=${currentLocation.lng}&radius=0.05`)
        const data = await response.json()
        
        if (data.success) {
          setNasaData(data)
          setDataSource('nasa')
          setLastUpdate(new Date())
          console.log('✅ NASA fallback data loaded')
          
          if (data.data?.gameMetrics) {
            setGameState(prev => ({
              ...prev,
              cropHealth: data.data.gameMetrics.cropHealth
            }))
          }
        }
      } catch (nasaError) {
        console.error('❌ Both enhanced and NASA data failed:', nasaError)
        setNasaData({ success: false, error: 'All data sources failed' })
      }
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch and periodic updates
  useEffect(() => {
    fetchEnhancedData()
    
    // Set up periodic updates every 5 minutes (real NASA data updates vary by dataset)
    const interval = setInterval(fetchEnhancedData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [currentLocation])

  // Game loop - runs when game is not paused
  useEffect(() => {
    if (gameSpeed === 'paused') return

    const interval = setInterval(() => {
      setGameState(prev => {
        const newDay = prev.day + (gameSpeed === 'fast' ? 3 : 1)
        const newSeason = newDay > 90 ? 'Fall' : newDay > 60 ? 'Summer' : newDay > 30 ? 'Spring' : 'Winter'
        
        // Environmental effects based on NASA data
        let newCropHealth = prev.cropHealth
        
        if (nasaData?.data?.soilMoisture?.current < 0.15) {
          newCropHealth = Math.max(0, newCropHealth - 2) // Drought stress
        }
        
        if (nasaData?.data?.temperature?.current > 35) {
          newCropHealth = Math.max(0, newCropHealth - 3) // Heat stress
        }
        
        if (nasaData?.data?.precipitation?.current > 1) {
          newCropHealth = Math.min(100, newCropHealth + 1) // Beneficial rain
        }
        
        return {
          ...prev,
          day: newDay,
          season: newSeason,
          cropHealth: newCropHealth,
          weather: Math.random() > 0.8 ? 
            (['sunny', 'cloudy', 'rainy'] as const)[Math.floor(Math.random() * 3)] : 
            prev.weather
        }
      })
    }, gameSpeed === 'fast' ? 1000 : 3000)

    return () => clearInterval(interval)
  }, [gameSpeed, nasaData])

  // Handle player actions
  const handleExecuteAction = (action: PlayerAction) => {
    if (gameState.money < action.cost) {
      alert(`Not enough money! Need $${action.cost}, have $${gameState.money}`)
      return
    }

    setGameState(prev => {
      let newState = { ...prev, money: prev.money - action.cost }
      
      switch (action.type) {
        case 'irrigate':
          newState.waterReserves = Math.max(0, prev.waterReserves - 50)
          if (nasaData?.data?.soilMoisture?.current < 0.25) {
            newState.cropHealth = Math.min(100, prev.cropHealth + 15)
            newState.score = prev.score + 10
          }
          break
          
        case 'fertilize':
          if (nasaData?.data?.soilMoisture?.current > 0.2) {
            newState.cropHealth = Math.min(100, prev.cropHealth + 10)
            newState.score = prev.score + 15
          }
          break
          
        case 'plant':
          if (prev.season === 'Spring' && nasaData?.data?.soilMoisture?.current > 0.2) {
            newState.cropHealth = 60
            newState.score = prev.score + 5
          }
          break
          
        case 'harvest':
          if (prev.cropHealth > 50) {
            const harvestYield = Math.floor(prev.cropHealth * 2)
            newState.money = prev.money + harvestYield
            newState.score = prev.score + Math.floor(harvestYield / 5)
            newState.cropHealth = 0
          }
          break
      }
      
      return newState
    })
    
    setSelectedAction(null)
  }

  const handleCellClick = (x: number, y: number) => {
    if (selectedAction) {
      console.log(`Applying ${selectedAction.type} to cell (${x}, ${y})`)
      handleExecuteAction(selectedAction)
    }
  }

  const handleRefreshData = () => {
    fetchEnhancedData()
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Sidebar */}
      <FarmSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                🛰️ Enhanced Multi-Source Farm Simulation
              </h1>
              <p className="text-blue-300 text-sm">
                NASA + Microsoft Planetary Computer • Ultra-high resolution (10m) • Real-time decisions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${loading ? 'animate-pulse bg-yellow-600/20 text-yellow-300' : dataSource === 'enhanced' ? 'bg-purple-600/20 text-purple-300' : 'bg-green-600/20 text-green-300'}`}>
                <Satellite className="w-3 h-3 mr-1" />
                {loading ? 'Updating...' : dataSource === 'enhanced' ? 'Enhanced Multi-Source' : 'NASA Data'}
              </Badge>
              {dataSource === 'enhanced' && enhancedData && (
                <Badge className="bg-blue-600/20 text-blue-300">
                  10m Resolution
                </Badge>
              )}
              <Button
                size="sm"
                onClick={() => setGameSpeed(gameSpeed === 'paused' ? 'normal' : 'paused')}
                className="bg-green-600 hover:bg-green-700"
              >
                {gameSpeed === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefreshData}
                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Game Status Bar */}
          <div className="mt-3 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Score:</span>
              <span className="text-green-400 font-bold">{gameState.score}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Money:</span>
              <span className="text-green-400 font-bold">${gameState.money}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Day {gameState.day}:</span>
              <span className="text-blue-400 font-bold">{gameState.season}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Location:</span>
              <span className="text-purple-400 font-bold">{currentLocation.name}</span>
            </div>
            {selectedAction && (
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">Selected Action:</span>
                <Badge className="bg-cyan-600/20 text-cyan-300 capitalize">
                  {selectedAction.type}
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid lg:grid-cols-4 gap-4 h-full">
            
            {/* Main 3D Scene */}
            <div className="lg:col-span-3">
              <Card className="bg-black/80 backdrop-blur-xl border border-blue-500/30 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <Map className="w-5 h-5 text-blue-400" />
                    Ultra-High Resolution Farm Terrain
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {dataSource === 'enhanced' ? 'NASA + Microsoft' : 'NASA Only'}
                    </Badge>
                    {enhancedData?.microsoft && (
                      <Badge className="bg-green-600/20 text-green-300 text-xs">
                        {enhancedData.microsoft.resolution}
                      </Badge>
                    )}
                    {(enhancedData?.fusion?.confidenceLevel || nasaData?.metadata?.dataQuality) && (
                      <Badge className="bg-purple-600/20 text-purple-300 text-xs">
                        {Math.round((enhancedData?.fusion?.confidenceLevel || nasaData?.metadata?.dataQuality || 0) * 100)}% Confidence
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[calc(100%-4rem)]">
                  {nasaAssetsReady ? (
                    <EnhancedRealTimeNASATerrain
                      nasaData={nasaData}
                      gameState={gameState}
                      onCellClick={handleCellClick}
                      selectedAction={selectedAction}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-black">
                      <div className="text-center">
                        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <div className="text-white text-lg mb-2">Loading NASA 3D Resources</div>
                        <div className="text-gray-400 text-sm">Satellites • Terrain • Authentic Models</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Control Panels */}
            <div className="space-y-4 overflow-y-auto">
              {/* NASA Asset Loading Status */}
              <NASAAssetLoading onAssetsReady={setNasaAssetsReady} />
              
              {/* Player Actions */}
              <PlayerActionsPanel
                gameState={gameState}
                selectedAction={selectedAction}
                onActionSelect={setSelectedAction}
                onExecuteAction={handleExecuteAction}
                nasaData={nasaData}
              />
              
              {/* Real-time NASA Metrics */}
              <RealTimeNASAMetrics 
                nasaData={nasaData} 
                gameState={gameState}
              />
              
              {/* Educational Panel */}
              <NASADataEducation nasaData={nasaData} />
            </div>
          </div>

          {/* Mission Status & Technical Info */}
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {/* Mission Progress */}
            <Card className="bg-black/80 backdrop-blur-xl border border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-sm">
                  <Target className="w-4 h-4 text-green-400" />
                  Current Objective
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-white">Manage farm using real NASA satellite data</div>
                  <div className="text-xs text-gray-400">Use MODIS NDVI, SMAP soil moisture, GPM precipitation, and land surface temperature to make farming decisions</div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className={`w-3 h-3 rounded-full ${gameState.cropHealth > 60 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-gray-300">
                      Crop Health: {gameState.cropHealth}% {gameState.cropHealth > 60 ? '(Healthy)' : '(Needs Attention)'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Implementation */}
            <Card className="bg-black/80 backdrop-blur-xl border border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white text-sm">🚀 NASA Integration Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-green-300 font-medium mb-1">Live Data Sources</div>
                    <div className="text-gray-400">MODIS NDVI • SMAP L4 • GPM IMERG • MODIS LST</div>
                  </div>
                  <div>
                    <div className="text-blue-300 font-medium mb-1">3D Assets</div>
                    <div className="text-gray-400">NASA-3D-Resources • Authentic models</div>
                  </div>
                  <div>
                    <div className="text-purple-300 font-medium mb-1">Visual Features</div>
                    <div className="text-gray-400">Orbital satellites • Real terrain textures</div>
                  </div>
                  <div>
                    <div className="text-orange-300 font-medium mb-1">Educational Value</div>
                    <div className="text-gray-400">NASA-guided learning • Scientific accuracy</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700 space-y-1">
                  {nasaData && (
                    <div className="text-xs text-gray-400">
                      Last data update: {new Date(nasaData.timestamp).toLocaleString()}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Assets: NASA/JPL-Caltech • NASA GSFC • NASA ARC
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}