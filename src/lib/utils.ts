/**
 * 知客 KnowClient — 通用工具函数
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** 合并 Tailwind 类名，自动去重和优化 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 格式化日期为友好显示 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "从未";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}月前`;
  return d.toLocaleDateString("zh-CN");
}

/** 阶段对应的颜色类名 */
export function getStageColor(stage: string): string {
  const map: Record<string, string> = {
    新线索: "bg-gray-100 text-gray-600",
    初步接触: "bg-blue-50 text-blue-600",
    需求确认: "bg-purple-50 text-purple-600",
    报价: "bg-orange-50 text-orange-600",
    谈判: "bg-red-50 text-red-600",
    已成交: "bg-green-50 text-green-600",
    维护: "bg-teal-50 text-teal-600",
  };
  return map[stage] || "bg-gray-100 text-gray-600";
}

/** 优先级对应的颜色类名 */
export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    urgent: "bg-red-50 text-red-500 border-red-200",
    high: "bg-orange-50 text-orange-500 border-orange-200",
    normal: "bg-blue-50 text-blue-500 border-blue-200",
  };
  return map[priority] || map.normal;
}

/** 优先级对应的标签文字 */
export function getPriorityLabel(priority: string): string {
  const map: Record<string, string> = {
    urgent: "⚠ 紧急",
    high: "● 重要",
    normal: "常规",
  };
  return map[priority] || priority;
}
