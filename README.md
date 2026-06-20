# 🪐 星际漂流计划 | Cosmic Drift

> 一个由用户亲手绘制、AI赋予生命的数字生物宇宙。它们在星海中漂流、互动、选择被谁理解——而非被谁拥有。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-61dafb)](https://reactjs.org/)

**项目状态**：🚧 开发中 | **当前版本**：v0.2.0-alpha

## 📖 项目简介

星际漂流计划（Cosmic Drift）是一个数字生命共创与连接平台，面向热爱创造与共感的年轻人群体。结合 AI 生成、社交互动与视觉艺术，构建一个可浏览、可对话、可被选择的虚拟生命生态。

### 核心概念

- 🌱 **生命（Creature）**: 用户绘制或上传的原创生物，经AI补全背景与性格后生成的虚拟生命体
- 🌌 **星图（Galaxy Map）**: 展示所有生命的可视化星空界面，用户可浏览、抽盲盒或与生物对话
- 💬 **对话（Conversation）**: 用户与生命的互动方式，生命根据自身性格和记忆回应
- 🔮 **认养（Adoption）**: 当契合度足够高，生命会主动邀请用户成为"理解者"
- 📜 **宇宙日志（Cosmic Log）**: 用户可公开对话记录或生命的成长日志，形成公共故事流

## 🚀 快速开始

### 前置要求

- Node.js 18+
- MySQL 8.0+
- 通义千问 API Key (可选，用于 AI 功能)

### 5 分钟启动

```bash
# 1. 安装依赖
cd backend && npm install
cd ../frontend && npm install

# 2. 配置环境变量
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# 编辑 .env 文件，配置数据库

# 3. 初始化数据库
cd backend && npm run migrate

# 4. 启动服务
# 终端 1
cd backend && npm run dev

# 终端 2
cd frontend && npm start
```

**详细指南**：[快速启动指南](./docs/快速启动指南.md) | [项目交接文档](./docs/archive/PROJECT-HANDOVER.md)

## 🎮 使用流程

### 1. 创造生命
在首页点击"创造"按钮，通过画布绘制或上传图片创建你的数字生命。AI 会自动分析图像并生成独特的性格、背景故事和栖息地描述。

### 2. 浏览星系
进入"星际漂流"页面，查看所有漂流中的数字生命。每个生命都以粒子轮廓的形式展示，点击可查看详细档案。

### 3. 开启对话
点击生物档案中的"开始对话"按钮，与数字生命进行 AI 驱动的角色对话。生命会根据自己的性格、背景和当前情绪值做出独特回应。

### 4. 建立连接
通过持续对话提升契合度，当契合度足够高时，生命会主动邀请你成为它的"理解者"（认养功能开发中）。

## 📁 项目结构

```
cosmicDrift/
├── frontend/              # React 前端应用
│   ├── src/
│   │   ├── components/   # React 组件
│   │   ├── pages/        # 页面组件
│   │   ├── services/     # API 服务
│   │   ├── types/        # TypeScript 类型
│   │   └── utils/        # 工具函数
│   └── package.json
│
├── backend/              # Node.js 后端应用
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── services/     # 业务逻辑
│   │   ├── models/       # 数据模型
│   │   ├── repositories/ # 数据访问层
│   │   ├── routes/       # 路由配置
│   │   ├── middleware/   # 中间件
│   │   └── types/        # TypeScript 类型
│   ├── migrations/       # 数据库迁移
│   └── package.json
│
├── scripts/              # 启动脚本
│   ├── 快速启动.bat      # 交互式启动菜单
│   ├── start-dev.bat     # 开发环境启动
│   ├── start-dev.ps1     # PowerShell 启动脚本
│   └── install-all.bat   # 依赖安装脚本
│
├── docs/                 # 项目文档
│   ├── 快速启动指南.md
│   ├── 生物模块文档.md
│   └── 开发规范.md
│
├── .kiro/                # Kiro 规格文档
│   └── specs/
│       └── cosmic-drift/
│           ├── requirements.md  # 需求文档
│           ├── design.md        # 设计文档
│           └── tasks.md         # 任务列表
│
└── package.json          # 根项目配置
```

## ✨ 核心功能

### 已实现 ✅

- [x] 用户认证系统（注册、登录、JWT）
- [x] 生物创建模块
  - [x] 画布绘图（Fabric.js）
  - [x] 图片上传
  - [x] AI 图像分析（通义千问 Qwen-VL-Plus）
  - [x] AI 档案生成（通义千问 Qwen-Plus）
  - [x] 档案编辑器
- [x] 粒子轮廓系统
  - [x] 智能轮廓提取
  - [x] 粒子动画渲染
  - [x] 情绪值驱动效果
- [x] 星系展示页面
  - [x] 生物卡片展示
  - [x] 详情查看
  - [x] 粒子效果预览
- [x] AI 对话系统
  - [x] 角色化对话（基于性格和背景）
  - [x] 情绪系统（0-100情绪值）
  - [x] 对话历史记录
  - [x] 对话列表管理

### 开发中 🚧

- [ ] 星际漂流 3D 可视化（Three.js）
- [ ] 契合度计算与认养机制
- [ ] 宇宙日志与社区功能

### 计划中 📋

- [ ] WebSocket 实时通信
- [ ] 每日生命状态更新
- [ ] 性能优化与监控
- [ ] 移动端适配

---

## 🚀 部署

项目支持多种部署方案：

### 推荐方案（最简单）
- **前端**：Vercel（免费）
- **后端**：Railway（$5 免费额度/月）
- **数据库**：Railway MySQL（包含）

### 快速部署
查看 [快速部署指南](./docs/快速部署-Vercel+Railway.md)，10 分钟即可部署上线。

### 其他方案
- Render + Vercel
- 云服务器全栈部署
- Docker 容器化部署

详见 [完整部署指南](./docs/部署指南.md)

## 🛠️ 技术栈

### 前端
- React 18 + TypeScript
- Three.js (3D 可视化)
- Fabric.js (画布绘图)
- TailwindCSS (样式系统)
- Framer Motion (动画)
- Socket.io-client (实时通信)

### 后端
- Node.js + Express + TypeScript
- MySQL 8.0 (关系数据库)
- Canvas (服务端图像处理)
- Socket.io (WebSocket，计划中)
- Bull + Redis (任务队列，计划中)

### AI 服务
- 通义千问 Qwen-Plus (角色对话、档案生成)
- 通义千问 Qwen-VL-Plus (图像分析)

## 📚 文档

### 快速入门
- [⚡ 快速启动指南](./docs/快速启动指南.md) - 5 分钟启动项目
- [📋 项目交接文档](./docs/archive/PROJECT-HANDOVER.md) - 完整项目说明
- [🛠️ 开发规范](./docs/开发规范.md) - 开发规范和最佳实践
- [🚀 运行和调试指南](./docs/运行和调试指南.md) - 详细的运行说明

### 部署指南
- [⚡ 快速部署（Vercel + Railway）](./docs/快速部署-Vercel+Railway.md) - 10 分钟部署上线
- [📦 完整部署指南](./docs/部署指南.md) - 多种部署方案详解

### 功能文档
- [💬 对话系统文档](./docs/对话系统文档.md) - AI 对话系统实现详解
- [🌱 生物模块文档](./docs/生物模块文档.md) - 生物创建和管理
- [📊 项目结构说明](./docs/项目结构说明.md) - 完整的项目结构
- [🗄️ MySQL 数据库设置](./docs/MySQL数据库设置.md) - 数据库配置指南
- [🔧 API 测试指南](./docs/API测试指南.md) - API 接口测试

### 后端文档
- [后端 API 文档](./backend/README.md) - API 接口说明
- [认证系统文档](./backend/README_AUTH.md) - 用户认证系统

### 规格文档
- [需求文档](./.kiro/specs/cosmic-drift/requirements.md) - 完整需求规格
- [设计文档](./.kiro/specs/cosmic-drift/design.md) - 系统设计文档
- [任务列表](./.kiro/specs/cosmic-drift/tasks.md) - 开发任务清单

## 🌟 特色功能

### 🎨 AI 赋灵系统
用户绘制或上传图片后，通义千问视觉模型（Qwen-VL-Plus）会分析图像特征，Qwen-Plus 自动生成独特的性格、背景故事、栖息地描述，让每个生命都拥有独一无二的灵魂。

### ✨ 粒子轮廓动画
基于 Canvas 的智能轮廓提取算法，将生物图像转换为流动的粒子效果。粒子的运动速度和扩散程度由生物的情绪值驱动，视觉化呈现生命的内在状态。

### 💬 角色化 AI 对话
每个生物都是独立的 AI 角色，基于自己的性格、背景和当前情绪值进行对话。系统会记忆最近 10 条对话作为上下文，让交流更加连贯自然。用户的语气会影响生物的情绪值，创造动态的情感互动。

### 🌌 星际漂流展示
所有生命以卡片形式在星系页面展示，支持查看详细档案、粒子效果预览和一键开启对话。未来将升级为 3D 星空可视化。

## 🎯 产品目标

| 目标类型 | 具体内容 |
|---------|---------|
| 🎭 情感目标 | 让用户在数字宇宙中与AI生命建立"被理解"的连接 |
| ⚙️ 功能目标 | 实现用户绘制 → AI赋灵 → 星际漂流 → 对话互动 → 自主认养 全流程 |
| ✨ 体验目标 | 创造一种「柔和、神秘、诗意、共情」的产品 vibe |

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🌟 致谢

感谢所有为这个项目做出贡献的开发者和设计师！

---

**用心创造，用爱连接** ✨🪐
