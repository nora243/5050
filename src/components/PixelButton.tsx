'use client'

import { ReactNode } from 'react'

interface PixelButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  loading?: boolean
}

const PixelButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false
}: PixelButtonProps) => {
  
  const variantClasses = {
    primary: 'bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 border-blue-800',
    secondary: 'bg-gradient-to-b from-gray-500 to-gray-700 hover:from-gray-400 hover:to-gray-600 border-gray-800',
    success: 'bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 border-green-800',
    danger: 'bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 border-red-800',
    warning: 'bg-gradient-to-b from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 border-yellow-800'
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const LoadingDots = () => (
    <div className="flex items-center space-x-1">
      <div className="w-2 h-2 bg-white animate-pulse"></div>
      <div className="w-2 h-2 bg-white animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-white animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  )

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
        relative font-bold text-white uppercase tracking-wider
        border-4 border-b-8 
        transform transition-all duration-100 ease-in-out
        hover:transform hover:scale-105
        active:transform active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        disabled:hover:scale-100
        pixel-font
        shadow-lg hover:shadow-xl
        ${loading ? 'cursor-wait' : 'cursor-pointer'}
      `}
      style={{
        imageRendering: 'pixelated',
        textShadow: '2px 2px 0px rgba(0,0,0,0.8)'
      }}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading ? <LoadingDots /> : children}
      </div>
      
      {/* Pixel corners effect */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-white opacity-30"></div>
      <div className="absolute top-0 right-0 w-2 h-2 bg-white opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-black opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-black opacity-30"></div>
    </button>
  )
}

export default PixelButton