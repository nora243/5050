'use client'

import { useState, useEffect } from 'react'

const PixelTitle = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Create pixel grid for "50-50" text
  const createPixelLetter = (letter: string, letterIndex: number) => {
    const patterns: { [key: string]: boolean[][] } = {
      '5': [
        [true, true, true, true],
        [true, false, false, false],
        [true, true, true, true],
        [false, false, false, true],
        [true, true, true, true]
      ],
      '0': [
        [true, true, true, true],
        [true, false, false, true],
        [true, false, false, true],
        [true, false, false, true],
        [true, true, true, true]
      ],
      '-': [
        [false, false, false, false],
        [false, false, false, false],
        [true, true, true, true],
        [false, false, false, false],
        [false, false, false, false]
      ]
    }

    const pattern = patterns[letter] || patterns['0']
    
    return (
      <div key={letterIndex} className="inline-block mr-1 sm:mr-2 md:mr-3 lg:mr-4">
        {pattern.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((pixel, colIndex) => {
              const pixelIndex = letterIndex * 100 + rowIndex * 10 + colIndex
              const isHovered = hoveredIndex === pixelIndex
              const isNearHover = hoveredIndex !== null && 
                Math.abs(pixelIndex - hoveredIndex) <= 1
              
              return (
                <div
                  key={colIndex}
                  className={`w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 m-0.5 sm:m-1 transition-all duration-300 cursor-pointer ${
                    pixel 
                      ? isHovered 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg transform scale-110' 
                        : isNearHover
                        ? 'bg-gradient-to-br from-green-400 to-blue-500 transform scale-105'
                        : 'bg-gradient-to-br from-red-500 to-pink-600'
                      : 'bg-gray-800 opacity-30'
                  } ${
                    pixel ? 'shadow-md hover:shadow-xl' : ''
                  }`}
                  style={{
                    imageRendering: 'pixelated',
                    boxShadow: pixel 
                      ? isHovered 
                        ? '0 0 20px rgba(255, 193, 7, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.2)' 
                        : isNearHover
                        ? '0 0 15px rgba(34, 197, 94, 0.6)'
                        : '0 0 10px rgba(239, 68, 68, 0.4)'
                      : 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
                  }}
                  onMouseEnter={() => setHoveredIndex(pixelIndex)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center py-4 sm:py-6 md:py-8 select-none">
      <div className="flex items-center justify-center bg-gray-900 p-2 sm:p-4 md:p-6 lg:p-8 rounded-lg sm:rounded-xl md:rounded-2xl border-2 sm:border-3 md:border-4 border-white shadow-2xl">
        <div className="flex items-center justify-center overflow-x-auto">
          {['5', '0', '-', '5', '0'].map((letter, index) => 
            createPixelLetter(letter, index)
          )}
        </div>
      </div>
    </div>
  )
}

export default PixelTitle