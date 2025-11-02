/**
 * Settings Button Component
 * Reusable settings button with integrated panel
 */

"use client"

import { useState } from 'react'
import { Settings } from 'lucide-react'
import SettingsPanel from '@/components/settings-panel'

interface SettingsButtonProps {
  onSettingsChange?: (settings: any) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'ghost'
}

export default function SettingsButton({ 
  onSettingsChange, 
  className = '', 
  size = 'md',
  variant = 'default' 
}: SettingsButtonProps) {
  const [showSettings, setShowSettings] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-3'
  }

  const variantClasses = {
    default: 'glass-button hover:scale-110',
    primary: 'glass-button-primary hover:scale-110',
    ghost: 'hover:glass-light hover:scale-110'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <>
      <button
        onClick={() => setShowSettings(true)}
        className={`
          ${sizeClasses[size]} 
          ${variantClasses[variant]} 
          rounded-lg transition-all duration-200
          ${className}
        `}
        title="Settings"
      >
        <Settings className={`${iconSizes[size]} text-cyan-400`} />
      </button>

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={onSettingsChange}
      />
    </>
  )
}