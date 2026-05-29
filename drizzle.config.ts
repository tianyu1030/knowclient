/** Drizzle Kit 配置文件 — 用于数据库迁移 */
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  // MariaDB 用户也使用 "mysql" 方言（两者兼容）
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "121.224.76.39",
    port: parseInt(process.env.DB_PORT || "8001"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "yookey",
    database: process.env.DB_NAME || "knowclient",
  },
  // 严格模式关闭：兼容 MariaDB / 旧版 MySQL（缺少 check_constraints 表）
  strict: false,
  verbose: true,
} satisfies Config;
