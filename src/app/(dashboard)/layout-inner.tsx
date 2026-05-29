/**
 * 知客 KnowClient — 仪表盘布局（客户端 UI）
 *
 * 包含：
 *   - 顶部导航栏（Header）
 *   - 底部导航栏（BottomNav）
 *   - 浮动快速记录按钮（FAB）
 *   - 快速记录弹窗（QuickRecordModal）
 *
 * 认证守卫在 layout.tsx（服务端），本文件只负责 UI 渲染
 */
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";

/** 底部导航配置 */
const NAV_ITEMS = [
  { key: "today", label: "今日", icon: "📋", path: "/today" },
  { key: "leads", label: "线索", icon: "📊", path: "/leads" },
  { key: "clients", label: "客户", icon: "👥", path: "/clients" },
  { key: "insights", label: "洞察", icon: "💡", path: "/insights" },
  { key: "settings", label: "设置", icon: "⚙️", path: "/settings" },
];

/** 页面标题映射 */
const PAGE_TITLES: Record<string, string> = {
  today: "知客",
  leads: "线索跟踪",
  clients: "客户管理",
  insights: "AI洞察",
  settings: "设置",
};

export default function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardUI>{children}</DashboardUI>
    </SessionProvider>
  );
}

function DashboardUI({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // 当前激活的导航项
  const activeNav = NAV_ITEMS.find((item) => pathname.startsWith(item.path));
  const activeKey = activeNav?.key || "today";

  // 判断是否在客户详情页（隐藏底部导航和FAB）
  const isDetailPage = /^\/clients\/[^/]+$/.test(pathname);

  // 快速记录弹窗状态
  const [showRecord, setShowRecord] = useState(false);
  const [recordText, setRecordText] = useState("");
  const [recordClientId, setRecordClientId] = useState("");
  const [clients, setClients] = useState<Array<{ id: string; name: string; company?: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  // 获取客户列表（用于快速记录的客户选择器）
  useEffect(() => {
    if (showRecord) {
      fetch("/api/clients")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setClients(data);
        })
        .catch(() => {});
    }
  }, [showRecord]);

  /** 提交快速记录 */
  async function handleRecordSubmit() {
    if (!recordText.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: recordClientId || undefined,
          content: recordText,
        }),
      });

      if (res.ok) {
        setRecordText("");
        setRecordClientId("");
        setShowRecord(false);
        alert("✅ 记录已保存，AI已自动更新客户信息");
      } else {
        alert("保存失败，请重试");
      }
    } catch {
      alert("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-container flex flex-col relative">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold">
            知
          </div>
          <h1 className="text-sm font-semibold text-gray-900">
            {isDetailPage ? "客户详情" : PAGE_TITLES[activeKey] || "知客"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {session?.user?.name || "用户"}
          </span>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto px-5 py-4 pb-24">{children}</main>

      {/* 底部导航（客户详情页隐藏） */}
      {!isDetailPage && (
        <nav className="sticky bottom-0 z-10 bg-white border-t border-gray-100 flex px-2 pb-safe">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                onClick={() => router.push(item.path)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors ${
                  isActive ? "text-brand-500" : "text-gray-400"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* 浮动快速记录按钮（客户详情页隐藏） */}
      {!isDetailPage && (
        <button
          onClick={() => setShowRecord(true)}
          className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-2xl flex items-center justify-center shadow-lg shadow-brand-500/25 hover:scale-105 transition-transform z-20"
        >
          +
        </button>
      )}

      {/* 快速记录弹窗 */}
      {showRecord && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRecord(false);
          }}
        >
          <div className="w-full max-w-[420px] bg-white rounded-t-2xl p-5 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-semibold mb-3">✏️ 快速记录</h3>

            <textarea
              value={recordText}
              onChange={(e) => setRecordText(e.target.value)}
              placeholder="用一句话记录刚才的沟通...&#10;例如：刚和李总通了电话，他对报价80万有异议，我承诺周五给阶梯报价方案"
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />

            <p className="text-xs text-gray-400 mt-2 mb-3">
              AI会自动提取关键信息、更新客户标签和状态
            </p>

            <select
              value={recordClientId}
              onChange={(e) => setRecordClientId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4"
            >
              <option value="">选择关联客户（可选，AI可自动识别）</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `- ${c.company}` : ""}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRecord(false)}
                className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl"
              >
                取消
              </button>
              <button
                onClick={handleRecordSubmit}
                disabled={!recordText.trim() || submitting}
                className="flex-1 py-2.5 text-sm bg-brand-500 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {submitting ? "提交中..." : "提交记录"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
