/**
 * Enhanced Location Picker with Glass Styling
 * Interactive location selection for NASA farm data
 */

"use client"

import { useState, useCallback } from 'react'
import { MapPin, Satellite, Search, Globe, Target, CheckCircle } from 'lucide-react'

export interface LocationData {
  lat: number
  lng: number
  name: string
  country: string
  region: string
  nasaDataAvailable: boolean
}

export interface LocationPickerProps {
  selectedLocation?: LocationData
  onLocationSelect: (location: LocationData) => void
  className?: string
  showSuggestions?: boolean
}

// Popular agricultural regions with NASA data coverage
const SUGGESTED_LOCATIONS: LocationData[] = [
  { lat: 40.7128, lng: -74.0060, name: "New York", country: "USA", region: "North America", nasaDataAvailable: true },
  { lat: 41.8781, lng: -87.6298, name: "Chicago", country: "USA", region: "Midwest", nasaDataAvailable: true },
  { lat: 36.1627, lng: -86.7816, name: "Nashville", country: "USA", region: "South", nasaDataAvailable: true },
  { lat: 39.7392, lng: -104.9903, name: "Denver", country: "USA", region: "West", nasaDataAvailable: true },
  { lat: 52.5200, lng: 13.4050, name: "Berlin", country: "Germany", region: "Europe", nasaDataAvailable: true },
  { lat: 48.8566, lng: 2.3522, name: "Paris", country: "France", region: "Europe", nasaDataAvailable: true },
  { lat: 35.6762, lng: 139.6503, name: "Tokyo", country: "Japan", region: "Asia", nasaDataAvailable: true },
  { lat: -33.8688, lng: 151.2093, name: "Sydney", country: "Australia", region: "Oceania", nasaDataAvailable: true },
  { lat: -23.5505, lng: -46.6333, name: "São Paulo", country: "Brazil", region: "South America", nasaDataAvailable: true },
  { lat: 30.0444, lng: 31.2357, name: "Cairo", country: "Egypt", region: "Africa", nasaDataAvailable: true }
]

export default function LocationPicker({ 
  selectedLocation, 
  onLocationSelect, 
  className = "",
  showSuggestions = true 
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [customLocation, setCustomLocation] = useState({ lat: "", lng: "", name: "" })
  const [selectedSuggestion, setSelectedSuggestion] = useState<LocationData | null>(selectedLocation || null)
  const [showCustomInput, setShowCustomInput] = useState(false)

  const filteredLocations = SUGGESTED_LOCATIONS.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLocationSelect = useCallback((location: LocationData) => {
    setSelectedSuggestion(location)
    onLocationSelect(location)
  }, [onLocationSelect])

  const handleCustomLocationSubmit = () => {
    if (customLocation.lat && customLocation.lng && customLocation.name) {
      const newLocation: LocationData = {
        lat: parseFloat(customLocation.lat),
        lng: parseFloat(customLocation.lng),
        name: customLocation.name,
        country: "Custom",
        region: "Custom Location",
        nasaDataAvailable: true
      }
      handleLocationSelect(newLocation)
      setShowCustomInput(false)
      setCustomLocation({ lat: "", lng: "", name: "" })
    }
  }

  return (
    <div className={`glass-container p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 glass-light neon-border rounded-xl flex items-center justify-center mx-auto">
            <Globe className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold glass-text-primary">Select Farm Location</h3>
          <p className="glass-text-secondary text-sm">
            Choose where your virtual farm will be located to access real NASA satellite data
          </p>
        </div>

        {showSuggestions && (
          <>
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 glass-text-muted" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-10 pr-4"
              />
            </div>

            {/* Suggested Locations */}
            <div className="space-y-4">
              <h4 className="glass-text-primary font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Suggested Agricultural Regions
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {filteredLocations.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(location)}
                    className={`
                      glass-card-hover p-4 text-left transition-all duration-300
                      ${selectedSuggestion?.name === location.name 
                        ? 'neon-border glass-light' 
                        : 'hover:glass-light'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-cyan-400" />
                          <span className="glass-text-primary font-medium text-sm">
                            {location.name}
                          </span>
                          {selectedSuggestion?.name === location.name && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <p className="glass-text-secondary text-xs">
                          {location.country}, {location.region}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Satellite className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-green-400">NASA Data Available</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Location Input */}
            <div className="space-y-4">
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="glass-button w-full flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {showCustomInput ? 'Hide' : 'Add'} Custom Location
              </button>

              {showCustomInput && (
                <div className="glass-light p-4 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="number"
                      placeholder="Latitude"
                      value={customLocation.lat}
                      onChange={(e) => setCustomLocation(prev => ({ ...prev, lat: e.target.value }))}
                      className="glass-input text-sm"
                      step="any"
                    />
                    <input
                      type="number"
                      placeholder="Longitude"
                      value={customLocation.lng}
                      onChange={(e) => setCustomLocation(prev => ({ ...prev, lng: e.target.value }))}
                      className="glass-input text-sm"
                      step="any"
                    />
                    <input
                      type="text"
                      placeholder="Location Name"
                      value={customLocation.name}
                      onChange={(e) => setCustomLocation(prev => ({ ...prev, name: e.target.value }))}
                      className="glass-input text-sm"
                    />
                  </div>
                  
                  <button
                    onClick={handleCustomLocationSubmit}
                    disabled={!customLocation.lat || !customLocation.lng || !customLocation.name}
                    className="glass-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Custom Location
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Selected Location Preview */}
        {selectedSuggestion && (
          <div className="glass-light p-4 rounded-xl">
            <h5 className="glass-text-primary font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Selected Location
            </h5>
            <div className="space-y-2">
              <p className="glass-text-secondary text-sm">
                <strong>Name:</strong> {selectedSuggestion.name}
              </p>
              <p className="glass-text-secondary text-sm">
                <strong>Coordinates:</strong> {selectedSuggestion.lat.toFixed(4)}, {selectedSuggestion.lng.toFixed(4)}
              </p>
              <p className="glass-text-secondary text-sm">
                <strong>Region:</strong> {selectedSuggestion.country}, {selectedSuggestion.region}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Satellite className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">
                  NASA Satellite Data: Available
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
