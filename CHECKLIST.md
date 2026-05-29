# 知客 KnowClient — 开发与部署清单

## 一、本地开发环境准备

### 1.1 必需环境

- [ ] **Node.js** >= 20.x（推荐 22.x）
- [ ] **npm** >= 10.x（Node.js 自带）
- [ ] **MySQL** >= 8.0（本地安装或使用 Docker）
- [ ] **Git**（版本管理）

### 1.2 MySQL 准备

```bash
# 方式1: 本地安装 MySQL
# macOS:  brew install mysql@8.0
# Ubuntu: sudo apt install mysql-server-8.0

# 方式2: Docker（推荐，零配置）
docker run -d --name knowclient-mysql \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=knowclient \
  -p 3306:3306 \
  mysql:8.0

# 创建数据库（如果手动安装）
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS knowclient CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

## 二、项目启动

### 2.1 首次启动

```bash
# 1. 进入项目目录
cd knowclient

# 2. 安装依赖
npm install

# 3. 配置环境变量（复制模板）
cp .env.example .env.local

# 4. 编辑 .env.local，填入真实值
#    - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME（数据库连接）
#    - DEEPSEEK_API_KEY（AI能力，在 https://platform.deepseek.com 获取）

# 5. 初始化数据库表结构
npm run db:push

# 6. 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可看到登录页。

### 2.2 日常开发

```bash
npm run dev          # 启动开发服务器（热更新）
npm run db:studio    # 打开数据库管理界面（Drizzle Studio）
npm run build        # 生产构建
npm run start        # 启动生产服务器
```

---

## 三、环境变量配置说明

编辑 `.env.local`，必填项：

```env
# === 数据库 ===
DB_HOST=localhost          # MySQL 地址
DB_PORT=3306               # MySQL 端口
DB_USER=root               # 数据库用户名
DB_PASSWORD=your_password  # 数据库密码
DB_NAME=knowclient         # 数据库名

# === AI 模型 ===
DEEPSEEK_API_KEY=sk-xxx    # DeepSeek API Key

# === 认证 ===
AUTH_SECRET=random-string  # 随机字符串（openssl rand -base64 32）
```

> **注意**：如果未配置 `DEEPSEEK_API_KEY`，AI 功能会返回模拟数据，不影响其他功能使用。

---

## 四、功能自测清单

开发完成后，逐项验证以下功能：

### 4.1 认证

- [ ] 访问 http://localhost:3000 自动跳转到登录页
- [ ] 输入邮箱，点击"登录/注册"成功跳转到 /today
- [ ] 未登录访问 /clients 自动跳转到登录页
- [ ] 退出登录后回到登录页

### 4.2 今日页面（首页）

- [ ] 页面显示问候语和用户名
- [ ] 显示 AI 洞察摘要（需配置 DeepSeek Key）
- [ ] 未配置 DeepSeek Key 时显示模拟建议
- [ ] 客户卡片显示：姓名、公司、阶段、优先级、AI建议
- [ ] 点击"已跟进"按钮后卡片消失
- [ ] 点击客户卡片跳转到客户详情
- [ ] 空状态：无客户时显示引导文案

### 4.3 客户管理

- [ ] 看板视图：按阶段分列显示，横向可滚动
- [ ] 列表视图：客户卡片纵向排列
- [ ] 搜索框：输入姓名或公司可筛选
- [ ] 点击客户卡片跳转到详情
- [ ] 新增客户按钮弹出表单
- [ ] AI 一句话录入：输入描述文字 → 点击"AI自动填充" → 表单字段自动填充
- [ ] 手动填写表单 → 保存成功 → 列表刷新
- [ ] 空状态：无客户时显示引导

### 4.4 客户详情

- [ ] 显示客户姓名、公司、职位、阶段
- [ ] 显示成交概率
- [ ] 显示 AI 摘要（如果 AI 生成过）
- [ ] 显示标签列表
- [ ] 显示跟进时间线（按时间倒序）
- [ ] 时间线支持展开 AI 解析详情
- [ ] 返回按钮回到上一页
- [ ] 无记录时显示"暂无沟通记录"

### 4.5 快速记录

- [ ] 点击右下角 + 按钮弹出记录面板
- [ ] 输入文本 + 选择关联客户 → 提交
- [ ] 成功提示"AI已自动更新客户信息"
- [ ] 关联客户的详情页中出现该记录
- [ ] 客户的标签和摘要被 AI 更新（需 DeepSeek Key）

### 4.6 AI 洞察

- [ ] 自然语言查询：输入问题 → 点击"提问" → 显示 AI 回答
- [ ] 数据统计卡片：显示客户总数、本周新增等
- [ ] AI 周报：显示周报内容或"暂无数据"

### 4.7 设置

- [ ] 显示通知设置（每日提醒、预警、周报、语音）
- [ ] 显示用户信息（名称、邮箱）
- [ ] 显示当前模式（个人版）
- [ ] "升级团队版"按钮禁用状态
- [ ] 退出登录功能正常

### 4.8 边界情况

- [ ] 空数据状态：无客户、无记录时各页面正常显示
- [ ] 加载状态：数据加载中显示加载动画
- [ ] 错误状态：API 失败时显示错误信息和重试入口
- [ ] 移动端适配：在手机浏览器上查看布局正常
- [ ] 表单校验：姓名不能为空，提交前校验

---

## 五、部署上线

### 5.1 Vercel 部署（推荐）

```bash
# 1. 将项目推送到 GitHub
git init
git add .
git commit -m "feat: 知客 KnowClient MVP v0.1"
git remote add origin git@github.com:yourname/knowclient.git
git push -u origin main

# 2. 在 Vercel 中导入项目
#    - 打开 https://vercel.com
#    - Import Project → 选择 GitHub 仓库
#    - 框架自动识别为 Next.js
#    - 配置环境变量（同 .env.local 中的内容）

# 3. 等待自动部署完成，访问 Vercel 提供的域名
```

### 5.2 MySQL 生产环境

```bash
# 推荐方案（按成本从低到高）：

# 方案A: Aiven MySQL 免费计划（开发/测试）
# https://aiven.io/free-mysql-database
# 1核1G, 5GB — 完全免费

# 方案B: Railway MySQL（小规模生产）
# https://railway.app
# $5/月起 — 自动备份

# 方案C: 阿里云 RDS MySQL（国内生产）
# https://www.aliyun.com/product/rds/mysql
# 1核1G, 20GB — ¥40/月起

# 获取连接信息后，在 Vercel 环境变量中配置：
# DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
```

### 5.3 DeepSeek API

```bash
# 1. 注册 https://platform.deepseek.com
# 2. 获取 API Key
# 3. 在 Vercel 环境变量中配置 DEEPSEEK_API_KEY
# 4. 充值（最低 ¥10 起，够用几个月）
```

### 5.4 数据库迁移（生产环境）

```bash
# 在本地执行迁移命令，指向生产数据库
DB_HOST=prod-host DB_USER=prod-user DB_PASSWORD=xxx DB_NAME=knowclient npm run db:push
```

### 5.5 自定义域名

```bash
# 1. 购买域名（如 knowclient.app）
# 2. 在 Vercel 项目设置 → Domains 中添加
# 3. 更新 DNS 记录指向 Vercel
# 4. 更新 .env 中的 AUTH_URL 为 https://your-domain.com
```

---

## 六、定时任务配置

Vercel Cron Jobs 放在 `vercel.json`：

```json
{
  "crons": [
    {
      "path": "/api/ai/suggest",
      "schedule": "0 0 * * *"
    }
  ]
}
```

> MVP 阶段 AI 建议在用户打开页面时实时生成，定时任务为可选优化。

---

## 七、项目结构速查

```
knowclient/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # 仪表盘（需登录）
│   │   │   ├── today/          # 今日页面
│   │   │   ├── clients/        # 客户管理
│   │   │   ├── insights/       # AI 洞察
│   │   │   └── settings/       # 设置
│   │   ├── api/                # API 路由
│   │   │   ├── clients/        # 客户 CRUD
│   │   │   ├── notes/          # 沟通记录
│   │   │   ├── ai/             # AI 服务
│   │   │   └── insights/       # 统计洞察
│   │   └── auth/login/         # 登录页
│   ├── lib/
│   │   ├── db/                 # 数据库（Schema + 连接）
│   │   ├── ai/                 # DeepSeek 客户端
│   │   ├── services/           # 业务服务层
│   │   └── auth.ts             # NextAuth 配置
│   └── middleware.ts           # 认证中间件
├── drizzle/                    # 数据库迁移文件
├── .env.example                # 环境变量模板
├── CHECKLIST.md                # 本文件
├── package.json
└── README.md
```

---

## 八、常见问题

### Q: npm install 报错？
```bash
# 清除缓存重试
rm -rf node_modules package-lock.json
npm install
```

### Q: 数据库连接失败？
```bash
# 检查 MySQL 是否启动
mysql -u root -p -e "SELECT 1"

# 检查 .env.local 中的连接信息
cat .env.local | grep DB_

# 测试连接
node -e "const mysql=require('mysql2/promise');mysql.createConnection({host:'localhost',user:'root',password:'xxx',database:'knowclient'}).then(c=>{console.log('OK');c.end()}).catch(e=>console.error(e))"
```

### Q: AI 功能不工作？
```bash
# 1. 检查 DEEPSEEK_API_KEY 是否配置
echo $DEEPSEEK_API_KEY

# 2. 检查 Key 是否有效
curl https://api.deepseek.com/v1/models -H "Authorization: Bearer $DEEPSEEK_API_KEY"

# 3. 未配置 Key 时会返回模拟数据，不影响其他功能
```

### Q: 端口被占用？
```bash
# 指定其他端口
npm run dev -- -p 3001
```

---

*清单版本：v1.0 | 最后更新：2026-05-28*
