/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      "lh3.googleusercontent.com",
      "pbs.twimg.com",
      "images.unsplash.com",
      "logos-world.net",
      "images.pexels.com",
      "img.freepik.com",
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Disable image optimization for Netlify to prevent 502/400 errors
    unoptimized: process.env.NETLIFY === 'true',
  },
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    // Fix for MongoDB DNS module resolution issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        'child_process': false,
        'mongodb-client-encryption': false,
        'aws4': false,
        '@aws-sdk/credential-providers': false,
        '@aws-sdk/credential-provider-imds': false,
        '@aws-sdk/credential-provider-ini': false,
        '@aws-sdk/credential-provider-node': false,
        '@aws-sdk/credential-provider-process': false,
        '@aws-sdk/credential-provider-sso': false,
        '@aws-sdk/credential-provider-web-identity': false,
        'snappy': false,
        'kerberos': false,
        '@mongodb-js/zstd': false,
        'gcp-metadata': false,
        'socks': false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
