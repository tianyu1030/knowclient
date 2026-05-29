/**
 * 客户 API — 列表 & 新增
 *
 * GET  /api/clients        — 获取客户列表（支持搜索、阶段筛选）
 * POST /api/clients        — 新增客户
 */
import { auth } from "@/lib/auth";
import { getClients, createClient } from "@/lib/services/client-service";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/clients?search=xxx&stage=xxx */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const stage = searchParams.get("stage") || undefined;

  const clients = await getClients({
    userId: session.user.id,
    search,
    stage,
  });

  return NextResponse.json(clients);
}

/** POST /api/clients — 新增客户 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const { name, company, title, phone, email, stage } = body;

  if (!name) {
    return NextResponse.json({ error: "姓名不能为空" }, { status: 400 });
  }

  const id = await createClient({
    userId: session.user.id,
    name,
    company,
    title,
    phone,
    email,
    stage,
  });

  return NextResponse.json({ id }, { status: 201 });
}
