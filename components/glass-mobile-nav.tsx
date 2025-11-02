/**
 * Responsive Glass Mobile Navigation
 * Liquid glass design for mobile devices
 */

"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  Home, 
  Satellite, 
  BarChart3, 
  Target,
  Droplets,
  Leaf,
  ThermometerSun,
  CloudRain,
  Calendar,
  Users,
  Trophy,
  BookOpen
} from 'lucide-react'

interface MobileNavProps {
  isOpen: boolean
  onToggle: () => void
}

const navigationItems = [
  {
    title: "Core",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Farm Simulation", href: "/farm/simulation", icon: Satellite },
      { name: "Analytics", href: "/reports", icon: BarChart3 },
      { name: "Challenges", href: "/challenges", icon: Target }
    ]
  },
  {
    title: "NASA Data",
    items: [
      { name: "Soil Moisture", href: "/data/soil-moisture", icon: Droplets },
      { name: "Vegetation", href: "/data/vegetation", icon: Leaf },
      { name: "Temperature", href: "/data/temperature", icon: ThermometerSun },
      { name: "Precipitation", href: "/data/precipitation", icon: CloudRain }
    ]
  },
  {
    title: "Community",
    items: [
      { name: "Multiplayer", href: "/multiplayer", icon: Users },
      { name: "Leaderboards", href: "/leaderboards", icon: Trophy },
      { name: "Learning Hub", href: "/learn", icon: BookOpen }
    ]
  }
]

export default function GlassMobileNav({ isOpen, onToggle }: MobileNavProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-4 left-4 z-50 glass-button p-3 rounded-xl"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-cyan-400" />
        ) : (
          <Menu className="w-6 h-6 text-cyan-400" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Mobile Navigation Panel */}
      <div className={`
        md:hidden fixed left-0 top-0 h-full w-80 z-50
        glass-sidebar transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="p-6 border-b border-white/10 mt-16">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 glass-light neon-border rounded-xl flex items-center justify-center">
                <Satellite className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h2 className="glass-text-primary font-bold text-lg">TerraAI Farm</h2>
                <p className="glass-text-secondary text-sm">NASA Navigator</p>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="space-y-4">
              {navigationItems.map((section, sectionIndex) => (
                <div key={sectionIndex} className="px-4">
                  <h3 className="glass-text-muted text-xs font-bold uppercase tracking-wider mb-3 px-3">
                    {section.title}
                  </h3>
                  
                  <div className="space-y-2">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const active = isActive(item.href)
                      
                      return (
                        <Link key={item.href} href={item.href} onClick={onToggle}>
                          <div className={`
                            flex items-center space-x-4 px-4 py-3 rounded-xl
                            transition-all duration-300 group relative overflow-hidden
                            ${active 
                              ? 'glass-light neon-border neon-text' 
                              : 'glass-text-secondary hover:glass-light hover:glass-text-primary hover:scale-105'
                            }
                          `}>
                            <Icon className={`w-6 h-6 flex-shrink-0 transition-colors duration-300 ${
                              active ? 'text-cyan-400' : 'group-hover:text-cyan-400'
                            }`} />
                            <span className="text-base font-medium">{item.name}</span>
                            {active && (
                              <div className="ml-auto w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                            )}
                            {active && (
                              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 opacity-50" />
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                  
                  {sectionIndex < navigationItems.length - 1 && (
                    <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="glass-light p-4 rounded-xl text-center">
              <p className="glass-text-secondary text-sm">
                🛰️ Live NASA Data
              </p>
              <p className="glass-text-muted text-xs mt-1">
                Real-time satellite integration
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}