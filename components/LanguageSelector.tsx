"use client";
import { useRouter, usePathname } from 'next/navigation'
import { useLanguage } from '@/context/languageContext'
import type { Language } from '@/lib/translations'

export default function LanguageSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()
  const currentLang = pathname.split('/')[1] || language

  const changeLanguage = (lang: string) => {
    setLanguage(lang as Language)
    router.push(`/${lang}`)
  }

  return (
    <select
      value={currentLang}
      onChange={(e) => changeLanguage(e.target.value)}
      style={{ padding: '8px', fontSize: '16px', borderRadius: '4px' }}
    >
      <option value="en">English</option>
      <option value="pt">Portuguese</option>
      <option value="es">Spanish</option>
    </select>
  )
}
