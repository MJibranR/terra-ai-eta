"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'
import { MapPin, Satellite, Droplets, Sprout, Thermometer } from 'lucide-react'
import LocationPicker from '@/components/location-picker'

// Import reliable 3D component with CSS fallback
import ReliableNASAFarm3D from "@/components/reliable-nasa-terrain"

interface LocationData {
  lat: number
  lng: number
  name: string
  country: string
  region: string
  nasaDataAvailable: boolean
}

interface SafeFarm3DProps {
  farmData?: {
    location: LocationData
    realTimeData?: {
      soilMoisture: Array<{ value: number; timestamp: string }>
      vegetation: Array<{ ndvi: number; timestamp: string }>
      temperature: Array<{ value: number; timestamp: string }>
    }
  } | null
}

// FarmField function removed - now using SafeThreeFarm component

export function SimpleFarm3D({ farmData }: SafeFarm3DProps) {
  const [isClient, setIsClient] = useState(false)
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<LocationData>(farmData?.location || {
    lat: 40.7128,
    lng: -74.0060,
    name: "New York",
    country: "USA",
    region: "North America",
    nasaDataAvailable: true
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleLocationChange = (location: LocationData) => {
    setCurrentLocation(location)
    setShowLocationSelector(false)
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-xl border border-blue-500/20">
        <div className="text-center text-white">
          <Satellite className="w-16 h-16 mx-auto mb-4 animate-pulse text-blue-400" />
          <p className="text-lg font-semibold mb-2">Loading Farm View</p>
          <p className="text-sm text-gray-300">Initializing 3D environment</p>
        </div>
      </div>
    )
  }

  if (showLocationSelector) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="glass-text-primary font-bold text-lg">Select Location</h3>
          <button
            onClick={() => setShowLocationSelector(false)}
            className="glass-button px-4 py-2 rounded-lg"
          >
            Back
          </button>
        </div>
        <LocationPicker
          selectedLocation={currentLocation}
          onLocationSelect={handleLocationChange}
          showSuggestions={true}
        />
      </div>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-green-900/40 to-blue-900/40 border-green-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Satellite className="h-5 w-5 text-blue-400" />
            Farm View
          </CardTitle>
          <button
            onClick={() => setShowLocationSelector(true)}
            className="glass-button p-2 rounded-lg flex items-center gap-2"
          >
            <MapPin className="h-4 w-4 text-cyan-400" />
            <span className="text-sm">Change Location</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
            <Droplets className="h-3 w-3 mr-1" />
            Soil: {farmData?.realTimeData?.soilMoisture?.[0]?.value?.toFixed(1) || 'N/A'}%
          </Badge>
          <Badge variant="secondary" className="bg-green-500/20 text-green-300">
            <Sprout className="h-3 w-3 mr-1" />
            NDVI: {farmData?.realTimeData?.vegetation?.[0]?.ndvi?.toFixed(2) || 'N/A'}
          </Badge>
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
            <Thermometer className="h-3 w-3 mr-1" />
            {farmData?.realTimeData?.temperature?.[0]?.value?.toFixed(1) || 'N/A'}°C
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <ReliableNASAFarm3D 
          farmData={farmData}
          activeLayers={['vegetation', 'soil-moisture', 'temperature']}
          onFieldClick={(fieldId: string) => console.log('NASA SimpleFarm3D field clicked:', fieldId)}
        />
      </CardContent>
    </Card>
  )
}