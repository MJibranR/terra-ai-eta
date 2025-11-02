/**
 * NASA Layer Implementation Guide & Demo
 * Complete guide to implementing all 7 NASA data layers
 */

"use client"

import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, Code, Play } from 'lucide-react'

interface LayerGuideProps {
  layer: {
    id: string
    name: string
    icon: string
    description: string
    useCase: string
    apiUrl: string
    format: string
    frequency: string
    requiresAuth: boolean
    implementation: {
      threejs: string
      shader: string
      workflow: string[]
    }
  }
}

function LayerGuideCard({ layer }: LayerGuideProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{layer.icon}</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{layer.name}</h3>
            <p className="text-sm text-gray-400">{layer.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {layer.requiresAuth && (
              <span className="text-xs bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded">
                🔐 API Key
              </span>
            )}
            <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
              {layer.format}
            </span>
            {expanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-700/50">
          {/* Use Case */}
          <div className="p-4 bg-blue-900/10">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">🎯 Use in 3D Visualization</h4>
            <p className="text-sm text-gray-300">{layer.useCase}</p>
          </div>

          {/* API Information */}
          <div className="p-4">
            <h4 className="text-sm font-semibold text-cyan-300 mb-2">📡 Data Source</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">URL:</span>
                <code className="text-xs bg-gray-700 px-2 py-1 rounded text-cyan-300 flex-1 truncate">
                  {layer.apiUrl}
                </code>
                <a 
                  href={layer.apiUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>Format: <span className="text-white">{layer.format}</span></span>
                <span>Updates: <span className="text-green-400">{layer.frequency}</span></span>
              </div>
            </div>
          </div>

          {/* Three.js Implementation */}
          <div className="p-4 bg-green-900/10">
            <h4 className="text-sm font-semibold text-green-300 mb-2 flex items-center gap-2">
              <Code className="w-4 h-4" />
              Three.js Implementation
            </h4>
            <pre className="text-xs bg-gray-900 p-3 rounded overflow-x-auto text-green-300">
              <code>{layer.implementation.threejs}</code>
            </pre>
          </div>

          {/* Shader Code */}
          {layer.implementation.shader && (
            <div className="p-4 bg-purple-900/10">
              <h4 className="text-sm font-semibold text-purple-300 mb-2">🎨 Shader Material</h4>
              <pre className="text-xs bg-gray-900 p-3 rounded overflow-x-auto text-purple-300">
                <code>{layer.implementation.shader}</code>
              </pre>
            </div>
          )}

          {/* Workflow */}
          <div className="p-4">
            <h4 className="text-sm font-semibold text-orange-300 mb-2">⚡ Implementation Workflow</h4>
            <ol className="space-y-2 text-sm text-gray-300">
              {layer.implementation.workflow.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="bg-orange-600/20 text-orange-300 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NASALayerGuide() {
  const layers = [
    {
      id: 'modis_true_color',
      name: 'MODIS True Color',
      icon: '🌍',
      description: 'Realistic Earth surface imagery - your base terrain texture',
      useCase: 'Use as the main texture map for your globe/terrain. This provides the realistic ground appearance that users expect to see.',
      apiUrl: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{Time}/{z}/{y}/{x}.jpg',
      format: 'JPEG',
      frequency: 'Daily',
      requiresAuth: false,
      implementation: {
        threejs: `// Load MODIS True Color as base texture
const textureLoader = new THREE.TextureLoader();
const trueColorTexture = textureLoader.load(
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-10-05/8/123/89.jpg'
);

// Apply to terrain mesh
const terrainMaterial = new THREE.MeshLambertMaterial({
  map: trueColorTexture
});

const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);`,
        shader: '',
        workflow: [
          'Calculate tile coordinates from lat/lng bounds',
          'Fetch JPEG tiles from NASA GIBS (no auth required)',
          'Load texture using THREE.TextureLoader()',
          'Apply as base map to terrain geometry',
          'Set as foundation layer (z-index 0)'
        ]
      }
    },
    {
      id: 'modis_ndvi',
      name: 'MODIS NDVI',
      icon: '🌿',
      description: 'Vegetation greenness - 8-day composite for crop health monitoring',
      useCase: 'Overlay on base texture with transparency to show vegetation health. Green areas = healthy crops, red/brown = stressed vegetation.',
      apiUrl: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI/default/{Time}/{z}/{y}/{x}.png',
      format: 'PNG',
      frequency: '8-day',
      requiresAuth: false,
      implementation: {
        threejs: `// Load NDVI as overlay texture
const ndviTexture = textureLoader.load(
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI/default/2024-10-05/8/123/89.png'
);

// Create overlay material with transparency
const ndviMaterial = new THREE.MeshLambertMaterial({
  map: ndviTexture,
  transparent: true,
  opacity: 0.6,
  blending: THREE.MultiplyBlending
});

// Layer on top of base terrain
const ndviOverlay = new THREE.Mesh(terrainGeometry, ndviMaterial);
ndviOverlay.position.y = 0.01; // Slightly above base`,
        shader: `// Custom shader for NDVI blending
uniform sampler2D baseTexture;
uniform sampler2D ndviTexture;
uniform float ndviOpacity;

varying vec2 vUv;

void main() {
  vec4 base = texture2D(baseTexture, vUv);
  vec4 ndvi = texture2D(ndviTexture, vUv);
  
  // Blend NDVI with base using overlay mode
  vec3 result = mix(base.rgb, ndvi.rgb, ndviOpacity);
  gl_FragColor = vec4(result, 1.0);
}`,
        workflow: [
          'Fetch PNG tiles with NDVI color-coded data',
          'Create transparent overlay material',
          'Use multiply or overlay blending mode',
          'Position slightly above base terrain',
          'Animate opacity for toggling vegetation view'
        ]
      }
    },
    {
      id: 'viirs_ndvi',
      name: 'VIIRS NDVI',
      icon: '🌾',
      description: 'High-resolution vegetation index - detailed farm analysis',
      useCase: 'Switch to this when zooming into specific regions. Provides higher detail than MODIS for field-level crop monitoring.',
      apiUrl: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_NDVI/default/{Time}/{z}/{y}/{x}.png',
      format: 'PNG',
      frequency: '16-day',
      requiresAuth: false,
      implementation: {
        threejs: `// Dynamic texture switching based on zoom level
let currentNDVI = modisNDVI; // Default to MODIS

function updateNDVITexture(zoomLevel) {
  if (zoomLevel > 12) {
    // High zoom - use VIIRS for detail
    const viirsTexture = textureLoader.load(viirsNDVIUrl);
    ndviMaterial.map = viirsTexture;
    currentNDVI = viirsTexture;
  } else {
    // Low zoom - use MODIS for performance
    ndviMaterial.map = modisNDVITexture;
    currentNDVI = modisNDVITexture;
  }
  ndviMaterial.needsUpdate = true;
}`,
        shader: '',
        workflow: [
          'Monitor camera zoom level',
          'Switch from MODIS to VIIRS at zoom threshold',
          'Load higher resolution tiles for zoomed regions',
          'Update material texture dynamically',
          'Fallback to MODIS for performance at low zoom'
        ]
      }
    },
    {
      id: 'modis_lst',
      name: 'Land Surface Temperature',
      icon: '🌡️',
      description: 'Day/night surface temperature - heat stress analysis',
      useCase: 'Color-coded heat map overlay. Red for hot areas, blue for cool. Toggle between day/night for thermal simulation.',
      apiUrl: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/{Time}/{z}/{y}/{x}.png',
      format: 'PNG',
      frequency: 'Daily',
      requiresAuth: false,
      implementation: {
        threejs: `// Temperature overlay with day/night toggle
const dayTempTexture = textureLoader.load(dayTempUrl);
const nightTempTexture = textureLoader.load(nightTempUrl);

const tempMaterial = new THREE.ShaderMaterial({
  uniforms: {
    dayTexture: { value: dayTempTexture },
    nightTexture: { value: nightTempTexture },
    timeOfDay: { value: 0.5 }, // 0 = night, 1 = day
    opacity: { value: 0.4 }
  },
  vertexShader: vertexShader,
  fragmentShader: tempFragmentShader,
  transparent: true
});`,
        shader: `// Temperature blending shader
uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform float timeOfDay;
uniform float opacity;

varying vec2 vUv;

void main() {
  vec4 dayTemp = texture2D(dayTexture, vUv);
  vec4 nightTemp = texture2D(nightTexture, vUv);
  
  // Interpolate between day and night
  vec4 temp = mix(nightTemp, dayTemp, timeOfDay);
  
  gl_FragColor = vec4(temp.rgb, opacity);
}`,
        workflow: [
          'Load both day and night temperature tiles',
          'Create shader material for blending',
          'Animate timeOfDay uniform for day/night cycle',
          'Use color lookup table for temperature visualization',
          'Apply as semi-transparent overlay'
        ]
      }
    },
    {
      id: 'smap_soil_moisture',
      name: 'SMAP Soil Moisture',
      icon: '💧',
      description: 'Soil water content - critical for irrigation planning',
      useCase: 'Blue overlay for wet areas, brown for dry. Semi-transparent layer to show moisture distribution across farmland.',
      apiUrl: 'https://nsidc.org/api/dataset/2/data',
      format: 'GeoTIFF',
      frequency: 'Daily',
      requiresAuth: true,
      implementation: {
        threejs: `// SMAP requires data processing from GeoTIFF
// First, convert GeoTIFF to texture on server side
const soilMoistureTexture = await loadProcessedTexture('/api/smap-moisture', {
  lat: bounds.lat,
  lng: bounds.lng,
  date: currentDate
});

const moistureMaterial = new THREE.MeshLambertMaterial({
  map: soilMoistureTexture,
  transparent: true,
  opacity: 0.4,
  blending: THREE.AdditiveBlending
});`,
        shader: `// Soil moisture visualization
uniform sampler2D moistureTexture;
uniform float moistureThreshold;

varying vec2 vUv;

void main() {
  float moisture = texture2D(moistureTexture, vUv).r;
  
  // Color based on moisture level
  vec3 dryColor = vec3(0.8, 0.4, 0.2); // Brown
  vec3 wetColor = vec3(0.2, 0.6, 0.9); // Blue
  
  vec3 color = mix(dryColor, wetColor, moisture);
  float alpha = smoothstep(0.1, 0.9, moisture);
  
  gl_FragColor = vec4(color, alpha * 0.6);
}`,
        workflow: [
          'Authenticate with NASA Earthdata Login',
          'Download SMAP GeoTIFF data via NSIDC API',
          'Process GeoTIFF to extract moisture values',
          'Convert to texture format (server-side)',
          'Apply blue-brown color mapping for visualization'
        ]
      }
    },
    {
      id: 'gpm_precipitation',
      name: 'GPM Precipitation',
      icon: '🌧️',
      description: 'Real-time rainfall data - 30-minute updates',
      useCase: 'Animated precipitation overlay. Moving semi-transparent textures to show rainfall patterns across the terrain.',
      apiUrl: 'https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGHH_06/summary',
      format: 'HDF5',
      frequency: 'Real-time (30min)',
      requiresAuth: true,
      implementation: {
        threejs: `// Animated precipitation system
class PrecipitationSystem {
  constructor() {
    this.precipitationSprites = [];
    this.updateInterval = 30 * 60 * 1000; // 30 minutes
  }
  
  async loadPrecipitationData(timestamp) {
    const precipData = await fetch(\`/api/gpm-precipitation?\${timestamp}\`);
    const texture = await this.createPrecipitationTexture(precipData);
    
    // Create animated sprites
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.7
      })
    );
    
    this.animatePrecipitation(sprite);
  }
  
  animatePrecipitation(sprite) {
    // Move precipitation across terrain
    const duration = 600000; // 10 minutes
    new TWEEN.Tween(sprite.position)
      .to({ x: sprite.position.x + 100 }, duration)
      .easing(TWEEN.Easing.Linear.None)
      .start();
  }
}`,
        shader: '',
        workflow: [
          'Authenticate with NASA GES DISC',
          'Download GPM HDF5 precipitation data',
          'Process HDF5 to extract rainfall intensity',
          'Create animated sprite textures',
          'Implement real-time updates every 30 minutes'
        ]
      }
    },
    {
      id: 'vegetation_health',
      name: 'Vegetation Health Index',
      icon: '🌱',
      description: 'Combined NDVI + temperature stress indicator',
      useCase: 'Color-coded plant stress visualization. Green = healthy, yellow = moderate stress, red = severe stress.',
      apiUrl: 'https://www.star.nesdis.noaa.gov/smcd/emb/vci/VH/vh_ftp.php',
      format: 'GeoTIFF',
      frequency: '8-day',
      requiresAuth: true,
      implementation: {
        threejs: `// Vegetation Health Index combining multiple factors
const vhiMaterial = new THREE.ShaderMaterial({
  uniforms: {
    ndviTexture: { value: ndviTexture },
    temperatureTexture: { value: tempTexture },
    moistureTexture: { value: moistureTexture },
    healthThreshold: { value: 0.5 }
  },
  vertexShader: vertexShader,
  fragmentShader: vhiFragmentShader,
  transparent: true
});`,
        shader: `// Vegetation Health calculation
uniform sampler2D ndviTexture;
uniform sampler2D temperatureTexture;
uniform sampler2D moistureTexture;
uniform float healthThreshold;

varying vec2 vUv;

void main() {
  float ndvi = texture2D(ndviTexture, vUv).r;
  float temp = texture2D(temperatureTexture, vUv).r;
  float moisture = texture2D(moistureTexture, vUv).r;
  
  // Calculate vegetation health index
  float vhi = (ndvi * 0.5) + (moisture * 0.3) - (temp * 0.2);
  
  // Color mapping
  vec3 healthyColor = vec3(0.2, 0.8, 0.2); // Green
  vec3 stressedColor = vec3(0.8, 0.8, 0.2); // Yellow
  vec3 severeColor = vec3(0.8, 0.2, 0.2); // Red
  
  vec3 color;
  if (vhi > 0.6) {
    color = healthyColor;
  } else if (vhi > 0.3) {
    color = mix(stressedColor, healthyColor, (vhi - 0.3) / 0.3);
  } else {
    color = mix(severeColor, stressedColor, vhi / 0.3);
  }
  
  gl_FragColor = vec4(color, 0.7);
}`,
        workflow: [
          'Combine NDVI, temperature, and moisture data',
          'Calculate composite vegetation health index',
          'Apply color mapping for stress levels',
          'Update every 8 days with new satellite data',
          'Provide alerts for severe stress areas'
        ]
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
          NASA Layer Implementation Guide
        </h1>
        <p className="text-xl text-gray-300 mb-6">
          Complete guide to implementing all 7 NASA satellite data layers in your 3D terrain visualization
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-600/20 rounded-lg p-3 border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-300">{layers.length}</div>
            <div className="text-sm text-gray-400">NASA Layers</div>
          </div>
          <div className="bg-green-600/20 rounded-lg p-3 border border-green-500/30">
            <div className="text-2xl font-bold text-green-300">{layers.filter(l => !l.requiresAuth).length}</div>
            <div className="text-sm text-gray-400">No Auth Required</div>
          </div>
          <div className="bg-orange-600/20 rounded-lg p-3 border border-orange-500/30">
            <div className="text-2xl font-bold text-orange-300">{layers.filter(l => l.frequency === 'Daily').length}</div>
            <div className="text-sm text-gray-400">Daily Updates</div>
          </div>
          <div className="bg-purple-600/20 rounded-lg p-3 border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-300">{layers.filter(l => l.frequency === 'Real-time (30min)').length}</div>
            <div className="text-sm text-gray-400">Real-time</div>
          </div>
        </div>

        {/* Demo Button */}
        <div className="flex items-center gap-4 mb-8">
          <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 flex items-center gap-2">
            <Play className="w-5 h-5" />
            View Live Demo
          </button>
          <a 
            href="https://github.com/nasa-gibs/gibs-api-docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            NASA GIBS Documentation
          </a>
        </div>
      </div>

      {/* Layer Cards */}
      <div className="max-w-6xl mx-auto space-y-4">
        {layers.map((layer) => (
          <LayerGuideCard key={layer.id} layer={layer} />
        ))}
      </div>

      {/* Implementation Summary */}
      <div className="max-w-6xl mx-auto mt-12 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-6 border border-gray-600/50">
        <h2 className="text-2xl font-bold mb-4 text-cyan-300">🚀 Quick Start Implementation</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-green-300">✅ Start with these layers:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0"></span>
                <strong>MODIS True Color</strong> - Base terrain texture (no auth)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0"></span>
                <strong>MODIS NDVI</strong> - Vegetation overlay (no auth)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0"></span>
                <strong>Land Surface Temperature</strong> - Heat map (no auth)
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-orange-300">🔐 Add later with API keys:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-orange-600 rounded-full flex-shrink-0"></span>
                <strong>SMAP Soil Moisture</strong> - Irrigation planning
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-orange-600 rounded-full flex-shrink-0"></span>
                <strong>GPM Precipitation</strong> - Real-time weather
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-orange-600 rounded-full flex-shrink-0"></span>
                <strong>Vegetation Health</strong> - Advanced crop monitoring
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}