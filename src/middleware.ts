/**
 * 知客 KnowClient — 认证守卫（停用 middleware，改用 layout 层检查）
 *
 * middleware 运行在 Edge Runtime，无法加载 mysql2。
 * 认证逻辑已移至 (dashboard)/layout.tsx（Node.js Runtime）。
 */
import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
