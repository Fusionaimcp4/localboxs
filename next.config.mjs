/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Strict production configuration for Docker / server deployment

  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during builds
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript checks during builds
  },

  // ✅ Standard standalone build for Docker (enables runtime server rendering)
  output: 'standalone',

  // ✅ Prevent static export attempts
  trailingSlash: false,
  skipTrailingSlashRedirect: true,

  // ✅ Image optimization
  images: {
    unoptimized: true,
    domains: ['localhost', 'localboxs.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // ✅ Core performance and security
  compress: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/onboard',
        permanent: true,
      },
    ];
  },

  // ✅ Environment variables passthrough
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // ✅ Webpack configuration (keep lightweight)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('mammoth', 'canvas', 'pdf-parse');
    }
    return config;
  },

  // ✅ Allow hybrid rendering and dynamic routes safely
  experimental: {
    typedRoutes: false,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localboxs.com'],
    },
    externalDir: true,
    optimizeCss: false, // Prevent Next from failing on CSS optimization
  },

  // ✅ Ensure dynamic routes don’t break during static export
  outputFileTracingIncludes: {
    '/': ['./**/*'],
  },

  // ✅ Force Next.js to treat build as runtime-capable
  generateBuildId: async () => {
    process.env.__NEXT_PRIVATE_PREBUNDLED_REACT = 'true';
    return 'localboxs-build';
  },
};

export default nextConfig;
