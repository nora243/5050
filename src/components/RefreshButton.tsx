'use client'

interface RefreshButtonProps {
  /** Function to call when refresh button is clicked */
  onRefresh: () => void
  /** Tooltip text to show on hover */
  title: string
  /** Whether the button is in loading state (shows spinning animation) */
  isLoading?: boolean
  /** Whether the button is disabled */
  disabled?: boolean
  /** Custom CSS classes for positioning and styling */
  className?: string
  /** Size of the icon (default: 4) */
  size?: number
  /** Color variant of the button */
  variant?: 'default' | 'primary' | 'success' | 'warning'
}

const variantClasses = {
  default: 'text-gray-400 hover:text-white',
  primary: 'text-blue-400 hover:text-blue-200',
  success: 'text-green-400 hover:text-green-200',
  warning: 'text-yellow-400 hover:text-yellow-200'
}

export default function RefreshButton({ 
  onRefresh, 
  title, 
  isLoading = false, 
  disabled = false,
  className = "absolute top-4 right-4",
  size = 4,
  variant = 'default'
}: RefreshButtonProps) {
  const colorClasses = variantClasses[variant]
  
  return (
    <button
      onClick={onRefresh}
      className={`${className} p-1 ${colorClasses} transition-all duration-200 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 active:scale-95'
      } ${isLoading ? 'opacity-75' : ''}`}
      title={isLoading ? 'Loading...' : title}
      disabled={disabled}
      aria-label={title}
    >
      <svg 
        className={`w-${size} h-${size} transition-transform duration-200 ${
          isLoading ? 'animate-spin' : 'hover:rotate-45'
        }`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
    </button>
  )
}