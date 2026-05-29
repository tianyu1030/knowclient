/**
 * AI 自然语言查询 API
 *
 * POST /api/ai/query  — 用户用自然语言提问，AI分析数据后回答
 */
import { auth } from "@/lib/auth";
import { getClients, getStageStats } from "@/lib/services/client-service";
import { queryInsight } from "@/lib/services/ai-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { question } = await req.json();
  if (!question) {
    return NextResponse.json({ error: "问题不能为空" }, { status: 400 });
  }

  // 构建数据上下文
  const clients = await getClients({ userId: session.user.id });
  const stageStats = await getStageStats(session.user.id);

  const context = JSON.stringify({
    totalClients: clients.length,
    stageDistribution: stageStats,
    clients: clients.slice(0, 30).map((c) => ({
      name: c.name,
      company: c.company,
      stage: c.stage,
      lastFollowAt: c.lastFollowAt,
      tags: c.aiTags,
    })),
  });

  const answer = await queryInsight(question, context);
  return NextResponse.json({ answer });
}
