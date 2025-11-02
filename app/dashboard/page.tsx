"use client"

import { useState } from "react"
import { NASAFarmNavigator } from "@/components/nasa-farm-navigator"
import FarmSidebar from "@/components/farm-sidebar"  
import GlassMobileNav from "@/components/glass-mobile-nav"
import { Safe3DLoader } from "@/components/safe-3d-loader"

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex h-screen relative">
      {/* Desktop Glass Sidebar */}
      <div className="hidden md:block glass-sidebar">
        <FarmSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>

      {/* Mobile Glass Navigation */}
      <div className="md:hidden">
        <GlassMobileNav 
          isOpen={mobileNavOpen}
          onToggle={() => setMobileNavOpen(!mobileNavOpen)}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Glass Header */}
        <div className="glass-nav p-6 border-b border-white/10">
          <div className="text-center space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">
              <span className="neon-text">NASA Farm Navigator</span>{" "}
              <span className="glass-text-primary">Dashboard</span>
            </h1>
            <p className="glass-text-secondary text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
              Learn precision agriculture through real NASA satellite data interpretation and educational farming challenges.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <div className="glass-light px-3 py-1 rounded-full">
                <span className="text-cyan-300 text-xs font-medium">🛰️ Live Data</span>
              </div>
              <div className="glass-light px-3 py-1 rounded-full">
                <span className="text-green-300 text-xs font-medium">🌱 Educational</span>
              </div>
              <div className="glass-light px-3 py-1 rounded-full">
                <span className="text-purple-300 text-xs font-medium">🎮 Interactive</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Area with Glass Background */}
        <div className="flex-1 p-4 md:p-6 overflow-auto relative">
          <div className="glass-container min-h-full">
            <NASAFarmNavigator />
          </div>
        </div>
      </div>
    </div>
  )
}