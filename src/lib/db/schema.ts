/**
 * 知客 KnowClient — 数据库 Schema 定义
 *
 * 使用 Drizzle ORM + MySQL
 * 表名和字段名统一蛇形命名（snake_case），符合 MySQL 惯例
 *
 * 核心表（6张）：
 *   users          — 用户
 *   clients        — 客户（核心表）
 *   notes          — 沟通记录
 *   todos          — 待办事项
 *   ai_suggestions — AI跟进建议缓存
 *   ai_events      — AI事件日志（客户行为信号）
 */

import {
  mysqlTable,
  varchar,
  text,
  int,
  timestamp,
  json,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================================
// 用户表
// ============================================================
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),
  avatar: varchar("avatar", { length: 500 }),
  weeklyReport: text("weekly_report"),
  weeklyReportAt: timestamp("weekly_report_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================
// 客户表（核心业务表）
// ============================================================
export const clients = mysqlTable(
  "clients",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id)
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    company: varchar("company", { length: 200 }),
    title: varchar("title", { length: 100 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    // 客户阶段：使用 MySQL ENUM 约束
    stage: mysqlEnum("stage", [
      "新线索",
      "初步接触",
      "需求确认",
      "报价",
      "谈判",
      "已成交",
      "维护",
    ])
      .default("新线索")
      .notNull(),
    // 成交概率 0-100
    probability: int("probability"),
    // AI 自动维护的客户摘要（1-2句话）
    aiSummary: text("ai_summary"),
    // AI 标签，MySQL JSON 字段，如 ["价格敏感","决策者"]
    aiTags: json("ai_tags").$type<string[]>(),
    // 上次跟进时间
    lastFollowAt: timestamp("last_follow_at"),
    // 建议跟进间隔（天）
    followInterval: int("follow_interval").default(3),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    // 按用户+阶段的联合索引，加速看板查询
    userStageIdx: index("user_stage_idx").on(table.userId, table.stage),
    // 按用户+上次跟进时间的索引，加速"超期未跟进"查询
    userFollowIdx: index("user_follow_idx").on(table.userId, table.lastFollowAt),
  })
);

// ============================================================
// 沟通记录表
// ============================================================
export const notes = mysqlTable("notes", {
  id: varchar("id", { length: 255 }).primaryKey(),
  clientId: varchar("client_id", { length: 255 }).references(() => clients.id),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  // 用户原始输入（自然语言）
  contentRaw: text("content_raw").notNull(),
  // AI 结构化后的内容（JSON）
  contentAi: text("content_ai"),
  // 沟通类型
  type: varchar("type", { length: 20 }).default("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================
// 待办事项表
// ============================================================
export const todos = mysqlTable("todos", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  clientId: varchar("client_id", { length: 255 }).references(() => clients.id),
  title: varchar("title", { length: 500 }).notNull(),
  dueDate: timestamp("due_date"),
  done: int("done").default(0), // 0=未完成, 1=已完成
  autoCreated: int("auto_created").default(0), // AI自动创建的标记
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================
// AI跟进建议表（缓存AI生成的建议，避免重复调用）
// ============================================================
export const aiSuggestions = mysqlTable("ai_suggestions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  clientId: varchar("client_id", { length: 255 })
    .references(() => clients.id)
    .notNull(),
  suggestion: text("suggestion").notNull(),
  priority: mysqlEnum("priority", ["urgent", "high", "normal"]).default("normal"),
  dismissed: int("dismissed").default(0), // 用户是否已忽略
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================
// AI事件日志（记录客户行为信号，如打开链接、查看页面等）
// ============================================================
export const aiEvents = mysqlTable("ai_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  clientId: varchar("client_id", { length: 255 }).references(() => clients.id),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  description: text("description"),
  metadata: json("metadata"), // 附加数据，如链接、页面停留时间等
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================
// 表关联定义（用于 Drizzle Relations API 的联表查询）
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  notes: many(notes),
  todos: many(todos),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, { fields: [clients.userId], references: [users.id] }),
  notes: many(notes),
  todos: many(todos),
  suggestions: many(aiSuggestions),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  client: one(clients, { fields: [notes.clientId], references: [clients.id] }),
  user: one(users, { fields: [notes.userId], references: [users.id] }),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  client: one(clients, { fields: [todos.clientId], references: [clients.id] }),
  user: one(users, { fields: [todos.userId], references: [users.id] }),
}));

export const aiSuggestionsRelations = relations(aiSuggestions, ({ one }) => ({
  client: one(clients, {
    fields: [aiSuggestions.clientId],
    references: [clients.id],
  }),
  user: one(users, { fields: [aiSuggestions.userId], references: [users.id] }),
}));
