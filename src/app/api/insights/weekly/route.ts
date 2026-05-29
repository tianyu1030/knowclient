/**
 * 周报 API（带缓存，当天只生成一次）
 *
 * GET /api/insights/weekly  — 获取 AI 周报
 */
import { auth } from "@/lib/auth";
import { getClients } from "@/lib/services/client-service";
import { generateWeeklyReport } from "@/lib/services/ai-service";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/** 判断两个日期是否为同一天 */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const db = getDb();

  // 1. 检查缓存
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, session.user.id),
  });

  if (user?.weeklyReport && user?.weeklyReportAt) {
    // 当天内生成的报告直接返回缓存
    if (isSameDay(new Date(user.weeklyReportAt), new Date())) {
      return NextResponse.json({
        report: user.weeklyReport,
        cached: true,
        cachedAt: user.weeklyReportAt,
      });
    }
  }

  // 2. 缓存过期或不存在，重新生成
  const clients = await getClients({ userId: session.user.id });

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const newClients = clients.filter(
    (c) => c.createdAt && new Date(c.createdAt) >= weekAgo
  ).length;

  const closedDeals = clients.filter((c) => c.stage === "已成交").length;

  const stats = {
    totalFollows: 0,
    newClients,
    closedDeals,
    stageChanges: [],
    topClients: clients
      .filter((c) => c.lastFollowAt)
      .sort(
        (a, b) =>
          new Date(b.lastFollowAt!).getTime() -
          new Date(a.lastFollowAt!).getTime()
      )
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        company: c.company || "",
        reason: `最近跟进: ${c.lastFollowAt ? "活跃" : "待跟进"}`,
      })),
  };

  let report: string;
  try {
    report = await generateWeeklyReport(stats);
  } catch (error) {
    console.error("[Insights] AI 周报生成失败:", error);
    // 如果有旧缓存，降级返回
    if (user?.weeklyReport) {
      return NextResponse.json({
        report: user.weeklyReport,
        cached: true,
        stale: true,
        cachedAt: user.weeklyReportAt,
      });
    }
    return NextResponse.json({ error: "周报生成失败" }, { status: 500 });
  }

  // 3. 存入缓存
  await db
    .update(schema.users)
    .set({
      weeklyReport: report,
      weeklyReportAt: new Date(),
    })
    .where(eq(schema.users.id, session.user.id));

  return NextResponse.json({
    report,
    cached: false,
    cachedAt: new Date().toISOString(),
  });
}
