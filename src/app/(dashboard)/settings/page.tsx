/**
 * 知客 KnowClient — 设置页
 */
"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function SettingsPage() {
  const { data: session, update } = useSession();

  // 编辑用户名
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit() {
    setNewName(session?.user?.name || "");
    setEditing(true);
  }

  async function saveName() {
    if (!newName.trim()) return;
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (res.ok) {
        // 更新客户端 session，所有 useSession() 的组件（页头+设置页）同步刷新
        await update({
          user: {
            ...session?.user,
            name: newName.trim(),
          },
        });
        setEditing(false);
      } else {
        const data = await res.json();
        alert(data.error || "保存失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* 账户信息 */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">👤 账户</h3>

        {/* 用户名 */}
        <div className="flex items-center justify-between py-2 border-b border-gray-50">
          {editing ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                placeholder="输入用户名"
                autoFocus
                className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                onClick={saveName}
                disabled={!newName.trim() || saving}
                className="text-xs text-white bg-brand-500 px-2.5 py-1 rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? "..." : "保存"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-xs text-gray-400 px-2 py-1"
              >
                取消
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-1">
              <div>
                <p className="text-sm text-gray-800">{session?.user?.name || "用户"}</p>
                <p className="text-xs text-gray-400">{session?.user?.email || ""}</p>
              </div>
              <button
                onClick={startEdit}
                className="text-xs text-brand-500 border border-brand-200 px-2.5 py-1 rounded-lg hover:bg-brand-50 transition"
              >
                修改
              </button>
            </div>
          )}
        </div>

        {/* 当前模式 */}
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div>
            <p className="text-sm text-gray-800">当前模式</p>
            <p className="text-xs text-gray-400">个人版 · 无限客户</p>
          </div>
          <button
            disabled
            className="text-xs text-gray-300 border border-gray-200 px-3 py-1 rounded-lg cursor-not-allowed"
          >
            升级团队版
          </button>
        </div>

        {/* 退出登录 */}
        <div className="pt-3">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="text-sm text-red-500 w-full text-left"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">🔔 通知设置</h3>

        <SettingRow label="AI每日提醒" desc="每天早上8:00推送今日行动清单" status="已开启 ✓" />
        <SettingRow label="智能预警通知" desc="客户流失风险或积极信号即时推送" status="已开启 ✓" />
        <SettingRow label="AI周报" desc="每周五18:00自动生成周报" status="已开启 ✓" />
        <SettingRow label="语音记录" desc="支持语音转文字快速记录" status="V1.0 上线" last />
      </div>

      {/* 版本信息 */}
      <p className="text-center text-xs text-gray-300 py-4">
        知客 KnowClient v0.1 · MVP · 个人版
      </p>
    </div>
  );
}

/** 设置行子组件 */
function SettingRow({
  label,
  desc,
  status,
  last,
}: {
  label: string;
  desc: string;
  status: string;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-3 ${last ? "" : "border-b border-gray-50"}`}>
      <div>
        <p className="text-sm text-gray-800">{label}</p>
        <p className="text-[10px] text-gray-400">{desc}</p>
      </div>
      <span className="text-xs text-green-500">{status}</span>
    </div>
  );
}
