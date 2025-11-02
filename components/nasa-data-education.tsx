/**
 * NASA Data Education Component
 * Interactive educational content about NASA satellite data and farming applications
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen,
  Satellite,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  Target,
  Award,
  Info
} from 'lucide-react'

interface NASADataEducationProps {
  nasaData: any
}

interface EducationalTopic {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  keyPoints: string[]
  farmingApplication: string
  dataSource: string
  learnMoreUrl: string
  currentValue?: string
  interpretation?: string
}

const NASADataEducation: React.FC<NASADataEducationProps> = ({ nasaData }) => {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set())

  const educationalTopics: EducationalTopic[] = [
    {
      id: 'ndvi',
      title: 'NDVI: Vegetation Health Index',
      icon: <div className="w-4 h-4 bg-green-500 rounded" />,
      description: 'NDVI (Normalized Difference Vegetation Index) measures plant health by analyzing how vegetation reflects different wavelengths of light.',
      keyPoints: [
        'Healthy plants reflect more near-infrared light',
        'Values range from -1 (no vegetation) to +1 (dense, healthy vegetation)',
        'MODIS satellites provide global NDVI data every 1-2 days',
        'Farmers use NDVI to identify stressed areas in their fields'
      ],
      farmingApplication: 'Identify which areas of your farm need attention, optimize fertilizer application, and monitor crop growth over time.',
      dataSource: 'NASA MODIS Terra/Aqua satellites',
      learnMoreUrl: 'https://earthobservatory.nasa.gov/features/MeasuringVegetation',
      currentValue: nasaData?.data?.ndvi ? nasaData.data.ndvi.current.toFixed(3) : 'Loading...',
      interpretation: nasaData?.data?.ndvi ? getNDVIInterpretation(nasaData.data.ndvi.current) : ''
    },
    {
      id: 'smap',
      title: 'SMAP: Soil Moisture Monitoring',
      icon: <div className="w-4 h-4 bg-blue-500 rounded" />,
      description: 'SMAP (Soil Moisture Active Passive) measures soil moisture in the root zone using advanced radar and radiometer technology.',
      keyPoints: [
        'Measures moisture in top 5cm of soil',
        'L-band radar penetrates vegetation to reach soil',
        'Updated every 2-3 days with global coverage',
        'Critical for irrigation timing and drought monitoring'
      ],
      farmingApplication: 'Optimize irrigation schedules, prevent over-watering, and identify drought-stressed areas before visible damage occurs.',
      dataSource: 'NASA SMAP satellite',
      learnMoreUrl: 'https://smap.jpl.nasa.gov',
      currentValue: nasaData?.data?.soilMoisture ? `${(nasaData.data.soilMoisture.current * 100).toFixed(1)}%` : 'Loading...',
      interpretation: nasaData?.data?.soilMoisture ? getSMAPInterpretation(nasaData.data.soilMoisture.current) : ''
    },
    {
      id: 'gpm',
      title: 'GPM: Precipitation Measurement',
      icon: <div className="w-4 h-4 bg-cyan-500 rounded" />,
      description: 'GPM (Global Precipitation Measurement) provides real-time rainfall data worldwide using advanced radar and microwave sensors.',
      keyPoints: [
        'Measures precipitation every 30 minutes',
        'Detects rain, snow, and ice from space',
        'Provides 3D structure of precipitation systems',
        'Essential for flood prediction and water management'
      ],
      farmingApplication: 'Plan field operations around weather, adjust irrigation based on recent rainfall, and prepare for flood or drought conditions.',
      dataSource: 'NASA GPM Core Observatory',
      learnMoreUrl: 'https://gpm.nasa.gov',
      currentValue: nasaData?.data?.precipitation ? `${nasaData.data.precipitation.current.toFixed(2)} mm/hr` : 'Loading...',
      interpretation: nasaData?.data?.precipitation ? getGPMInterpretation(nasaData.data.precipitation.current) : ''
    },
    {
      id: 'lst',
      title: 'LST: Land Surface Temperature',
      icon: <div className="w-4 h-4 bg-red-500 rounded" />,
      description: 'Land Surface Temperature from MODIS provides thermal infrared measurements of Earth\'s surface temperature.',
      keyPoints: [
        'Measures actual surface temperature, not air temperature',
        'Day and night measurements available',
        'Spatial resolution of 1km globally',
        'Important for understanding plant stress and growing conditions'
      ],
      farmingApplication: 'Monitor heat stress in crops, optimize planting timing, and identify microclimates within your farm.',
      dataSource: 'NASA MODIS Terra/Aqua satellites',
      learnMoreUrl: 'https://modis.gsfc.nasa.gov/data/dataprod/mod11.php',
      currentValue: nasaData?.data?.temperature ? `${nasaData.data.temperature.current.toFixed(1)}°C` : 'Loading...',
      interpretation: nasaData?.data?.temperature ? getLSTInterpretation(nasaData.data.temperature.current) : ''
    }
  ]

  function getNDVIInterpretation(value: number): string {
    if (value > 0.7) return 'Excellent: Dense, healthy vegetation'
    if (value > 0.5) return 'Good: Healthy vegetation with good coverage'
    if (value > 0.3) return 'Fair: Moderate vegetation, may need attention'
    if (value > 0.1) return 'Poor: Sparse or stressed vegetation'
    return 'Very Poor: Little to no healthy vegetation'
  }

  function getSMAPInterpretation(value: number): string {
    if (value > 0.35) return 'High: Well-watered soil, possible oversaturation'
    if (value > 0.25) return 'Good: Adequate soil moisture for most crops'
    if (value > 0.15) return 'Fair: Moderate moisture, monitor closely'
    if (value > 0.1) return 'Low: Dry soil, irrigation recommended'
    return 'Very Low: Critically dry, immediate irrigation needed'
  }

  function getGPMInterpretation(value: number): string {
    if (value > 10) return 'Heavy rainfall: Flooding risk, avoid field operations'
    if (value > 2) return 'Moderate rainfall: Good for crops, delay irrigation'
    if (value > 0.5) return 'Light rainfall: Beneficial for vegetation'
    if (value > 0.1) return 'Trace precipitation: Minimal impact'
    return 'No precipitation: Consider irrigation needs'
  }

  function getLSTInterpretation(value: number): string {
    if (value > 40) return 'Extreme heat: High crop stress risk'
    if (value > 35) return 'Very hot: Monitor for heat stress'
    if (value > 25) return 'Warm: Good growing conditions'
    if (value > 15) return 'Cool: Slower growth expected'
    return 'Cold: Growth may be limited'
  }

  const handleTopicComplete = (topicId: string) => {
    setCompletedTopics(prev => new Set(prev).add(topicId))
  }

  const completionPercentage = (completedTopics.size / educationalTopics.length) * 100

  return (
    <Card className="bg-black/80 backdrop-blur-xl border border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <BookOpen className="w-4 h-4 text-purple-400" />
          NASA Data Education
          <Badge className="bg-purple-600/20 text-purple-300">
            {completedTopics.size}/{educationalTopics.length} Complete
          </Badge>
        </CardTitle>
        
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Learning Progress</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {educationalTopics.map((topic) => (
          <div key={topic.id} className="bg-gray-800/30 rounded-lg">
            {/* Topic Header */}
            <button
              onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
              className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-700/30 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                {topic.icon}
                <div>
                  <div className="text-sm font-medium text-white">{topic.title}</div>
                  {topic.currentValue && (
                    <div className="text-xs text-blue-300">
                      Current: {topic.currentValue}
                    </div>
                  )}
                </div>
                {completedTopics.has(topic.id) && (
                  <Award className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              {expandedTopic === topic.id ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* Expanded Content */}
            {expandedTopic === topic.id && (
              <div className="px-3 pb-3 space-y-3">
                {/* Description */}
                <div className="text-xs text-gray-300">
                  {topic.description}
                </div>

                {/* Current Interpretation */}
                {topic.interpretation && (
                  <div className="bg-blue-900/30 p-2 rounded text-xs">
                    <div className="flex items-start gap-2">
                      <Info className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-blue-300 font-medium">Current Status:</div>
                        <div className="text-gray-300">{topic.interpretation}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Points */}
                <div>
                  <div className="text-xs font-medium text-gray-200 mb-2">Key Learning Points:</div>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {topic.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Farming Application */}
                <div className="bg-green-900/20 p-2 rounded">
                  <div className="flex items-start gap-2">
                    <Target className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-green-300 mb-1">Farming Application:</div>
                      <div className="text-xs text-gray-300">{topic.farmingApplication}</div>
                    </div>
                  </div>
                </div>

                {/* Data Source & Learn More */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    Source: {topic.dataSource}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTopicComplete(topic.id)}
                      disabled={completedTopics.has(topic.id)}
                      className="h-6 px-2 text-xs border-green-600 text-green-400 hover:bg-green-600/10"
                    >
                      {completedTopics.has(topic.id) ? (
                        <>
                          <Award className="w-3 h-3 mr-1" />
                          Learned
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-3 h-3 mr-1" />
                          Mark as Learned
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(topic.learnMoreUrl, '_blank')}
                      className="h-6 px-2 text-xs border-blue-600 text-blue-400 hover:bg-blue-600/10"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Achievement System */}
        {completedTopics.size > 0 && (
          <div className="bg-yellow-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">Learning Achievements</span>
            </div>
            <div className="space-y-1">
              {completedTopics.size >= 1 && (
                <div className="text-xs text-gray-300">🏆 First Steps: Learned about NASA satellite data</div>
              )}
              {completedTopics.size >= 2 && (
                <div className="text-xs text-gray-300">🌱 Growing Knowledge: Understanding farming applications</div>
              )}
              {completedTopics.size >= 3 && (
                <div className="text-xs text-gray-300">📡 Data Expert: Mastering satellite measurements</div>
              )}
              {completedTopics.size >= 4 && (
                <div className="text-xs text-gray-300">🎓 NASA Scholar: Complete understanding of all datasets</div>
              )}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-gray-900/50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-300">Pro Tips</span>
          </div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• Combine multiple datasets for better decisions</div>
            <div>• Monitor trends over time, not just current values</div>
            <div>• Use NASA data to validate ground observations</div>
            <div>• Consider local conditions with satellite data</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default NASADataEducation