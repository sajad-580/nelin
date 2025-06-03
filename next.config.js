module.exports = {
  eslint: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  images: {
    // domains: ['hq.nelin.co'],
  },
  serverRuntimeConfig: {
    maxPayloadSize: 52428800, // 1MB as an example
  },
}
