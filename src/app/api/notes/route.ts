/**
 * 沟通记录 API
 *
 * POST /api/notes  — 添加沟通记录（含AI自动解析）
 */
import { auth } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { addNote } from "@/lib/services/note-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { clientId, content, type } = await req.json();

  if (!content) {
    return NextResponse.json(
      { error: "content 不能为空" },
      { status: 400 }
    );
  }

  // clientId 为可选：AI可自动从内容中识别客户
  // 未关联客户时，仅保存原始记录，不触发AI解析
  if (!clientId) {
    const db = getDb();
    const noteId = crypto.randomUUID();
    await db.insert(schema.notes).values({
      id: noteId,
      userId: session.user.id,
      contentRaw: content,
      type: type || "note",
    });
    return NextResponse.json({ noteId, parsed: null }, { status: 201 });
  }

  const result = await addNote({
    userId: session.user.id,
    clientId,
    content,
    type,
  });

  return NextResponse.json(result, { status: 201 });
}
