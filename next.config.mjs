/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development optimizations
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during builds for faster dev
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript checks during builds for faster dev
  },
  
  // Disable static export to avoid build-time database requirements
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  
  // Disable static generation completely
  // Force all pages to be dynamic (no static generation)
  
  // Disable static optimization entirely
  staticPageGenerationTimeout: 0,
  
  // Force dynamic rendering for all pages
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast'
    ],
    // Disable static generation
    staticGenerationRetryCount: 0,
  },
  
  // Experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast'
    ],
  },
  
  // Image optimizations
  images: {
    unoptimized: true,
    domains: ['localhost', 'localboxs.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Security headers (simplified for dev)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/onboard',
        permanent: true,
      },
    ];
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Webpack optimizations for development
  webpack: (config, { dev, isServer }) => {
    // Externalize heavy packages for server-side only
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('mammoth', 'canvas', 'pdf-parse');
    }
    
    return config;
  },
}

export default nextConfig
