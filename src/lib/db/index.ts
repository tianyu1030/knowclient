/**
 * 知客 KnowClient — 数据库连接
 *
 * 使用 mysql2 连接池 + Drizzle ORM
 * 单例模式，避免创建多个连接池
 */
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// 全局单例
let dbInstance: MySql2Database<typeof schema> | null = null;
let poolInstance: mysql.Pool | null = null;

/** 获取 MySQL 连接池（单例） */
function getPool(): mysql.Pool {
  if (poolInstance) return poolInstance;

  poolInstance = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "knowclient",
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_POOL_MAX || "10"),
    // 连接超时 10 秒
    connectTimeout: 10000,
  });

  return poolInstance;
}

/** 获取 Drizzle 数据库实例（单例） */
export function getDb() {
  if (dbInstance) return dbInstance;

  const pool = getPool();
  dbInstance = drizzle(pool, { schema, mode: "default" });
  return dbInstance;
}

/** 测试数据库连接 */
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return true;
  } catch (error) {
    console.error("[DB] 连接失败:", error);
    return false;
  }
}

// 导出 schema（方便其他地方引用）
export { schema };
