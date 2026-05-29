/**
 * 用户资料 API
 *
 * PUT /api/user/profile  — 修改用户名
 */
import { auth } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;
  const { name } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "用户名不能为空" }, { status: 400 });
  }

  const db = getDb();
  await db
    .update(schema.users)
    .set({ name: name.trim() })
    .where(eq(schema.users.id, userId));

  return NextResponse.json({ name: name.trim() });
}
