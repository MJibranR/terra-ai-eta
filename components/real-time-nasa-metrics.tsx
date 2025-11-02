/**
 * Real-Time NASA Metrics Component
 * Live display of NASA satellite data with educational context
 */

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Satellite,
  TrendingUp,
  TrendingDown,
  Minus,
  Droplets,
  Thermometer,
  Cloud,
  Sprout,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'

interface RealTimeNASAMetricsProps {
  nasaData: any
  gameState: any
}

const RealTimeNASAMetrics: React.FC<RealTimeNASAMetricsProps> = ({
  nasaData,
  gameState
}) => {
  
  if (!nasaData || !nasaData.data) {
    return (
      <Card className="bg-black/80 backdrop-blur-xl border border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-sm">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            NASA Satellite Data
            <Badge className="bg-gray-600/20 text-gray-300">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <div className="text-gray-400 text-xs">Fetching NASA data...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-3 h-3 text-green-400" />
      case 'decreasing':
        return <TrendingDown className="w-3 h-3 text-red-400" />
      default:
        return <Minus className="w-3 h-3 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-green-400'
      case 'good':
        return 'text-blue-400'
      case 'warning':
        return 'text-yellow-400'
      case 'critical':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'good':
        return <CheckCircle className="w-3 h-3 text-green-400" />
      case 'warning':
      case 'critical':
        return <AlertTriangle className="w-3 h-3 text-red-400" />
      default:
        return <Info className="w-3 h-3 text-gray-400" />
    }
  }

  const metrics = [
    {
      id: 'ndvi',
      label: 'Vegetation Index (NDVI)',
      value: nasaData.data.ndvi.current.toFixed(3),
      rawValue: nasaData.data.ndvi.current,
      status: nasaData.data.ndvi.status,
      trend: nasaData.data.ndvi.trend,
      icon: <Sprout className="w-4 h-4" />,
      source: 'MODIS Terra/Aqua',
      description: 'Measures vegetation health and density',
      unit: 'index',
      range: '-1.0 to +1.0',
      interpretation: nasaData.data.ndvi.current > 0.6 ? 'Healthy vegetation' : 
                     nasaData.data.ndvi.current > 0.3 ? 'Moderate vegetation' : 
                     'Sparse/stressed vegetation'
    },
    {
      id: 'soilMoisture',
      label: 'Soil Moisture (SMAP)',
      value: `${(nasaData.data.soilMoisture.current * 100).toFixed(1)}%`,
      rawValue: nasaData.data.soilMoisture.current,
      status: nasaData.data.soilMoisture.status,
      trend: nasaData.data.soilMoisture.trend,
      icon: <Droplets className="w-4 h-4" />,
      source: 'SMAP L4',
      description: 'Root zone soil moisture content',
      unit: 'volumetric %',
      range: '0% to 50%',
      interpretation: nasaData.data.soilMoisture.current > 0.3 ? 'Well-watered soil' :
                     nasaData.data.soilMoisture.current > 0.15 ? 'Adequate moisture' :
                     'Dry soil - irrigation needed'
    },
    {
      id: 'temperature',
      label: 'Land Surface Temperature',
      value: `${nasaData.data.temperature.current.toFixed(1)}°C`,
      rawValue: nasaData.data.temperature.current,
      status: nasaData.data.temperature.status,
      trend: nasaData.data.temperature.trend,
      icon: <Thermometer className="w-4 h-4" />,
      source: 'MODIS LST',
      description: 'Surface temperature from thermal infrared',
      unit: '°Celsius',
      range: '-40°C to +60°C',
      interpretation: nasaData.data.temperature.current > 35 ? 'Very hot - stress risk' :
                     nasaData.data.temperature.current > 25 ? 'Warm conditions' :
                     nasaData.data.temperature.current > 10 ? 'Cool conditions' :
                     'Cold - growth limited'
    },
    {
      id: 'precipitation',
      label: 'Precipitation Rate (GPM)',
      value: `${nasaData.data.precipitation.current.toFixed(2)} mm/hr`,
      rawValue: nasaData.data.precipitation.current,
      status: nasaData.data.precipitation.status,
      trend: nasaData.data.precipitation.trend,
      icon: <Cloud className="w-4 h-4" />,
      source: 'GPM IMERG',
      description: 'Real-time precipitation measurement',
      unit: 'mm/hour',
      range: '0 to 100+ mm/hr',
      interpretation: nasaData.data.precipitation.current > 5 ? 'Heavy rainfall' :
                     nasaData.data.precipitation.current > 1 ? 'Light rainfall' :
                     'No significant precipitation'
    }
  ]

  return (
    <Card className="bg-black/80 backdrop-blur-xl border border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <Satellite className="w-4 h-4 text-blue-400" />
          Live NASA Satellite Data
          <Badge className="bg-green-600/20 text-green-300">
            Real-time
          </Badge>
        </CardTitle>
        <div className="text-xs text-gray-400">
          Last update: {new Date(nasaData.timestamp).toLocaleTimeString()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-gray-800/30 p-3 rounded-lg space-y-2">
            {/* Main Metric Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={getStatusColor(metric.status)}>
                  {metric.icon}
                </div>
                <div>
                  <div className="text-xs font-medium text-white">{metric.label}</div>
                  <div className="text-[10px] text-gray-400">{metric.source}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                  {metric.value}
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <span className="text-xs text-gray-400 capitalize">{metric.trend}</span>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              {getStatusIcon(metric.status)}
              <span className={`text-xs font-medium ${getStatusColor(metric.status)} capitalize`}>
                {metric.status}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">{metric.interpretation}</span>
            </div>

            {/* Educational Information */}
            <div className="bg-gray-900/50 p-2 rounded text-xs space-y-1">
              <div className="text-gray-300">{metric.description}</div>
              <div className="flex justify-between text-gray-400">
                <span>Range: {metric.range}</span>
                <span>Unit: {metric.unit}</span>
              </div>
            </div>

            {/* Progress Bar for Visual Reference */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Data Quality</span>
                <span>{nasaData.metadata?.dataQuality || 95}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${nasaData.metadata?.dataQuality || 95}%` }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Data Summary */}
        <div className="bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Farming Conditions Summary</span>
          </div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>
              • Vegetation health: {nasaData.data.ndvi.current > 0.5 ? 'Good' : 'Needs attention'}
            </div>
            <div>
              • Water availability: {nasaData.data.soilMoisture.current > 0.2 ? 'Adequate' : 'Low'}
            </div>
            <div>
              • Temperature stress: {nasaData.data.temperature.current > 35 ? 'High risk' : 'Manageable'}
            </div>
            <div>
              • Recent rainfall: {nasaData.data.precipitation.current > 0.5 ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Satellite Coverage Info */}
        <div className="text-xs text-gray-500 text-center">
          Coverage: {nasaData.metadata?.coverage || 'Regional'} • 
          Resolution: {nasaData.metadata?.resolution || '1km'} • 
          Confidence: {nasaData.metadata?.confidence || 'High'}
        </div>
      </CardContent>
    </Card>
  )
}

export default RealTimeNASAMetrics