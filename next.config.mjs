/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development optimizations
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during builds for faster dev
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript checks during builds for faster dev
  },
  
  // Skip static optimization for pages with dynamic content
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  
  // Skip static generation for auth pages that use search params
  // Note: Pages using useSearchParams() will be dynamically rendered
  
  // Image optimizations
  images: {
    unoptimized: true,
    domains: ['localhost', 'your-domain.com'],
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
  
  // Output configuration for server deployment
  output: 'standalone',
  
  // Experimental features for better performance
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
    // Disable static generation retry to avoid useSearchParams issues
    staticGenerationRetryCount: 0,
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
