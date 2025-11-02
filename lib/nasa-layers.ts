/**
 * NASA Data Layers Configuration
 * Defines the 7 core NASA data layers used in the farm simulation
 */

export interface NASALayer {
  id: string
  name: string
  color: string
  icon: string
  description: string
  unit?: string
  range?: {
    min: number
    max: number
  }
}

export interface NASALayers {
  [key: string]: NASALayer
}

export const NASA_LAYERS: NASALayers = {
  NDVI: {
    id: 'MODIS_Terra_NDVI_8Day',
    name: 'Vegetation Health (NDVI)',
    color: '#4ade80',
    icon: 'Sprout',
    description: 'Measures plant health and density',
    unit: 'index',
    range: {
      min: -1,
      max: 1
    }
  },
  SOIL_MOISTURE: {
    id: 'SMAP_L4_Soil_Moisture',
    name: 'Soil Moisture',
    color: '#0ea5e9',
    icon: 'Droplets',
    description: 'Ground water content from SMAP satellite',
    unit: '%',
    range: {
      min: 0,
      max: 100
    }
  },
  TEMPERATURE: {
    id: 'MODIS_Terra_Land_Surface_Temp_Day',
    name: 'Surface Temperature',
    color: '#f97316',
    icon: 'Thermometer',
    description: 'Land surface temperature measurements',
    unit: '°C',
    range: {
      min: -20,
      max: 60
    }
  },
  PRECIPITATION: {
    id: 'GPM_3IMERGDF_06_Precipitation',
    name: 'Precipitation',
    color: '#06b6d4',
    icon: 'Cloud',
    description: 'Rainfall data from GPM satellite',
    unit: 'mm/hr',
    range: {
      min: 0,
      max: 50
    }
  },
  ELEVATION: {
    id: 'ASTER_GDEM_DEM',
    name: 'Terrain Elevation',
    color: '#84cc16',
    icon: 'Mountain',
    description: '3D terrain height data',
    unit: 'm',
    range: {
      min: -500,
      max: 8000
    }
  },
  LAND_COVER: {
    id: 'MODIS_Terra_Land_Cover_Type',
    name: 'Land Cover Type',
    color: '#8b5cf6',
    icon: 'Map',
    description: 'Surface vegetation and land use classification',
    unit: 'class'
  },
  SOIL_TYPE: {
    id: 'HWSD_SOIL_TYPE',
    name: 'Soil Classification',
    color: '#d97706',
    icon: 'Layers',
    description: 'Soil type and composition data',
    unit: 'class'
  }
}

// Helper functions for working with NASA layers
export function getNASALayerByID(id: string): NASALayer | undefined {
  return Object.values(NASA_LAYERS).find(layer => layer.id === id)
}

export function formatNASAValue(layerKey: keyof typeof NASA_LAYERS, value: number): string {
  const layer = NASA_LAYERS[layerKey]
  if (!layer) return value.toString()

  switch (layer.unit) {
    case '%':
      return `${(value * 100).toFixed(1)}%`
    case '°C':
      return `${value.toFixed(1)}°C`
    case 'mm/hr':
      return `${value.toFixed(2)} mm/hr`
    case 'm':
      return `${value.toFixed(0)}m`
    case 'index':
      return value.toFixed(3)
    case 'class':
      return value.toString()
    default:
      return value.toString()
  }
}

export function getNASALayerColor(layerKey: keyof typeof NASA_LAYERS, value: number): string {
  const layer = NASA_LAYERS[layerKey]
  if (!layer || !layer.range) return layer?.color || '#666666'

  const { min, max } = layer.range
  const normalized = (value - min) / (max - min)

  // Return color based on normalized value
  if (normalized < 0.33) return '#ef4444' // Red for low values
  if (normalized < 0.66) return '#eab308' // Yellow for medium values
  return '#22c55e' // Green for high values
}

export default NASA_LAYERS