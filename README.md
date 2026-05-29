# 知客 KnowClient

> AI 驱动的轻量级客户关系管理工具 — 让每个销售都拥有自己的 AI 参谋

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-ff6b00?logo=drizzle)](https://orm.drizzle.team/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7-4479A1?logo=mysql)](https://www.mysql.com/)
[![DeepSeek](https://img.shields.io/badge/AI-DeepSeek-8b5cf6)](https://www.deepseek.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## 这是什么

知客（KnowClient）是一个面向个人销售和自由职业者的 AI 客户管理工具。你只需要用一句话记录沟通，AI 会自动提取关键信息、更新客户画像、生成跟进建议，并在每天早上告诉你今天该联系谁。

**核心理念**：不是又一个笨重的 CRM，而是一个懂销售的 AI 伙伴。

## 功能

### 客户管理
- **客户列表**：搜索、筛选、阶段管理
- **线索看板**：按销售阶段（新线索 → 已成交 → 维护）纵列展示，卡片式左右滑动
- **客户画像**：单一视图展示基本信息、AI 摘要、沟通时间线
- **一键录入**：支持自然语言输入，AI 自动识别姓名、公司、阶段

### AI 销售参谋
- **每日跟进建议**：打开首页即看到 AI 按优先级排序的今日行动清单
- **智能建议**：每条建议包含话术方向和判断依据
- **跟进/推迟**：一键标记，已处理客户当天不再重复推荐

### 沟通记录
- **快速记录**：用一句话描述沟通内容，AI 自动提取要点、标签、情绪、待办
- **自动更新**：记录提交后，客户阶段、标签、摘要自动同步
- **时间线**：客户详情页完整展示历史沟通

### 数据洞察
- **数据概览**：总客户数、本周新增、待跟进、已成交 — 秒级返回
- **AI 周报**：每周自动生成工作周报（当天缓存，不重复消耗 token）
- **自然语言查询**：用中文提问，如「最近谁快跟丢了？」「哪个阶段的客户最多？」

### 账户
- **邮箱密码注册/登录**（NextAuth JWT）
- **个人信息编辑**（全局同步刷新）

## 技术栈

| 层级 | 选型 | 说明 |
|---|---|---|
| 框架 | Next.js 15 (App Router) | 服务端组件 + API Route |
| 语言 | TypeScript 5.7 (strict) | 全量类型安全 |
| ORM | Drizzle ORM 0.41 | 查询构建器模式，手动多查询替代 LATERAL（兼容 MySQL 5.7） |
| 数据库 | MySQL 5.7 | InnoDB，JSON / ENUM 原生支持 |
| 认证 | NextAuth v5 (Credentials) | JWT 策略，scrypt 密码哈希，无第三方 adapter |
| AI | DeepSeek (OpenAI 兼容) | deepseek-chat + deepseek-reasoner |
| 样式 | Tailwind CSS 3.4 | 移动优先，iOS 风格圆角卡片 |
| 部署 | Vercel / 自托管 Node.js | `serverExternalPackages: ["mysql2"]` |

## 项目结构

```
knowclient/
├── init.sql                    # MySQL 5.7 建表脚本（含所有表 + 索引 + 外键）
├── migrate-*.sql               # 增量迁移脚本
├── next.config.ts              # Next.js 配置
├── drizzle.config.ts           # Drizzle Kit 配置
├── src/
│   ├── app/
│   │   ├── (dashboard)/        # 仪表盘（需登录）
│   │   │   ├── layout.tsx      # 服务端认证守卫
│   │   │   ├── layout-inner.tsx # 客户端 UI（导航栏 / FAB / 快速记录）
│   │   │   ├── today/          # 今日首页 — AI 跟进建议
│   │   │   ├── leads/          # 线索看板 — 管线视图
│   │   │   ├── clients/        # 客户列表 + 详情
│   │   │   ├── insights/       # 数据洞察 + AI 周报
│   │   │   └── settings/       # 账户设置
│   │   ├── auth/
│   │   │   ├── login/          # 登录页
│   │   │   └── register/       # 注册页
│   │   └── api/
│   │       ├── auth/           # NextAuth + 注册
│   │       ├── clients/        # 客户 CRUD
│   │       ├── notes/          # 沟通记录
│   │       ├── ai/             # AI 建议 / 解析 / 推迟 / 查询
│   │       ├── insights/       # 统计 + 周报缓存
│   │       └── user/           # 个人资料
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts        # 数据库连接池（单例，MySql2Database 类型）
│   │   │   └── schema.ts       # Drizzle 表定义 + 关系（6 表）
│   │   ├── auth.ts             # NextAuth 配置
│   │   ├── auth/password.ts    # scrypt 密码哈希
│   │   ├── ai/deepseek.ts      # DeepSeek 客户端（OpenAI SDK）
│   │   ├── services/
│   │   │   ├── client-service.ts  # 客户业务逻辑
│   │   │   ├── note-service.ts    # 沟通记录 + AI 解析
│   │   │   └── ai-service.ts      # AI 场景封装（4 大场景）
│   │   └── utils.ts            # 工具函数
│   └── middleware.ts           # 停用（认证移至 layout 层）
└── package.json
```

## 快速开始

### 环境要求

- Node.js 18+
- MySQL 5.7+
- DeepSeek API Key（[申请地址](https://platform.deepseek.com/)）

### 1. 克隆项目

```bash
git clone https://github.com/your-org/knowclient.git
cd knowclient
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=knowclient

# DeepSeek AI
DEEPSEEK_API_KEY=sk-your-api-key

# NextAuth
AUTH_SECRET=openssl rand -base64 32
```

### 4. 初始化数据库

```bash
mysql -u root -p < init.sql
```

已有数据库执行增量迁移：

```bash
mysql -u root -p knowclient < migrate-password.sql
mysql -u root -p knowclient < migrate-weekly-cache.sql
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`，注册账号即可使用。

### 6. 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

环境变量在 Vercel Dashboard → Settings → Environment Variables 中配置，与 `.env.local` 一致。注意：

- `DB_HOST` 需填写可公网访问的 MySQL 地址
- `AUTH_SECRET` 使用 `openssl rand -base64 32` 生成

## API 一览

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/clients` | 客户列表（支持 `?search=&stage=`） |
| `POST` | `/api/clients` | 新增客户 |
| `GET` | `/api/clients/[id]` | 客户详情（含沟通记录 + 待办） |
| `PUT` | `/api/clients/[id]` | 更新客户信息 |
| `DELETE` | `/api/clients/[id]` | 删除客户 |
| `POST` | `/api/notes` | 添加沟通记录（AI 自动解析） |
| `POST` | `/api/ai/suggest` | 获取今日跟进建议 |
| `POST` | `/api/ai/parse` | 预览 AI 解析结果 |
| `POST` | `/api/ai/dismiss` | 推迟某客户今日建议 |
| `POST` | `/api/ai/query` | 自然语言数据查询 |
| `GET` | `/api/insights/stats` | 数据概览（秒返） |
| `GET` | `/api/insights/weekly` | AI 周报（当天缓存） |
| `PUT` | `/api/user/profile` | 修改用户名 |
| `POST` | `/api/auth/register` | 注册 |
| `*` | `/api/auth/*` | NextAuth 登录/登出 |

## 设计决策

### 为什么不用 Drizzle Relations API？

Drizzle 的 `db.query.*.findFirst({ with: {...} })` 本质是编译期将关系查询展开为 SQL。展开结果是 `LATERAL` join + `ROW_NUMBER() OVER()` + `JSON_ARRAYAGG()`，全部是 MySQL 8.0+ 语法。

本项目定位兼容 MySQL 5.7，因此采用**手动多查询 + JS 层组装**策略：主表一次查询，关联表分别查询，内存中组合结果。性能开销可忽略（多 2-3 次查询），换来完全的版本兼容性。

### 为什么认证不在 middleware？

Next.js middleware 运行在 Edge Runtime，无法加载 `mysql2`（Node.js 原生模块）。本项目将认证守卫放在 `(dashboard)/layout.tsx`（Server Component，Node.js Runtime），middleware 改为空操作。这是 NextAuth + MySQL 的推荐架构。

### 为什么周报用缓存？

每次请求都调 AI 生成周报会产生不必要的 token 消耗。本项目在 users 表增加 `weekly_report` + `weekly_report_at` 字段，当天内重复请求直接返回缓存，避免重复计费。

## 数据库 Schema

6 张核心表：

```
users           — 用户（含密码哈希、周报缓存）
clients         — 客户（ENUM 阶段、JSON 标签、成交概率）
notes           — 沟通记录（原始文本 + AI 结构化 JSON）
todos           — 待办（支持 AI 自动创建）
ai_suggestions  — AI 跟进建议缓存（dismiss 机制）
ai_events       — AI 事件日志（行为信号）
```

详见 `src/lib/db/schema.ts` 和 `init.sql`。

## 路线图

- [x] MVP v0.1 — 客户管理 + AI 建议 + 沟通记录 + 数据洞察
- [ ] 团队版 — 多人协作、权限管理
- [ ] 邮件集成 — 自动抓取邮件沟通记录
- [ ] 移动端 PWA — 离线支持 + 推送通知
- [ ] 语音记录 — 语音转文字快速录入
- [ ] 智能预警 — 客户流失风险自动检测

## License

MIT

---

<p align="center">
  <sub>Built with ❤️ by the KnowClient team</sub>
</p>
