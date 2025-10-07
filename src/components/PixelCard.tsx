'use client'

import { ReactNode } from 'react'

interface PixelCardProps {
  children: ReactNode
  className?: string
  title?: string
  emoji?: string
  glowing?: boolean
}

const PixelCard = ({ children, className = '', title, emoji, glowing = false }: PixelCardProps) => {
  return (
    <div className={`
      relative bg-gradient-to-br from-gray-800 via-gray-900 to-black
      border-4 border-white 
      ${className}
      ${glowing ? 'shadow-2xl shadow-blue-500/50' : 'shadow-xl'}
      transition-all duration-300 hover:shadow-2xl hover:shadow-white/20
      overflow-hidden
    `}
    style={{ imageRendering: 'pixelated' }}
    >
      {/* Pixel pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.1) 50%),
              linear-gradient(0deg, transparent 50%, rgba(255,255,255,0.1) 50%)
            `,
            backgroundSize: '4px 4px'
          }}
        />
      </div>

      {/* Glowing border effect */}
      {glowing && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur opacity-30 animate-pulse"></div>
      )}

      {/* Header with title and emoji */}
      {(title || emoji) && (
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 border-b-4 border-white p-4">
          <div className="flex items-center space-x-3">
            {emoji && (
              <span className="text-3xl animate-bounce" style={{ animationDuration: '2s' }}>
                {emoji}
              </span>
            )}
            {title && (
              <h3 className="text-xl font-bold text-white pixel-card-title tracking-wider">
                {title}
              </h3>
            )}
          </div>
          
          {/* Decorative pixels */}
          <div className="absolute top-2 right-2 flex space-x-1">
            <div className="w-2 h-2 bg-yellow-400 animate-pulse"></div>
            <div className="w-2 h-2 bg-green-400 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 bg-red-400 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative p-6">
        {children}
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-yellow-400 opacity-60"></div>
      <div className="absolute top-0 right-0 w-0 h-0 border-r-[20px] border-r-transparent border-t-[20px] border-t-green-400 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-red-400 opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-0 h-0 border-r-[20px] border-r-transparent border-b-[20px] border-b-blue-400 opacity-60"></div>
    </div>
  )
}

export default PixelCard