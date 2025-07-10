/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'pt', 'es', 'fr'],
    defaultLocale: 'en',
  },
  swcMinify: true,
}

module.exports = nextConfig
