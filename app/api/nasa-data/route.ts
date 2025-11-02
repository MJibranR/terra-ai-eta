/**
 * NASA Farm Navigators API Route
 * Server-side NASA data integration with caching for educational farming game
 */

import { NextRequest, NextResponse } from 'next/server'
import { FARMING_SCENARIOS, NASA_DATASETS } from '@/lib/nasa-api'
import { EnhancedNASAClient } from '@/lib/enhanced-nasa-client'

// Initialize NASA client with demo API key for testing
const nasaClient = new EnhancedNASAClient(process.env.NASA_API_KEY || 'xUVqGzhFLydz87SVBPKEXlQnHo9VBwCfpij5AzCj')

// Enhanced in-memory cache with statistics (use Redis in production)
interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
  hits: number
  lastAccessed: number
}

const dataCache = new Map<string, CacheEntry>()
const cacheStats = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  totalEntries: 0
}

function getCachedData(key: string) {
  cacheStats.totalRequests++
  const cached = dataCache.get(key)

  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    // Update access statistics
    cached.hits++
    cached.lastAccessed = Date.now()
    cacheStats.cacheHits++

    // Add cache info to response
    const responseData = {
      ...cached.data,
      cache: {
        hit: true,
        age: Math.floor((Date.now() - cached.timestamp) / 1000),
        hits: cached.hits,
        ttl: Math.floor(cached.ttl / 1000)
      }
    }
    return responseData
  }

  if (cached) {
    dataCache.delete(key)
    cacheStats.totalEntries--
  }
  cacheStats.cacheMisses++
  return null
}

function setCachedData(key: string, data: any, ttlMinutes: number = 60) {
  const existing = dataCache.has(key)
  if (!existing) cacheStats.totalEntries++

  dataCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMinutes * 60 * 1000,
    hits: 0,
    lastAccessed: Date.now()
  })

  // Clean up expired entries periodically
  if (cacheStats.totalEntries % 10 === 0) {
    cleanupExpiredCache()
  }
}

function cleanupExpiredCache() {
  const now = Date.now()
  for (const [key, entry] of dataCache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      dataCache.delete(key)
      cacheStats.totalEntries--
    }
  }
}

function getCacheStats() {
  const hitRate = cacheStats.totalRequests > 0
    ? (cacheStats.cacheHits / cacheStats.totalRequests * 100).toFixed(1)
    : '0.0'

  return {
    ...cacheStats,
    hitRate: `${hitRate}%`,
    memoryUsage: `${dataCache.size} entries`
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const scenario = searchParams.get('scenario')
  const lat = Number(searchParams.get('lat') ?? 40.7128)
  const lng = Number(searchParams.get('lng') ?? -74.0060)

  try {
    switch (action) {
      case 'test-connection': {
        const connectionStatus = await nasaClient.testConnection()
        return NextResponse.json(connectionStatus)
      }

      case 'scenarios':
        return NextResponse.json({
          scenarios: FARMING_SCENARIOS,
          datasets: NASA_DATASETS,
        })

      case 'farm-data':
        return await getFarmData(lat, lng, scenario)

      case 'terrain':
        return await getTerrainData(lat, lng)

      case 'weather':
        return await getWeatherData(lat, lng)

      case 'soil-analysis':
        return await getSoilAnalysis(lat, lng)

      case 'crop-health':
        return await getCropHealthData(lat, lng)

      case 'earth':
        return await getEarthImagery(lat, lng, searchParams.get('date'))

      case 'elevation':
        return await getElevationData(lat, lng)

      case 'terrain-3d':
        return await get3DTerrainData(lat, lng)

      case 'cache-stats':
        return NextResponse.json({
          success: true,
          stats: getCacheStats(),
          timestamp: new Date().toISOString()
        })

      case 'clear-cache':
        dataCache.clear()
        cacheStats.totalEntries = 0
        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('NASA API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch NASA data', details: error?.message ?? String(error) },
      { status: 500 }
    )
  }
}

/* -------------------------
   ELEVATION DATA (SRTM)
   ------------------------- */
async function getElevationData(lat: number, lng: number) {
  const cacheKey = `elevation-${lat}-${lng}`
  const cached = getCachedData(cacheKey)
  if (cached) return NextResponse.json(cached)

  try {
    // Generate realistic elevation grid based on coordinates
    const elevationGrid = generateTerrainElevationGrid(lat, lng)

    const result = {
      success: true,
      data: {
        elevationGrid,
        bounds: {
          north: lat + 0.01,
          south: lat - 0.01,
          east: lng + 0.01,
          west: lng - 0.01
        },
        resolution: '30m', // SRTM resolution
        source: 'NASA SRTM DEM (simulated)'
      },
      location: { lat, lng }
    }

    setCachedData(cacheKey, result, 240) // Cache for 4 hours
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Elevation Data Error:', error)

    const fallbackResult = {
      success: false,
      error: 'NASA SRTM unavailable',
      fallback: {
        elevationGrid: generateFallbackElevationGrid(),
        source: 'Generated terrain'
      }
    }

    return NextResponse.json(fallbackResult)
  }
}

/* -------------------------
   3D TERRAIN DATA
   ------------------------- */
async function get3DTerrainData(lat: number, lng: number) {
  const cacheKey = `terrain-3d-${lat}-${lng}`
  const cached = getCachedData(cacheKey)
  if (cached) return NextResponse.json(cached)

  try {
    // Combine elevation + satellite imagery for 3D terrain
    const elevationResponse = await getElevationData(lat, lng)
    const elevationData = await elevationResponse.json()

    // Try to get earth imagery
    let imageryData = null
    try {
      const imageryResponse = await getEarthImagery(lat, lng, null)
      imageryData = await imageryResponse.json()
    } catch (error) {
      console.warn('Earth imagery unavailable:', error)
    }

    const result = {
      success: true,
      data: {
        elevation: elevationData.data || elevationData.fallback,
        imagery: imageryData?.data || imageryData?.fallback || null,
        farmableAreas: identifyFarmableAreas(elevationData.data?.elevationGrid || elevationData.fallback?.elevationGrid || []),
        recommendedCrops: getRecommendedCrops(lat, lng)
      },
      location: { lat, lng },
      source: 'NASA SRTM + Landsat'
    }

    setCachedData(cacheKey, result, 120) // Cache for 2 hours
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('3D Terrain Error:', error)

    const fallbackResult = {
      success: false,
      error: 'NASA 3D terrain unavailable',
      fallback: {
        elevation: { elevationGrid: generateFallbackElevationGrid() },
        imagery: null,
        farmableAreas: [],
        recommendedCrops: ['corn', 'wheat']
      }
    }

    return NextResponse.json(fallbackResult)
  }
}

/* -------------------------
   EARTH IMAGERY
   ------------------------- */
async function getEarthImagery(lat: number, lng: number, dateStr: string | null) {
  const cacheKey = `earth-imagery-${lat}-${lng}-${dateStr ?? 'latest'}`
  const cached = getCachedData(cacheKey)
  if (cached) return NextResponse.json(cached)

  try {
    const date = dateStr || new Date().toISOString().split('T')[0]
    const earthImageryData = await nasaClient.getEarthImagery(lat, lng, date)

    const result = {
      success: true,
      data: earthImageryData,
      location: { lat, lng },
      date,
      source: 'NASA Earth Imagery API'
    }

    setCachedData(cacheKey, result, 120) // Cache for 2 hours
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Earth Imagery Error:', error)

    // Return fallback data
    const fallbackResult = {
      success: false,
      error: 'NASA Earth Imagery unavailable',
      fallback: {
        imageUrl: '/placeholder.jpg',
        metadata: {
          lat,
          lng,
          date: dateStr || new Date().toISOString().split('T')[0],
          source: 'Fallback data'
        }
      }
    }

    return NextResponse.json(fallbackResult)
  }
}

// Generate realistic elevation grid based on geographic coordinates
function generateTerrainElevationGrid(lat: number, lng: number) {
  const size = 32
  const grid: number[][] = []

  // Use coordinate-based patterns for realistic terrain
  const seed = Math.abs(lat * lng * 1000) % 1000

  for (let x = 0; x < size; x++) {
    grid[x] = []
    for (let z = 0; z < size; z++) {
      // Base elevation from coordinates (simplified)
      let elevation = Math.abs(lat) * 2 // Higher latitudes = higher base elevation

      // Add terrain variation using coordinate-based noise
      const noiseX = (x + seed) * 0.15
      const noiseZ = (z + seed) * 0.15

      elevation += Math.sin(noiseX) * Math.cos(noiseZ) * 30
      elevation += Math.sin(noiseX * 2) * Math.cos(noiseZ * 2) * 15
      elevation += Math.sin(noiseX * 4) * Math.cos(noiseZ * 4) * 8

      // Add some randomness
      elevation += (Math.random() - 0.5) * 12

      // Create more dramatic terrain features
      if (Math.random() > 0.85) {
        elevation += Math.random() * 25 // Random peaks
      }

      // Ensure non-negative elevation
      grid[x][z] = Math.max(0, elevation)
    }
  }

  return grid
}

function generateFallbackElevationGrid() {
  const size = 32
  const grid: number[][] = []

  for (let x = 0; x < size; x++) {
    grid[x] = []
    for (let z = 0; z < size; z++) {
      grid[x][z] = Math.sin(x * 0.2) * Math.cos(z * 0.2) * 20 + Math.random() * 15
    }
  }

  return grid
}

// Identify flat areas suitable for farming
function identifyFarmableAreas(elevationGrid: number[][]) {
  if (!elevationGrid || elevationGrid.length === 0) return []

  const farmableAreas = []
  const size = elevationGrid.length

  for (let x = 2; x < size - 2; x++) {
    for (let z = 2; z < size - 2; z++) {
      const centerHeight = elevationGrid[x][z]
      let isFlat = true
      let totalVariation = 0

      // Check surrounding area for flatness
      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          const height = elevationGrid[x + dx][z + dz]
          const variation = Math.abs(height - centerHeight)
          totalVariation += variation

          if (variation > 8) { // Too steep for farming
            isFlat = false
            break
          }
        }
        if (!isFlat) break
      }

      if (isFlat && totalVariation < 30) {
        farmableAreas.push({
          x: (x / size - 0.5) * 400, // Convert to world coordinates
          z: (z / size - 0.5) * 400,
          elevation: centerHeight,
          suitability: Math.max(0, 1 - totalVariation / 30)
        })
      }
    }
  }

  return farmableAreas
}

// Get recommended crops based on location
function getRecommendedCrops(lat: number, lng: number) {
  const crops = []

  // Simple climate-based crop recommendations
  if (lat >= 30 && lat <= 50) {
    crops.push('corn', 'soybeans', 'wheat')
  } else if (lat >= 20 && lat < 30) {
    crops.push('cotton', 'rice', 'sugarcane')
  } else if (lat >= 0 && lat < 20) {
    crops.push('coffee', 'cocoa', 'bananas')
  } else {
    crops.push('wheat', 'barley', 'potatoes')
  }

  return crops
}

// Simplified implementations for other endpoints
async function getFarmData(lat: number, lng: number, scenario: string | null) {
  return NextResponse.json({
    message: 'Farm data endpoint - simplified implementation',
    location: { lat, lng },
    scenario: scenario || 'default'
  })
}

async function getTerrainData(lat: number, lng: number) {
  return NextResponse.json({
    message: 'Terrain data endpoint - simplified implementation',
    location: { lat, lng }
  })
}

async function getWeatherData(lat: number, lng: number) {
  const cacheKey = `weather-${lat}-${lng}`
  const cached = getCachedData(cacheKey)
  if (cached) return NextResponse.json(cached)

  try {
    // Use EnhancedNASAClient to fetch POWER data server-side
    const powerData = await nasaClient.getPOWERData(lat, lng)

    const params = powerData?.properties?.parameter || powerData?.data?.properties?.parameter || {}
    const dates = Object.keys(params.T2M || {})
    const latest = dates[dates.length - 1]

    const summary = {
      temperature: latest ? params.T2M?.[latest] ?? null : null,
      humidity: latest ? params.RH2M?.[latest] ?? null : null,
      precipitation: latest ? params.PRECTOTCORR?.[latest] ?? null : null,
      wind: latest ? params.WS2M?.[latest] ?? null : null,
      date: latest || null
    }

    const forecast = dates.slice(0, 7).map((d) => ({
      date: d,
      temp: params.T2M?.[d] ?? null,
      precipitation: params.PRECTOTCORR?.[d] ?? null,
      humidity: params.RH2M?.[d] ?? null,
      wind: params.WS2M?.[d] ?? null
    }))

    const result = {
      success: true,
      location: { lat, lng },
      summary,
      forecast,
      raw: powerData
    }

    setCachedData(cacheKey, result, 60)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('getWeatherData error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

async function getSoilAnalysis(lat: number, lng: number) {
  return NextResponse.json({
    message: 'Soil analysis endpoint - simplified implementation',
    location: { lat, lng }
  })
}

async function getCropHealthData(lat: number, lng: number) {
  return NextResponse.json({
    message: 'Crop health endpoint - simplified implementation',
    location: { lat, lng }
  })
}