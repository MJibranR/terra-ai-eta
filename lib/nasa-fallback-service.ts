/**
 * NASA Fallback Service
 * Provides graceful degradation when NASA APIs are unavailable
 */

const NASA_API_KEY = 'xUVqGzhFLydz87SVBPKEXlQnHo9VBwCfpij5AzCj'

interface NASAServiceResponse<T> {
  success: boolean
  data?: T
  error?: string
  source: 'live' | 'fallback' | 'cached'
}

class NASAFallbackService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 1000 * 60 * 30 // 30 minutes
  private apiAvailable = true

  constructor() {
    // Test API availability on startup
    this.testAPIAvailability()
  }

  private async testAPIAvailability(): Promise<void> {
    try {
      // Test with a simple APOD request
      const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`, {
        method: 'HEAD', // Just check if endpoint responds
        mode: 'no-cors' // Avoid CORS issues for this test
      })
      this.apiAvailable = true
      console.log('✅ NASA API is available')
    } catch (error) {
      this.apiAvailable = false
      console.warn('⚠️ NASA API unavailable, using fallback mode')
    }
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async getEarthImagery(lat: number, lon: number, date?: string): Promise<NASAServiceResponse<string>> {
    const cacheKey = `earth_${lat}_${lon}_${date}`
    const cached = this.getCached<string>(cacheKey)
    
    if (cached) {
      return { success: true, data: cached, source: 'cached' }
    }

    // Always use fallback images for now due to CORS issues
    const fallbackImages = [
      'https://www.nasa.gov/wp-content/uploads/2023/03/potw2143a.jpg',
      'https://www.nasa.gov/wp-content/uploads/2023/03/web_first_images_release-5.png',
      'https://www.nasa.gov/wp-content/uploads/2023/03/hubble_crab_nebula.jpg'
    ]
    
    // Select image based on coordinates for some variety
    const imageIndex = Math.abs(Math.floor(lat + lon)) % fallbackImages.length
    const imageUrl = fallbackImages[imageIndex]
    
    this.setCache(cacheKey, imageUrl)
    
    return {
      success: true,
      data: imageUrl,
      source: 'fallback'
    }
  }

  async getAgriculturalData(lat: number, lon: number): Promise<NASAServiceResponse<any>> {
    const cacheKey = `agricultural_${lat}_${lon}`
    const cached = this.getCached<any>(cacheKey)
    
    if (cached) {
      return { success: true, data: cached, source: 'cached' }
    }

    // Provide simulated agricultural data
    const mockData = {
      temperature: 22 + Math.random() * 8, // 22-30°C
      humidity: 40 + Math.random() * 30, // 40-70%
      soilMoisture: 30 + Math.random() * 40, // 30-70%
      precipitation: Math.random() * 5, // 0-5mm
      vegetation: 0.3 + Math.random() * 0.5, // NDVI 0.3-0.8
      coordinates: { lat, lon },
      timestamp: new Date().toISOString(),
      source: 'NASA POWER (simulated)'
    }
    
    this.setCache(cacheKey, mockData)
    
    return {
      success: true,
      data: mockData,
      source: 'fallback'
    }
  }

  async getSatellitePositions(): Promise<NASAServiceResponse<any>> {
    // Provide simulated satellite positions
    const mockSatellites = [
      { 
        id: 'TERRA', 
        name: 'Terra (EOS AM-1)',
        position: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 2 - 1 },
        orbit: 'Sun-synchronous',
        status: 'operational'
      },
      { 
        id: 'AQUA', 
        name: 'Aqua (EOS PM-1)',
        position: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 2 - 1 },
        orbit: 'Sun-synchronous',
        status: 'operational'
      },
      { 
        id: 'LANDSAT8', 
        name: 'Landsat 8',
        position: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 2 - 1 },
        orbit: 'Sun-synchronous',
        status: 'operational'
      }
    ]
    
    return {
      success: true,
      data: mockSatellites,
      source: 'fallback'
    }
  }

  getImageUrl(lat: number, lon: number, date?: string): string {
    // Return a working fallback image URL
    const images = [
      'https://www.nasa.gov/wp-content/uploads/2023/03/potw2143a.jpg',
      'https://www.nasa.gov/wp-content/uploads/2023/03/web_first_images_release-5.png'
    ]
    
    const index = Math.abs(Math.floor(lat + lon)) % images.length
    return images[index]
  }
}

export const nasaFallbackService = new NASAFallbackService()
export default NASAFallbackService