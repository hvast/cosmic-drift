# 🪐 星际漂流计划 | Cosmic Drift

> 一个由用户亲手绘制、AI赋予生命的数字生物宇宙。它们在星海中漂流、互动、选择被谁理解——而非被谁拥有。

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
- Redis 6+ (可选)
- OpenAI API Key (可选，用于 AI 功能)

### 一键启动

```bash
# Windows 用户：双击运行
scripts\快速启动.bat

# 或使用命令行
npm run dev
```

详细启动指南请查看 [快速启动指南](./docs/快速启动指南.md)

## 📁 项目结构

```
cosmic-drift/
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
  - [x] AI 图像分析（OpenAI Vision）
  - [x] AI 档案生成（GPT-4）
  - [x] 档案编辑器

### 开发中 🚧

- [ ] 星际漂流展示（Galaxy Map 3D）
- [ ] 对话互动系统（WebSocket + AI）
- [ ] 契合度计算与认养机制
- [ ] 宇宙日志与社区功能

### 计划中 📋

- [ ] 每日生命状态更新
- [ ] 性能优化与监控
- [ ] 移动端适配
- [ ] 部署上线

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
- PostgreSQL (关系数据库)
- Redis (缓存、会话)
- Socket.io (WebSocket)
- Bull (任务队列)

### AI 服务
- OpenAI GPT-4 (对话生成、档案生成)
- OpenAI Vision (图像分析)

## 📚 文档

- [快速启动指南](./docs/快速启动指南.md) - 如何启动项目
- [生物模块文档](./docs/生物模块文档.md) - 生物创建模块详细说明
- [后端 API 文档](./backend/README.md) - API 接口文档
- [认证系统文档](./backend/README_AUTH.md) - 认证系统说明
- [需求文档](./.kiro/specs/cosmic-drift/requirements.md) - 完整需求规格
- [设计文档](./.kiro/specs/cosmic-drift/design.md) - 系统设计文档
- [任务列表](./.kiro/specs/cosmic-drift/tasks.md) - 开发任务清单

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
