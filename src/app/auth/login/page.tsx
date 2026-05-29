/**
 * 知客 KnowClient — 登录页
 */
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        alert("邮箱或密码错误");
      } else {
        router.push("/today");
        router.refresh();
      }
    } catch {
      alert("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50 to-white p-6">
      <div className="w-full max-w-sm animate-fade-in">
        {/* 品牌 Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white text-2xl font-bold mb-4 shadow-lg">
            知
          </div>
          <h1 className="text-2xl font-bold text-gray-900">知客</h1>
          <p className="text-sm text-gray-500 mt-1">KnowClient — AI客户管理</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">登录</h2>

          <form onSubmit={handleLogin}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition mb-3"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full mt-4 py-3 bg-brand-500 text-white rounded-xl font-medium text-sm hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            还没有账号？{" "}
            <button
              onClick={() => router.push("/auth/register")}
              className="text-brand-500 font-medium hover:underline"
            >
              立即注册
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          知客 KnowClient v0.1 · 个人版
        </p>
      </div>
    </div>
  );
}
