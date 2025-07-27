import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 图片优化配置（Cloudflare Pages兼容）
  images: {
    unoptimized: true,
  },
  
  // 资源路径配置
  assetPrefix: undefined,
  
  // 禁用某些功能以确保与Cloudflare Pages兼容
  poweredByHeader: false,
  
  // ESLint配置
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript配置
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
