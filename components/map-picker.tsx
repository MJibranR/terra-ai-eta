
"use client"

import { useEffect, useState, useRef } from "react"
import { MapPin, Satellite, Search, Globe, Target, CheckCircle, Settings, Layers, Eye, MapIcon, Navigation } from "lucide-react"
import SettingsPanel from '@/components/settings-panel'

interface LocationData {
  lat: number
  lng: number
  name: string
  country: string
  region: string
  nasaDataAvailable: boolean
}

interface MapPickerProps {
  onLocationSelect: (location: LocationData) => void
  initialLocation?: LocationData
  showSuggestions?: boolean
}

interface MapSettings {
  mapStyle: 'satellite' | 'street' | 'terrain' | 'hybrid'
  showNASAOverlays: boolean
  theme: 'dark' | 'light' | 'auto'
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

const MAP_TILES = {
  street: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  hybrid: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
}

export function MapPicker({ onLocationSelect, initialLocation, showSuggestions = true }: MapPickerProps) {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation || null)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [customLocation, setCustomLocation] = useState({ lat: "", lng: "", name: "" })
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : null,
  )
  const [mapSettings, setMapSettings] = useState<MapSettings>({
    mapStyle: 'satellite',
    showNASAOverlays: true,
    theme: 'dark'
  })
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return

    let cleanup: (() => void) | null = null;

    // Dynamically import Leaflet only on client side
    import("leaflet").then((L) => {
      // Fix for default marker icons in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const mapContainer = document.getElementById("enhanced-map")
      if (!mapContainer) return

      // Clean up existing map if it exists
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      // Clear container content
      mapContainer.innerHTML = ""

      // Use initial location or default to center of USA
      const initialLat = initialLocation?.lat || 39.8283
      const initialLng = initialLocation?.lng || -98.5795

      // Initialize map
      const map = L.map("enhanced-map").setView([initialLat, initialLng], 4)
      mapRef.current = map

      // Add tile layer based on current settings
      const tileUrl = MAP_TILES[mapSettings.mapStyle]
      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Add click handler
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng

        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current)
        }

        // Add new marker
        markerRef.current = L.marker([lat, lng]).addTo(map)

        // Reverse geocode to get address
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          const data = await response.json()
          const locationName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`

          markerRef.current.bindPopup(`<b>Selected Location</b><br/>${locationName}`).openPopup()

          const locationData: LocationData = {
            lat: lat,
            lng: lng,
            name: locationName,
            country: data.address?.country || 'Unknown',
            region: data.address?.state || data.address?.region || 'Unknown',
            nasaDataAvailable: true // Assume NASA data is available for most locations
          }

          setSelectedPosition([lat, lng])
          setSelectedLocation(locationData)
          onLocationSelect(locationData)
        } catch (error) {
          console.error("Geocoding error:", error)
          const locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          markerRef.current.bindPopup(`<b>Selected Location</b><br/>${locationName}`).openPopup()
          
          const locationData: LocationData = {
            lat: lat,
            lng: lng,
            name: locationName,
            country: 'Unknown',
            region: 'Unknown',
            nasaDataAvailable: true
          }

          setSelectedPosition([lat, lng])
          setSelectedLocation(locationData)
          onLocationSelect(locationData)
        }
      })

      // Add initial marker if position exists
      if (selectedPosition) {
        markerRef.current = L.marker(selectedPosition).addTo(map)
        map.setView(selectedPosition, 8)
      }

      cleanup = () => {
        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }
        markerRef.current = null
      }
    })

    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [mounted, initialLocation, mapSettings.mapStyle])

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markerRef.current = null
    }
  }, [])

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location)
    setSelectedPosition([location.lat, location.lng])
    onLocationSelect(location)

    // Update map if it exists
    if (mapRef.current && markerRef.current) {
      mapRef.current.removeLayer(markerRef.current)
    }
    
    if (mapRef.current) {
      import("leaflet").then((L) => {
        markerRef.current = L.marker([location.lat, location.lng]).addTo(mapRef.current)
        mapRef.current.setView([location.lat, location.lng], 8)
        markerRef.current.bindPopup(`<b>${location.name}</b><br/>${location.country}`).openPopup()
      })
    }
  }

  const handleCustomLocationSubmit = () => {
    const lat = parseFloat(customLocation.lat)
    const lng = parseFloat(customLocation.lng)
    
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      const locationData: LocationData = {
        lat,
        lng,
        name: customLocation.name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        country: 'Custom',
        region: 'Custom',
        nasaDataAvailable: true
      }
      
      handleLocationSelect(locationData)
      setShowCustomInput(false)
      setCustomLocation({ lat: "", lng: "", name: "" })
    }
  }

  const filteredSuggestions = SUGGESTED_LOCATIONS.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSettingsChange = (settings: any) => {
    setMapSettings({
      mapStyle: settings.mapStyle,
      showNASAOverlays: settings.showNASAOverlays,
      theme: settings.theme
    })
  }

  if (!mounted) {
    return (
      <div className="glass-container">
        <div className="w-full h-[400px] flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-8 w-8 glass-text-secondary mx-auto mb-2 animate-pulse" />
            <p className="glass-text-secondary">Loading map...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-container">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      
      {/* Header with Settings */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 glass-light neon-border rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="glass-text-primary font-semibold">Interactive Map</h3>
            <p className="glass-text-secondary text-sm">Click anywhere to select a location</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Map Style Quick Toggle */}
          <div className="flex items-center gap-1 glass-light rounded-lg p-1">
            {[
              { value: 'satellite', icon: Satellite, label: 'Satellite' },
              { value: 'street', icon: MapIcon, label: 'Street' },
              { value: 'terrain', icon: Globe, label: 'Terrain' }
            ].map((style) => {
              const Icon = style.icon
              return (
                <button
                  key={style.value}
                  onClick={() => setMapSettings(prev => ({ ...prev, mapStyle: style.value as any }))}
                  className={`
                    p-2 rounded-md transition-all duration-200
                    ${mapSettings.mapStyle === style.value 
                      ? 'neon-border glass-light' 
                      : 'hover:glass-light'
                    }
                  `}
                  title={style.label}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                </button>
              )
            })}
          </div>
          
          {/* NASA Overlays Toggle */}
          <button
            onClick={() => setMapSettings(prev => ({ ...prev, showNASAOverlays: !prev.showNASAOverlays }))}
            className={`
              glass-button p-2 rounded-lg transition-all duration-200
              ${mapSettings.showNASAOverlays ? 'neon-border' : ''}
            `}
            title="Toggle NASA Data Overlays"
          >
            <Layers className={`w-4 h-4 ${mapSettings.showNASAOverlays ? 'text-cyan-400' : 'text-gray-400'}`} />
          </button>
          
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="glass-button p-2 rounded-lg hover:scale-110 transition-transform"
            title="Map Settings"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Search and Suggestions */}
      {showSuggestions && (
        <div className="mb-4 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 glass-text-muted" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-10 w-full"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="glass-button flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            >
              <Target className="w-4 h-4" />
              Custom Coordinates
            </button>
            
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords
                    const locationData: LocationData = {
                      lat: latitude,
                      lng: longitude,
                      name: "Current Location",
                      country: "Unknown",
                      region: "Current",
                      nasaDataAvailable: true
                    }
                    handleLocationSelect(locationData)
                  })
                }
              }}
              className="glass-button flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            >
              <Navigation className="w-4 h-4" />
              Use Current Location
            </button>
          </div>

          {/* Custom Input */}
          {showCustomInput && (
            <div className="glass-light p-4 rounded-xl space-y-3">
              <h4 className="glass-text-primary font-medium">Enter Custom Coordinates</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="number"
                  placeholder="Latitude (-90 to 90)"
                  value={customLocation.lat}
                  onChange={(e) => setCustomLocation(prev => ({ ...prev, lat: e.target.value }))}
                  className="glass-input"
                  step="any"
                  min="-90"
                  max="90"
                />
                <input
                  type="number"
                  placeholder="Longitude (-180 to 180)"
                  value={customLocation.lng}
                  onChange={(e) => setCustomLocation(prev => ({ ...prev, lng: e.target.value }))}
                  className="glass-input"
                  step="any"
                  min="-180"
                  max="180"
                />
                <input
                  type="text"
                  placeholder="Location name (optional)"
                  value={customLocation.name}
                  onChange={(e) => setCustomLocation(prev => ({ ...prev, name: e.target.value }))}
                  className="glass-input"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCustomLocationSubmit}
                  className="glass-button-primary px-4 py-2 rounded-lg text-sm"
                >
                  Set Location
                </button>
                <button
                  onClick={() => setShowCustomInput(false)}
                  className="glass-button px-4 py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Suggested Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {filteredSuggestions.map((location, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(location)}
                className={`
                  glass-light p-3 rounded-lg text-left transition-all duration-200 hover:scale-105
                  ${selectedLocation?.name === location.name ? 'neon-border' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="glass-text-primary font-medium text-sm">{location.name}</p>
                      <p className="glass-text-secondary text-xs">{location.country}</p>
                    </div>
                  </div>
                  {location.nasaDataAvailable && (
                    <Satellite className="w-4 h-4 text-green-400" />
                  )}
                  {selectedLocation?.name === location.name && (
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="glass-light p-3 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="glass-text-primary font-medium">{selectedLocation.name}</p>
                <p className="glass-text-secondary text-sm">
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
            </div>
            {selectedLocation.nasaDataAvailable && (
              <div className="flex items-center gap-1 glass-light px-2 py-1 rounded-full">
                <Satellite className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">NASA Data Available</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative">
        <div 
          id="enhanced-map" 
          className="w-full h-[400px] rounded-xl overflow-hidden glass-light neon-border"
          style={{ zIndex: 1 }}
        />
        
        {/* Map Overlay Info */}
        {mapSettings.showNASAOverlays && (
          <div className="absolute top-2 left-2 glass-light px-3 py-2 rounded-lg z-10">
            <div className="flex items-center gap-2">
              <Satellite className="w-4 h-4 text-cyan-400" />
              <span className="glass-text-primary text-sm">NASA Overlays Active</span>
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  )
}
