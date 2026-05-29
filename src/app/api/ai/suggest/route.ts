/**
 * AI 建议 API
 *
 * POST /api/ai/suggest  — 获取今日跟进建议
 */
import { auth } from "@/lib/auth";
import { getClients } from "@/lib/services/client-service";
import { generateDailySuggestions } from "@/lib/services/ai-service";
import { getDb, schema } from "@/lib/db";
import { eq, and, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const db = getDb();

  // 获取用户所有客户
  const clients = await getClients({ userId: session.user.id });

  // 查询今日已 dismiss 的记录
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const dismissed = await db
    .select({ clientId: schema.aiSuggestions.clientId })
    .from(schema.aiSuggestions)
    .where(
      and(
        eq(schema.aiSuggestions.userId, session.user.id),
        eq(schema.aiSuggestions.dismissed, 1),
        gte(schema.aiSuggestions.createdAt, todayStart)
      )
    );

  const dismissedIds = new Set(dismissed.map((d) => d.clientId));

  // 过滤：今天已跟进 或 今天已推迟 的客户不传给 AI
  const filtered = clients.filter((c) => {
    // 今天已推迟
    if (dismissedIds.has(c.id)) return false;
    // 今天已跟进
    if (c.lastFollowAt) {
      const lf = new Date(c.lastFollowAt);
      if (lf >= todayStart) return false;
    }
    return true;
  });

  // 只传 AI 需要的字段，减少 token 消耗
  const summary = filtered.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
    stage: c.stage,
    lastFollowAt: c.lastFollowAt?.toISOString() || null,
    aiTags: (c.aiTags as string[]) || [],
  }));

  // 如果全部被过滤，返回空
  if (summary.length === 0) {
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      summary: "今天没有需要跟进的客户，休息一下吧 🎉",
      suggestions: [],
    });
  }

  const result = await generateDailySuggestions(summary);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    ...result,
  });
}
