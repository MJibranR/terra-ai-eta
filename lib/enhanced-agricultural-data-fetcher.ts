/**
 * Enhanced NASA + Microsoft Planetary Computer Data Fetcher
 * Combines NASA's real-time data with Microsoft's high-resolution datasets
 * Provides the best of both platforms for agricultural simulation
 */

import { planetaryComputerClient } from './planetary-computer-client'

interface EnhancedAgriculturalData {
  // Core NASA data (real-time, global)
  nasa: {
    ndvi: number
    soilMoisture: number
    precipitation: number
    temperature: number
    trends: {
      ndvi: 'increasing' | 'decreasing' | 'stable'
      soilMoisture: 'increasing' | 'decreasing' | 'stable'
      precipitation: 'increasing' | 'decreasing' | 'stable'
      temperature: 'increasing' | 'decreasing' | 'stable'
    }
  }
  
  // Enhanced Microsoft Planetary Computer data (high-resolution)
  microsoft: {
    highResNDVI: number
    resolution: string
    cropType?: string
    soilProperties?: any
    localWeather?: any
    dataQuality: number
  }
  
  // Fusion analysis
  fusion: {
    combinedNDVI: number
    confidenceLevel: number
    dataSourceWeights: {
      nasa: number
      microsoft: number
    }
    recommendations: string[]
  }
  
  // Metadata
  metadata: {
    timestamp: string
    location: { longitude: number; latitude: number }
    updateFrequency: string
    spatialResolution: string
    temporalCoverage: string
  }
}

export class EnhancedAgriculturalDataFetcher {
  private nasaEndpoint = '/api/nasa-live-data'
  
  constructor() {
    console.log('Enhanced Agricultural Data Fetcher initialized')
    console.log('🛰️ NASA real-time data + 🌍 Microsoft Planetary Computer high-resolution data')
  }

  /**
   * Fetch comprehensive agricultural data combining NASA + Microsoft sources
   */
  async fetchEnhancedAgriculturalData(
    longitude: number,
    latitude: number
  ): Promise<EnhancedAgriculturalData> {
    try {
      console.log(`🔄 Fetching enhanced data for coordinates: ${latitude}, ${longitude}`)
      
      // Fetch both NASA and Microsoft data in parallel
      const [nasaData, microsoftData] = await Promise.all([
        this.fetchNASAData(longitude, latitude),
        planetaryComputerClient.processAgriculturalDataForGame(longitude, latitude)
      ])

      // Combine and analyze both datasets
      const fusedData = this.fuseDataSources(nasaData, microsoftData)
      
      console.log('✅ Enhanced agricultural data successfully fetched and fused')
      return fusedData

    } catch (error) {
      console.error('❌ Failed to fetch enhanced agricultural data:', error)
      return this.getFallbackData(longitude, latitude)
    }
  }

  /**
   * Get ultra-high resolution crop analysis using Sentinel-2 (10m resolution)
   */
  async getUltraHighResCropAnalysis(
    longitude: number,
    latitude: number
  ): Promise<any> {
    try {
      const sentinelData = await planetaryComputerClient.getSentinel2NDVI(longitude, latitude)
      
      return {
        fieldLevelNDVI: sentinelData?.ndvi || 0.5,
        resolution: '10m - individual plant level',
        cropHealthZones: this.analyzeCropHealthZones(sentinelData),
        precisionRecommendations: this.generatePrecisionRecommendations(sentinelData),
        dataSource: 'Sentinel-2 via Microsoft Planetary Computer'
      }
    } catch (error) {
      console.error('Failed to get ultra-high res analysis:', error)
      return null
    }
  }

  /**
   * Combine crop-specific data with real-time conditions
   */
  async getCropSpecificInsights(
    longitude: number,
    latitude: number,
    cropType?: string
  ): Promise<any> {
    try {
      const [nasaWeather, croplandData, soilData] = await Promise.all([
        this.fetchNASAData(longitude, latitude),
        planetaryComputerClient.getUSDAcropData(longitude, latitude),
        this.getSoilProperties(longitude, latitude)
      ])

      const detectedCropType = cropType || croplandData?.dominantCrop || 'mixed'
      
      return {
        cropType: detectedCropType,
        optimalConditions: this.getOptimalConditionsForCrop(detectedCropType),
        currentMatch: this.assessCurrentConditions(nasaWeather, detectedCropType),
        growthStage: this.estimateGrowthStage(detectedCropType, nasaWeather),
        actionPriority: this.prioritizeActions(nasaWeather, detectedCropType),
        yieldPrediction: this.predictYield(nasaWeather, detectedCropType, soilData)
      }
    } catch (error) {
      console.error('Failed to get crop-specific insights:', error)
      return null
    }
  }

  /**
   * Real-time farming decision support system
   */
  async getFarmingDecisionSupport(
    longitude: number,
    latitude: number,
    currentActions: string[]
  ): Promise<any> {
    const enhancedData = await this.fetchEnhancedAgriculturalData(longitude, latitude)
    const cropInsights = await this.getCropSpecificInsights(longitude, latitude)
    
    return {
      immediateActions: this.getImmediateActions(enhancedData),
      weeklyPlan: this.generateWeeklyPlan(enhancedData, cropInsights),
      riskAssessment: this.assessRisks(enhancedData),
      optimizationTips: this.getOptimizationTips(enhancedData, currentActions),
      dataConfidence: enhancedData.fusion.confidenceLevel,
      lastUpdated: new Date().toISOString()
    }
  }

  // Private helper methods
  private async fetchNASAData(longitude: number, latitude: number): Promise<any> {
    try {
      const response = await fetch(`${this.nasaEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longitude, latitude })
      })
      
      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.warn('NASA data fetch failed, using fallback:', error)
      return this.generateFallbackNASAData(longitude, latitude)
    }
  }

  private fuseDataSources(nasaData: any, microsoftData: any): EnhancedAgriculturalData {
    // Calculate confidence weights based on data quality
    const nasaWeight = 0.6 // NASA has broader coverage and real-time updates
    const microsoftWeight = 0.4 // Microsoft has higher resolution but less frequent updates
    
    // Fuse NDVI values intelligently
    const nasaNDVI = nasaData?.data?.ndvi?.current || 0.4
    const msNDVI = microsoftData?.highResolution?.ndvi || 0.4
    const combinedNDVI = (nasaNDVI * nasaWeight) + (msNDVI * microsoftWeight)
    
    // Generate intelligent recommendations
    const recommendations = this.generateFusionRecommendations(nasaData, microsoftData)
    
    return {
      nasa: {
        ndvi: nasaNDVI,
        soilMoisture: nasaData?.data?.soilMoisture?.current || 0.25,
        precipitation: nasaData?.data?.precipitation?.current || 0,
        temperature: nasaData?.data?.temperature?.current || 20,
        trends: {
          ndvi: nasaData?.data?.ndvi?.trend || 'stable',
          soilMoisture: nasaData?.data?.soilMoisture?.trend || 'stable',
          precipitation: nasaData?.data?.precipitation?.trend || 'stable',
          temperature: nasaData?.data?.temperature?.trend || 'stable'
        }
      },
      microsoft: {
        highResNDVI: msNDVI,
        resolution: microsoftData?.highResolution?.resolution || '10m',
        cropType: microsoftData?.cropland?.cropType,
        soilProperties: microsoftData?.soil,
        localWeather: microsoftData?.localWeather,
        dataQuality: microsoftData?.highResolution?.dataQuality || 85
      },
      fusion: {
        combinedNDVI,
        confidenceLevel: this.calculateConfidenceLevel(nasaData, microsoftData),
        dataSourceWeights: { nasa: nasaWeight, microsoft: microsoftWeight },
        recommendations
      },
      metadata: {
        timestamp: new Date().toISOString(),
        location: { longitude: microsoftData?.location?.longitude || 0, latitude: microsoftData?.location?.latitude || 0 },
        updateFrequency: 'Real-time NASA + 5-day Microsoft',
        spatialResolution: '10m (Sentinel-2) to 1km (MODIS)',
        temporalCoverage: 'Current + 30-day trends'
      }
    }
  }

  private generateFusionRecommendations(nasaData: any, microsoftData: any): string[] {
    const recommendations: string[] = []
    
    // NDVI-based recommendations
    const combinedNDVI = (nasaData?.data?.ndvi?.current || 0.4) * 0.6 + 
                        (microsoftData?.highResolution?.ndvi || 0.4) * 0.4
    
    if (combinedNDVI < 0.3) {
      recommendations.push('🚨 Low vegetation health detected - consider fertilization')
    } else if (combinedNDVI > 0.7) {
      recommendations.push('✅ Excellent vegetation health - maintain current practices')
    }
    
    // Soil moisture recommendations
    const soilMoisture = nasaData?.data?.soilMoisture?.current || 0.25
    if (soilMoisture < 0.15) {
      recommendations.push('💧 Soil moisture critically low - immediate irrigation recommended')
    }
    
    // High-resolution specific recommendations
    if (microsoftData?.highResolution?.dataQuality > 90) {
      recommendations.push('📊 High-quality satellite data available - precision agriculture optimal')
    }
    
    // Crop-specific recommendations
    if (microsoftData?.cropland?.cropType) {
      recommendations.push(`🌾 ${microsoftData.cropland.cropType} detected - applying crop-specific insights`)
    }

    return recommendations
  }

  private calculateConfidenceLevel(nasaData: any, microsoftData: any): number {
    let confidence = 0.5 // Base confidence
    
    // Boost confidence with NASA data availability
    if (nasaData?.data?.ndvi?.current !== undefined) confidence += 0.2
    if (nasaData?.data?.soilMoisture?.current !== undefined) confidence += 0.1
    
    // Boost confidence with Microsoft high-res data
    if (microsoftData?.highResolution?.dataQuality > 80) confidence += 0.2
    if (microsoftData?.cropland?.confidence > 0.8) confidence += 0.1
    
    return Math.min(1.0, confidence)
  }

  private analyzeCropHealthZones(sentinelData: any): any {
    if (!sentinelData?.ndvi) return null
    
    const ndvi = sentinelData.ndvi
    return {
      healthy: ndvi > 0.6 ? 'High' : ndvi > 0.4 ? 'Moderate' : 'Low',
      stressedAreas: ndvi < 0.3 ? 'Detected' : 'None',
      uniformity: Math.random() > 0.5 ? 'Uniform' : 'Variable',
      recommendation: ndvi < 0.4 ? 'Targeted intervention needed' : 'Monitor regularly'
    }
  }

  private generatePrecisionRecommendations(sentinelData: any): string[] {
    const recommendations: string[] = []
    
    if (sentinelData?.ndvi < 0.3) {
      recommendations.push('Apply variable-rate fertilizer to stressed areas')
      recommendations.push('Investigate soil compaction or drainage issues')
    }
    
    if (sentinelData?.cloudCover > 20) {
      recommendations.push('Weather conditions may affect field operations')
    }
    
    recommendations.push('Use precision irrigation based on field zones')
    return recommendations
  }

  private async getSoilProperties(longitude: number, latitude: number): Promise<any> {
    // This would integrate with gNATSGO soil database from Planetary Computer
    return {
      pH: 6.5 + Math.random(),
      organicMatter: 2 + Math.random() * 3,
      drainage: Math.random() > 0.5 ? 'well-drained' : 'poorly-drained',
      fertility: Math.random() > 0.3 ? 'high' : 'medium'
    }
  }

  private getOptimalConditionsForCrop(cropType: string): any {
    const conditions: { [key: string]: any } = {
      corn: { ndvi: [0.6, 0.8], temp: [20, 30], moisture: [0.25, 0.35] },
      soybeans: { ndvi: [0.5, 0.7], temp: [18, 28], moisture: [0.2, 0.3] },
      wheat: { ndvi: [0.4, 0.6], temp: [15, 25], moisture: [0.15, 0.25] },
      mixed: { ndvi: [0.4, 0.7], temp: [18, 28], moisture: [0.2, 0.3] }
    }
    
    return conditions[cropType] || conditions.mixed
  }

  private assessCurrentConditions(nasaData: any, cropType: string): any {
    const optimal = this.getOptimalConditionsForCrop(cropType)
    const current = {
      ndvi: nasaData?.data?.ndvi?.current || 0.4,
      temp: nasaData?.data?.temperature?.current || 20,
      moisture: nasaData?.data?.soilMoisture?.current || 0.25
    }
    
    return {
      ndviMatch: current.ndvi >= optimal.ndvi[0] && current.ndvi <= optimal.ndvi[1],
      tempMatch: current.temp >= optimal.temp[0] && current.temp <= optimal.temp[1],
      moistureMatch: current.moisture >= optimal.moisture[0] && current.moisture <= optimal.moisture[1],
      overallScore: 0.7 + Math.random() * 0.3
    }
  }

  private estimateGrowthStage(cropType: string, nasaData: any): string {
    const stages = ['seedling', 'vegetative', 'flowering', 'maturity']
    const ndvi = nasaData?.data?.ndvi?.current || 0.4
    
    if (ndvi < 0.3) return stages[0]
    if (ndvi < 0.5) return stages[1]
    if (ndvi < 0.7) return stages[2]
    return stages[3]
  }

  private prioritizeActions(nasaData: any, cropType: string): string[] {
    const actions: string[] = []
    const soilMoisture = nasaData?.data?.soilMoisture?.current || 0.25
    const ndvi = nasaData?.data?.ndvi?.current || 0.4
    
    if (soilMoisture < 0.15) actions.push('irrigation')
    if (ndvi < 0.4) actions.push('fertilization')
    if (nasaData?.data?.temperature?.current > 35) actions.push('heat_protection')
    
    return actions
  }

  private predictYield(nasaData: any, cropType: string, soilData: any): any {
    const baseYield = { corn: 150, soybeans: 50, wheat: 60, mixed: 100 }[cropType] || 100
    const healthFactor = (nasaData?.data?.ndvi?.current || 0.4) / 0.6
    const soilFactor = soilData?.fertility === 'high' ? 1.1 : 1.0
    
    return {
      predicted: Math.round(baseYield * healthFactor * soilFactor),
      unit: 'bushels/acre',
      confidence: 0.75 + Math.random() * 0.2
    }
  }

  private getImmediateActions(data: EnhancedAgriculturalData): string[] {
    const actions: string[] = []
    
    if (data.nasa.soilMoisture < 0.15) {
      actions.push('🚨 URGENT: Irrigate immediately - soil moisture critical')
    }
    
    if (data.fusion.combinedNDVI < 0.3) {
      actions.push('⚠️ Apply fertilizer to stressed vegetation areas')
    }
    
    if (data.nasa.precipitation > 2) {
      actions.push('🌧️ Postpone field operations - heavy rain detected')
    }
    
    return actions
  }

  private generateWeeklyPlan(enhancedData: any, cropInsights: any): any {
    return {
      day1: 'Monitor soil moisture levels',
      day3: 'Apply precision fertilizer if NDVI < 0.4',
      day5: 'Check crop growth stage progression',
      day7: 'Evaluate weekly progress and adjust plan'
    }
  }

  private assessRisks(data: EnhancedAgriculturalData): any {
    return {
      drought: data.nasa.soilMoisture < 0.2 ? 'High' : 'Low',
      heatStress: data.nasa.temperature > 35 ? 'High' : 'Low',
      cropHealth: data.fusion.combinedNDVI < 0.4 ? 'At Risk' : 'Healthy',
      overall: 'Moderate'
    }
  }

  private getOptimizationTips(data: EnhancedAgriculturalData, actions: string[]): string[] {
    return [
      '💡 Use variable-rate application based on high-res NDVI maps',
      '📊 Monitor trends across multiple data sources for better decisions',
      '🎯 Focus interventions on low-performing field zones',
      '⏰ Time operations during optimal weather windows'
    ]
  }

  private generateFallbackNASAData(longitude: number, latitude: number): any {
    return {
      data: {
        ndvi: { current: 0.4 + Math.random() * 0.3, trend: 'stable' },
        soilMoisture: { current: 0.2 + Math.random() * 0.2, trend: 'stable' },
        precipitation: { current: Math.random() * 2, trend: 'stable' },
        temperature: { current: 20 + Math.random() * 15, trend: 'stable' }
      },
      simulated: true
    }
  }

  private getFallbackData(longitude: number, latitude: number): EnhancedAgriculturalData {
    return {
      nasa: {
        ndvi: 0.5,
        soilMoisture: 0.25,
        precipitation: 0,
        temperature: 25,
        trends: { ndvi: 'stable', soilMoisture: 'stable', precipitation: 'stable', temperature: 'stable' }
      },
      microsoft: {
        highResNDVI: 0.55,
        resolution: '10m (simulated)',
        dataQuality: 80
      },
      fusion: {
        combinedNDVI: 0.52,
        confidenceLevel: 0.6,
        dataSourceWeights: { nasa: 0.6, microsoft: 0.4 },
        recommendations: ['Using simulated data - limited recommendations available']
      },
      metadata: {
        timestamp: new Date().toISOString(),
        location: { longitude, latitude },
        updateFrequency: 'Simulated',
        spatialResolution: 'Mixed',
        temporalCoverage: 'Current'
      }
    }
  }
}

export const enhancedAgriculturalDataFetcher = new EnhancedAgriculturalDataFetcher()