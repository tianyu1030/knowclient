/**
 * AI 解析 API
 *
 * POST /api/ai/parse  — 预览 AI 解析结果（不保存，用于"新增客户"页面的一句話录入）
 */
import { auth } from "@/lib/auth";
import { parseNote } from "@/lib/services/ai-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "文本不能为空" }, { status: 400 });
  }

  const result = await parseNote(text);
  return NextResponse.json(result);
}
