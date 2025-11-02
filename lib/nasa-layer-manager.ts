/**
 * NASA Layer Manager - Multi-Layer Earth Visualization System
 * Integrates 7 NASA datasets into a cohesive 3D terrain visualization
 */

export interface LayerConfig {
  id: string
  name: string
  description: string
  enabled: boolean
  opacity: number
  zIndex: number
  updateFrequency: 'realtime' | 'daily' | '8day' | '16day' | 'monthly'
  apiKey?: boolean
  dataFormat: 'jpeg' | 'png' | 'geotiff' | 'hdf5'
  tileService: 'gibs' | 'appeears' | 'gesdisc' | 'nsidc'
}

export const NASA_LAYERS: Record<string, LayerConfig> = {
  // 🌍 1️⃣ MODIS True Color (Base Layer)
  MODIS_TRUE_COLOR: {
    id: 'modis_true_color',
    name: 'MODIS True Color',
    description: 'Realistic Earth surface imagery - your base terrain texture',
    enabled: true,
    opacity: 1.0,
    zIndex: 0,
    updateFrequency: 'daily',
    apiKey: false,
    dataFormat: 'jpeg',
    tileService: 'gibs'
  },

  // 🌿 2️⃣ MODIS NDVI (8-day Average)
  MODIS_NDVI: {
    id: 'modis_ndvi',
    name: 'MODIS NDVI',
    description: 'Vegetation greenness - 8-day composite for crop health',
    enabled: true,
    opacity: 0.6,
    zIndex: 1,
    updateFrequency: '8day',
    apiKey: false,
    dataFormat: 'png',
    tileService: 'gibs'
  },

  // 🌾 3️⃣ VIIRS NDVI (High Resolution)
  VIIRS_NDVI: {
    id: 'viirs_ndvi',
    name: 'VIIRS NDVI',
    description: 'High-resolution vegetation index - for detailed farm analysis',
    enabled: false,
    opacity: 0.7,
    zIndex: 2,
    updateFrequency: '16day',
    apiKey: false,
    dataFormat: 'png',
    tileService: 'gibs'
  },

  // 🌡️ 4️⃣ MODIS Land Surface Temperature
  MODIS_LST_DAY: {
    id: 'modis_lst_day',
    name: 'Land Surface Temperature (Day)',
    description: 'Daytime surface temperature - heat stress analysis',
    enabled: false,
    opacity: 0.5,
    zIndex: 3,
    updateFrequency: 'daily',
    apiKey: false,
    dataFormat: 'png',
    tileService: 'gibs'
  },

  MODIS_LST_NIGHT: {
    id: 'modis_lst_night',
    name: 'Land Surface Temperature (Night)',
    description: 'Nighttime surface temperature - thermal analysis',
    enabled: false,
    opacity: 0.5,
    zIndex: 3,
    updateFrequency: 'daily',
    apiKey: false,
    dataFormat: 'png',
    tileService: 'gibs'
  },

  // 💧 5️⃣ SMAP Soil Moisture
  SMAP_SOIL_MOISTURE: {
    id: 'smap_soil_moisture',
    name: 'SMAP Soil Moisture',
    description: 'Soil water content - irrigation planning layer',
    enabled: false,
    opacity: 0.4,
    zIndex: 4,
    updateFrequency: 'daily',
    apiKey: true,
    dataFormat: 'geotiff',
    tileService: 'nsidc'
  },

  // 🌧️ 6️⃣ GPM Precipitation
  GPM_PRECIPITATION: {
    id: 'gpm_precipitation',
    name: 'GPM Precipitation',
    description: 'Real-time rainfall data - 30-minute updates',
    enabled: false,
    opacity: 0.6,
    zIndex: 5,
    updateFrequency: 'realtime',
    apiKey: true,
    dataFormat: 'hdf5',
    tileService: 'gesdisc'
  },

  // 🌱 7️⃣ Vegetation Health Index
  VEGETATION_HEALTH: {
    id: 'vegetation_health',
    name: 'Vegetation Health Index',
    description: 'Combined NDVI + temperature stress indicator',
    enabled: false,
    opacity: 0.5,
    zIndex: 6,
    updateFrequency: '8day',
    apiKey: true,
    dataFormat: 'geotiff',
    tileService: 'appeears'
  }
}

// 🌐 NASA GIBS (Global Imagery Browse Services) URLs
export const GIBS_TILE_URLS = {
  // Base layer - No API key needed
  MODIS_TRUE_COLOR: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{Time}/{z}/{y}/{x}.jpg',
  
  // Vegetation layers - No API key needed
  MODIS_NDVI: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI/default/{Time}/{z}/{y}/{x}.png',
  VIIRS_NDVI: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_NDVI/default/{Time}/{z}/{y}/{x}.png',
  
  // Temperature layers - No API key needed
  MODIS_LST_DAY: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/{Time}/{z}/{y}/{x}.png',
  MODIS_LST_NIGHT: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Night/default/{Time}/{z}/{y}/{x}.png'
}

// 🔐 Authenticated NASA APIs (require Earthdata login)
export const NASA_API_ENDPOINTS = {
  // SMAP data from NSIDC
  SMAP_SOIL_MOISTURE: 'https://nsidc.org/api/dataset/2/data',
  
  // GPM data from GES DISC
  GPM_PRECIPITATION: 'https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGHH_06/summary',
  
  // AppEEARS for processed data
  APPEEARS_BASE: 'https://appeears.earthdatacloud.nasa.gov/api/v1',
  
  // Vegetation Health (NOAA/NASA combined)
  VHI_DATA: 'https://www.star.nesdis.noaa.gov/smcd/emb/vci/VH/vh_ftp.php'
}

export class NASALayerManager {
  private layers: Map<string, LayerConfig> = new Map()
  private textures: Map<string, HTMLImageElement | HTMLCanvasElement> = new Map()
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    
    // Initialize all layers
    Object.values(NASA_LAYERS).forEach(layer => {
      this.layers.set(layer.id, layer)
    })
  }

  // 🎯 Get tile URL for a specific layer and coordinates
  getTileURL(layerId: string, z: number, x: number, y: number, time?: string): string {
    const currentTime = time || new Date().toISOString().split('T')[0]
    
    switch (layerId) {
      case 'modis_true_color':
        return GIBS_TILE_URLS.MODIS_TRUE_COLOR
          .replace('{Time}', currentTime)
          .replace('{z}', z.toString())
          .replace('{x}', x.toString())
          .replace('{y}', y.toString())
          
      case 'modis_ndvi':
        return GIBS_TILE_URLS.MODIS_NDVI
          .replace('{Time}', currentTime)
          .replace('{z}', z.toString())
          .replace('{x}', x.toString())
          .replace('{y}', y.toString())
          
      case 'viirs_ndvi':
        return GIBS_TILE_URLS.VIIRS_NDVI
          .replace('{Time}', currentTime)
          .replace('{z}', z.toString())
          .replace('{x}', x.toString())
          .replace('{y}', y.toString())
          
      case 'modis_lst_day':
        return GIBS_TILE_URLS.MODIS_LST_DAY
          .replace('{Time}', currentTime)
          .replace('{z}', z.toString())
          .replace('{x}', x.toString())
          .replace('{y}', y.toString())
          
      case 'modis_lst_night':
        return GIBS_TILE_URLS.MODIS_LST_NIGHT
          .replace('{Time}', currentTime)
          .replace('{z}', z.toString())
          .replace('{x}', x.toString())
          .replace('{y}', y.toString())
          
      default:
        throw new Error(`Unknown layer: ${layerId}`)
    }
  }

  // 🖼️ Load texture for a specific layer
  async loadLayerTexture(layerId: string, bounds: {lat: number, lng: number, zoom: number}): Promise<HTMLImageElement> {
    const layer = this.layers.get(layerId)
    if (!layer) throw new Error(`Layer not found: ${layerId}`)

    // Calculate tile coordinates from lat/lng
    const z = Math.floor(bounds.zoom)
    const x = Math.floor((bounds.lng + 180) / 360 * Math.pow(2, z))
    const y = Math.floor((1 - Math.log(Math.tan(bounds.lat * Math.PI / 180) + 1 / Math.cos(bounds.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z))

    const tileUrl = this.getTileURL(layerId, z, x, y)
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        this.textures.set(layerId, img)
        resolve(img)
      }
      img.onerror = reject
      img.src = tileUrl
    })
  }

  // 🎨 Create composite texture from multiple layers
  async createCompositeTexture(
    bounds: {lat: number, lng: number, zoom: number},
    enabledLayers: string[]
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    // Load and composite layers in z-index order
    const sortedLayers = enabledLayers
      .map(id => this.layers.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.zIndex - b.zIndex)

    for (const layer of sortedLayers) {
      try {
        const texture = await this.loadLayerTexture(layer.id, bounds)
        
        // Apply layer opacity and blending
        ctx.globalAlpha = layer.opacity
        ctx.globalCompositeOperation = this.getBlendMode(layer.id)
        ctx.drawImage(texture, 0, 0, canvas.width, canvas.height)
      } catch (error) {
        console.warn(`Failed to load layer ${layer.id}:`, error)
      }
    }

    return canvas
  }

  // 🎭 Get appropriate blend mode for each layer type
  private getBlendMode(layerId: string): GlobalCompositeOperation {
    switch (layerId) {
      case 'modis_true_color':
        return 'source-over'
      case 'modis_ndvi':
      case 'viirs_ndvi':
        return 'overlay'
      case 'modis_lst_day':
      case 'modis_lst_night':
        return 'multiply'
      case 'smap_soil_moisture':
        return 'screen'
      case 'gpm_precipitation':
        return 'soft-light'
      case 'vegetation_health':
        return 'color-burn'
      default:
        return 'source-over'
    }
  }

  // ⚙️ Layer management methods
  enableLayer(layerId: string) {
    const layer = this.layers.get(layerId)
    if (layer) {
      layer.enabled = true
    }
  }

  disableLayer(layerId: string) {
    const layer = this.layers.get(layerId)
    if (layer) {
      layer.enabled = false
    }
  }

  setLayerOpacity(layerId: string, opacity: number) {
    const layer = this.layers.get(layerId)
    if (layer) {
      layer.opacity = Math.max(0, Math.min(1, opacity))
    }
  }

  getEnabledLayers(): string[] {
    return Array.from(this.layers.values())
      .filter(layer => layer.enabled)
      .map(layer => layer.id)
  }

  // 📊 Get layer information for UI
  getLayerInfo(layerId: string) {
    return this.layers.get(layerId)
  }

  getAllLayers() {
    return Array.from(this.layers.values())
  }
}

// 🚀 Ready for use in terrain component