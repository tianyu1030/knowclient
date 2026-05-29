/**
 * 知客 KnowClient — DeepSeek AI 客户端
 *
 * DeepSeek API 兼容 OpenAI SDK，只需改 baseURL
 * 两个模型：
 *   deepseek-chat     — 日常对话、记录解析、建议生成
 *   deepseek-reasoner — 深度推理、复杂分析
 */
import OpenAI from "openai";

// DeepSeek 兼容 OpenAI SDK
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: "https://api.deepseek.com",
});

/** 可用模型常量 */
export const AI_MODELS = {
  /** 日常对话模型：记录解析、跟进建议、周报 — 性价比最高 */
  CHAT: "deepseek-chat",
  /** 推理模型：自然语言查询、数据深度分析 */
  REASONER: "deepseek-reasoner",
} as const;

/** 聊天补全参数 */
interface ChatParams {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/** 聊天补全返回结果 */
interface ChatResult {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * 通用聊天补全（非流式）
 *
 * @param systemPrompt - 系统提示词（角色设定、任务要求）
 * @param userMessage  - 用户消息
 * @param params       - 模型参数（可选）
 * @returns AI回复 + Token用量
 */
export async function chat(
  systemPrompt: string,
  userMessage: string,
  params: ChatParams = {}
): Promise<ChatResult> {
  // 开发环境下，如果未配置 API Key，返回模拟数据
  if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY.startsWith("sk-your-")) {
    console.warn("[DeepSeek] API Key 未配置，返回模拟响应");
    return {
      content: JSON.stringify({
        summary: "模拟响应：API Key 未配置",
        stage: "初步接触",
        tags: ["待配置"],
        todo: null,
        sentiment: "neutral",
      }),
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }

  const response = await client.chat.completions.create({
    model: params.model || AI_MODELS.CHAT,
    temperature: params.temperature ?? 0.7,
    max_tokens: params.maxTokens || 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  return {
    content: response.choices[0].message.content || "",
    usage: {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    },
  };
}

/**
 * 流式聊天补全（用于需要实时展示的场景）
 * 使用示例：
 *   for await (const chunk of chatStream(system, user)) {
 *     process.stdout.write(chunk);
 *   }
 */
export async function* chatStream(
  systemPrompt: string,
  userMessage: string,
  params: ChatParams = {}
): AsyncGenerator<string> {
  if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY.startsWith("sk-your-")) {
    yield "API Key 未配置，请在 .env.local 中设置 DEEPSEEK_API_KEY";
    return;
  }

  const stream = await client.chat.completions.create({
    model: params.model || AI_MODELS.CHAT,
    temperature: params.temperature ?? 0.7,
    max_tokens: params.maxTokens || 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}
