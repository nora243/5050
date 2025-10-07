'use client'

import { useLanguage, Language } from '@/hooks/useLanguage'
import PixelButton from './PixelButton'

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage()

  const handleLanguageChange = (newLanguage: Language) => {
    changeLanguage(newLanguage)
    // Auto reload page after language change
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  return (
    <div className="flex items-center space-x-2 pl-8">
      <PixelButton
        onClick={() => handleLanguageChange('en')}
        variant={language === 'en' ? 'primary' : 'secondary'}
        size="sm"
        className="text-sm"
      >
        🇺🇸 EN
      </PixelButton>
      <PixelButton
        onClick={() => handleLanguageChange('vi')}
        variant={language === 'vi' ? 'primary' : 'secondary'}
        size="sm"
        className="text-sm"
      >
        🇻🇳 VI
      </PixelButton>
    </div>
  )
}

export default LanguageSwitcher