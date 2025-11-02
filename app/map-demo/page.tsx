/**
 * Enhanced Map Demo Page
 * Demonstrates the map picker with settings integration
 */

"use client"

import { useState } from 'react'
import { MapPicker } from '@/components/map-picker'
import SettingsButton from '@/components/settings-button'
import { MapPin, Globe, Satellite } from 'lucide-react'

interface LocationData {
  lat: number
  lng: number
  name: string
  country: string
  region: string
  nasaDataAvailable: boolean
}

export default function MapDemoPage() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [appSettings, setAppSettings] = useState({
    theme: 'dark',
    mapStyle: 'satellite',
    showNASAOverlays: true,
    notifications: true
  })

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location)
    console.log('Selected location:', location)
  }

  const handleSettingsChange = (settings: any) => {
    setAppSettings(settings)
    console.log('Settings updated:', settings)
  }

  return (
    <div className="min-h-screen glass-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 glass-light neon-border rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="glass-text-primary font-bold text-2xl">Enhanced Map Picker</h1>
                <p className="glass-text-secondary">Interactive map with comprehensive settings</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <SettingsButton
                onSettingsChange={handleSettingsChange}
                size="lg"
                variant="primary"
              />
            </div>
          </div>
        </div>

        {/* Current Settings Display */}
        <div className="glass-container">
          <h2 className="glass-text-primary font-semibold text-lg mb-4">Current Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-light p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="glass-text-primary font-medium">Theme</span>
              </div>
              <p className="glass-text-secondary capitalize">{appSettings.theme}</p>
            </div>
            
            <div className="glass-light p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="glass-text-primary font-medium">Map Style</span>
              </div>
              <p className="glass-text-secondary capitalize">{appSettings.mapStyle}</p>
            </div>
            
            <div className="glass-light p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Satellite className="w-4 h-4 text-cyan-400" />
                <span className="glass-text-primary font-medium">NASA Overlays</span>
              </div>
              <p className="glass-text-secondary">{appSettings.showNASAOverlays ? 'Enabled' : 'Disabled'}</p>
            </div>
            
            <div className="glass-light p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-cyan-400 rounded-full" />
                <span className="glass-text-primary font-medium">Status</span>
              </div>
              <p className="glass-text-secondary">Active</p>
            </div>
          </div>
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="glass-container">
            <h2 className="glass-text-primary font-semibold text-lg mb-4">Selected Location</h2>
            <div className="glass-light p-6 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="glass-text-primary font-medium mb-2">Location Details</h3>
                  <div className="space-y-2">
                    <p className="glass-text-secondary">
                      <span className="font-medium">Name:</span> {selectedLocation.name}
                    </p>
                    <p className="glass-text-secondary">
                      <span className="font-medium">Country:</span> {selectedLocation.country}
                    </p>
                    <p className="glass-text-secondary">
                      <span className="font-medium">Region:</span> {selectedLocation.region}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="glass-text-primary font-medium mb-2">Coordinates</h3>
                  <div className="space-y-2">
                    <p className="glass-text-secondary">
                      <span className="font-medium">Latitude:</span> {selectedLocation.lat.toFixed(6)}
                    </p>
                    <p className="glass-text-secondary">
                      <span className="font-medium">Longitude:</span> {selectedLocation.lng.toFixed(6)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Satellite className={`w-4 h-4 ${selectedLocation.nasaDataAvailable ? 'text-green-400' : 'text-gray-400'}`} />
                      <span className="glass-text-secondary">
                        NASA Data: {selectedLocation.nasaDataAvailable ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Picker */}
        <MapPicker
          onLocationSelect={handleLocationSelect}
          showSuggestions={true}
        />

        {/* Features List */}
        <div className="glass-container">
          <h2 className="glass-text-primary font-semibold text-lg mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Interactive Map",
                description: "Click anywhere on the map to select a location",
                icon: MapPin
              },
              {
                title: "Settings Panel",
                description: "Comprehensive settings with map options, NASA data, and preferences",
                icon: Globe
              },
              {
                title: "Location Search",
                description: "Search and select from suggested agricultural regions",
                icon: Globe
              },
              {
                title: "Custom Coordinates",
                description: "Enter precise latitude and longitude coordinates",
                icon: MapPin
              },
              {
                title: "NASA Integration",
                description: "NASA satellite data availability and overlays",
                icon: Satellite
              },
              {
                title: "Responsive Design",
                description: "Fully responsive with liquid glass styling",
                icon: Globe
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="glass-light p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    <h3 className="glass-text-primary font-medium">{feature.title}</h3>
                  </div>
                  <p className="glass-text-secondary text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}