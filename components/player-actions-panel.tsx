/**
 * Player Actions Panel - NASA Data-Driven Farming Decisions
 * Interactive panel for executing farming actions based on real satellite data
 */

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Droplets, 
  Sprout, 
  Zap, 
  Scissors, 
  Info,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface PlayerAction {
  type: 'irrigate' | 'fertilize' | 'plant' | 'harvest'
  name: string
  cost: number
  effect: string
  nasaDataUsed: string[]
  icon: React.ReactNode
  color: string
  enabled: boolean
  recommendation?: string
}

interface PlayerActionsPanelProps {
  gameState: any
  selectedAction: any
  onActionSelect: (action: any) => void
  onExecuteAction: (action: any) => void
  nasaData: any
}

const PlayerActionsPanel: React.FC<PlayerActionsPanelProps> = ({
  gameState,
  selectedAction,
  onActionSelect,
  onExecuteAction,
  nasaData
}) => {
  
  // Generate NASA-guided actions based on current satellite data
  const getAvailableActions = (): PlayerAction[] => {
    const baseActions: PlayerAction[] = [
      {
        type: 'plant',
        name: 'Plant Crops',
        cost: 50,
        effect: 'Start new crop cycle',
        nasaDataUsed: ['MODIS NDVI', 'SMAP Soil Moisture'],
        icon: <Sprout className="w-4 h-4" />,
        color: 'bg-green-600 hover:bg-green-700',
        enabled: gameState.money >= 50,
        recommendation: getPlantingRecommendation()
      },
      {
        type: 'irrigate',
        name: 'Irrigate Field',
        cost: 25,
        effect: 'Increase soil moisture',
        nasaDataUsed: ['SMAP L4', 'GPM IMERG'],
        icon: <Droplets className="w-4 h-4" />,
        color: 'bg-blue-600 hover:bg-blue-700',
        enabled: gameState.money >= 25,
        recommendation: getIrrigationRecommendation()
      },
      {
        type: 'fertilize',
        name: 'Apply Fertilizer',
        cost: 40,
        effect: 'Boost crop nutrition',
        nasaDataUsed: ['MODIS NDVI', 'MODIS LST'],
        icon: <Zap className="w-4 h-4" />,
        color: 'bg-yellow-600 hover:bg-yellow-700',
        enabled: gameState.money >= 40,
        recommendation: getFertilizerRecommendation()
      },
      {
        type: 'harvest',
        name: 'Harvest Crops',
        cost: 0,
        effect: 'Collect mature crops',
        nasaDataUsed: ['MODIS NDVI'],
        icon: <Scissors className="w-4 h-4" />,
        color: 'bg-orange-600 hover:bg-orange-700',
        enabled: gameState.cropHealth > 70,
        recommendation: getHarvestRecommendation()
      }
    ]

    return baseActions
  }

  function getPlantingRecommendation(): string {
    if (!nasaData) return 'No satellite data available'
    
    const soilMoisture = nasaData.data?.soilMoisture?.current || 0
    const temperature = nasaData.data?.temperature?.current || 20
    
    if (soilMoisture < 0.2) return '⚠️ Low soil moisture - consider irrigation first'
    if (temperature > 35) return '🌡️ High temperature - wait for cooler conditions'
    if (soilMoisture > 0.3 && temperature < 30) return '✅ Optimal conditions for planting'
    
    return 'Moderate conditions for planting'
  }

  function getIrrigationRecommendation(): string {
    if (!nasaData) return 'No satellite data available'
    
    const soilMoisture = nasaData.data?.soilMoisture?.current || 0
    const precipitation = nasaData.data?.precipitation?.current || 0
    
    if (precipitation > 2) return '🌧️ Recent rainfall - irrigation not needed'
    if (soilMoisture < 0.15) return '🚨 Critical - immediate irrigation required'
    if (soilMoisture < 0.25) return '⚠️ Recommended - soil moisture low'
    
    return '✅ Soil moisture adequate'
  }

  function getFertilizerRecommendation(): string {
    if (!nasaData) return 'No satellite data available'
    
    const ndvi = nasaData.data?.ndvi?.current || 0
    const trend = nasaData.data?.ndvi?.trend || 'stable'
    
    if (ndvi < 0.3) return '🚨 Low vegetation health - fertilizer critical'
    if (ndvi < 0.5 && trend === 'decreasing') return '⚠️ Declining health - fertilizer recommended'
    if (ndvi > 0.7) return '✅ Healthy vegetation - fertilizer optional'
    
    return 'Moderate vegetation health'
  }

  function getHarvestRecommendation(): string {
    if (!nasaData) return 'No satellite data available'
    
    const ndvi = nasaData.data?.ndvi?.current || 0
    const cropHealth = gameState.cropHealth || 0
    
    if (ndvi > 0.7 && cropHealth > 80) return '🌾 Peak maturity - harvest immediately'
    if (ndvi > 0.6 && cropHealth > 70) return '✅ Ready for harvest'
    if (cropHealth < 50) return '⚠️ Crops stressed - consider early harvest'
    
    return 'Crops still developing'
  }

  const actions = getAvailableActions()

  return (
    <Card className="bg-black/80 backdrop-blur-xl border border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <Sprout className="w-4 h-4 text-green-400" />
          NASA-Guided Actions
          {selectedAction && (
            <Badge className="bg-cyan-600/20 text-cyan-300 capitalize">
              {selectedAction.type} Selected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <div key={index} className="space-y-2">
            <Button
              onClick={() => onActionSelect(selectedAction?.type === action.type ? null : action)}
              disabled={!action.enabled}
              className={`w-full justify-start gap-2 ${action.color} ${
                selectedAction?.type === action.type ? 'ring-2 ring-cyan-400' : ''
              } ${!action.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              size="sm"
            >
              {action.icon}
              <div className="flex-1 text-left">
                <div className="font-medium">{action.name}</div>
                <div className="text-xs opacity-75">${action.cost} • {action.effect}</div>
              </div>
              {!action.enabled && action.type !== 'harvest' && (
                <AlertTriangle className="w-3 h-3 text-red-400" />
              )}
              {action.enabled && action.type === 'harvest' && (
                <TrendingUp className="w-3 h-3 text-green-400" />
              )}
            </Button>

            {/* NASA Data Integration */}
            <div className="ml-4 space-y-1">
              <div className="flex flex-wrap gap-1">
                {action.nasaDataUsed.map((dataset, idx) => (
                  <Badge key={idx} className="bg-purple-600/20 text-purple-300 text-xs">
                    {dataset.split(' ')[0]}
                  </Badge>
                ))}
              </div>
              
              {/* NASA Recommendation */}
              <div className="bg-gray-800/50 p-2 rounded text-xs">
                <div className="flex items-start gap-2">
                  <Info className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-blue-300 font-medium mb-1">NASA Data Analysis:</div>
                    <div className="text-gray-300">{action.recommendation}</div>
                  </div>
                </div>
              </div>

              {/* Show relevant NASA data values */}
              {action.type === 'irrigate' && nasaData?.data?.soilMoisture && (
                <div className="bg-blue-900/30 p-2 rounded text-xs">
                  <div className="text-blue-300">💧 Soil Moisture: {(nasaData.data.soilMoisture.current * 100).toFixed(0)}%</div>
                  <div className="text-gray-400">Trend: {nasaData.data.soilMoisture.trend}</div>
                </div>
              )}
              
              {action.type === 'fertilize' && nasaData?.data?.ndvi && (
                <div className="bg-green-900/30 p-2 rounded text-xs">
                  <div className="text-green-300">🌱 NDVI: {nasaData.data.ndvi.current.toFixed(2)}</div>
                  <div className="text-gray-400">Health: {nasaData.data.ndvi.trend}</div>
                </div>
              )}

              {action.type === 'plant' && nasaData?.data?.temperature && (
                <div className="bg-orange-900/30 p-2 rounded text-xs">
                  <div className="text-orange-300">🌡️ Temperature: {nasaData.data.temperature.current.toFixed(1)}°C</div>
                  <div className="text-gray-400">Status: {nasaData.data.temperature.status}</div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {selectedAction && (
          <div className="pt-3 border-t border-gray-700">
            <div className="text-xs text-cyan-300 mb-2 flex items-center gap-2">
              <Info className="w-3 h-3" />
              Click on terrain cells to apply {selectedAction.name}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onActionSelect(null)}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel Action
            </Button>
          </div>
        )}

        {/* Game State Summary */}
        <div className="pt-3 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-400">Money</div>
              <div className="text-green-400 font-bold">${gameState.money}</div>
            </div>
            <div>
              <div className="text-gray-400">Crop Health</div>
              <div className={`font-bold ${gameState.cropHealth > 60 ? 'text-green-400' : 'text-red-400'}`}>
                {gameState.cropHealth}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PlayerActionsPanel