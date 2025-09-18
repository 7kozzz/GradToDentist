import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable the development indicators (removes the "N" icon)
  devIndicators: false,
  
  // Configure external image domains
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
};

export default nextConfig;