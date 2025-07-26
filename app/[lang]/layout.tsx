import { NextIntlClientProvider } from 'next-intl'

export default async function RootLayout({ children, params: { lang } }: { children: React.ReactNode; params: { lang: string } }) {
  const messages = await import(`../../locales/${lang}/common.json`)

  return (
    <html lang={lang}>
      <body>
        <NextIntlClientProvider locale={lang} messages={messages.default}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
