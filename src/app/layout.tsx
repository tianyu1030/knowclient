/**
 * 知客 KnowClient — 根布局
 */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "知客 KnowClient",
  description: "AI客户管理 — 懂客户，更懂你",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
