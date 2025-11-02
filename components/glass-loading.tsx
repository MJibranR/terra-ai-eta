/**
 * Glass Loading Components
 * Beautiful liquid glass loading states
 */

"use client"

import { Satellite, Loader2, Sparkles } from 'lucide-react'

interface GlassLoadingProps {
  message?: string
  submessage?: string
  type?: 'default' | 'nasa' | 'farm' | 'data'
}

export function GlassLoading({ 
  message = "Loading...", 
  submessage,
  type = 'default' 
}: GlassLoadingProps) {
  const getIcon = () => {
    switch (type) {
      case 'nasa':
        return <Satellite className="w-12 h-12 md:w-16 md:h-16 text-cyan-400 animate-pulse" />
      case 'farm':
        return <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-green-400 animate-pulse" />
      case 'data':
        return <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-blue-400 animate-spin" />
      default:
        return <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-cyan-400 animate-spin" />
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="glass-container glass-float text-center p-8 md:p-12 max-w-md mx-auto">
        <div className="mb-6">
          {getIcon()}
        </div>
        
        <h2 className="glass-text-primary text-xl md:text-2xl font-bold mb-3">
          {message}
        </h2>
        
        {submessage && (
          <p className="glass-text-secondary text-sm md:text-base mb-6">
            {submessage}
          </p>
        )}
        
        {/* Animated progress dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200" />
        </div>
        
        {/* Glass shimmer effect */}
        <div className="glass-loader mt-4 h-2 rounded-full bg-white/10">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )
}

// Skeleton loaders with glass effect
export function GlassCardSkeleton() {
  return (
    <div className="glass-container glass-loader p-6 space-y-4">
      <div className="h-4 bg-white/10 rounded-full animate-pulse" />
      <div className="h-4 bg-white/10 rounded-full animate-pulse w-3/4" />
      <div className="h-8 bg-white/10 rounded-lg animate-pulse" />
    </div>
  )
}

export function GlassGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="glass-grid">
      {Array.from({ length: count }, (_, i) => (
        <GlassCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Page loading wrapper
export function GlassPageLoading({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <div className="glass-container min-h-screen flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}