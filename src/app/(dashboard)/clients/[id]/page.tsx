/**
 * 知客 KnowClient — 客户详情页
 *
 * 显示客户完整画像：基本信息、AI摘要、跟进建议、时间线
 */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface ClientDetail {
  id: string;
  name: string;
  company: string | null;
  title: string | null;
  stage: string;
  probability: number | null;
  aiSummary: string | null;
  aiTags: string[];
  notes: Array<{
    id: string;
    contentRaw: string;
    contentAi: string | null;
    type: string;
    createdAt: string;
  }>;
}

const STAGES = ["新线索", "初步接触", "需求确认", "报价", "谈判", "已成交", "维护"];

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 编辑状态
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editStage, setEditStage] = useState("");
  const [editProbability, setEditProbability] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/clients/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("客户不存在");
        return r.json();
      })
      .then((data) => setClient(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function startEdit() {
    if (!client) return;
    setEditName(client.name);
    setEditCompany(client.company || "");
    setEditTitle(client.title || "");
    setEditStage(client.stage);
    setEditProbability(client.probability);
    setEditing(true);
  }

  async function saveEdit() {
    if (!editName.trim() || !client) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          company: editCompany.trim() || null,
          title: editTitle.trim() || null,
          stage: editStage,
          probability: editProbability,
        }),
      });

      if (res.ok) {
        setClient({
          ...client,
          name: editName.trim(),
          company: editCompany.trim() || null,
          title: editTitle.trim() || null,
          stage: editStage,
          probability: editProbability,
        });
        setEditing(false);
      } else {
        alert("保存失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setSaving(false);
    }
  }

  const stageColors: Record<string, string> = {
    新线索: "bg-gray-100 text-gray-600",
    初步接触: "bg-blue-50 text-blue-600",
    需求确认: "bg-purple-50 text-purple-600",
    报价: "bg-orange-50 text-orange-600",
    谈判: "bg-red-50 text-red-600",
    已成交: "bg-green-50 text-green-600",
    维护: "bg-teal-50 text-teal-600",
  };

  if (loading) {
    return <div className="text-center py-20 text-sm text-gray-400">加载中...</div>;
  }

  if (error || !client) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-red-500 mb-2">{error || "客户不存在"}</p>
        <button onClick={() => router.back()} className="text-sm text-brand-500 underline">返回</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* 返回按钮 */}
      <button
        onClick={() => router.back()}
        className="text-sm text-brand-500 mb-3 font-medium hover:text-brand-600 transition"
      >
        ← 返回
      </button>

      {/* 头部信息 */}
      {editing ? (
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">姓名</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">公司</label>
              <input
                type="text"
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">职位</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">阶段</label>
              <select
                value={editStage}
                onChange={(e) => setEditStage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {STAGES.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">成交概率 (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={editProbability ?? ""}
                onChange={(e) => setEditProbability(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl"
            >
              取消
            </button>
            <button
              onClick={saveEdit}
              disabled={!editName.trim() || saving}
              className="flex-1 py-2.5 text-sm bg-brand-500 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{client.name}</h2>
              <button
                onClick={startEdit}
                className="text-xs text-brand-500 border border-brand-200 px-2 py-0.5 rounded-lg hover:bg-brand-50 transition"
              >
                修改
              </button>
            </div>
            {client.company && (
              <p className="text-sm text-gray-500">
                {client.company}{client.title ? ` · ${client.title}` : ""}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${stageColors[client.stage] || ""}`}>
              {client.stage}
            </span>
            {client.probability !== null && (
              <p className="text-xs text-gray-400 mt-1">成交概率 {client.probability}%</p>
            )}
          </div>
        </div>
      )}

      {/* 标签 */}
      {client.aiTags && client.aiTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(client.aiTags as unknown as string[]).map((tag, i) => (
            <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {/* AI摘要 */}
      {client.aiSummary && (
        <div className="bg-white rounded-xl p-4 border-l-2 border-brand-500 shadow-sm mb-3">
          <p className="text-xs text-brand-500 font-semibold mb-1">🤖 AI摘要</p>
          <p className="text-sm text-gray-700 leading-relaxed">{client.aiSummary}</p>
        </div>
      )}

      {/* 时间线 */}
      <h3 className="text-sm font-semibold text-gray-400 mb-3 mt-5">📅 跟进时间线</h3>

      {client.notes && client.notes.length > 0 ? (
        <div className="space-y-3">
          {client.notes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl p-3.5 shadow-sm">
              <p className="text-[10px] text-gray-400 mb-1">
                {new Date(note.createdAt).toLocaleString("zh-CN")}
                {note.type && note.type !== "note" && (
                  <span className="ml-2 text-gray-500">
                    {note.type === "call" ? "📞 电话" : note.type === "meeting" ? "🤝 会面" : ""}
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{note.contentRaw}</p>
              {note.contentAi && (
                <details className="mt-2">
                  <summary className="text-[10px] text-brand-500 cursor-pointer">🤖 AI解析结果</summary>
                  <pre className="text-[10px] text-gray-400 mt-1 whitespace-pre-wrap">
                    {JSON.stringify(JSON.parse(note.contentAi), null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400 py-8">暂无沟通记录</p>
      )}
    </div>
  );
}
