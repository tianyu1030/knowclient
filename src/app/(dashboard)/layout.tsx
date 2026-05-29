/**
 * 知客 KnowClient — 仪表盘 layout（服务端认证守卫）
 *
 * 认证检查在这里做（Node.js Runtime），不放在 middleware（Edge Runtime）。
 * Edge 无法加载 mysql2，会导致 "node:diagnostics_channel" 构建错误。
 */
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayoutInner from "./layout-inner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return <DashboardLayoutInner>{children}</DashboardLayoutInner>;
}
