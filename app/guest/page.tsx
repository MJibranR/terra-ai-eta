/**
 * Guest Entry Screen
 * First landing page for new users
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Satellite, 
  User, 
  Play, 
  Globe, 
  Sparkles,
  ArrowRight,
  Users,
  BookOpen,
  Trophy,
  Shield,
  Settings,
  Sprout,
  Loader2
} from "lucide-react"

export default function GuestPage() {
  const [guestName, setGuestName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGuestEntry = async () => {
    setIsLoading(true)
    
    // Simulate session creation
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Store guest session
    localStorage.setItem('terra-ai-session', JSON.stringify({
      type: 'guest',
      name: guestName || 'Guest Farmer',
      startTime: new Date().toISOString(),
      progress: {
        onboarding: false,
        firstSimulation: false,
        completedChallenges: 0
      }
    }))
    
    // Redirect to onboarding
    router.push('/onboarding')
  }

  const features = [
    {
      icon: Satellite,
      title: 'Real NASA Data',
      description: 'Access live satellite data from SMAP, MODIS, and GPM missions'
    },
    {
      icon: Globe,
      title: 'Global Farms',
      description: 'Manage farms across different climates and agricultural zones'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Insights',
      description: 'Get intelligent recommendations based on satellite analysis'
    },
    {
      icon: Users,
      title: 'Educational Gaming',
      description: 'Learn precision agriculture through interactive scenarios'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="max-w-6xl w-full space-y-8">
        {/* Main Header Glass Container */}
        <div className="glass-container glass-float text-center space-y-6 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 glass-container neon-border flex items-center justify-center">
                <Satellite className="w-12 h-12 md:w-14 md:h-14 neon-text" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-2">
                <span className="neon-text">TerraAI</span>
              </h1>
              <p className="text-lg md:text-xl glass-text-secondary">
                NASA Farm Navigator
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold glass-text-primary">
              Welcome to the Future of Agriculture
            </h2>
            <p className="text-lg md:text-xl glass-text-secondary max-w-3xl mx-auto leading-relaxed">
              Experience precision farming with real NASA satellite data, 
              AI-powered insights, and immersive 3D visualization.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="glass-light px-4 py-2 rounded-full border border-green-400/30">
              <div className="flex items-center gap-2 text-green-300">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">No Registration Required</span>
              </div>
            </div>
            <div className="glass-light px-4 py-2 rounded-full border border-blue-400/30">
              <div className="flex items-center gap-2 text-blue-300">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Educational Experience</span>
              </div>
            </div>
            <div className="glass-light px-4 py-2 rounded-full border border-purple-400/30">
              <div className="flex items-center gap-2 text-purple-300">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">Gamified Learning</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Guest Entry Form - Glass Container */}
          <div className="glass-container glass-card-hover p-8">
            <div className="text-center pb-6">
              <h3 className="flex items-center justify-center gap-3 glass-text-primary text-2xl font-bold mb-3">
                <div className="w-10 h-10 glass-light rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-cyan-400" />
                </div>
                Start Your Farm Journey
              </h3>
              <p className="glass-text-secondary text-lg">
                Enter as a guest to explore NASA-powered agricultural simulation
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="guestName" className="glass-text-primary text-sm font-medium block">
                  Farmer Name (Optional)
                </label>
                <input
                  id="guestName"
                  type="text"
                  placeholder="Enter your name or stay anonymous"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="glass-input w-full text-lg"
                />
              </div>

              <button 
                onClick={handleGuestEntry}
                disabled={isLoading}
                className="glass-button-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-3 transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Session...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Enter Simulation
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-xs glass-text-muted">
                  No account needed • Free access • Educational purpose
                </p>
              </div>
            </div>
          </div>

          {/* Features Preview - Glass Grid */}
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold glass-text-primary mb-6">What You'll Experience</h3>
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="glass-container glass-card-hover flex items-start gap-4 p-6 transition-all duration-300">
                    <div className="w-12 h-12 glass-light neon-border rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                    <div>
                      <h4 className="glass-text-primary font-semibold text-lg">{feature.title}</h4>
                      <p className="glass-text-secondary text-sm mt-1">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Alternative Options - Glass Container */}
        <div className="glass-container p-8">
          <div className="text-center space-y-6">
            <h3 className="glass-text-primary font-bold text-xl">Alternative Access Options</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/setup" className="glass-button-secondary flex items-center justify-center gap-2 px-6 py-3 no-underline">
                <Settings className="w-4 h-4" />
                Configure NASA APIs
              </Link>
              <Link href="/learn" className="glass-button-secondary flex items-center justify-center gap-2 px-6 py-3 no-underline">
                <BookOpen className="w-4 h-4" />
                Learning Resources
              </Link>
              <Link href="/" className="glass-button-secondary flex items-center justify-center gap-2 px-6 py-3 no-underline">
                <Globe className="w-4 h-4" />
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}