'use client';
import { useTranslations } from 'next-intl';
import LanguageSelector from '../../components/LanguageSelector';
import { AnalyticsService } from '../../lib/analytics';
import { autoTranslate } from '../../lib/auto-translate';
import { useEffect, useState } from 'react';

export default function Home({ params: { lang } }: { params: { lang: string } }) {
  const t = useTranslations('common');
  const [dynamicText, setDynamicText] = useState('Hello, world!');

  useEffect(() => {
    AnalyticsService.initializeSession();
    autoTranslate('Hello, world!', lang).then(setDynamicText);
  }, [lang]);

  return (
    <div style={{ padding: '20px' }}>
      <LanguageSelector />
      <h1>{t('welcome')}</h1>
      <p>{t('description')}</p>
      <p>Dynamic: {dynamicText}</p>
    </div>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      messages: (await import(`../../locales/${locale}/common.json`)).default,
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { lang: 'en' } },
      { params: { lang: 'pt' } },
      { params: { lang: 'es' } },
    ],
    fallback: false,
  };
}
