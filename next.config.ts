import type { NextConfig } from "next";

// Gitee 项目页地址为 username.gitee.io/仓库名，需设置 basePath
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true, // 生成 xxx/index.html，改善静态托管兼容性，避免点击下载 HTML
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true, // 与 output: 'export' 兼容
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sts2.runthesim.ai",
        pathname: "/assets/card-portraits/**",
      },
      {
        protocol: "https",
        hostname: "sts2.runthesim.ai",
        pathname: "/assets/relic-images/**",
      },
      {
        protocol: "https",
        hostname: "sts2.runthesim.ai",
        pathname: "/assets/monster-images/**",
      },
      {
        protocol: "https",
        hostname: "sts2.runthesim.ai",
        pathname: "/assets/potion-images/**",
      },
    ],
  },
};

export default nextConfig;
