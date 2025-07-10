import { useRouter, usePathname } from 'next/navigation'

export default function LanguageSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLang = pathname.split('/')[1] || 'en'

  const changeLanguage = (lang: string) => {
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
      <option value="fr">French</option>
    </select>
  )
}
