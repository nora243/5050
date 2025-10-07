'use client'

import { useEffect } from 'react'
import PixelButton from './PixelButton'

interface TransactionPopupProps {
  isOpen: boolean
  onClose: () => void
  status: 'pending' | 'success' | 'error' | null
  hash?: string
  errorMessage?: string
  language: 'en' | 'vi'
}

export default function TransactionPopup({ 
  isOpen, 
  onClose, 
  status, 
  hash, 
  errorMessage, 
  language 
}: TransactionPopupProps) {
  useEffect(() => {
    if (status === 'success') {
      // Auto close after 5 seconds for success
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [status, onClose])

  if (!isOpen || !status) return null

  const getContent = () => {
    switch (status) {
      case 'pending':
        return {
          icon: '🚀',
          title: language === 'vi' ? 'Đang xử lý giao dịch...' : 'Processing Transaction...',
          message: language === 'vi' 
            ? 'Vui lòng đợi trong khi blockchain xử lý giao dịch của bạn'
            : 'Please wait while the blockchain processes your transaction',
          bgColor: 'from-blue-600 to-purple-600',
          showSpinner: true
        }
      case 'success':
        return {
          icon: '🎉',
          title: language === 'vi' ? 'Giao dịch thành công!' : 'Transaction Successful!',
          message: language === 'vi' 
            ? 'Game đã được tạo thành công. Đang chờ kết quả...'
            : 'Game created successfully. Waiting for result...',
          bgColor: 'from-green-600 to-emerald-600',
          showSpinner: false
        }
      case 'error':
        return {
          icon: '❌',
          title: language === 'vi' ? 'Giao dịch thất bại!' : 'Transaction Failed!',
          message: errorMessage || (language === 'vi' 
            ? 'Đã có lỗi xảy ra khi xử lý giao dịch'
            : 'An error occurred while processing the transaction'),
          bgColor: 'from-red-600 to-pink-600',
          showSpinner: false
        }
      default:
        return null
    }
  }

  const content = getContent()
  if (!content) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className={`
        relative bg-gradient-to-br ${content.bgColor}
        rounded-2xl p-6 max-w-md w-full mx-4
        border-4 border-white shadow-2xl
        transform transition-all duration-300
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        {/* Pixel pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="w-full h-full rounded-2xl"
            style={{
              backgroundImage: `
                linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.1) 50%),
                linear-gradient(0deg, transparent 50%, rgba(255,255,255,0.1) 50%)
              `,
              backgroundSize: '4px 4px'
            }}
          />
        </div>

        {/* Close button */}
        {status !== 'pending' && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-gray-300 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition-all"
          >
            ×
          </button>
        )}

        {/* Content */}
        <div className="relative text-center space-y-4">
          {/* Icon with animation */}
          <div className={`text-6xl mb-4 ${content.showSpinner ? 'animate-spin' : 'animate-bounce'}`}>
            {content.icon}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white pixel-font">
            {content.title}
          </h2>

          {/* Message */}
          <p className="text-white text-sm leading-relaxed">
            {content.message}
          </p>

          {/* Transaction Hash */}
          {hash && status === 'success' && (
            <div className="bg-black bg-opacity-30 rounded-lg p-3 mt-4">
              <p className="text-xs text-gray-300 mb-1">
                {language === 'vi' ? 'Hash giao dịch:' : 'Transaction Hash:'}
              </p>
              <p className="text-blue-300 font-mono text-xs break-all">
                {hash}
              </p>
              <a
                href={`https://basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs underline mt-1 inline-block"
              >
                {language === 'vi' ? 'Xem trên Explorer' : 'View on Explorer'}
              </a>
            </div>
          )}

          {/* Loading spinner for pending */}
          {content.showSpinner && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <div className="pixel-loading"></div>
              <div className="pixel-loading"></div>
              <div className="pixel-loading"></div>
            </div>
          )}

          {/* Action buttons */}
          {status === 'error' && (
            <div className="flex gap-2 mt-6">
              <PixelButton
                onClick={onClose}
                variant="secondary"
                size="sm"
              >
                {language === 'vi' ? 'Đóng' : 'Close'}
              </PixelButton>
            </div>
          )}

          {status === 'success' && (
            <div className="text-xs text-white opacity-75 mt-4">
              {language === 'vi' 
                ? 'Popup sẽ tự đóng sau 5 giây...'
                : 'This popup will close in 5 seconds...'
              }
            </div>
          )}
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-0 h-0 border-l-[15px] border-l-transparent border-t-[15px] border-t-yellow-400 opacity-60"></div>
        <div className="absolute top-0 right-0 w-0 h-0 border-r-[15px] border-r-transparent border-t-[15px] border-t-green-400 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[15px] border-l-transparent border-b-[15px] border-b-red-400 opacity-60"></div>
        <div className="absolute bottom-0 right-0 w-0 h-0 border-r-[15px] border-r-transparent border-b-[15px] border-b-blue-400 opacity-60"></div>
      </div>
    </div>
  )
}