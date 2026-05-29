/**
 * 注册 API
 *
 * POST /api/auth/register  — 邮箱 + 密码注册
 */
import { getDb, schema } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // 校验
  if (!email || !password) {
    return NextResponse.json(
      { error: "邮箱和密码不能为空" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "密码至少 6 位" },
      { status: 400 }
    );
  }

  const db = getDb();

  // 检查邮箱是否已注册
  const existing = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email.trim()),
  });

  if (existing) {
    return NextResponse.json(
      { error: "该邮箱已注册，请直接登录" },
      { status: 409 }
    );
  }

  // 创建用户
  const id = crypto.randomUUID();
  const hashed = await hashPassword(password);

  await db.insert(schema.users).values({
    id,
    email: email.trim(),
    name: email.trim().split("@")[0],
    password: hashed,
  });

  return NextResponse.json({ id }, { status: 201 });
}
