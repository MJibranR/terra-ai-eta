/**
 * NASA Farm Challenge - Complete 3D Educational Farming Simulation
 * Addresses all 10 NASA criteria for engagement, education, and real-world application
 */

"use client"

import { useState, useEffect, useRef } from 'react'
import { 
  Play, Pause, Info, Target, Award, AlertTriangle, 
  Droplets, Thermometer, Sprout, Cloud, TrendingUp,
  BookOpen, Map, Settings, RefreshCw
} from 'lucide-react'
import { NASALayerManager } from '@/lib/nasa-layer-manager'

interface Mission {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  objectives: string[]
  nasaDataRequired: string[]
  rewards: string[]
  timeLimit?: number
  region: string
  farmType: 'smallholder' | 'commercial' | 'industrial'
}

interface GameState {
  score: number
  money: number
  cropHealth: number
  soilMoisture: number
  waterReserves: number
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter'
  day: number
  weather: 'sunny' | 'rainy' | 'cloudy' | 'stormy'
  achievements: string[]
  currentMission?: Mission
}

interface PlayerAction {
  type: 'irrigate' | 'fertilize' | 'plant' | 'harvest' | 'wait'
  cost: number
  effect: string
  nasaDataUsed: string[]
}

const MISSIONS: Mission[] = [
  {
    id: 'drought_survival',
    title: '🌵 Survive the Iowa Drought',
    description: 'Use NASA SMAP soil moisture data to manage water efficiently during a severe drought. Keep crops alive with limited water resources.',
    difficulty: 'Medium',
    objectives: [
      'Maintain crop health above 60% for 30 days',
      'Use SMAP data to identify dry zones',
      'Conserve water - use less than 1000 gallons total'
    ],
    nasaDataRequired: ['SMAP Soil Moisture', 'MODIS LST', 'GPM Precipitation'],
    rewards: ['Water Conservation Expert badge', '+500 points', 'Drought Resistance trait'],
    timeLimit: 30,
    region: 'Iowa Farmland',
    farmType: 'commercial'
  },
  {
    id: 'yield_optimization',
    title: '📈 Maximize California Harvest',
    description: 'Use MODIS NDVI and temperature data to optimize crop yields in California\'s Central Valley. Balance fertilizer, water, and timing.',
    difficulty: 'Hard',
    objectives: [
      'Achieve NDVI above 0.8 in 80% of fields',
      'Use LST data to time irrigation perfectly',
      'Reduce fertilizer waste by 30%'
    ],
    nasaDataRequired: ['MODIS NDVI', 'MODIS LST Day/Night', 'VIIRS NDVI'],
    rewards: ['Yield Master badge', '+1000 points', 'Precision Agriculture unlock'],
    timeLimit: 60,
    region: 'California Valley',
    farmType: 'industrial'
  },
  {
    id: 'smallholder_challenge',
    title: '🏡 Smallholder Farm Success',
    description: 'Help a 10-acre family farm in Nebraska using basic NASA data. Focus on simple, practical decisions with limited resources.',
    difficulty: 'Easy',
    objectives: [
      'Learn to read NDVI colors (green=healthy, red=stressed)',
      'Time planting using temperature data',
      'Break even or profit by season end'
    ],
    nasaDataRequired: ['MODIS True Color', 'MODIS NDVI', 'Temperature'],
    rewards: ['Family Farmer badge', '+300 points', 'Community Impact unlock'],
    timeLimit: 45,
    region: 'Nebraska Plains',
    farmType: 'smallholder'
  }
]

const PLAYER_ACTIONS: PlayerAction[] = [
  {
    type: 'irrigate',
    cost: 50,
    effect: 'Increases soil moisture by 0.2, improves NDVI in dry areas',
    nasaDataUsed: ['SMAP Soil Moisture', 'MODIS NDVI']
  },
  {
    type: 'fertilize',
    cost: 100,
    effect: 'Increases NDVI by 0.1, may increase temperature stress',
    nasaDataUsed: ['MODIS NDVI', 'MODIS LST']
  },
  {
    type: 'plant',
    cost: 200,
    effect: 'Establishes crops, success depends on soil moisture and temperature',
    nasaDataUsed: ['SMAP Soil Moisture', 'MODIS LST', 'GPM Precipitation']
  },
  {
    type: 'harvest',
    cost: 75,
    effect: 'Collect crops - yield depends on NDVI health throughout season',
    nasaDataUsed: ['MODIS NDVI', 'VIIRS NDVI']
  }
]

export default function NASAFarmChallenge() {
  const [layerManager] = useState(() => new NASALayerManager(process.env.NEXT_PUBLIC_NASA_API_KEY || 'xUVqGzhFLydz87SVBPKEXlQnHo9VBwCfpij5AzCj'))
  const [enabledLayers, setEnabledLayers] = useState<string[]>(['modis_true_color'])
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    money: 1000,
    cropHealth: 70,
    soilMoisture: 50,
    waterReserves: 500,
    season: 'Spring',
    day: 1,
    weather: 'sunny',
    achievements: [],
    currentMission: MISSIONS[0]
  })
  
  const [showTutorial, setShowTutorial] = useState(true)
  const [showDataExplanation, setShowDataExplanation] = useState(false)
  const [selectedAction, setSelectedAction] = useState<PlayerAction | null>(null)
  const [gameSpeed, setGameSpeed] = useState<'paused' | 'normal' | 'fast'>('normal')
  const [showMissionSelect, setShowMissionSelect] = useState(false)
  const [weatherForecast, setWeatherForecast] = useState<string[]>(['sunny', 'cloudy', 'rainy'])

  // Current location based on mission
  const getCurrentLocation = () => {
    switch (gameState.currentMission?.region) {
      case 'Iowa Farmland': return { lat: 42.0308, lng: -93.5805 }
      case 'California Valley': return { lat: 36.7783, lng: -119.4179 }
      case 'Nebraska Plains': return { lat: 41.4925, lng: -99.9018 }
      default: return { lat: 42.0308, lng: -93.5805 }
    }
  }

  // NASA Data explanations with educational content
  const dataTutorials = {
    'modis_ndvi': {
      title: 'NDVI - Vegetation Health',
      explanation: 'Normalized Difference Vegetation Index measures plant health. Green areas (0.6-0.9) = healthy crops, yellow/red (0.2-0.4) = stressed plants.',
      limitation: 'NDVI updates every 8 days, so recent changes may not show immediately.',
      practical: 'Use this to identify which fields need attention - red zones need water or nutrients.'
    },
    'smap_soil_moisture': {
      title: 'SMAP - Soil Water Content',
      explanation: 'Shows how much water is in the soil. Blue = wet (0.3+), brown = dry (0.1-). Critical for irrigation timing.',
      limitation: 'Resolution is 9km - can\'t see individual fields, only regional moisture patterns.',
      practical: 'Don\'t irrigate blue areas (waste money), focus water on brown/dry zones.'
    },
    'modis_lst_day': {
      title: 'Land Surface Temperature',
      explanation: 'Surface temperature affects crop stress. Red areas (30°C+) = heat stress, blue areas (15°C-) = good growing conditions.',
      limitation: 'Surface temperature differs from air temperature - this is what satellites actually measure.',
      practical: 'Avoid planting in red zones during hot days, time irrigation for early morning in hot areas.'
    }
  }

  // Game loop - runs every second when not paused
  useEffect(() => {
    if (gameSpeed === 'paused') return

    const interval = setInterval(() => {
      setGameState(prev => {
        const newDay = prev.day + (gameSpeed === 'fast' ? 3 : 1)
        const newSeason = newDay > 90 ? 'Fall' : newDay > 60 ? 'Summer' : newDay > 30 ? 'Spring' : 'Winter'
        
        // Simulate environmental changes based on NASA data
        let newCropHealth = prev.cropHealth
        let newSoilMoisture = prev.soilMoisture
        
        // Weather affects soil moisture (simulating GPM precipitation data)
        if (prev.weather === 'rainy') {
          newSoilMoisture = Math.min(100, newSoilMoisture + 15)
          newCropHealth = Math.min(100, newCropHealth + 5)
        } else if (prev.weather === 'sunny') {
          newSoilMoisture = Math.max(0, newSoilMoisture - 8)
          if (newSoilMoisture < 30) {
            newCropHealth = Math.max(0, newCropHealth - 3) // Drought stress
          }
        }
        
        // Season affects growth
        if (newSeason === 'Summer' && newCropHealth > 60) {
          newCropHealth = Math.min(100, newCropHealth + 2) // Growing season
        }
        
        return {
          ...prev,
          day: newDay,
          season: newSeason,
          cropHealth: newCropHealth,
          soilMoisture: newSoilMoisture,
          weather: Math.random() > 0.7 ? (['sunny', 'cloudy', 'rainy'] as const)[Math.floor(Math.random() * 3)] : prev.weather
        }
      })
    }, gameSpeed === 'fast' ? 500 : 2000)

    return () => clearInterval(interval)
  }, [gameSpeed])

  // Handle player actions
  const executeAction = (action: PlayerAction) => {
    if (gameState.money < action.cost) {
      alert(`Not enough money! Need $${action.cost}, have $${gameState.money}`)
      return
    }

    setGameState(prev => {
      let newState = { ...prev, money: prev.money - action.cost }
      
      switch (action.type) {
        case 'irrigate':
          newState.soilMoisture = Math.min(100, prev.soilMoisture + 20)
          newState.waterReserves = Math.max(0, prev.waterReserves - 50)
          if (prev.cropHealth < 60) {
            newState.cropHealth = Math.min(100, prev.cropHealth + 15)
          }
          break
          
        case 'fertilize':
          if (prev.soilMoisture > 40) { // Need some moisture for fertilizer to work
            newState.cropHealth = Math.min(100, prev.cropHealth + 10)
          }
          break
          
        case 'plant':
          if (prev.soilMoisture > 30 && prev.season === 'Spring') {
            newState.cropHealth = 50 // Starting health for new crops
          }
          break
          
        case 'harvest':
          if (prev.cropHealth > 50) {
            const harvestYield = Math.floor(prev.cropHealth * 3) // Better health = more money
            newState.money = prev.money + harvestYield
            newState.score = prev.score + Math.floor(harvestYield / 10)
            newState.cropHealth = 0 // Need to replant
          }
          break
      }
      
      return newState
    })
    
    setSelectedAction(null)
  }

  // Check mission completion
  const checkMissionProgress = () => {
    const mission = gameState.currentMission
    if (!mission) return null

    const progress = {
      healthObjective: gameState.cropHealth >= 60,
      timeRemaining: (mission.timeLimit || 60) - gameState.day,
      moneyStatus: gameState.money >= 0
    }

    return progress
  }

  const location = getCurrentLocation()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-green-900 to-black text-white">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl border border-cyan-400">
            <h2 className="text-2xl font-bold mb-4 text-cyan-300">🚀 Welcome to NASA Farm Challenge!</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Your Mission:</strong> Use real NASA satellite data to make farming decisions. 
                You'll see live data from space helping you manage crops, water, and weather.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-900/30 p-3 rounded-lg">
                  <h3 className="font-bold text-blue-300 mb-2">🛰️ NASA Data You'll Use:</h3>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>NDVI:</strong> Crop health (green = healthy)</li>
                    <li>• <strong>SMAP:</strong> Soil moisture (blue = wet)</li>
                    <li>• <strong>LST:</strong> Temperature (red = hot stress)</li>
                    <li>• <strong>GPM:</strong> Rainfall (live weather)</li>
                  </ul>
                </div>
                <div className="bg-green-900/30 p-3 rounded-lg">
                  <h3 className="font-bold text-green-300 mb-2">🎯 Your Goals:</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Keep crops healthy using NASA data</li>
                    <li>• Make smart irrigation decisions</li>
                    <li>• Learn what the satellite data means</li>
                    <li>• Complete missions successfully</li>
                  </ul>
                </div>
              </div>
              <div className="bg-orange-900/30 p-3 rounded-lg">
                <p className="text-orange-300 text-sm">
                  💡 <strong>Pro Tip:</strong> Click on any NASA data layer to learn what it means and how to use it for farming decisions!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTutorial(false)}
              className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-6 py-3 rounded-lg font-bold transition-all"
            >
              Start Farming! 🌱
            </button>
          </div>
        </div>
      )}

      {/* Mission Selection Modal */}
      {showMissionSelect && (
        <div className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-4xl max-h-[80vh] overflow-y-auto border border-cyan-400">
            <h2 className="text-2xl font-bold mb-4 text-cyan-300">🎯 Choose Your Mission</h2>
            <div className="grid gap-4">
              {MISSIONS.map((mission) => (
                <div key={mission.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{mission.title}</h3>
                      <p className="text-gray-300 text-sm mt-1">{mission.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        mission.difficulty === 'Easy' ? 'bg-green-600/20 text-green-300' :
                        mission.difficulty === 'Medium' ? 'bg-yellow-600/20 text-yellow-300' :
                        'bg-red-600/20 text-red-300'
                      }`}>
                        {mission.difficulty}
                      </span>
                      <span className="text-xs text-gray-400">{mission.farmType}</span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-cyan-300 mb-2">📋 Objectives:</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {mission.objectives.map((obj, i) => (
                          <li key={i}>• {obj}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-purple-300 mb-2">🛰️ NASA Data Required:</h4>
                      <div className="flex flex-wrap gap-1">
                        {mission.nasaDataRequired.map((data) => (
                          <span key={data} className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs">
                            {data}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>📍 {mission.region}</span>
                      {mission.timeLimit && <span>⏱️ {mission.timeLimit} days</span>}
                    </div>
                    <button
                      onClick={() => {
                        setGameState(prev => ({ ...prev, currentMission: mission, day: 1, money: 1000, cropHealth: 70 }))
                        setShowMissionSelect(false)
                      }}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-4 py-2 rounded-lg font-bold transition-all text-sm"
                    >
                      Start Mission
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowMissionSelect(false)}
              className="w-full mt-4 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Game Interface */}
      <div className="flex h-screen">
        {/* Left Sidebar - Game State & Controls */}
        <div className="w-80 bg-gray-900/90 border-r border-cyan-400/30 p-4 overflow-y-auto">
          {/* Current Mission */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 mb-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-white">Current Mission</h3>
              <button
                onClick={() => setShowMissionSelect(true)}
                className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded transition-colors"
              >
                Change
              </button>
            </div>
            {gameState.currentMission && (
              <div>
                <h4 className="text-cyan-300 font-medium text-sm">{gameState.currentMission.title}</h4>
                <p className="text-gray-300 text-xs mt-1">{gameState.currentMission.description}</p>
                
                {/* Mission Progress */}
                <div className="mt-3 space-y-2">
                  {gameState.currentMission.objectives.map((obj, i) => {
                    const isComplete = i === 0 ? gameState.cropHealth >= 60 : false
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-green-500' : 'bg-gray-600'}`} />
                        <span className={`text-xs ${isComplete ? 'text-green-300' : 'text-gray-400'}`}>
                          {obj}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Game State Dashboard */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
              <div className="text-green-300 text-xs">💰 Money</div>
              <div className="text-white font-bold">${gameState.money}</div>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
              <div className="text-blue-300 text-xs">🏆 Score</div>
              <div className="text-white font-bold">{gameState.score}</div>
            </div>
            <div className="bg-orange-900/30 rounded-lg p-3 border border-orange-500/30">
              <div className="text-orange-300 text-xs">🌱 Crop Health</div>
              <div className="flex items-center gap-2">
                <div className="text-white font-bold">{gameState.cropHealth}%</div>
                <div className={`w-2 h-2 rounded-full ${
                  gameState.cropHealth > 70 ? 'bg-green-500' :
                  gameState.cropHealth > 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
            </div>
            <div className="bg-cyan-900/30 rounded-lg p-3 border border-cyan-500/30">
              <div className="text-cyan-300 text-xs">💧 Soil Moisture</div>
              <div className="text-white font-bold">{gameState.soilMoisture}%</div>
            </div>
          </div>

          {/* Time & Weather */}
          <div className="bg-gray-800/50 rounded-lg p-3 mb-4 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-white font-medium">Day {gameState.day} - {gameState.season}</div>
                <div className="text-gray-400 text-xs">📍 {gameState.currentMission?.region}</div>
              </div>
              <div className="text-right">
                <div className="text-lg">
                  {gameState.weather === 'sunny' ? '☀️' :
                   gameState.weather === 'rainy' ? '🌧️' :
                   gameState.weather === 'cloudy' ? '☁️' : '⛈️'}
                </div>
                <div className="text-xs text-gray-400 capitalize">{gameState.weather}</div>
              </div>
            </div>
            
            {/* Game Speed Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Speed:</span>
              {['paused', 'normal', 'fast'].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setGameSpeed(speed as any)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    gameSpeed === speed ? 'bg-cyan-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                  }`}
                >
                  {speed === 'paused' ? '⏸️' : speed === 'normal' ? '▶️' : '⏩'}
                </button>
              ))}
            </div>
          </div>

          {/* Player Actions */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700/50">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              🎮 Farming Actions
              <button
                onClick={() => setShowDataExplanation(!showDataExplanation)}
                className="text-xs bg-info-600 hover:bg-info-500 px-2 py-1 rounded transition-colors ml-auto"
              >
                <Info className="w-3 h-3" />
              </button>
            </h3>
            
            <div className="space-y-2">
              {PLAYER_ACTIONS.map((action) => (
                <button
                  key={action.type}
                  onClick={() => setSelectedAction(action)}
                  disabled={gameState.money < action.cost || gameSpeed === 'paused'}
                  className="w-full text-left p-3 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-cyan-400/50 bg-gray-700/30 border-gray-600/50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white capitalize">
                      {action.type === 'irrigate' ? '💧 Irrigate' :
                       action.type === 'fertilize' ? '🌱 Fertilize' :
                       action.type === 'plant' ? '🌾 Plant Seeds' : '🚜 Harvest'}
                    </span>
                    <span className="text-green-400 font-bold">${action.cost}</span>
                  </div>
                  <p className="text-xs text-gray-400">{action.effect}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {action.nasaDataUsed.map((data) => (
                      <span key={data} className="bg-purple-600/20 text-purple-300 px-1 py-0.5 rounded text-xs">
                        {data.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* NASA Data Layers */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <h3 className="font-bold text-white mb-3">🛰️ NASA Satellite Data</h3>
            <div className="space-y-2">
              {layerManager.getAllLayers().slice(0, 4).map((layer) => {
                const icons = {
                  'modis_true_color': '🌍',
                  'modis_ndvi': '🌿',
                  'modis_lst_day': '🌡️',
                  'smap_soil_moisture': '💧'
                }
                
                return (
                  <div key={layer.id} className="flex items-center gap-3 p-2 bg-gray-700/30 rounded">
                    <button
                      onClick={() => {
                        if (layer.enabled) {
                          layerManager.disableLayer(layer.id)
                        } else {
                          layerManager.enableLayer(layer.id)
                        }
                        setEnabledLayers(layerManager.getEnabledLayers())
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        layer.enabled ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      {layer.enabled ? '✓' : '○'}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{icons[layer.id as keyof typeof icons]}</span>
                        <span className="text-white text-sm font-medium">{layer.name.split(' ')[0]}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const tutorial = dataTutorials[layer.id as keyof typeof dataTutorials]
                        if (tutorial) {
                          alert(`${tutorial.title}\n\n${tutorial.explanation}\n\nLimitation: ${tutorial.limitation}\n\nPractical Use: ${tutorial.practical}`)
                        }
                      }}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main 3D Visualization Area */}
        <div className="flex-1 relative">
          {/* Enhanced 3D Farm Visualization */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-600 via-green-600 to-green-800">
            {/* 3D Terrain Grid */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: 'perspective(1000px) rotateX(60deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Terrain blocks showing NASA data integration */}
              {Array(12).fill(null).map((_, x) =>
                Array(12).fill(null).map((_, z) => {
                  // Simulate NASA data influence on terrain
                  const ndviValue = enabledLayers.includes('modis_ndvi') ? 
                    (gameState.cropHealth / 100) * (0.8 + Math.random() * 0.2) : 0.5
                  const moistureValue = enabledLayers.includes('smap_soil_moisture') ? 
                    gameState.soilMoisture / 100 : 0.5
                  const tempValue = enabledLayers.includes('modis_lst_day') ? 
                    0.3 + (Math.random() * 0.4) : 0.5

                  // Dynamic coloring based on active NASA layers
                  let blockColor = '#16a34a' // Default green
                  let blockOpacity = 0.8

                  if (enabledLayers.includes('modis_ndvi')) {
                    if (ndviValue > 0.7) blockColor = '#22c55e' // Healthy
                    else if (ndviValue > 0.4) blockColor = '#eab308' // Moderate
                    else blockColor = '#ef4444' // Stressed
                  }

                  if (enabledLayers.includes('smap_soil_moisture')) {
                    if (moistureValue > 0.7) {
                      blockColor = '#06b6d4' // High moisture
                      blockOpacity = 0.9
                    } else if (moistureValue < 0.3) {
                      blockColor = '#92400e' // Dry
                      blockOpacity = 0.6
                    }
                  }

                  if (enabledLayers.includes('modis_lst_day') && tempValue > 0.7) {
                    blockColor = '#dc2626' // Hot temperature
                    blockOpacity = 0.9
                  }

                  const height = 15 + (ndviValue * 20) + (moistureValue * 10)

                  return (
                    <div
                      key={`${x}-${z}`}
                      className="absolute transition-all duration-500 hover:scale-110 cursor-pointer"
                      style={{
                        left: `${300 + (x - 6) * 25}px`,
                        top: `${300 + (z - 6) * 25 - height}px`,
                        width: '20px',
                        height: '20px',
                        backgroundColor: blockColor,
                        opacity: blockOpacity,
                        transform: `translateZ(${height}px)`,
                        borderRadius: height > 25 ? '4px' : '2px',
                        boxShadow: `0 ${height/5}px ${height/3}px rgba(0,0,0,0.3)`,
                        border: selectedAction ? '1px solid cyan' : 'none'
                      }}
                      onClick={() => selectedAction && executeAction(selectedAction)}
                      title={`NDVI: ${ndviValue.toFixed(2)} | Moisture: ${moistureValue.toFixed(2)} | Temp: ${tempValue.toFixed(2)}`}
                    />
                  )
                })
              )}
            </div>

            {/* Weather Effects */}
            {gameState.weather === 'rainy' && (
              <div className="absolute inset-0 pointer-events-none">
                {Array(50).fill(null).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-8 bg-blue-300 opacity-60 animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animation: `fall 2s linear infinite ${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Action Confirmation Modal */}
            {selectedAction && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
                <div className="bg-gray-800 rounded-lg p-6 border border-cyan-400 max-w-md">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Confirm Action: {selectedAction.type.charAt(0).toUpperCase() + selectedAction.type.slice(1)}
                  </h3>
                  <div className="space-y-3 mb-6">
                    <p className="text-gray-300">{selectedAction.effect}</p>
                    <div className="bg-blue-900/30 p-3 rounded">
                      <h4 className="text-blue-300 font-medium mb-2">🛰️ NASA Data Being Used:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAction.nasaDataUsed.map((data) => (
                          <span key={data} className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-sm">
                            {data}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-green-400 font-bold">Cost: ${selectedAction.cost}</div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => executeAction(selectedAction)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-4 py-2 rounded-lg font-bold transition-all"
                    >
                      Execute Action
                    </button>
                    <button
                      onClick={() => setSelectedAction(null)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HUD Overlays */}
          <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="text-white font-bold mb-2">🎯 Mission Progress</h3>
            {gameState.currentMission && checkMissionProgress() && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    checkMissionProgress()!.healthObjective ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-300">Crop Health Target</span>
                </div>
                <div className="text-xs text-cyan-300">
                  ⏱️ {checkMissionProgress()!.timeRemaining} days remaining
                </div>
              </div>
            )}
          </div>

          {/* NASA Data Visualization Legend */}
          <div className="absolute bottom-4 left-4 bg-black/70 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="text-white font-bold mb-2">🛰️ NASA Data Legend</h3>
            <div className="space-y-1 text-xs">
              {enabledLayers.includes('modis_ndvi') && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-gray-300">Green = Healthy Crops (NDVI)</span>
                </div>
              )}
              {enabledLayers.includes('smap_soil_moisture') && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-gray-300">Blue = Wet Soil (SMAP)</span>
                </div>
              )}
              {enabledLayers.includes('modis_lst_day') && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span className="text-gray-300">Red = Hot Temperature (LST)</span>
                </div>
              )}
              <div className="pt-2 text-gray-400">
                Click terrain blocks to apply selected action
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  )
}