/**
 * 知客 KnowClient — 客户管理页面
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ClientData {
  id: string;
  name: string;
  company: string | null;
  stage: string;
  lastFollowAt: string | null;
  aiTags: string[];
  updatedAt: string;
}

const STAGES = ["新线索", "初步接触", "需求确认", "报价", "谈判", "已成交", "维护"];

const STAGE_COLORS: Record<string, string> = {
  新线索: "bg-gray-50 text-gray-500",
  初步接触: "bg-blue-50 text-blue-600",
  需求确认: "bg-purple-50 text-purple-600",
  报价: "bg-orange-50 text-orange-600",
  谈判: "bg-red-50 text-red-600",
  已成交: "bg-green-50 text-green-600",
  维护: "bg-teal-50 text-teal-600",
};

export default function ClientsPage() {
  const router = useRouter();

  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCompany, setAddCompany] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addStage, setAddStage] = useState("新线索");
  const [aiInput, setAiInput] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClients(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      (c.company || "").toLowerCase().includes(s)
    );
  });

  async function handleAiParse() {
    if (!aiInput.trim()) return;

    try {
      const res = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiInput }),
      });
      const data = await res.json();

      const nameMatch = aiInput.match(/([张李王陈刘杨赵黄周吴孙][一-龥]{1,2})(总|先生|女士)?/);
      const companyMatch = aiInput.match(/([一-龥]+(?:科技|集团|资本|医疗|教育|制造|网络|互动))/);

      if (nameMatch) setAddName(nameMatch[1]);
      if (companyMatch) setAddCompany(companyMatch[1]);
      if (data.stage) setAddStage(data.stage);

      alert("🤖 AI已自动填充，请确认或修改");
    } catch {
      alert("AI解析失败，请手动填写");
    }
  }

  async function handleAddClient() {
    if (!addName.trim()) {
      alert("请输入客户姓名");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName,
          company: addCompany || undefined,
          title: addTitle || undefined,
          stage: addStage,
        }),
      });

      if (res.ok) {
        const listRes = await fetch("/api/clients");
        const data = await listRes.json();
        if (Array.isArray(data)) setClients(data);

        setAddName("");
        setAddCompany("");
        setAddTitle("");
        setAiInput("");
        setAddStage("新线索");
        setShowAdd(false);
      } else {
        alert("添加失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      {/* 搜索栏 + 新增按钮 */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-gray-100">
          <span>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索客户、公司..."
            className="flex-1 border-none outline-none text-sm bg-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-300 text-sm"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-brand-500 text-white text-sm rounded-xl font-medium hover:bg-brand-600 flex-shrink-0 transition"
        >
          + 新增
        </button>
      </div>

      {/* 加载 */}
      {loading && (
        <div className="text-center py-10 text-sm text-gray-400">加载中...</div>
      )}

      {/* 空状态 */}
      {!loading && clients.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm text-gray-500">还没有客户</p>
          <button
            onClick={() => setShowAdd(true)}
            className="text-sm text-brand-500 mt-2 underline"
          >
            添加第一个客户
          </button>
        </div>
      )}

      {/* 客户列表 */}
      {!loading && clients.length > 0 && (
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">没有匹配的客户</p>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/clients/${c.id}`)}
                className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm cursor-pointer hover:shadow-md active:scale-[0.98] transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-semibold text-sm flex-shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {c.name}
                    {c.company && (
                      <span className="text-xs text-gray-400 ml-1.5 font-normal">
                        {c.company}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {c.stage}
                    {c.lastFollowAt
                      ? ` · ${Math.floor((Date.now() - new Date(c.lastFollowAt).getTime()) / (1000 * 60 * 60 * 24))}天前跟进`
                      : " · 待首次跟进"}
                  </p>
                </div>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${STAGE_COLORS[c.stage] || ""}`}>
                  {c.stage}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* 新增客户弹窗 */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAdd(false);
          }}
        >
          <div className="w-full max-w-[420px] bg-white rounded-t-2xl p-5 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-semibold mb-3">➕ 新增客户</h3>

            {/* AI一句话录入 */}
            <div className="ai-card rounded-xl p-3 mb-3 text-xs text-gray-600">
              <p className="mb-2">🤖 一句话录入，AI自动填充：</p>
              <p className="text-gray-400">例："上周展会上认识的张总，星辉医疗CEO"</p>
            </div>
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="一句话描述这个客户..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 mb-2"
            />
            <button
              onClick={handleAiParse}
              className="w-full py-2 text-xs text-brand-600 border border-brand-200 rounded-xl mb-4 hover:bg-brand-50 transition"
            >
              🤖 AI自动填充
            </button>

            {/* 手动填写 */}
            <label className="block text-xs text-gray-500 mb-1">姓名 *</label>
            <input
              type="text"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="客户姓名"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">公司</label>
                <input
                  type="text"
                  value={addCompany}
                  onChange={(e) => setAddCompany(e.target.value)}
                  placeholder="公司名称"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">职位</label>
                <input
                  type="text"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  placeholder="职位"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <label className="block text-xs text-gray-500 mb-1">初始阶段</label>
            <select
              value={addStage}
              onChange={(e) => setAddStage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl"
              >
                取消
              </button>
              <button
                onClick={handleAddClient}
                disabled={!addName.trim() || adding}
                className="flex-1 py-2.5 text-sm bg-brand-500 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {adding ? "保存中..." : "保存客户"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
