/**
 * 知客 KnowClient — 线索跟踪页
 *
 * 按阶段纵向排列，每阶段内客户卡片可左右滑动
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
  probability: number | null;
}

const STAGES = ["新线索", "初步接触", "需求确认", "报价", "谈判", "已成交", "维护"];

const STAGE_COLORS: Record<string, string> = {
  新线索: "text-gray-600",
  初步接触: "text-blue-600",
  需求确认: "text-purple-600",
  报价: "text-orange-600",
  谈判: "text-red-600",
  已成交: "text-green-600",
  维护: "text-teal-600",
};

const STAGE_DOT: Record<string, string> = {
  新线索: "bg-gray-400",
  初步接触: "bg-blue-400",
  需求确认: "bg-purple-400",
  报价: "bg-orange-400",
  谈判: "bg-red-400",
  已成交: "bg-green-400",
  维护: "bg-teal-400",
};

export default function LeadsPage() {
  const router = useRouter();

  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClients(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const grouped = STAGES.reduce(
    (acc, stage) => {
      acc[stage] = clients.filter((c) => c.stage === stage);
      return acc;
    },
    {} as Record<string, ClientData[]>
  );

  if (loading) {
    return <div className="text-center py-10 text-sm text-gray-400">加载中...</div>;
  }

  const total = clients.length;

  return (
    <div className="space-y-5">
      {STAGES.map((stage) => {
        const list = grouped[stage] || [];
        const pct = total > 0 ? Math.round((list.length / total) * 100) : 0;

        return (
          <div key={stage}>
            {/* 阶段标题行 */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${STAGE_DOT[stage]}`} />
                <span className={`text-sm font-semibold ${STAGE_COLORS[stage]}`}>
                  {stage}
                </span>
                <span className="text-xs text-gray-400">{list.length}</span>
              </div>
              {/* 进度条 */}
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-300">{pct}%</span>
              </div>
            </div>

            {/* 客户卡片 — 横向滑动 */}
            {list.length === 0 ? (
              <p className="text-xs text-gray-300 pl-4 border-l-2 border-gray-100 ml-1 py-2">暂无客户</p>
            ) : (
              <div className="flex gap-2.5 overflow-x-auto pb-2 -mr-4 pr-4 scrollbar-hide snap-x">
                {/* 占位对齐圆点 */}
                <div className="w-0" />
                {list.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/clients/${c.id}`)}
                    className="flex-shrink-0 w-[148px] bg-white rounded-xl p-3 shadow-sm border border-gray-50 cursor-pointer hover:shadow-md active:scale-[0.97] transition-all snap-start"
                  >
                    <p className="text-xs font-semibold truncate">{c.name}</p>
                    {c.company ? (
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{c.company}</p>
                    ) : (
                      <p className="text-[10px] text-gray-300 mt-0.5">—</p>
                    )}
                    {c.probability !== null && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{ width: `${c.probability}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-gray-400">{c.probability}%</span>
                      </div>
                    )}
                    {c.lastFollowAt && (
                      <p className="text-[9px] text-gray-300 mt-1.5">
                        {Math.floor((Date.now() - new Date(c.lastFollowAt).getTime()) / (1000 * 60 * 60 * 24))}天前跟进
                      </p>
                    )}
                  </div>
                ))}
                {/* 右侧留白 */}
                <div className="w-1 flex-shrink-0" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
