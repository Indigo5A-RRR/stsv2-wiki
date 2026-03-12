import type { NextConfig } from "next";

// Gitee 项目页地址为 username.gitee.io/仓库名，需设置 basePath
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
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
