/**
 * 知客 KnowClient — 注册页
 */
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const router = useRouter();

  /** 失焦时校验邮箱 */
  function validateEmail(value: string) {
    if (!value.trim()) {
      setEmailError("");
    } else if (!EMAIL_REGEX.test(value.trim())) {
      setEmailError("邮箱格式不正确");
    } else {
      setEmailError("");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password || !confirm) return;

    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError("邮箱格式不正确");
      return;
    }

    if (password !== confirm) {
      alert("两次输入的密码不一致");
      return;
    }

    if (password.length < 6) {
      alert("密码至少 6 位");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "注册失败");
        return;
      }

      // 注册成功，自动登录
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        alert("注册成功，请登录");
        router.push("/auth/login");
      } else {
        router.push("/today");
        router.refresh();
      }
    } catch {
      alert("注册失败，请重试");
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

        {/* 注册表单 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">注册</h2>

          <form onSubmit={handleRegister}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={(e) => validateEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition mb-1 ${
                emailError ? "border-red-300" : "border-gray-200"
              }`}
            />
            {emailError && (
              <p className="text-xs text-red-500 mb-2">{emailError}</p>
            )}
            {!emailError && <div className="mb-3" />}

            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位密码"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition mb-3"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">
              确认密码
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="再次输入密码"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
            {password && confirm && password !== confirm && (
              <p className="text-xs text-red-500 mt-1">两次输入的密码不一致</p>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                !email.trim() ||
                !!emailError ||
                !password ||
                !confirm ||
                password !== confirm
              }
              className="w-full mt-4 py-3 bg-brand-500 text-white rounded-xl font-medium text-sm hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "注册中..." : "注册"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            已有账号？{" "}
            <button
              onClick={() => router.push("/auth/login")}
              className="text-brand-500 font-medium hover:underline"
            >
              返回登录
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
