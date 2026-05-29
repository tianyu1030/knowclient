/**
 * NextAuth API Route
 * 处理所有认证请求：登录、登出、回调
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
