/**
 * 知客 KnowClient — AI洞察页
 *
 * 功能：
 *   1. 自然语言查询
 *   2. 数据统计卡片（独立加载，秒级返回）
 *   3. AI周报（独立加载，当天缓存）
 */
"use client";

import { useState, useEffect } from "react";

export default function InsightsPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [querying, setQuerying] = useState(false);

  const [stats, setStats] = useState({
    totalClients: 0,
    newClients: 0,
    pendingFollow: 0,
    closedDeals: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [weeklyReport, setWeeklyReport] = useState("");
  const [reportLoading, setReportLoading] = useState(true);
  const [reportCached, setReportCached] = useState(false);

  // 独立加载统计数据（快速）
  useEffect(() => {
    fetch("/api/insights/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats({
          totalClients: data.totalClients || 0,
          newClients: data.newClients || 0,
          pendingFollow: data.pendingFollow || 0,
          closedDeals: data.closedDeals || 0,
        });
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  // 独立加载周报（慢，有缓存）
  useEffect(() => {
    fetch("/api/insights/weekly")
      .then((r) => r.json())
      .then((data) => {
        if (data.report) {
          setWeeklyReport(data.report);
          setReportCached(data.cached);
        }
      })
      .catch(() => {})
      .finally(() => setReportLoading(false));
  }, []);

  /** 执行自然语言查询 */
  async function handleQuery() {
    if (!question.trim()) return;
    setQuerying(true);
    setAnswer("");

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      const data = await res.json();
      setAnswer(data.answer || "无法回答该问题");
    } catch {
      setAnswer("查询失败，请重试");
    } finally {
      setQuerying(false);
    }
  }

  return (
    <div>
      {/* AI查询 */}
      <div className="ai-card rounded-xl p-3 mb-4 text-xs text-gray-600">
        <p>🤖 用自然语言问我任何关于你的客户和销售数据的问题</p>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleQuery()}
          placeholder='例如："最近谁快跟丢了？"'
          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={handleQuery}
          disabled={!question.trim() || querying}
          className="px-4 py-2.5 bg-brand-500 text-white text-sm rounded-xl font-medium disabled:opacity-50 hover:bg-brand-600 transition"
        >
          {querying ? "..." : "提问"}
        </button>
      </div>

      {/* 查询结果 */}
      {querying && (
        <div className="text-center py-4 text-sm text-gray-400">
          🤖 AI分析中...
        </div>
      )}
      {answer && (
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4 animate-fade-in">
          <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}

      {/* 统计卡片 */}
      <h3 className="text-sm font-semibold text-gray-400 mb-3 mt-6">📊 数据概览</h3>
      {statsLoading ? (
        <div className="text-center py-6 text-sm text-gray-400">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <StatCard label="总客户数" value={stats.totalClients} />
          <StatCard label="本周新增" value={stats.newClients} change="↑" />
          <StatCard label="待跟进" value={stats.pendingFollow || "-"} />
          <StatCard label="已成交" value={stats.closedDeals} />
        </div>
      )}

      {/* 周报 */}
      <h3 className="text-sm font-semibold text-gray-400 mb-3">
        📝 AI周报预览
        {reportCached && <span className="text-[10px] text-gray-300 ml-1">（缓存）</span>}
      </h3>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        {reportLoading ? (
          <div className="text-center py-6 text-sm text-gray-400">
            <Spinner />
            <p className="mt-2">AI 正在生成周报...</p>
          </div>
        ) : weeklyReport ? (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{weeklyReport}</p>
        ) : (
          <p className="text-sm text-gray-400">暂无周报数据，添加客户并记录沟通后自动生成</p>
        )}
      </div>
    </div>
  );
}

/** 加载动画 */
function Spinner() {
  return (
    <div className="inline-block w-5 h-5 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
  );
}

/** 统计卡片子组件 */
function StatCard({ label, value, change }: { label: string; value: string | number; change?: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
      <p className="text-[10px] text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {change && <p className="text-[10px] text-green-500 mt-0.5">{change}</p>}
    </div>
  );
}
