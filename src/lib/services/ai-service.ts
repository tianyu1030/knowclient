/**
 * 知客 KnowClient — AI 业务服务层
 *
 * 封装所有 AI 调用场景，提供清晰的业务语义
 * 四大场景：
 *   1. parseNote()              — 解析沟通记录
 *   2. generateDailySuggestions() — 生成每日跟进建议
 *   3. generateWeeklyReport()   — 生成周报
 *   4. queryInsight()           — 自然语言查询
 */
import { chat, AI_MODELS } from "@/lib/ai/deepseek";

// ============================================================
// 1. 沟通记录解析
// ============================================================

/** AI解析返回结构 */
interface ParsedNote {
  summary: string; // 沟通要点（1-2句话）
  stage: string; // 客户阶段
  tags: string[]; // 标签数组
  todo: string | null; // 待办事项（如果有承诺）
  sentiment: "positive" | "neutral" | "negative"; // 情绪判断
}

/**
 * 解析用户输入的沟通记录 → 结构化信息
 *
 * 场景：用户在"快速记录"中写了一句话，
 * AI 自动提取关键信息并更新客户画像。
 *
 * @param rawText - 用户原始输入，如"刚和李总通了电话，他对报价80万有异议"
 * @returns 结构化信息，用于更新客户标签、阶段、待办
 */
export async function parseNote(rawText: string): Promise<ParsedNote> {
  const result = await chat(
    `你是一个销售助手。从用户的沟通记录中提取结构化信息。

返回纯 JSON（不要 Markdown 代码块，不要注释）：
{
  "summary": "沟通要点总结（1-2句话）",
  "stage": "客户当前阶段",
  "tags": ["标签1", "标签2"],
  "todo": "待办事项（如果用户承诺了什么）或 null",
  "sentiment": "沟通情绪"
}

客户阶段必须是以下之一：新线索、初步接触、需求确认、报价、谈判、已成交、维护
标签示例：价格敏感、决策者、积极信号、竞品对比中、需要技术支持、意向度高
情绪必须是：positive（积极）、neutral（中性）、negative（消极）`,
    rawText,
    { model: AI_MODELS.CHAT, temperature: 0.3 }
  );

  // 尝试清理可能的 Markdown 代码块标记
  let content = result.content;
  content = content.replace(/^```(json)?\s*/i, "").replace(/\s*```$/i, "");

  return JSON.parse(content);
}

// ============================================================
// 2. 每日跟进建议
// ============================================================

/** 跟进建议项 */
interface FollowSuggestion {
  clientId: string;
  priority: "urgent" | "high" | "normal";
  suggestion: string; // 具体建议，含话术要点
  reason: string; // 建议原因
}

/** AI洞察摘要 */
interface AiInsight {
  summary: string; // AI洞察总结（如"3位客户需要关注"）
  suggestions: FollowSuggestion[];
}

/**
 * 生成每日跟进建议
 *
 * 场景：每天早上8点（Vercel Cron）或用户打开"今日"页面时，
 * AI 分析所有客户数据，生成按优先级排序的跟进清单。
 *
 * @param clients - 用户的所有客户数据（摘要版，不含完整历史）
 * @returns AI 洞察 + 优先级排序的建议列表
 */
export async function generateDailySuggestions(
  clients: Array<{
    id: string;
    name: string;
    company: string | null;
    stage: string;
    lastFollowAt: string | null;
    aiTags: string[];
  }>
): Promise<AiInsight> {
  // 如果客户数量很少，返回简单建议
  if (clients.length === 0) {
    return {
      summary: "还没有客户数据，请先添加第一个客户开始使用。",
      suggestions: [],
    };
  }

  const result = await chat(
    `你是一个资深销售参谋。根据以下客户数据，生成今日跟进建议。

返回纯 JSON（不要 Markdown 代码块）：
{
  "summary": "一句话全局洞察（如：'3位客户需要紧急跟进，2位出现积极信号'）",
  "suggestions": [
    {
      "clientId": "客户ID",
      "priority": "urgent|high|normal",
      "suggestion": "具体跟进建议（含话术要点，控制在50字以内）",
      "reason": "简短说明为什么建议跟进"
    }
  ]
}

优先级判断规则（按重要性递减）：
1. urgent（紧急）— 高意向客户超过建议跟进周期未联系，或客户表达负面信号
2. high（重要）  — 有积极信号（如多次查看资料），或普通客户超过跟进周期
3. normal（常规）— 定期维护、新线索首次接触、已成交客户回访

建议质量要求：
- 每条建议包含具体话术方向（如"发送行业案例"、"电话确认需求细节"）
- reason 说明判断依据（如"5天未跟进，报价阶段停滞"）`,
    JSON.stringify(clients),
    { model: AI_MODELS.CHAT, temperature: 0.7 }
  );

  let content = result.content;
  content = content.replace(/^```(json)?\s*/i, "").replace(/\s*```$/i, "");

  return JSON.parse(content);
}

// ============================================================
// 3. 周报生成
// ============================================================

/**
 * 生成每周销售周报
 *
 * 场景：每周五18:00（Vercel Cron），AI 自动生成周报
 *
 * @param stats - 本周统计数据
 * @returns AI 生成的周报文字
 */
export async function generateWeeklyReport(stats: {
  totalFollows: number;
  newClients: number;
  closedDeals: number;
  stageChanges: Array<{ name: string; from: string; to: string }>;
  topClients: Array<{ name: string; company: string; reason: string }>;
}): Promise<string> {
  const result = await chat(
    `你是一个数据分析师。根据本周销售数据，生成一份简洁的工作周报。

要求：
- 本周数据摘要（3-5句话，包含关键数字）
- 值得关注的亮点（1-2个）
- 需要改善的地方（1个，如果有）
- 下周重点建议（2-3条，具体可执行）

语气：专业但亲切，像团队内部复盘。控制在300字以内。`,
    JSON.stringify(stats),
    { model: AI_MODELS.CHAT, temperature: 0.7 }
  );

  return result.content;
}

// ============================================================
// 4. 自然语言查询
// ============================================================

/**
 * 自然语言查询 → 数据洞察
 *
 * 场景：用户在"洞察"页面用自然语言提问，
 * 如"最近谁快跟丢了？""哪个阶段的客户最多？"
 *
 * @param question - 用户问题
 * @param context  - 结构化数据上下文（客户统计、阶段分布等）
 * @returns AI 分析结果（自然语言）
 */
export async function queryInsight(
  question: string,
  context: string
): Promise<string> {
  const result = await chat(
    `你是一个数据分析助手。根据提供的数据上下文，用中文回答用户的问题。

数据上下文是 JSON 格式，包含客户统计、阶段分布、跟进频率等信息。
如果问题无法从数据中回答，如实说明原因。

回答要求：
- 直接回答问题，不要铺垫
- 如果有数据支撑，引用具体数字
- 如果发现需要关注的问题，主动提醒`,
    `用户问题：${question}\n\n数据上下文：${context}`,
    { model: AI_MODELS.REASONER, temperature: 0.3 }
  );

  return result.content;
}
