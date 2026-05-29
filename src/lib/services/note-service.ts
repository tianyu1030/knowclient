/**
 * 知客 KnowClient — 沟通记录服务
 *
 * 记录添加 + AI 解析 + 自动更新客户画像
 */
import { getDb, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { parseNote } from "./ai-service";

/** 添加沟通记录（含 AI 自动解析） */
export async function addNote(params: {
  userId: string;
  clientId: string;
  content: string;
  type?: string;
}) {
  const db = getDb();
  const id = crypto.randomUUID();

  // 1. 保存原始记录
  await db.insert(schema.notes).values({
    id,
    clientId: params.clientId,
    userId: params.userId,
    contentRaw: params.content,
    type: params.type || "note",
  });

  // 2. AI 解析记录（异步，不阻塞响应）
  //    生产环境可改为队列处理
  try {
    const parsed = await parseNote(params.content);

    // 3. 更新客户画像
    const updatedData: any = { lastFollowAt: new Date() };

    if (parsed.stage) updatedData.stage = parsed.stage;
    if (parsed.summary) updatedData.aiSummary = parsed.summary;
    if (parsed.tags?.length) updatedData.aiTags = parsed.tags;

    await db
      .update(schema.clients)
      .set(updatedData)
      .where(
        and(
          eq(schema.clients.id, params.clientId),
          eq(schema.clients.userId, params.userId)
        )
      );

    // 4. 自动创建待办
    if (parsed.todo) {
      await db.insert(schema.todos).values({
        id: crypto.randomUUID(),
        userId: params.userId,
        clientId: params.clientId,
        title: parsed.todo,
        autoCreated: 1,
      });
    }

    // 5. 保存 AI 结构化结果到记录
    await db
      .update(schema.notes)
      .set({ contentAi: JSON.stringify(parsed) })
      .where(eq(schema.notes.id, id));

    return { noteId: id, parsed };
  } catch (error) {
    console.error("[NoteService] AI 解析失败:", error);
    // AI 解析失败不影响记录保存
    return { noteId: id, parsed: null };
  }
}
