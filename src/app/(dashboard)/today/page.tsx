/**
 * 知客 KnowClient — 今日页面（首页）
 *
 * 核心功能：
 *   1. 每日欢迎语 + AI洞察
 *   2. 按优先级排序的跟进建议清单
 *   3. 一键标记已跟进 / 推迟
 *
 * 数据来源：
 *   GET /api/clients — 获取客户列表
 *   POST /api/ai/suggest — 获取AI跟进建议
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/** 跟进建议项 */
interface Suggestion {
  clientId: string;
  clientName?: string;
  company?: string;
  priority: "urgent" | "high" | "normal";
  suggestion: string;
  reason: string;
  lastFollow?: string;
}

/** 获取问候语 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "早上好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

/** 获取今天的日期字符串（中文） */
function getTodayString(): string {
  const now = new Date();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
}

/** 格式化相对时间 */
function formatRelative(dateStr: string | undefined): string {
  if (!dateStr) return "从未";
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  return `${days}天前`;
}

/** 优先级标签 */
function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { label: string; className: string }> = {
    urgent: { label: "⚠ 紧急", className: "bg-red-50 text-red-500 text-[10px] font-semibold px-1.5 py-0.5 rounded" },
    high: { label: "● 重要", className: "bg-orange-50 text-orange-500 text-[10px] font-semibold px-1.5 py-0.5 rounded" },
    normal: { label: "常规", className: "bg-blue-50 text-blue-500 text-[10px] font-semibold px-1.5 py-0.5 rounded" },
  };
  const c = config[priority] || config.normal;
  return <span className={c.className}>{c.label}</span>;
}

/** 阶段标签 */
function StageBadge({ stage }: { stage: string }) {
  const colors: Record<string, string> = {
    新线索: "bg-gray-100 text-gray-600",
    初步接触: "bg-blue-50 text-blue-600",
    需求确认: "bg-purple-50 text-purple-600",
    报价: "bg-orange-50 text-orange-600",
    谈判: "bg-red-50 text-red-600",
    已成交: "bg-green-50 text-green-600",
    维护: "bg-teal-50 text-teal-600",
  };
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${colors[stage] || "bg-gray-100 text-gray-600"}`}
    >
      {stage}
    </span>
  );
}

export default function TodayPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [insight, setInsight] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 页面加载时获取数据
  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      // 请求AI建议
      const res = await fetch("/api/ai/suggest", { method: "POST" });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "加载失败");
      }

      const data = await res.json();
      setInsight(data.summary || "");
      setSuggestions(data.suggestions || []);
    } catch (err: any) {
      setError(err.message || "加载失败");
      console.error("[Today] 数据加载失败:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /** 标记已跟进 */
  async function handleFollow(clientId: string) {
    try {
      // 更新 lastFollowAt
      await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastFollowAt: new Date().toISOString() }),
      });

      // 同时 dismiss，确保刷新后不再出现
      await fetch("/api/ai/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });

      setSuggestions((prev) => prev.filter((s) => s.clientId !== clientId));
    } catch {
      alert("操作失败，请重试");
    }
  }

  /** 推迟跟进 */
  async function handleDismiss(clientId: string) {
    try {
      await fetch("/api/ai/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });

      setSuggestions((prev) => prev.filter((s) => s.clientId !== clientId));
    } catch {
      alert("操作失败，请重试");
    }
  }

  // ========== 渲染 ==========

  return (
    <div>
      {/* 欢迎语 */}
      <p className="text-sm text-gray-500 mb-1">
        {getGreeting()}，<strong className="text-gray-900">{session?.user?.name || "用户"}</strong> 👋
      </p>
      <p className="text-xs text-gray-400 mb-4">
        {getTodayString()} · 待跟进 {suggestions.length} 位客户
      </p>

      {/* AI洞察 */}
      {insight && (
        <div className="ai-card rounded-xl p-3 mb-4 flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed">
          <span className="text-base flex-shrink-0">🤖</span>
          <p>
            <strong className="text-brand-600">AI洞察：</strong>
            {insight}
          </p>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block w-6 h-6 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 mt-3">AI 正在分析你的客户数据...</p>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="text-center py-10">
          <p className="text-sm text-red-500 mb-2">加载失败：{error}</p>
          <button
            onClick={loadData}
            className="text-sm text-brand-500 underline"
          >
            重新加载
          </button>
        </div>
      )}

      {/* 空状态 */}
      {!loading && !error && suggestions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-sm text-gray-500 mb-1">今天没有需要跟进的客户</p>
          <p className="text-xs text-gray-400">去添加新客户或休息一下吧</p>
        </div>
      )}

      {/* 跟进建议列表 */}
      {!loading && suggestions.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">
            📋 今日建议跟进
          </h2>

          <div className="space-y-3">
            {suggestions.map((s) => (
              <div
                key={s.clientId}
                onClick={() => router.push(`/clients/${s.clientId}`)}
                className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow animate-fade-in ${
                  s.priority === "urgent" ? "border-l-2 border-l-red-400" : ""
                }`}
              >
                {/* 客户信息行 */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-semibold text-sm">{s.clientName || "未知"}</span>
                    {s.company && (
                      <span className="text-xs text-gray-400 ml-2">{s.company}</span>
                    )}
                  </div>
                  <PriorityBadge priority={s.priority} />
                </div>

                {/* 阶段和时间 */}
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                  <span>上次跟进: {formatRelative(s.lastFollow)}</span>
                </div>

                {/* AI建议 */}
                <div className="ai-card rounded-lg p-2.5 mb-3">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    💡 <strong className="text-brand-600">建议：</strong>
                    {s.suggestion}
                  </p>
                  {s.reason && (
                    <p className="text-[10px] text-gray-400 mt-1">原因：{s.reason}</p>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollow(s.clientId);
                    }}
                    className="flex-1 py-1.5 bg-brand-500 text-white text-xs rounded-lg font-medium hover:bg-brand-600 transition"
                  >
                    ✓ 已跟进
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(s.clientId);
                    }}
                    className="py-1.5 px-3 text-xs text-gray-400 hover:text-gray-600 transition"
                  >
                    ↗ 推迟
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[10px] text-gray-300 mt-4 mb-6">
            以上由 AI 根据跟进节奏和客户信号自动排序
          </p>
        </>
      )}
    </div>
  );
}
