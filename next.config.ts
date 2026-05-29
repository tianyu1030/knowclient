import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mysql2 是 Node.js 原生模块，禁止 webpack 打包它（Edge Runtime 用它就炸）
  // 标记为 external 后只在 Node.js Runtime（API Route / Server Action）加载
  serverExternalPackages: ["mysql2"],
  // 允许 DeepSeek API 的远程图片（如头像）
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.deepseek.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  // 生产环境优化
  poweredByHeader: false,
};

export default nextConfig;
