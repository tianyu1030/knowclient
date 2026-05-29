/**
 * 知客 KnowClient — 客户业务服务
 *
 * 封装所有客户相关的数据库操作
 * 每个操作都包含权限检查（只能操作自己的数据）
 */
import { getDb, schema } from "@/lib/db";
import { eq, and, desc, like, or, sql } from "drizzle-orm";

function generateId(): string {
  return crypto.randomUUID();
}

/** 创建客户 */
export async function createClient(params: {
  userId: string;
  name: string;
  company?: string;
  title?: string;
  phone?: string;
  email?: string;
  stage?: string;
}) {
  const db = getDb();
  const id = generateId();

  await db.insert(schema.clients).values({
    id,
    userId: params.userId,
    name: params.name,
    company: params.company || null,
    title: params.title || null,
    phone: params.phone || null,
    email: params.email || null,
    stage: (params.stage as any) || "新线索",
    aiTags: [],
  });

  return id;
}

/** 获取客户列表（支持搜索、阶段筛选、排序） */
export async function getClients(params: {
  userId: string;
  search?: string;
  stage?: string;
  sortBy?: "updatedAt" | "lastFollowAt" | "name" | "aiPriority";
}) {
  const db = getDb();

  // 动态构建条件数组，避免链式 .where() 的类型收窄问题
  const conditions: any[] = [eq(schema.clients.userId, params.userId)];

  if (params.search) {
    const term = `%${params.search}%`;
    conditions.push(
      or(like(schema.clients.name, term), like(schema.clients.company, term))
    );
  }

  if (params.stage) {
    conditions.push(eq(schema.clients.stage, params.stage));
  }

  const query = db
    .select()
    .from(schema.clients)
    .where(and(...conditions))
    .orderBy(desc(schema.clients.updatedAt));

  return query.execute();
}

/** 获取单个客户详情（含关联的沟通记录和待办） */
export async function getClientDetail(params: {
  userId: string;
  clientId: string;
}) {
  const db = getDb();

  // 使用手动多查询替代 Drizzle relations with: 语法，
  // 避免生成 LATERAL / ROW_NUMBER() OVER() / JSON_ARRAYAGG() 等 MySQL 8.0+ 语法，
  // 以兼容 MySQL 5.7
  const client = await db.query.clients.findFirst({
    where: (c, { eq, and }) =>
      and(eq(c.id, params.clientId), eq(c.userId, params.userId)),
  });

  if (!client) return null;

  // 分别查询关联数据
  const notesData = await db
    .select()
    .from(schema.notes)
    .where(eq(schema.notes.clientId, params.clientId))
    .orderBy(desc(schema.notes.createdAt));

  const todosData = await db
    .select()
    .from(schema.todos)
    .where(
      and(
        eq(schema.todos.clientId, params.clientId),
        eq(schema.todos.userId, params.userId)
      )
    )
    .orderBy(desc(schema.todos.createdAt));

  const suggestionsData = await db
    .select()
    .from(schema.aiSuggestions)
    .where(
      and(
        eq(schema.aiSuggestions.clientId, params.clientId),
        eq(schema.aiSuggestions.userId, params.userId),
        eq(schema.aiSuggestions.dismissed, 0)
      )
    )
    .orderBy(desc(schema.aiSuggestions.createdAt));

  return {
    ...client,
    notes: notesData,
    todos: todosData,
    suggestions: suggestionsData,
  };
}

/** 更新客户信息 */
export async function updateClient(params: {
  userId: string;
  clientId: string;
  data: Partial<{
    name: string;
    company: string;
    title: string;
    phone: string;
    email: string;
    stage: string;
    probability: number;
    aiSummary: string;
    aiTags: string[];
    lastFollowAt: Date;
  }>;
}) {
  const db = getDb();

  await db
    .update(schema.clients)
    .set({
      ...params.data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.clients.id, params.clientId),
        eq(schema.clients.userId, params.userId)
      )
    );
}

/** 删除客户 */
export async function deleteClient(params: {
  userId: string;
  clientId: string;
}) {
  const db = getDb();

  await db
    .delete(schema.clients)
    .where(
      and(
        eq(schema.clients.id, params.clientId),
        eq(schema.clients.userId, params.userId)
      )
    );
}

/** 获取客户阶段分布统计 */
export async function getStageStats(userId: string) {
  const db = getDb();

  const result = await db
    .select({
      stage: schema.clients.stage,
      count: sql<number>`count(*)`,
    })
    .from(schema.clients)
    .where(eq(schema.clients.userId, userId))
    .groupBy(schema.clients.stage);

  return result;
}
