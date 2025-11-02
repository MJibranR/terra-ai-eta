/**
 * Direct NASA Agricultural Data Integration
 * Uses official NASA APIs for real agricultural satellite data
 * No fallbacks - direct API calls only
 */

import { NASA_API_KEY } from './nasa-api'

// Direct NASA API endpoints for agricultural monitoring
export const DIRECT_NASA_APIS = {
  // Earth Imagery API - Landsat satellite images
  earthImagery: {
    base: 'https://api.nasa.gov/planetary/earth/imagery',
    params: (lat: number, lon: number, date?: string, dim?: number) => ({
      lat,
      lon,
      date: date || new Date().toISOString().split('T')[0],
      dim: dim || 0.15, // degrees of lat/lon
      api_key: NASA_API_KEY
    })
  },

  // Earth Assets API - Available satellite data for location
  earthAssets: {
    base: 'https://api.nasa.gov/planetary/earth/assets',
    params: (lat: number, lon: number, date?: string, dim?: number) => ({
      lat,
      lon,
      date: date || new Date().toISOString().split('T')[0],
      dim: dim || 0.15,
      api_key: NASA_API_KEY
    })
  },

  // NASA APOD - Astronomy Picture of the Day
  apod: {
    base: 'https://api.nasa.gov/planetary/apod',
    params: (date?: string) => ({
      date: date || new Date().toISOString().split('T')[0],
      api_key: NASA_API_KEY
    })
  },

  // NASA Mars Weather - Weather analysis patterns
  marsWeather: {
    base: 'https://api.nasa.gov/insight_weather/',
    params: () => ({
      api_key: NASA_API_KEY,
      feedtype: 'json',
      ver: '1.0'
    })
  },

  // NASA Neo (Near Earth Objects) - Environmental monitoring
  neo: {
    base: 'https://api.nasa.gov/neo/rest/v1/feed',
    params: (startDate?: string, endDate?: string) => ({
      start_date: startDate || new Date().toISOString().split('T')[0],
      end_date: endDate || new Date().toISOString().split('T')[0],
      api_key: NASA_API_KEY
    })
  },

  // NASA TechTransfer - Agricultural technology data
  techTransfer: {
    base: 'https://api.nasa.gov/techtransfer/patent/',
    params: (query?: string) => ({
      query: query || 'agriculture',
      api_key: NASA_API_KEY
    })
  }
}

// Build URL with parameters
function buildApiUrl(endpoint: any, params: any): string {
  const url = new URL(endpoint.base)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value))
    }
  })
  return url.toString()
}

// Direct NASA data fetcher class
export class DirectNASADataFetcher {
  private cache: Map<string, { data: any, timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  constructor() {
    console.log('🚀 Direct NASA Data Fetcher initialized with API key:', NASA_API_KEY ? 'Present' : 'Missing')
  }

  // Check if data is cached and valid
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log('📦 Using cached NASA data for:', key)
      return cached.data
    }
    return null
  }

  // Store data in cache
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // Fetch satellite imagery for agricultural area
  async getSatelliteImagery(lat: number, lon: number, date?: string): Promise<{
    imageUrl?: string
    error?: string
    metadata?: any
  }> {
    const cacheKey = `imagery-${lat}-${lon}-${date}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const params = DIRECT_NASA_APIS.earthImagery.params(lat, lon, date)
      const url = buildApiUrl(DIRECT_NASA_APIS.earthImagery, params)

      console.log('🛰️ Fetching NASA Earth Imagery:', url)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`NASA Earth Imagery API failed: ${response.status} ${response.statusText}`)
      }

      // Convert image blob to URL
      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)

      const result = {
        imageUrl,
        metadata: {
          coordinates: { lat, lon },
          date: date || new Date().toISOString().split('T')[0],
          source: 'NASA Landsat'
        }
      }

      this.setCachedData(cacheKey, result)
      console.log('✅ NASA satellite imagery loaded successfully')
      return result

    } catch (error) {
      console.error('❌ NASA Earth Imagery Error:', error)
      return { error: String(error) }
    }
  }

  // Get available satellite assets for location
  async getAvailableAssets(lat: number, lon: number, date?: string): Promise<{
    assets?: any[]
    count?: number
    error?: string
  }> {
    const cacheKey = `assets-${lat}-${lon}-${date}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const params = DIRECT_NASA_APIS.earthAssets.params(lat, lon, date)
      const url = buildApiUrl(DIRECT_NASA_APIS.earthAssets, params)

      console.log('📡 Fetching NASA Earth Assets:', url)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`NASA Earth Assets API failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      const result = {
        assets: data,
        count: Array.isArray(data) ? data.length : 0
      }

      this.setCachedData(cacheKey, result)
      console.log('✅ NASA earth assets loaded:', result.count, 'items')
      return result

    } catch (error) {
      console.error('❌ NASA Earth Assets Error:', error)
      return { error: String(error) }
    }
  }

  // Get NASA Astronomy Picture of the Day (for background/context)
  async getAPOD(date?: string): Promise<{
    title?: string
    url?: string
    explanation?: string
    mediaType?: string
    error?: string
  }> {
    const cacheKey = `apod-${date || 'today'}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const params = DIRECT_NASA_APIS.apod.params(date)
      const url = buildApiUrl(DIRECT_NASA_APIS.apod, params)

      console.log('🌌 Fetching NASA APOD:', url)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`NASA APOD API failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      const result = {
        title: data.title,
        url: data.url,
        explanation: data.explanation,
        mediaType: data.media_type
      }

      this.setCachedData(cacheKey, result)
      console.log('✅ NASA APOD loaded:', data.title)
      return result

    } catch (error) {
      console.error('❌ NASA APOD Error:', error)
      return { error: String(error) }
    }
  }

  // Get agricultural technology patents from NASA
  async getAgriculturalTech(query: string = 'agriculture'): Promise<{
    patents?: any[]
    count?: number
    error?: string
  }> {
    const cacheKey = `tech-${query}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const params = DIRECT_NASA_APIS.techTransfer.params(query)
      const url = buildApiUrl(DIRECT_NASA_APIS.techTransfer, params)

      console.log('🔬 Fetching NASA Tech Transfer:', url)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`NASA Tech Transfer API failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      const result = {
        patents: data.results || [],
        count: data.results?.length || 0
      }

      this.setCachedData(cacheKey, result)
      console.log('✅ NASA agricultural tech loaded:', result.count, 'patents')
      return result

    } catch (error) {
      console.error('❌ NASA Tech Transfer Error:', error)
      return { error: String(error) }
    }
  }

  // Get comprehensive agricultural data for location
  async getComprehensiveAgriculturalData(lat: number, lon: number, date?: string): Promise<{
    satelliteImage?: string
    availableAssets?: any[]
    apod?: any
    agriculturalTech?: any[]
    metadata?: any
    errors?: string[]
    success: boolean
  }> {
    console.log('🌾 Fetching comprehensive NASA agricultural data for:', lat, lon)

    const results: any = {
      success: false,
      errors: []
    }

    // Parallel fetch all NASA data
    const [imagery, assets, apod, tech] = await Promise.allSettled([
      this.getSatelliteImagery(lat, lon, date),
      this.getAvailableAssets(lat, lon, date),
      this.getAPOD(),
      this.getAgriculturalTech('agriculture farming')
    ])

    // Process imagery results
    if (imagery.status === 'fulfilled' && !imagery.value.error) {
      results.satelliteImage = imagery.value.imageUrl
    } else {
      results.errors.push(`Satellite imagery failed: ${imagery.status === 'fulfilled' ? imagery.value.error : 'Promise rejected'}`)
    }

    // Process assets results  
    if (assets.status === 'fulfilled' && !assets.value.error) {
      results.availableAssets = assets.value.assets
    } else {
      results.errors.push(`Assets failed: ${assets.status === 'fulfilled' ? assets.value.error : 'Promise rejected'}`)
    }

    // Process APOD results
    if (apod.status === 'fulfilled' && !apod.value.error) {
      results.apod = apod.value
    } else {
      results.errors.push(`APOD failed: ${apod.status === 'fulfilled' ? apod.value.error : 'Promise rejected'}`)
    }

    // Process tech results
    if (tech.status === 'fulfilled' && !tech.value.error) {
      results.agriculturalTech = tech.value.patents
    } else {
      results.errors.push(`Tech transfer failed: ${tech.status === 'fulfilled' ? tech.value.error : 'Promise rejected'}`)
    }

    // Success if at least one API call worked
    results.success = !!(results.satelliteImage || results.availableAssets || results.apod || results.agriculturalTech)

    results.metadata = {
      coordinates: { lat, lon },
      date: date || new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      apiCalls: {
        imagery: !!results.satelliteImage,
        assets: !!results.availableAssets,
        apod: !!results.apod,
        tech: !!results.agriculturalTech
      }
    }

    console.log('📊 NASA agricultural data results:', results.metadata.apiCalls)
    return results
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
    console.log('🗑️ NASA data cache cleared')
  }
}

// Global instance
export const directNASAFetcher = new DirectNASADataFetcher()