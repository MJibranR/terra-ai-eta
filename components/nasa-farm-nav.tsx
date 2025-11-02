'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Satellite, Award, Play, ChevronRight, Globe, Layers, Target, ZoomIn, RotateCcw, Droplets, Thermometer, CloudRain, Sprout, MapPin } from "lucide-react"
import { useState } from "react"

export default function NASAFarmNavigatorsSection() {
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [activeLayer, setActiveLayer] = useState('soil')

  // Different farm data for each location
  const locationsData = {
    'Central Valley, California': {
      coordinates: '36.7783° N, 119.4179° W',
      farmSize: '1,250 acres',
      cropType: 'Almonds & Walnuts',
      elevation: '120m',
      soil: { 
        value: '45%', 
        status: 'Dry', 
        points: [
          { x: '20%', y: '35%', status: 'dry', value: '38%' },
          { x: '55%', y: '50%', status: 'dry', value: '42%' },
          { x: '70%', y: '40%', status: 'optimal', value: '65%' },
          { x: '35%', y: '60%', status: 'dry', value: '40%' }
        ]
      },
      vegetation: { 
        value: '65%', 
        status: 'Moderate Stress', 
        points: [
          { x: '25%', y: '40%', status: 'stress', value: '55%' },
          { x: '60%', y: '45%', status: 'stress', value: '60%' },
          { x: '45%', y: '30%', status: 'healthy', value: '80%' }
        ]
      },
      temperature: { 
        value: '32°C', 
        status: 'Hot', 
        points: [
          { x: '30%', y: '45%', status: 'hot', value: '35°C' },
          { x: '65%', y: '40%', status: 'hot', value: '33°C' },
          { x: '40%', y: '55%', status: 'hot', value: '30°C' }
        ]
      },
      terrain: {
        fields: [
          { left: '8%', bottom: '24%', width: '35%', height: '20%', rotation: '3deg', color: 'from-yellow-600 to-yellow-800' },
          { left: '50%', bottom: '28%', width: '30%', height: '16%', rotation: '-2deg', color: 'from-yellow-500 to-yellow-700' },
          { left: '20%', bottom: '32%', width: '45%', height: '12%', rotation: '1deg', color: 'from-yellow-400 to-yellow-600' }
        ],
        water: { left: '70%', bottom: '20%', width: '15%', height: '8%' }
      }
    },
    'Midwest Corn Belt, Iowa': {
      coordinates: '41.8780° N, 93.0977° W',
      farmSize: '2,800 acres',
      cropType: 'Corn & Soybeans',
      elevation: '335m',
      soil: { 
        value: '85%', 
        status: 'Optimal', 
        points: [
          { x: '30%', y: '45%', status: 'optimal', value: '88%' },
          { x: '60%', y: '50%', status: 'optimal', value: '82%' },
          { x: '45%', y: '35%', status: 'wet', value: '92%' }
        ]
      },
      vegetation: { 
        value: '95%', 
        status: 'Excellent', 
        points: [
          { x: '25%', y: '40%', status: 'healthy', value: '98%' },
          { x: '65%', y: '55%', status: 'healthy', value: '92%' },
          { x: '50%', y: '30%', status: 'healthy', value: '96%' }
        ]
      },
      temperature: { 
        value: '22°C', 
        status: 'Ideal', 
        points: [
          { x: '35%', y: '50%', status: 'normal', value: '21°C' },
          { x: '70%', y: '45%', status: 'normal', value: '23°C' },
          { x: '45%', y: '60%', status: 'normal', value: '20°C' }
        ]
      },
      terrain: {
        fields: [
          { left: '5%', bottom: '24%', width: '40%', height: '22%', rotation: '2deg', color: 'from-green-600 to-green-800' },
          { left: '52%', bottom: '26%', width: '35%', height: '18%', rotation: '-1deg', color: 'from-green-500 to-green-700' },
          { left: '15%', bottom: '32%', width: '50%', height: '14%', rotation: '0deg', color: 'from-green-400 to-green-600' }
        ],
        water: { left: '75%', bottom: '22%', width: '12%', height: '6%' }
      }
    },
    'Great Plains, Kansas': {
      coordinates: '38.5266° N, 96.7265° W',
      farmSize: '5,200 acres',
      cropType: 'Wheat & Sorghum',
      elevation: '400m',
      soil: { 
        value: '35%', 
        status: 'Very Dry', 
        points: [
          { x: '25%', y: '40%', status: 'dry', value: '30%' },
          { x: '60%', y: '55%', status: 'dry', value: '28%' },
          { x: '45%', y: '35%', status: 'dry', value: '32%' }
        ]
      },
      vegetation: { 
        value: '45%', 
        status: 'Poor', 
        points: [
          { x: '30%', y: '45%', status: 'stress', value: '40%' },
          { x: '65%', y: '50%', status: 'stress', value: '42%' },
          { x: '50%', y: '35%', status: 'stress', value: '38%' }
        ]
      },
      temperature: { 
        value: '28°C', 
        status: 'Warm', 
        points: [
          { x: '35%', y: '50%', status: 'hot', value: '30°C' },
          { x: '70%', y: '45%', status: 'hot', value: '29°C' },
          { x: '45%', y: '60%', status: 'normal', value: '25°C' }
        ]
      },
      terrain: {
        fields: [
          { left: '10%', bottom: '26%', width: '38%', height: '19%', rotation: '4deg', color: 'from-amber-600 to-amber-800' },
          { left: '55%', bottom: '28%', width: '32%', height: '15%', rotation: '-3deg', color: 'from-amber-500 to-amber-700' },
          { left: '18%', bottom: '34%', width: '48%', height: '11%', rotation: '2deg', color: 'from-amber-400 to-amber-600' }
        ],
        water: null // No water in this dry location
      }
    }
  }

  const [currentLocation, setCurrentLocation] = useState('Central Valley, California')
  const currentData = locationsData[currentLocation]

  const farmData = {
    soil: currentData.soil,
    vegetation: currentData.vegetation,
    temperature: currentData.temperature
  }

  const locations = Object.keys(locationsData)

  return (
    <section id="navigators" className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="bg-blue-600/20 backdrop-blur-md border border-blue-400/30 text-white px-6 py-3 mb-6 shadow-lg shadow-blue-500/20">
            <Award className="w-4 h-4 mr-2" />
            NASA Powered 3D Analytics
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="text-blue-400">Live Farm Intelligence</span>
            <br />in Stunning 3D
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Control Panel */}
          <div className="space-y-8">
            {/* Location Selector */}
            <div className="bg-black/30 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <MapPin className="w-6 h-6 mr-3 text-blue-400" />
                  Farm Location
                </h3>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  Active
                </Badge>
              </div>
              
              {/* Current Location Display */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-white">{currentLocation}</div>
                    <div className="text-sm text-blue-300 flex items-center mt-1">
                      <Globe className="w-4 h-4 mr-1" />
                      {currentData.coordinates}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Farm Size</div>
                    <div className="text-white font-semibold">{currentData.farmSize}</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-300">
                  Primary Crops: <span className="text-white">{currentData.cropType}</span>
                </div>
              </div>

              {/* Location Selector */}
              <div className="space-y-2">
                <div className="text-white font-semibold mb-3">Switch Location:</div>
                {locations.map((location) => (
                  <button
                    key={location}
                    onClick={() => setCurrentLocation(location)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      currentLocation === location
                        ? 'bg-blue-500/20 border-blue-500 text-white'
                        : 'bg-black/20 border-gray-600 text-gray-300 hover:border-blue-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{location}</span>
                      {currentLocation === location && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Data Layers */}
            <div className="bg-black/30 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-6">🌱 Data Layers</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setActiveLayer('soil')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    activeLayer === 'soil' 
                      ? 'border-blue-500 bg-blue-500/20' 
                      : 'border-gray-600 bg-black/20 hover:border-blue-400'
                  }`}
                >
                  <Droplets className={`w-8 h-8 mx-auto mb-2 ${
                    activeLayer === 'soil' ? 'text-blue-400' : 'text-gray-400'
                  }`} />
                  <div className="text-white font-semibold">Soil Moisture</div>
                  <div className="text-sm text-gray-400">SMAP Satellite</div>
                </button>

                <button
                  onClick={() => setActiveLayer('vegetation')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    activeLayer === 'vegetation' 
                      ? 'border-green-500 bg-green-500/20' 
                      : 'border-gray-600 bg-black/20 hover:border-green-400'
                  }`}
                >
                  <Sprout className={`w-8 h-8 mx-auto mb-2 ${
                    activeLayer === 'vegetation' ? 'text-green-400' : 'text-gray-400'
                  }`} />
                  <div className="text-white font-semibold">Crop Health</div>
                  <div className="text-sm text-gray-400">MODIS/VIIRS</div>
                </button>

                <button
                  onClick={() => setActiveLayer('temperature')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    activeLayer === 'temperature' 
                      ? 'border-orange-500 bg-orange-500/20' 
                      : 'border-gray-600 bg-black/20 hover:border-orange-400'
                  }`}
                >
                  <Thermometer className={`w-8 h-8 mx-auto mb-2 ${
                    activeLayer === 'temperature' ? 'text-orange-400' : 'text-gray-400'
                  }`} />
                  <div className="text-white font-semibold">Temperature</div>
                  <div className="text-sm text-gray-400">ECOSTRESS</div>
                </button>
              </div>

              {/* Current Data Display */}
              <div className="bg-black/40 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">
                    {activeLayer === 'soil' ? 'Soil Moisture' : 
                     activeLayer === 'vegetation' ? 'Vegetation Health' : 'Surface Temperature'}
                  </span>
                  <Badge className={
                    activeLayer === 'soil' ? 'bg-blue-500/20 text-blue-300 border-blue-400' :
                    activeLayer === 'vegetation' ? 'bg-green-500/20 text-green-300 border-green-400' :
                    'bg-orange-500/20 text-orange-300 border-orange-400'
                  }>
                    {farmData[activeLayer].status}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {farmData[activeLayer].value}
                </div>
                <div className="text-sm text-gray-400">
                  Last updated: 15 min ago • NASA {activeLayer === 'soil' ? 'SMAP' : activeLayer === 'vegetation' ? 'MODIS' : 'ECOSTRESS'}
                </div>
              </div>
            </div>

            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl shadow-blue-500/30 w-full">
              <Link href="/dashboard" className="flex items-center justify-center space-x-3">
                <Play className="w-6 h-6" />
                <span>Launch Full 3D Dashboard</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* 3D Visualization */}
          <div className="relative">
            <div className="bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-2xl shadow-blue-500/20">
              {/* Location Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{currentLocation}</div>
                    <div className="text-sm text-gray-400 flex items-center">
                      <span className="flex items-center">
                        <Globe className="w-3 h-3 mr-1" />
                        {currentData.coordinates}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Live</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setRotation(prev => prev - 15)}
                    className="bg-black/50 border border-white/20 rounded-lg p-2 hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-white" />
                  </button>
                  <button 
                    onClick={() => setZoom(prev => Math.min(prev + 0.1, 1.5))}
                    className="bg-black/50 border border-white/20 rounded-lg p-2 hover:bg-white/10 transition-colors"
                  >
                    <ZoomIn className="w-4 h-4 text-white" />
                  </button>
                </div>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  {activeLayer === 'soil' ? 'Soil Analysis' : activeLayer === 'vegetation' ? 'Crop Health' : 'Temp Map'}
                </Badge>
              </div>

              {/* 3D Farm Visualization */}
              <div className="relative h-96 rounded-xl overflow-hidden bg-gradient-to-b from-sky-900 via-blue-800 to-blue-900">
                {/* Sky with subtle animation */}
                <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-blue-800 to-blue-900 animate-sky-pulse"></div>
                
                {/* Main Farmland */}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-green-900 via-green-700 to-green-500 rounded-t-3xl">
                  
                  {/* Interactive 3D Fields - DYNAMIC BASED ON LOCATION */}
                  <div className="absolute inset-0 transform-gpu" style={{
                    transform: `rotateY(${rotation}deg) scale(${zoom})`,
                    transformStyle: 'preserve-3d'
                  }}>
                    {/* Render fields based on current location terrain data */}
                    {currentData.terrain.fields.map((field, index) => (
                      <div
                        key={index}
                        className={`absolute bg-gradient-to-b ${field.color} rounded-xl shadow-2xl border-2 border-green-400/20`}
                        style={{
                          left: field.left,
                          bottom: field.bottom,
                          width: field.width,
                          height: field.height,
                          transform: `rotate(${field.rotation})`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-green-300/10 to-transparent rounded-xl"></div>
                        {/* Crop rows */}
                        <div className="absolute inset-2 bg-[linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.1)_95%)] bg-[size:10px_10px] rounded-lg"></div>
                      </div>
                    ))}

                    {/* Water pond - only if exists for this location */}
                    {currentData.terrain.water && (
                      <div
                        className="absolute bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-2xl border-2 border-blue-300/40"
                        style={{
                          left: currentData.terrain.water.left,
                          bottom: currentData.terrain.water.bottom,
                          width: currentData.terrain.water.width,
                          height: currentData.terrain.water.height,
                          transform: 'rotate(6deg)'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-200/30 to-transparent rounded-full">
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3)_0%,transparent_70%)] animate-pulse"></div>
                        </div>
                      </div>
                    )}

                    {/* Data Measurement Points - DYNAMIC BASED ON LOCATION */}
                    {farmData[activeLayer].points.map((point, index) => (
                      <div
                        key={index}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: point.x, top: point.y }}
                      >
                        {/* Data point */}
                        <div className={`
                          w-6 h-6 rounded-full border-2 border-white shadow-lg animate-pulse
                          ${point.status === 'optimal' || point.status === 'healthy' || point.status === 'normal' ? 'bg-green-500' : ''}
                          ${point.status === 'dry' || point.status === 'stress' ? 'bg-yellow-500' : ''}
                          ${point.status === 'wet' || point.status === 'hot' ? 'bg-red-500' : ''}
                          ${point.status === 'cool' ? 'bg-blue-500' : ''}
                        `}>
                          {/* Scanning ring */}
                          <div className="absolute inset-0 border-2 border-current rounded-full animate-ping opacity-75"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Satellites */}
                  <div className="absolute top-4 left-1/4 animate-satellite-orbit" style={{ animationDuration: '25s' }}>
                    <div className="relative">
                      <Satellite className="w-6 h-6 text-blue-300 drop-shadow-lg" />
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-blue-400/30 animate-scan"></div>
                    </div>
                  </div>
                </div>

                {/* Location Label on Map */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-white/20">
                  <div className="text-sm font-semibold">{currentLocation}</div>
                  <div className="text-xs text-gray-300">Active Farm View</div>
                </div>

                {/* Compass */}
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs p-2 rounded border border-white/20">
                  <div className="text-center">N</div>
                  <div className="flex space-x-1">
                    <div>W</div>
                    <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                    <div>E</div>
                  </div>
                  <div className="text-center">S</div>
                </div>
              </div>

              {/* Location Details */}
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Farm Size</div>
                  <div className="text-white font-semibold">{currentData.farmSize}</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Primary Crop</div>
                  <div className="text-white font-semibold">{currentData.cropType.split('&')[0].trim()}</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Elevation</div>
                  <div className="text-white font-semibold">{currentData.elevation}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes sky-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        
        @keyframes satellite-orbit {
          0% { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }

        @keyframes scan {
          0% { transform: translateY(0) scaleY(0); opacity: 1; }
          50% { transform: translateY(20px) scaleY(1); opacity: 0.5; }
          100% { transform: translateY(40px) scaleY(0); opacity: 0; }
        }

        .animate-sky-pulse {
          animation: sky-pulse 8s ease-in-out infinite;
        }

        .animate-satellite-orbit {
          animation: satellite-orbit linear infinite;
        }

        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}