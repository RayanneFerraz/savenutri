import { useTranslations } from 'next-intl'
import LanguageSelector from '../../components/LanguageSelector'

export default function Home() {
  const t = useTranslations('common')

  return (
    <div style={{ padding: '20px' }}>
      <LanguageSelector />
      <h1>{t('welcome')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      messages: (await import(`../../locales/${locale}/common.json`)).default,
    },
  }
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { lang: 'en' } },
      { params: { lang: 'pt' } },
      { params: { lang: 'es' } },
      { params: { lang: 'fr' } },
    ],
    fallback: false,
  }
}
