/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: 'C:/Users/Remesas-Despachos/Desktop/Trazabilidad',
  },
  serverExternalPackages: ["@resvg/resvg-js"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Expose environment variables for production
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    ADMIN_USER: process.env.ADMIN_USER,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    AUTH_SECRET: process.env.AUTH_SECRET,
  },
}

export default nextConfig
