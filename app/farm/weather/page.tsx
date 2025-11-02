"use client"

import { Navigation } from "@/components/navigation"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from "next/link"
import {
  ArrowLeft,
  CloudRain,
  Droplets,
  Wind,
  Thermometer,
  Sun,
  Cloud,
  CloudDrizzle,
  TrendingUp,
  AlertCircle,
} from "lucide-react"

const defaultForecast = [
  { day: "Mon", temp: "--", condition: "--", icon: Sun, precipitation: "--", wind: "--" },
  { day: "Tue", temp: "--", condition: "--", icon: Cloud, precipitation: "--", wind: "--" },
  { day: "Wed", temp: "--", condition: "--", icon: CloudDrizzle, precipitation: "--", wind: "--" },
  { day: "Thu", temp: "--", condition: "--", icon: CloudRain, precipitation: "--", wind: "--" },
  { day: "Fri", temp: "--", condition: "--", icon: Cloud, precipitation: "--", wind: "--" },
  { day: "Sat", temp: "--", condition: "--", icon: Cloud, precipitation: "--", wind: "--" },
  { day: "Sun", temp: "--", condition: "--", icon: Sun, precipitation: "--", wind: "--" },
]

const defaultCurrentConditions = [
  { label: "Temperature", value: "--", icon: Thermometer, color: "text-chart-5" },
  { label: "Humidity", value: "--", icon: Droplets, color: "text-chart-1" },
  { label: "Wind Speed", value: "--", icon: Wind, color: "text-accent" },
  { label: "Precipitation", value: "--", icon: CloudRain, color: "text-primary" },
]

export default function FarmWeatherPage() {
  const [forecast, setForecast] = useState(defaultForecast)
  const [currentConditions, setCurrentConditions] = useState(defaultCurrentConditions)
  const [loading, setLoading] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [latInput, setLatInput] = useState('42.0308')
  const [lonInput, setLonInput] = useState('-93.5805')

  // Fetch NASA POWER demo weather for a location (example: Ames, Iowa)
  const fetchNASAPowerDemo = async (lat = 42.0308, lon = -93.5805) => {
    setLoading(true)
    try {
      // POWER API: https://power.larc.nasa.gov/docs/services/api/v2/
      const params = new URLSearchParams({
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        latitude: String(lat),
        longitude: String(lon),
        community: 'ag',
        parameters: 'T2M,RH2M,WS2M,PRECTOTCORR',
        format: 'JSON'
      })

      // Call our server API route which wraps NASA calls and adds caching
      const apiUrl = `/api/nasa-data?action=weather&lat=${lat}&lng=${lon}`
      const res = await fetch(apiUrl)
      if (!res.ok) throw new Error(`Server weather API error: ${res.status}`)
      const payload = await res.json()

      if (!payload.success) throw new Error(payload.error || 'No data')

      const summary = payload.summary
      const forecastData = payload.forecast || []

      setCurrentConditions([
        { label: 'Temperature', value: summary.temperature != null ? `${summary.temperature.toFixed(1)}°C` : '--', icon: Thermometer, color: 'text-chart-5' },
        { label: 'Humidity', value: summary.humidity != null ? `${summary.humidity.toFixed(0)}%` : '--', icon: Droplets, color: 'text-chart-1' },
        { label: 'Wind Speed', value: summary.wind != null ? `${summary.wind.toFixed(1)} m/s` : '--', icon: Wind, color: 'text-accent' },
        { label: 'Precipitation', value: summary.precipitation != null ? `${summary.precipitation.toFixed(2)} mm` : '--', icon: CloudRain, color: 'text-primary' }
      ])

      const forecastDays = forecastData.slice(0, 7).map((d: any) => ({
        day: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
        temp: d.temp != null ? `${d.temp.toFixed(0)}°C` : '--',
        condition: d.precipitation != null && d.precipitation > 1 ? 'Rain' : 'Clear',
        icon: d.precipitation != null && d.precipitation > 1 ? CloudRain : Sun,
        precipitation: d.precipitation != null ? `${d.precipitation.toFixed(1)} mm` : '--',
        wind: d.wind != null ? `${d.wind.toFixed(1)} m/s` : '--'
      }))

      setForecast(forecastDays)
    } catch (error) {
      console.error('Failed to fetch NASA POWER demo:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNASAPowerDemo()
  }, [])

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="container py-12">
        {/* Location modal trigger & modal */}
        <div className="mb-6 flex items-center justify-between">
          <div />
          <div>
            <Button variant="outline" size="sm" onClick={() => setShowLocationModal(true)}>
              Change Location
            </Button>
          </div>
        </div>

        {showLocationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLocationModal(false)} />
            <Card className="z-60 w-[min(90%,520px)]">
              <CardHeader>
                <CardTitle>Choose location</CardTitle>
                <CardDescription>Enter latitude and longitude to view NASA demo weather for that location.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    placeholder="e.g. 42.0308"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    value={lonInput}
                    onChange={(e) => setLonInput(e.target.value)}
                    placeholder="e.g. -93.5805"
                    className="mt-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={async () => {
                    const lat = parseFloat(latInput)
                    const lon = parseFloat(lonInput)
                    if (!isNaN(lat) && !isNaN(lon)) {
                      await fetchNASAPowerDemo(lat, lon)
                      setShowLocationModal(false)
                    } else {
                      // simple validation feedback
                      alert('Please enter valid numeric latitude and longitude')
                    }
                  }}>Show Weather</Button>
                  <Button variant="ghost" onClick={async () => {
                    // Use browser geolocation
                    if (!navigator.geolocation) {
                      alert('Geolocation is not supported by your browser')
                      return
                    }
                    navigator.geolocation.getCurrentPosition(async (pos) => {
                      const lat = pos.coords.latitude
                      const lon = pos.coords.longitude
                      setLatInput(String(lat))
                      setLonInput(String(lon))
                      await fetchNASAPowerDemo(lat, lon)
                      setShowLocationModal(false)
                    }, (err) => {
                      alert('Unable to retrieve your location')
                    })
                  }}>Use my location</Button>
                  <Button variant="link" onClick={() => setShowLocationModal(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/farm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <CloudRain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Weather Dashboard</h1>
              <p className="text-muted-foreground">NASA satellite data + local forecasts</p>
            </div>
          </div>
        </div>

        {/* Current Conditions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Current Conditions</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {currentConditions.map((condition) => {
              const Icon = condition.icon
              return (
                <Card key={condition.label}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${condition.color}`} />
                      <CardDescription>{condition.label}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-3xl">{condition.value}</CardTitle>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">7-Day Forecast</h2>
          <div className="grid md:grid-cols-7 gap-4">
            {forecast.map((day) => {
              const Icon = day.icon
              return (
                <Card key={day.day} className="text-center">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{day.day}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Icon className="h-10 w-10 mx-auto text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{day.temp}</p>
                      <p className="text-xs text-muted-foreground mt-1">{day.condition}</p>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center justify-center gap-1">
                        <Droplets className="h-3 w-3" />
                        {day.precipitation}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Wind className="h-3 w-3" />
                        {day.wind}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Weather Insights */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-chart-2" />
                <CardTitle>Irrigation Recommendations</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-chart-2/10 border border-chart-2/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="bg-chart-2/20 text-chart-2 border-chart-2/30">
                    Optimal
                  </Badge>
                  Next 48 Hours
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Current soil moisture is adequate. With 15mm rain expected Wednesday, delay irrigation for Fields A
                  and C until Friday.
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected rainfall (7 days):</span>
                  <span className="font-medium">27mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Evapotranspiration rate:</span>
                  <span className="font-medium">4.2mm/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Water balance:</span>
                  <span className="font-medium text-chart-2">+12mm surplus</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                <CardTitle>Weather Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">
                    Advisory
                  </Badge>
                  Heavy Rain Wednesday
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  15mm rainfall expected with 22 km/h winds. Consider postponing field operations and ensure drainage
                  systems are clear.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                    Info
                  </Badge>
                  Optimal Conditions Weekend
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Clear skies and moderate temperatures Saturday-Sunday. Ideal window for harvesting operations in Field
                  A.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NASA Data Integration */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle>Powered by NASA Earth Observations</CardTitle>
            <CardDescription>
              This forecast combines local weather data with NASA satellite measurements for enhanced accuracy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-1">GPM IMERG</h4>
                <p className="text-muted-foreground">Real-time precipitation data</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">ECOSTRESS</h4>
                <p className="text-muted-foreground">Evapotranspiration measurements</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">AIRS</h4>
                <p className="text-muted-foreground">Temperature and humidity profiles</p>
              </div>
            </div>
            <Button asChild className="mt-6">
              <Link href="/data">Explore NASA Data Sources</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
