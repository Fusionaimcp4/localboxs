/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development optimizations
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during builds for faster dev
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript checks during builds for faster dev
  },
  
  // Output configuration for server deployment
  // output: 'standalone', // Temporarily disabled due to build issues
  
  // Disable static export to avoid conflicts with standalone output
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  
  // Explicitly disable static export
  distDir: '.next',
  
  // Disable static generation for pages with useSearchParams
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
  
  // Disable static optimization entirely
  staticPageGenerationTimeout: 0,
  
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
