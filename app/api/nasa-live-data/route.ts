/**
 * app/api/nasa-live-data/route.ts
 * Fixed: mark route as dynamic and use server-only env variable + request.nextUrl
 */

import { NextRequest, NextResponse } from 'next/server'
import { RealTimeNASADataFetcher } from '@/lib/real-time-nasa-fetcher'

// Tell Next this route is intentionally dynamic (prevents static-render error)
export const dynamic = 'force-dynamic'
// Optionally set runtime explicitly if you need node (Edge or nodejs)
// export const runtime = 'nodejs'

/**
 * IMPORTANT:
 * - Set your NASA API key in a server-only env var (do NOT use NEXT_PUBLIC_).
 *   Example: in .env.local -> NASA_API_KEY=your_real_key_here
 */
const NASA_API_KEY = process.env.NASA_API_KEY
if (!NASA_API_KEY) {
  console.warn('⚠️ NASA_API_KEY not set. Please set process.env.NASA_API_KEY in .env.local (server-only).')
}

const dataFetcher = new RealTimeNASADataFetcher(NASA_API_KEY || '')

export async function GET(request: NextRequest) {
  try {
    // Prefer request.nextUrl for app routes (safer than new URL(request.url))
    const nextUrl = request.nextUrl
    const lat = parseFloat(nextUrl.searchParams.get('lat') || '42.0308')
    const lng = parseFloat(nextUrl.searchParams.get('lng') || '-93.5805')
    const radius = parseFloat(nextUrl.searchParams.get('radius') || '0.1') // degrees

    console.log(`🛰️ Fetching NASA data for farm at ${lat}, ${lng}`)

    const bounds = {
      north: lat + radius,
      south: lat - radius,
      east: lng + radius,
      west: lng - radius
    }

    // Make sure RealTimeNASADataFetcher gracefully handles empty API key
    const nasaData = await dataFetcher.fetchAllNASAData(bounds)

    const gameData = processDataForGame(nasaData, lat, lng)

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      location: { lat, lng, name: getLocationName(lat, lng) },
      data: gameData,
      metadata: {
        ndviPoints: (nasaData.ndvi || []).length,
        moisturePoints: (nasaData.soilMoisture || []).length,
        precipPoints: (nasaData.precipitation || []).length,
        tempPoints: (nasaData.temperature || []).length,
        lastUpdate: new Date().toISOString(),
        dataQuality: calculateDataQuality(nasaData)
      },
      educational: {
        ndviExplanation: "NDVI (Normalized Difference Vegetation Index) measures plant health. Values 0.6-0.9 = healthy crops, 0.2-0.4 = stressed vegetation.",
        smapExplanation: "SMAP measures soil moisture in m³/m³. Values above 0.3 = wet soil, below 0.15 = dry soil requiring irrigation.",
        lstExplanation: "Land Surface Temperature shows heat stress. Above 35°C during day = crop stress, optimal range 20-30°C.",
        gpmExplanation: "GPM measures precipitation in mm/hr. Light rain (0.5-2), moderate (2-10), heavy (10+)."
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('❌ NASA Data API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch NASA data',
      message: error instanceof Error ? error.message : String(error),
      fallback: true,
      data: generateFallbackGameData()
    }, { status: 500 })
  }
}

/* --------------------------
   rest of helpers unchanged
   (I left them as in your original file).
   If you want, I can inline them again here.
   -------------------------- */



// Process raw NASA data into game-usable format
function processDataForGame(nasaData: any, centerLat: number, centerLng: number) {
  // Calculate averages and create spatial grids for 3D visualization
  const gridSize = 12 // 12x12 grid for 3D terrain
  const grid = createSpatialGrid(nasaData, centerLat, centerLng, gridSize)

  // Game mechanics calculations
  const ndviAvg = calculateAverage(nasaData.ndvi.map((p: any) => p.value))
  const moistureAvg = calculateAverage(nasaData.soilMoisture.map((p: any) => p.value))
  const precipAvg = calculateAverage(nasaData.precipitation.map((p: any) => p.value))
  const tempAvg = calculateAverage(nasaData.temperature.map((p: any) => p.value))

  // Determine crop health based on NASA data
  const cropHealth = calculateCropHealth(ndviAvg, moistureAvg, tempAvg, precipAvg)

  // Generate irrigation recommendations based on SMAP data
  const irrigationNeeded = moistureAvg < 0.2 && precipAvg < 1.0

  // Heat stress detection based on LST data
  const heatStress = tempAvg > 35 && ndviAvg < 0.5

  // Drought conditions based on multiple factors
  const droughtRisk = moistureAvg < 0.15 && precipAvg < 0.5 && ndviAvg < 0.4

  return {
    // Real-time values for game state
    ndvi: {
      current: ndviAvg,
      trend: calculateTrend(nasaData.ndvi),
      status: getVegetationStatus(ndviAvg),
      grid: grid.ndvi
    },
    soilMoisture: {
      current: moistureAvg,
      trend: calculateTrend(nasaData.soilMoisture),
      status: getMoistureStatus(moistureAvg),
      grid: grid.moisture,
      irrigationRecommended: irrigationNeeded
    },
    precipitation: {
      current: precipAvg,
      trend: calculateTrend(nasaData.precipitation),
      status: getPrecipitationStatus(precipAvg),
      grid: grid.precipitation,
      forecast: generateWeatherForecast(precipAvg)
    },
    temperature: {
      current: tempAvg,
      trend: calculateTrend(nasaData.temperature),
      status: getTemperatureStatus(tempAvg),
      grid: grid.temperature,
      heatStressAlert: heatStress
    },
    // Game mechanics
    gameMetrics: {
      cropHealth: Math.round(cropHealth),
      droughtRisk: droughtRisk ? 'HIGH' : moistureAvg < 0.25 ? 'MEDIUM' : 'LOW',
      yieldPrediction: calculateYieldPrediction(ndviAvg, moistureAvg, tempAvg),
      actionRecommendations: generateActionRecommendations(irrigationNeeded, heatStress, droughtRisk, ndviAvg)
    },
    // 3D visualization data
    visualization: {
      terrainTexture: nasaData.trueColor,
      colorOverlay: generateColorOverlay(grid),
      animations: generateAnimationData(nasaData)
    }
  }
}

// Create spatial grid for 3D terrain visualization
function createSpatialGrid(nasaData: any, centerLat: number, centerLng: number, size: number) {
  const grid = {
    ndvi: Array(size).fill(null).map(() => Array(size).fill(0.5)),
    moisture: Array(size).fill(null).map(() => Array(size).fill(0.2)),
    precipitation: Array(size).fill(null).map(() => Array(size).fill(0)),
    temperature: Array(size).fill(null).map(() => Array(size).fill(25))
  }

  const radius = 0.05 // degrees around center point

  // Map NASA data points to grid cells
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const gridLat = centerLat + (x - size / 2) * (radius * 2 / size)
      const gridLng = centerLng + (y - size / 2) * (radius * 2 / size)

      // Find nearest NASA data points
      const nearestNDVI = findNearestDataPoint(nasaData.ndvi, gridLat, gridLng)
      const nearestMoisture = findNearestDataPoint(nasaData.soilMoisture, gridLat, gridLng)
      const nearestPrecip = findNearestDataPoint(nasaData.precipitation, gridLat, gridLng)
      const nearestTemp = findNearestDataPoint(nasaData.temperature, gridLat, gridLng)

      grid.ndvi[x][y] = nearestNDVI?.value || 0.5
      grid.moisture[x][y] = nearestMoisture?.value || 0.2
      grid.precipitation[x][y] = nearestPrecip?.value || 0
      grid.temperature[x][y] = nearestTemp?.value || 25
    }
  }

  return grid
}

// Helper functions
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

function calculateTrend(dataPoints: any[]): 'increasing' | 'decreasing' | 'stable' {
  if (dataPoints.length < 2) return 'stable'

  const recent = dataPoints.slice(-5).map(p => p.value)
  const older = dataPoints.slice(-10, -5).map(p => p.value)

  const recentAvg = calculateAverage(recent)
  const olderAvg = calculateAverage(older)

  if (recentAvg > olderAvg * 1.1) return 'increasing'
  if (recentAvg < olderAvg * 0.9) return 'decreasing'
  return 'stable'
}

function getVegetationStatus(ndvi: number): string {
  if (ndvi > 0.7) return 'Excellent - Dense, healthy vegetation'
  if (ndvi > 0.5) return 'Good - Moderate vegetation growth'
  if (ndvi > 0.3) return 'Fair - Sparse vegetation, may need attention'
  return 'Poor - Stressed or dying vegetation'
}

function getMoistureStatus(moisture: number): string {
  if (moisture > 0.3) return 'Saturated - May need drainage'
  if (moisture > 0.2) return 'Adequate - Good for most crops'
  if (moisture > 0.15) return 'Low - Consider irrigation soon'
  return 'Very Low - Urgent irrigation needed'
}

function getPrecipitationStatus(precip: number): string {
  if (precip > 10) return 'Heavy Rain - Flooding risk'
  if (precip > 2) return 'Moderate Rain - Good for crops'
  if (precip > 0.5) return 'Light Rain - Beneficial moisture'
  return 'No Precipitation - Monitor soil moisture'
}

function getTemperatureStatus(temp: number): string {
  if (temp > 40) return 'Extreme Heat - Crop damage likely'
  if (temp > 35) return 'Hot - Heat stress possible'
  if (temp > 20) return 'Optimal - Good growing conditions'
  if (temp > 10) return 'Cool - Slower growth expected'
  return 'Cold - Frost risk, protect crops'
}

function calculateCropHealth(ndvi: number, moisture: number, temp: number, precip: number): number {
  let health = 50 // Base health

  // NDVI contribution (40% weight)
  health += (ndvi - 0.5) * 80

  // Soil moisture contribution (30% weight)
  if (moisture > 0.15 && moisture < 0.35) {
    health += 20 // Optimal range
  } else if (moisture < 0.1) {
    health -= 30 // Too dry
  } else if (moisture > 0.4) {
    health -= 20 // Too wet
  }

  // Temperature contribution (20% weight)
  if (temp > 20 && temp < 30) {
    health += 15 // Optimal range
  } else if (temp > 35) {
    health -= 25 // Heat stress
  } else if (temp < 10) {
    health -= 20 // Cold stress
  }

  // Precipitation contribution (10% weight)
  if (precip > 0.5 && precip < 5) {
    health += 10 // Good rainfall
  } else if (precip > 10) {
    health -= 15 // Too much rain
  }

  return Math.max(0, Math.min(100, health))
}

function calculateYieldPrediction(ndvi: number, moisture: number, temp: number): number {
  // Simplified yield prediction based on NASA data
  const baseYield = 100 // bushels per acre

  let yieldMultiplier = 1.0

  // NDVI impact
  yieldMultiplier *= (0.5 + ndvi)

  // Moisture impact
  if (moisture < 0.15) yieldMultiplier *= 0.7 // Drought impact
  else if (moisture > 0.35) yieldMultiplier *= 0.8 // Too wet

  // Temperature impact
  if (temp > 35) yieldMultiplier *= 0.6 // Heat stress
  else if (temp < 15) yieldMultiplier *= 0.8 // Cold stress

  return Math.round(baseYield * yieldMultiplier)
}

function generateActionRecommendations(irrigation: boolean, heatStress: boolean, drought: boolean, ndvi: number): string[] {
  const actions = []

  if (irrigation) {
    actions.push("🚿 Immediate irrigation recommended - soil moisture critically low")
  }

  if (heatStress) {
    actions.push("🌡️ Heat stress detected - consider shade structures or cooling irrigation")
  }

  if (drought) {
    actions.push("🌵 Drought conditions - implement water conservation measures")
  }

  if (ndvi < 0.4) {
    actions.push("🌱 Poor vegetation health - check for pests, diseases, or nutrient deficiency")
  }

  if (actions.length === 0) {
    actions.push("✅ Crops are healthy - maintain current management practices")
  }

  return actions
}

function generateColorOverlay(grid: any): any {
  return {
    ndvi: grid.ndvi.map((row: number[]) =>
      row.map((val: number) => ({
        r: val < 0.4 ? 255 : Math.round(255 * (1 - val)),
        g: val > 0.3 ? Math.round(255 * val) : 0,
        b: 0,
        a: 180
      }))
    ),
    moisture: grid.moisture.map((row: number[]) =>
      row.map((val: number) => ({
        r: val < 0.15 ? 139 : 0,
        g: val < 0.15 ? 69 : Math.round(100 + 155 * (1 - val)),
        b: val < 0.15 ? 19 : Math.round(200 + 55 * val),
        a: Math.round(120 * val)
      }))
    )
  }
}

function generateAnimationData(nasaData: any): any {
  return {
    rainfall: nasaData.precipitation.filter((p: any) => p.value > 0.5).map((p: any) => ({
      lat: p.lat,
      lng: p.lng,
      intensity: p.value,
      duration: Math.min(p.value * 1000, 5000)
    })),
    temperature: {
      heatWaves: nasaData.temperature.filter((p: any) => p.value > 35).map((p: any) => ({
        lat: p.lat,
        lng: p.lng,
        intensity: (p.value - 35) / 10
      }))
    }
  }
}

function findNearestDataPoint(dataPoints: any[], lat: number, lng: number): any {
  if (dataPoints.length === 0) return null

  let nearest = dataPoints[0]
  let minDistance = Math.sqrt(Math.pow(nearest.lat - lat, 2) + Math.pow(nearest.lng - lng, 2))

  for (const point of dataPoints) {
    const distance = Math.sqrt(Math.pow(point.lat - lat, 2) + Math.pow(point.lng - lng, 2))
    if (distance < minDistance) {
      nearest = point
      minDistance = distance
    }
  }

  return nearest
}

function calculateDataQuality(nasaData: any): number {
  const totalPoints = nasaData.ndvi.length + nasaData.soilMoisture.length +
    nasaData.precipitation.length + nasaData.temperature.length

  const goodQualityPoints = [
    ...nasaData.ndvi,
    ...nasaData.soilMoisture,
    ...nasaData.precipitation,
    ...nasaData.temperature
  ].filter(p => p.quality > 0).length

  return totalPoints > 0 ? Math.round((goodQualityPoints / totalPoints) * 100) : 0
}

function getLocationName(lat: number, lng: number): string {
  // Simple location naming based on coordinates
  if (lat > 41 && lat < 43 && lng > -95 && lng < -92) return 'Iowa Farmland'
  if (lat > 35 && lat < 38 && lng > -121 && lng < -118) return 'California Central Valley'
  if (lat > 40 && lat < 42 && lng > -101 && lng < -98) return 'Nebraska Plains'
  if (lat > 34 && lat < 36 && lng > -103 && lng < -100) return 'Texas Panhandle'
  return `Farm Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`
}

function generateWeatherForecast(currentPrecip: number): any[] {
  const forecast = []
  let precip = currentPrecip

  for (let i = 0; i < 7; i++) {
    precip = Math.max(0, precip + (Math.random() - 0.5) * 2)
    forecast.push({
      day: i + 1,
      precipitation: Math.round(precip * 10) / 10,
      condition: precip > 5 ? 'Heavy Rain' : precip > 1 ? 'Light Rain' : 'Clear'
    })
  }

  return forecast
}

function generateFallbackGameData(): any {
  return {
    ndvi: { current: 0.6, status: 'Good - Moderate vegetation growth', grid: Array(12).fill(Array(12).fill(0.6)) },
    soilMoisture: { current: 0.2, status: 'Adequate - Good for most crops', grid: Array(12).fill(Array(12).fill(0.2)) },
    precipitation: { current: 1.0, status: 'Light Rain - Beneficial moisture', grid: Array(12).fill(Array(12).fill(1.0)) },
    temperature: { current: 25, status: 'Optimal - Good growing conditions', grid: Array(12).fill(Array(12).fill(25)) },
    gameMetrics: {
      cropHealth: 75,
      droughtRisk: 'LOW',
      yieldPrediction: 120,
      actionRecommendations: ['✅ Crops are healthy - maintain current management practices']
    }
  }
}
