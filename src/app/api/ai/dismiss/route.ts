/**
 * AI 建议 dismiss API
 *
 * POST /api/ai/dismiss  — 推迟某客户的今日跟进建议
 */
import { auth } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { clientId } = await req.json();
  if (!clientId) {
    return NextResponse.json({ error: "缺少 clientId" }, { status: 400 });
  }

  const db = getDb();

  await db.insert(schema.aiSuggestions).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    clientId,
    suggestion: "用户手动推迟",
    priority: "normal",
    dismissed: 1,
  });

  return NextResponse.json({ success: true });
}
