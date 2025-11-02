/**
 * Glass Settings Panel
 * Comprehensive settings with map options and configurations
 */

"use client"

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Map, 
  Globe, 
  Eye, 
  Volume2, 
  Bell, 
  Palette, 
  Save,
  RefreshCw,
  Monitor,
  Moon,
  Sun,
  Satellite,
  MapPin,
  Layers,
  Zap,
  Shield,
  Database,
  Wifi,
  X
} from 'lucide-react'
import LocationPicker from '@/components/location-picker'

interface SettingsData {
  theme: 'dark' | 'light' | 'auto'
  mapStyle: 'satellite' | 'street' | 'terrain' | 'hybrid'
  showNASAOverlays: boolean
  autoRefreshData: boolean
  refreshInterval: number
  notifications: boolean
  soundEnabled: boolean
  dataQuality: 'high' | 'medium' | 'low'
  offlineMode: boolean
  language: string
  defaultLocation: {
    lat: number
    lng: number
    name: string
    country: string
    region: string
    nasaDataAvailable: boolean
  }
}

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  onSettingsChange?: (settings: SettingsData) => void
}

const DEFAULT_SETTINGS: SettingsData = {
  theme: 'dark',
  mapStyle: 'satellite',
  showNASAOverlays: true,
  autoRefreshData: true,
  refreshInterval: 300, // 5 minutes
  notifications: true,
  soundEnabled: false,
  dataQuality: 'high',
  offlineMode: false,
  language: 'en',
  defaultLocation: {
    lat: 40.7128,
    lng: -74.0060,
    name: "New York, USA",
    country: "USA",
    region: "North America",
    nasaDataAvailable: true
  }
}

export default function SettingsPanel({ isOpen, onClose, onSettingsChange }: SettingsPanelProps) {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS)
  const [activeTab, setActiveTab] = useState<'general' | 'map' | 'data' | 'location'>('general')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('terra-ai-settings')
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) })
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  const handleSettingChange = (key: keyof SettingsData, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    setHasChanges(true)
  }

  const handleSaveSettings = () => {
    localStorage.setItem('terra-ai-settings', JSON.stringify(settings))
    onSettingsChange?.(settings)
    setHasChanges(false)
    
    // Show success feedback
    const event = new CustomEvent('settings-saved', { detail: settings })
    window.dispatchEvent(event)
  }

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    setHasChanges(true)
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'map', label: 'Map & View', icon: Map },
    { id: 'data', label: 'NASA Data', icon: Satellite },
    { id: 'location', label: 'Location', icon: MapPin }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Settings Panel */}
      <div className="glass-container relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 glass-light neon-border rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="glass-text-primary font-bold text-xl">Settings</h2>
              <p className="glass-text-secondary text-sm">Configure your NASA Farm Navigator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="glass-light px-3 py-1 rounded-full text-xs text-orange-400">
                Unsaved changes
              </span>
            )}
            <button
              onClick={onClose}
              className="glass-button p-2 rounded-lg hover:scale-110 transition-transform"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-white/10 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300
                      ${activeTab === tab.id 
                        ? 'glass-light neon-border glass-text-primary' 
                        : 'glass-text-secondary hover:glass-light hover:glass-text-primary'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="glass-text-primary font-semibold text-lg mb-4">General Settings</h3>
                
                {/* Theme */}
                <div className="glass-light p-4 rounded-xl">
                  <label className="glass-text-primary font-medium mb-3 block">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'auto', label: 'Auto', icon: Monitor }
                    ].map((option) => {
                      const Icon = option.icon
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleSettingChange('theme', option.value)}
                          className={`
                            flex flex-col items-center gap-2 p-3 rounded-lg transition-all
                            ${settings.theme === option.value 
                              ? 'neon-border glass-light' 
                              : 'border border-white/10 hover:glass-light'
                            }
                          `}
                        >
                          <Icon className="w-6 h-6 text-cyan-400" />
                          <span className="glass-text-primary text-sm">{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Notifications */}
                <div className="glass-light p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-cyan-400" />
                      <div>
                        <label className="glass-text-primary font-medium">Notifications</label>
                        <p className="glass-text-secondary text-sm">Receive alerts for important updates</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('notifications', !settings.notifications)}
                      className={`
                        w-12 h-6 rounded-full transition-all duration-300
                        ${settings.notifications ? 'bg-cyan-500' : 'bg-gray-600'}
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded-full bg-white transition-transform duration-300
                        ${settings.notifications ? 'translate-x-6' : 'translate-x-0.5'}
                      `} />
                    </button>
                  </div>
                </div>

                {/* Sound */}
                <div className="glass-light p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-cyan-400" />
                      <div>
                        <label className="glass-text-primary font-medium">Sound Effects</label>
                        <p className="glass-text-secondary text-sm">Play sounds for interactions</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                      className={`
                        w-12 h-6 rounded-full transition-all duration-300
                        ${settings.soundEnabled ? 'bg-cyan-500' : 'bg-gray-600'}
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded-full bg-white transition-transform duration-300
                        ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}
                      `} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="space-y-6">
                <h3 className="glass-text-primary font-semibold text-lg mb-4">Map & Visualization Settings</h3>
                
                {/* Map Style */}
                <div className="glass-light p-4 rounded-xl">
                  <label className="glass-text-primary font-medium mb-3 block">Map Style</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'satellite', label: 'Satellite', icon: Satellite },
                      { value: 'street', label: 'Street', icon: Map },
                      { value: 'terrain', label: 'Terrain', icon: Globe },
                      { value: 'hybrid', label: 'Hybrid', icon: Layers }
                    ].map((style) => {
                      const Icon = style.icon
                      return (
                        <button
                          key={style.value}
                          onClick={() => handleSettingChange('mapStyle', style.value)}
                          className={`
                            flex flex-col items-center gap-2 p-3 rounded-lg transition-all
                            ${settings.mapStyle === style.value 
                              ? 'neon-border glass-light' 
                              : 'border border-white/10 hover:glass-light'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5 text-cyan-400" />
                          <span className="glass-text-primary text-xs">{style.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* NASA Overlays */}
                <div className="glass-light p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-cyan-400" />
                      <div>
                        <label className="glass-text-primary font-medium">NASA Data Overlays</label>
                        <p className="glass-text-secondary text-sm">Show satellite data layers on map</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('showNASAOverlays', !settings.showNASAOverlays)}
                      className={`
                        w-12 h-6 rounded-full transition-all duration-300
                        ${settings.showNASAOverlays ? 'bg-cyan-500' : 'bg-gray-600'}
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded-full bg-white transition-transform duration-300
                        ${settings.showNASAOverlays ? 'translate-x-6' : 'translate-x-0.5'}
                      `} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h3 className="glass-text-primary font-semibold text-lg mb-4">NASA Data Settings</h3>
                
                {/* Auto Refresh */}
                <div className="glass-light p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-cyan-400" />
                      <div>
                        <label className="glass-text-primary font-medium">Auto Refresh Data</label>
                        <p className="glass-text-secondary text-sm">Automatically update NASA satellite data</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('autoRefreshData', !settings.autoRefreshData)}
                      className={`
                        w-12 h-6 rounded-full transition-all duration-300
                        ${settings.autoRefreshData ? 'bg-cyan-500' : 'bg-gray-600'}
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded-full bg-white transition-transform duration-300
                        ${settings.autoRefreshData ? 'translate-x-6' : 'translate-x-0.5'}
                      `} />
                    </button>
                  </div>
                  
                  {settings.autoRefreshData && (
                    <div className="mt-3">
                      <label className="glass-text-secondary text-sm block mb-2">Refresh Interval (seconds)</label>
                      <input
                        type="range"
                        min="60"
                        max="3600"
                        step="60"
                        value={settings.refreshInterval}
                        onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs glass-text-muted mt-1">
                        <span>1 min</span>
                        <span>{Math.floor(settings.refreshInterval / 60)} min</span>
                        <span>60 min</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Data Quality */}
                <div className="glass-light p-4 rounded-xl">
                  <label className="glass-text-primary font-medium mb-3 block">Data Quality</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'low', label: 'Low', desc: 'Faster loading' },
                      { value: 'medium', label: 'Medium', desc: 'Balanced' },
                      { value: 'high', label: 'High', desc: 'Best quality' }
                    ].map((quality) => (
                      <button
                        key={quality.value}
                        onClick={() => handleSettingChange('dataQuality', quality.value)}
                        className={`
                          flex flex-col items-center gap-1 p-3 rounded-lg transition-all
                          ${settings.dataQuality === quality.value 
                            ? 'neon-border glass-light' 
                            : 'border border-white/10 hover:glass-light'
                          }
                        `}
                      >
                        <span className="glass-text-primary text-sm font-medium">{quality.label}</span>
                        <span className="glass-text-secondary text-xs">{quality.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-6">
                <h3 className="glass-text-primary font-semibold text-lg mb-4">Default Location Settings</h3>
                
                <LocationPicker
                  selectedLocation={settings.defaultLocation}
                  onLocationSelect={(location) => handleSettingChange('defaultLocation', location)}
                  showSuggestions={true}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <button
            onClick={handleResetSettings}
            className="glass-button flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Defaults
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="glass-button px-6 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={!hasChanges}
              className="glass-button-primary px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}