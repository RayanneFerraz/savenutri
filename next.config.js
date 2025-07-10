/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'pt', 'es'],
    defaultLocale: 'en',
  },
  swcMinify: true,
}

module.exports = nextConfig
