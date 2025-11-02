/**
 * Comprehensive Data Hub API
 * Server-side data management for all NASA, agricultural, and educational data with aggressive caching
 */

import { NextRequest, NextResponse } from 'next/server'
import { directNASAFetcher } from '@/lib/direct-nasa-api'

// Enhanced server-side cache with different TTLs
const dataCache = new Map<string, { data: any, timestamp: number, ttl: number }>()

// Cache durations for different data types
const CACHE_DURATIONS = {
  nasa_imagery: 30 * 60 * 1000,      // 30 minutes
  weather_data: 15 * 60 * 1000,      // 15 minutes  
  crop_data: 60 * 60 * 1000,         // 1 hour
  learning_content: 24 * 60 * 60 * 1000, // 24 hours
  user_progress: 5 * 60 * 1000,      // 5 minutes
  market_data: 10 * 60 * 1000,       // 10 minutes
  static_content: 7 * 24 * 60 * 60 * 1000 // 7 days
}

// Comprehensive agricultural data structure
const COMPREHENSIVE_DATA = {
  cropDatabase: {
    corn: {
      name: 'Corn (Maize)',
      scientificName: 'Zea mays',
      growthStages: ['Planting', 'Germination', 'V6 Stage', 'Tasseling', 'Grain Filling', 'Maturity'],
      optimalConditions: {
        temperature: { min: 10, max: 35, optimal: 25 },
        soilMoisture: { min: 0.2, max: 0.8, optimal: 0.6 },
        ndvi: { healthy: 0.7, stressed: 0.4 },
        growthPeriod: 120 // days
      },
      nasaIndicators: {
        modisNDVI: 'Monitor vegetation health',
        smapSoilMoisture: 'Track water availability',
        gpmPrecipitation: 'Rainfall monitoring'
      }
    },
    soybeans: {
      name: 'Soybeans',
      scientificName: 'Glycine max',
      growthStages: ['Planting', 'Emergence', 'Flowering', 'Pod Fill', 'Maturity'],
      optimalConditions: {
        temperature: { min: 15, max: 30, optimal: 23 },
        soilMoisture: { min: 0.3, max: 0.7, optimal: 0.5 },
        ndvi: { healthy: 0.65, stressed: 0.35 },
        growthPeriod: 100
      }
    },
    wheat: {
      name: 'Wheat',
      scientificName: 'Triticum aestivum',
      growthStages: ['Planting', 'Tillering', 'Jointing', 'Heading', 'Grain Fill', 'Harvest'],
      optimalConditions: {
        temperature: { min: 5, max: 25, optimal: 18 },
        soilMoisture: { min: 0.25, max: 0.75, optimal: 0.5 },
        ndvi: { healthy: 0.6, stressed: 0.3 },
        growthPeriod: 180
      }
    }
  },

  farmingScenarios: [
    {
      id: 'midwest-corn-belt',
      name: 'Midwest Corn Belt Analysis',
      location: { lat: 41.5868, lng: -93.6250, name: 'Iowa, USA' },
      primaryCrops: ['corn', 'soybeans'],
      challenges: ['Variable rainfall', 'Soil erosion', 'Pest management'],
      nasaDataLayers: ['MODIS_Terra_NDVI', 'SMAP_L4_Soil_Moisture', 'GPM_IMERG_Precipitation'],
      seasonalPattern: {
        spring: 'Planting season - monitor soil conditions',
        summer: 'Growth monitoring - NDVI tracking critical',
        fall: 'Harvest planning - yield estimation',
        winter: 'Field preparation and planning'
      }
    },
    {
      id: 'california-central-valley',
      name: 'California Central Valley',
      location: { lat: 36.7783, lng: -119.4179, name: 'Central Valley, CA' },
      primaryCrops: ['wheat', 'tomatoes', 'almonds'],
      challenges: ['Water scarcity', 'Heat stress', 'Drought management'],
      nasaDataLayers: ['MODIS_Terra_LST', 'SMAP_L4_Soil_Moisture', 'VIIRS_NDVI']
    }
  ],

  educationalContent: {
    quickFacts: [
      {
        title: 'NASA MODIS Satellites',
        content: 'MODIS instruments on Terra and Aqua satellites provide daily global coverage for agricultural monitoring.',
        category: 'satellite-tech',
        difficulty: 'beginner'
      },
      {
        title: 'NDVI Interpretation',
        content: 'NDVI values above 0.6 typically indicate healthy, dense vegetation. Values below 0.3 suggest stressed or sparse vegetation.',
        category: 'data-interpretation',
        difficulty: 'intermediate'
      },
      {
        title: 'Soil Moisture Active Passive (SMAP)',
        content: 'SMAP provides soil moisture data at 36km resolution every 2-3 days, crucial for irrigation planning.',
        category: 'satellite-tech',
        difficulty: 'intermediate'
      }
    ],
    
    tutorials: [
      {
        id: 'reading-satellite-data',
        title: 'Reading Satellite Data for Beginners',
        steps: [
          'Understanding color scales in satellite imagery',
          'Interpreting NDVI values for crop health',
          'Using soil moisture data for irrigation decisions',
          'Combining multiple data layers for insights'
        ],
        estimatedTime: 20,
        interactiveElements: true
      }
    ]
  },

  marketData: {
    commodityPrices: {
      corn: { price: 4.85, unit: 'USD/bushel', change: +0.12, updated: '2024-10-05' },
      soybeans: { price: 11.20, unit: 'USD/bushel', change: -0.08, updated: '2024-10-05' },
      wheat: { price: 5.95, unit: 'USD/bushel', change: +0.05, updated: '2024-10-05' }
    },
    weatherOutlook: {
      shortTerm: 'Favorable conditions expected for next 7 days',
      seasonal: 'La Niña conditions may impact winter wheat planting',
      trends: ['Increased precipitation in Midwest', 'Above average temperatures in Southwest']
    }
  }
}

// Advanced caching functions
function getCachedData(key: string): any | null {
  const cached = dataCache.get(key)
  if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
    console.log(`📦 Cache HIT for: ${key}`)
    return cached.data
  }
  if (cached) {
    console.log(`🗑️ Cache EXPIRED for: ${key}`)
    dataCache.delete(key)
  }
  return null
}

function setCachedData(key: string, data: any, cacheType: keyof typeof CACHE_DURATIONS): void {
  const ttl = CACHE_DURATIONS[cacheType]
  dataCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  })
  console.log(`💾 Cached data for: ${key} (TTL: ${ttl/1000}s)`)
}

// Generate realistic farm data based on location and date
async function generateFarmData(lat: number, lng: number, date?: string): Promise<any> {
  const cacheKey = `farm-data-${lat}-${lng}-${date || 'current'}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  // Simulate farm data generation based on location
  const farmData = {
    coordinates: { lat, lng },
    date: date || new Date().toISOString().split('T')[0],
    fields: [
      {
        id: 'field-001',
        crop: 'corn',
        acres: 125,
        plantingDate: '2024-04-15',
        expectedHarvest: '2024-09-20',
        currentStage: 'Grain Filling',
        health: {
          ndvi: 0.72 + (Math.random() - 0.5) * 0.1,
          soilMoisture: 0.45 + (Math.random() - 0.5) * 0.2,
          temperature: 28 + (Math.random() - 0.5) * 8
        },
        alerts: []
      },
      {
        id: 'field-002',
        crop: 'soybeans',
        acres: 80,
        plantingDate: '2024-05-01',
        expectedHarvest: '2024-10-10',
        currentStage: 'Pod Fill',
        health: {
          ndvi: 0.68 + (Math.random() - 0.5) * 0.1,
          soilMoisture: 0.38 + (Math.random() - 0.5) * 0.2,
          temperature: 26 + (Math.random() - 0.5) * 6
        },
        alerts: ['Low soil moisture detected in Section B']
      }
    ],
    overallHealth: 'Good',
    recommendations: [
      'Monitor soil moisture in soybean field sections',
      'Optimal conditions for corn grain filling stage',
      'Consider irrigation scheduling for next week'
    ],
    nasaDataSources: ['MODIS Terra NDVI', 'SMAP Soil Moisture', 'GPM Precipitation'],
    lastUpdated: new Date().toISOString()
  }

  setCachedData(cacheKey, farmData, 'crop_data')
  return farmData
}

// Main API Route Handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const crop = searchParams.get('crop')
  const scenario = searchParams.get('scenario')

  console.log(`🌍 Data Hub API: ${action}`)

  try {
    switch (action) {
      case 'farm-overview':
        const farmData = await generateFarmData(lat, lng)
        
        return NextResponse.json({
          success: true,
          data: farmData,
          cache: { 
            strategy: 'server-side',
            ttl: CACHE_DURATIONS.crop_data / 1000,
            timestamp: new Date().toISOString()
          }
        })

      case 'crop-database':
        const cropData = crop ? 
          COMPREHENSIVE_DATA.cropDatabase[crop as keyof typeof COMPREHENSIVE_DATA.cropDatabase] :
          COMPREHENSIVE_DATA.cropDatabase

        return NextResponse.json({
          success: true,
          data: cropData,
          cache: { strategy: 'server-side', ttl: CACHE_DURATIONS.static_content / 1000 }
        })

      case 'farming-scenarios':
        const scenarioData = scenario ?
          COMPREHENSIVE_DATA.farmingScenarios.find(s => s.id === scenario) :
          COMPREHENSIVE_DATA.farmingScenarios

        return NextResponse.json({
          success: true,
          data: scenarioData,
          cache: { strategy: 'server-side', ttl: CACHE_DURATIONS.static_content / 1000 }
        })

      case 'educational-content':
        const educationalData = COMPREHENSIVE_DATA.educationalContent

        return NextResponse.json({
          success: true,
          data: educationalData,
          cache: { strategy: 'server-side', ttl: CACHE_DURATIONS.learning_content / 1000 }
        })

      case 'market-data':
        const marketData = COMPREHENSIVE_DATA.marketData

        return NextResponse.json({
          success: true,
          data: marketData,
          cache: { strategy: 'server-side', ttl: CACHE_DURATIONS.market_data / 1000 }
        })

      case 'nasa-live-data':
        const cacheKey = `nasa-live-${lat}-${lng}`
        let nasaData = getCachedData(cacheKey)
        
        if (!nasaData) {
          try {
            // Use direct NASA fetcher
            nasaData = await directNASAFetcher.getComprehensiveAgriculturalData(lat, lng)
            setCachedData(cacheKey, nasaData, 'nasa_imagery')
          } catch (error) {
            console.error('NASA data fetch failed:', error)
            nasaData = { error: 'NASA data temporarily unavailable', success: false }
          }
        }

        return NextResponse.json({
          success: nasaData.success || false,
          data: nasaData,
          cache: { 
            strategy: 'server-side', 
            ttl: CACHE_DURATIONS.nasa_imagery / 1000,
            fromCache: !!getCachedData(cacheKey)
          }
        })

      case 'weather-forecast':
        const weatherCacheKey = `weather-${lat}-${lng}`
        let weatherData = getCachedData(weatherCacheKey)

        if (!weatherData) {
          // Generate mock weather data (in production, use real weather API)
          weatherData = {
            current: {
              temperature: 24 + (Math.random() - 0.5) * 10,
              humidity: 65 + (Math.random() - 0.5) * 20,
              windSpeed: 12 + (Math.random() - 0.5) * 8,
              precipitation: Math.random() * 5,
              conditions: ['Partly Cloudy', 'Sunny', 'Overcast'][Math.floor(Math.random() * 3)]
            },
            forecast: Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              high: 26 + (Math.random() - 0.5) * 8,
              low: 18 + (Math.random() - 0.5) * 6,
              precipitation: Math.random() * 10,
              conditions: ['Sunny', 'Partly Cloudy', 'Rain'][Math.floor(Math.random() * 3)]
            }))
          }
          setCachedData(weatherCacheKey, weatherData, 'weather_data')
        }

        return NextResponse.json({
          success: true,
          data: weatherData,
          cache: { strategy: 'server-side', ttl: CACHE_DURATIONS.weather_data / 1000 }
        })

      case 'cache-stats':
        const stats = {
          totalCached: dataCache.size,
          cacheHitRate: '85%', // Mock data
          memoryUsage: `${Math.round(dataCache.size * 0.1)}MB`,
          oldestEntry: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          categories: {
            nasa_data: Array.from(dataCache.keys()).filter(k => k.includes('nasa')).length,
            farm_data: Array.from(dataCache.keys()).filter(k => k.includes('farm')).length,
            weather_data: Array.from(dataCache.keys()).filter(k => k.includes('weather')).length
          }
        }

        return NextResponse.json({
          success: true,
          data: stats
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Data Hub API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data', details: String(error) },
      { status: 500 }
    )
  }
}

// POST endpoint for data updates
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    const body = await request.json()

    switch (action) {
      case 'update-farm-data':
        const { farmId, fieldUpdates } = body
        
        // Mock farm data update (in production, save to database)
        const updateResult = {
          farmId,
          updatedFields: fieldUpdates.length,
          timestamp: new Date().toISOString(),
          success: true
        }

        return NextResponse.json({
          success: true,
          data: updateResult
        })

      case 'clear-cache':
        const { category } = body
        let clearedCount = 0

        if (category) {
          // Clear specific category
          for (const [key] of dataCache) {
            if (key.includes(category)) {
              dataCache.delete(key)
              clearedCount++
            }
          }
        } else {
          // Clear all cache
          clearedCount = dataCache.size
          dataCache.clear()
        }

        return NextResponse.json({
          success: true,
          data: { clearedEntries: clearedCount }
        })

      default:
        return NextResponse.json({ error: 'Invalid POST action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Data Hub POST Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    )
  }
}