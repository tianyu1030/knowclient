/**
 * 客户 API — 单个客户 CRUD
 *
 * GET    /api/clients/[id]  — 获取客户详情（含沟通记录、待办）
 * PUT    /api/clients/[id]  — 更新客户信息
 * DELETE /api/clients/[id]  — 删除客户
 */
import { auth } from "@/lib/auth";
import {
  getClientDetail,
  updateClient,
  deleteClient,
} from "@/lib/services/client-service";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/clients/[id] */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const client = await getClientDetail({
    userId: session.user.id,
    clientId: id,
  });

  if (!client) {
    return NextResponse.json({ error: "客户不存在" }, { status: 404 });
  }

  return NextResponse.json(client);
}

/** PUT /api/clients/[id] */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  await updateClient({
    userId: session.user.id,
    clientId: id,
    data: body,
  });

  return NextResponse.json({ success: true });
}

/** DELETE /api/clients/[id] */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  await deleteClient({ userId: session.user.id, clientId: id });

  return NextResponse.json({ success: true });
}
