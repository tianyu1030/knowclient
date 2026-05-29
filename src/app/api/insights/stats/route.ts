/**
 * 洞察统计 API（快速，无 AI 调用）
 *
 * GET /api/insights/stats  — 获取数据概览
 */
import { auth } from "@/lib/auth";
import { getClients, getStageStats } from "@/lib/services/client-service";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const clients = await getClients({ userId: session.user.id });
  const stageStats = await getStageStats(session.user.id);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalClients = clients.length;

  const newClients = clients.filter(
    (c) => c.createdAt && new Date(c.createdAt) >= weekAgo
  ).length;

  // 待跟进 = 非"已成交"和"维护"阶段的客户，且超过建议跟进间隔未联系
  const pendingFollow = clients.filter((c) => {
    if (c.stage === "已成交" || c.stage === "维护") return false;
    if (!c.lastFollowAt) return true;
    const interval = (c.followInterval ?? 3) * 24 * 60 * 60 * 1000;
    return now.getTime() - new Date(c.lastFollowAt).getTime() > interval;
  }).length;

  const closedDeals = clients.filter((c) => c.stage === "已成交").length;

  return NextResponse.json({
    totalClients,
    newClients,
    pendingFollow,
    closedDeals,
    stageDistribution: stageStats,
  });
}
