# 🪐 Cosmic Drift 项目交接文档

## 📋 项目概述

**Cosmic Drift（星际漂流计划）** 是一个数字生命共创与连接平台。用户可以绘制或上传原创生物图片，AI 会为其生成独特的背景故事和性格，创造出虚拟生命体。这些生命在星际空间中漂流，用户可以与它们对话互动，建立情感连接。

### 核心理念
- 🎨 **用户创造**：手绘或上传生物图片
- 🤖 **AI 赋灵**：自动生成档案、性格、背景故事
- 🌌 **星际漂流**：3D 星图展示所有生物
- 💬 **对话互动**：与生物进行 AI 对话
- 🔮 **自主认养**：契合度高时生物主动邀请用户

---

## 🚀 快速启动

### 环境要求
- Node.js 18+
- MySQL 8.0+
- OpenAI API Key（可选，用于 AI 功能）

### 启动步骤

#### 1. 安装依赖
```bash
# 后端
cd backend
npm install

# 前端
cd frontend
npm install
```

#### 2. 配置环境变量

**后端** (`backend/.env`)：
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cosmic_drift

# JWT 配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# OpenAI 配置（可选）
OPENAI_API_KEY=your-openai-api-key

# 服务器配置
PORT=3001
NODE_ENV=development
```

**前端** (`frontend/.env`)：
```env
REACT_APP_API_URL=http://localhost:3001
```

#### 3. 初始化数据库
```bash
cd backend
npm run migrate
```

#### 4. 启动服务

**后端**：
```bash
cd backend
npm run dev
# 运行在 http://localhost:3001
```

**前端**：
```bash
cd frontend
npm start
# 运行在 http://localhost:3000
```

---

## 📁 项目结构

```
cosmic-drift/
├── frontend/              # React 前端
│   ├── src/
│   │   ├── components/   # 可复用组件
│   │   ├── pages/        # 页面组件
│   │   ├── services/     # API 服务
│   │   ├── types/        # TypeScript 类型
│   │   └── utils/        # 工具函数
│   └── public/
│
├── backend/              # Node.js 后端
│   ├── src/
│   │   ├── controllers/  # 控制器层
│   │   ├── services/     # 业务逻辑层
│   │   ├── repositories/ # 数据访问层
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由配置
│   │   ├── middleware/   # 中间件
│   │   ├── validators/   # 数据验证
│   │   └── utils/        # 工具函数
│   ├── migrations/       # 数据库迁移
│   └── uploads/          # 上传文件存储
│
├── docs/                 # 项目文档
├── scripts/              # 启动脚本
└── .kiro/                # Kiro 规格文档
```

---

## ✨ 已实现功能

### 1. 用户认证系统 ✅
- 用户注册/登录
- JWT Token 认证
- 密码加密（bcrypt）
- 角色权限管理
- **注意**：目前为了快速测试，部分路由临时禁用了认证

### 2. 生物创建模块 ✅

#### 创建流程
1. **绘制/上传图片**
   - 画布绘图（Fabric.js）
   - 图片上传（支持 PNG/JPG）
   
2. **提交证件照**
   - 预览图片
   - 选择创建方式

3. **生成档案**
   - **AI 生成**：调用 OpenAI Vision 分析图片，GPT-4 生成档案
   - **手动编写**：用户自己填写所有字段

4. **编辑档案**
   - 名称（支持随机生成）
   - 物种（下拉选择 + 自定义）
   - 性格特征（标签形式，最多 6 个）
   - 栖息地（下拉选择 + 自定义）
   - 背景故事
   - 情绪值（0-100 滑块）

5. **发布到星系**
   - 保存到数据库
   - 跳转到星系页面

#### 核心组件
- `CreatePage.tsx` - 创建页面主组件
- `CreatureProfileCard.tsx` - 档案卡片（科幻风格）
- `DrawingCanvas.tsx` - 绘图画布
- `ImageUpload.tsx` - 图片上传

### 3. 粒子轮廓系统 ✅

**功能**：将生物图片转换为动态粒子动画

**特点**：
- 智能轮廓提取（Alpha 通道 → 背景移除 → 边缘检测）
- 彩虹渐变粒子效果
- 多层动画（呼吸、流动、闪烁、摆动）
- 情绪值驱动动画速度
- 数据库缓存（首次提取后保存）

**相关文件**：
- `backend/src/services/ContourExtractionService.ts` - 轮廓提取
- `frontend/src/components/ParticleOutlineViewer.tsx` - 粒子渲染
- `frontend/src/components/CreatureInfoPanel.tsx` - 详情面板

### 4. 星系展示页面 ✅
- 3D 星空背景
- 生物卡片展示
- 点击查看详情
- 粒子轮廓动画

---

## 🚧 开发中功能

### 1. 星际漂流 3D 可视化
- Three.js 3D 场景
- 生物在星空中漂流
- 相似生物聚集

### 2. 对话互动系统
- WebSocket 实时通信
- AI 对话生成
- 对话历史记录

### 3. 认养机制
- 契合度计算
- 生物主动邀请
- 认养关系管理

---

## 🛠️ 技术栈

### 前端
- **框架**：React 18 + TypeScript
- **样式**：TailwindCSS
- **3D**：Three.js
- **画布**：Fabric.js
- **动画**：Framer Motion
- **状态管理**：React Context
- **HTTP 客户端**：Axios

### 后端
- **框架**：Node.js + Express + TypeScript
- **数据库**：MySQL 8.0
- **ORM**：原生 SQL（使用 mysql2）
- **认证**：JWT + bcrypt
- **验证**：Joi
- **图像处理**：Canvas + Sharp
- **AI**：OpenAI GPT-4 + Vision

---

## 📝 重要说明

### 1. 临时禁用认证
为了快速测试核心功能，以下路由临时禁用了认证：
- 所有生物相关 API（`/api/creatures/*`）
- 前端 API 调用设置为 `includeAuth: false`

**恢复认证的步骤**：
1. 移除 `backend/src/routes/creatures.ts` 中的注释
2. 恢复 `authenticate` 中间件
3. 前端 `creatureService.ts` 改为 `includeAuth: true`

### 2. 数据验证规则

**必填字段**：
- 名称（1-50 字符）
- 物种（1-50 字符）
- 栖息地（1-200 字符）

**可选字段**：
- 性格特征（最多 6 个，每个最多 20 字符）
- 背景故事（0-1000 字符，空则使用默认值）
- 情绪值（0-100，默认 50）

### 3. 物种和栖息地系统
- 使用 HTML5 `<datalist>` 实现下拉 + 自定义
- 数据存储在 `localStorage`
- 用户创建的新类别自动保存
- 支持模糊搜索

### 4. AI 功能
- 需要配置 `OPENAI_API_KEY`
- 如果未配置，会使用 fallback 数据
- AI 生成包括：图像分析 + 档案生成

---

## 🐛 已知问题

### 1. 粒子轮廓提取
- 对于没有透明背景的图片，效果可能不理想
- 建议使用 PNG 透明背景图片
- 已实现智能背景移除算法作为降级方案

### 2. 性能优化
- 大量生物时星系页面可能卡顿
- 需要实现虚拟滚动或分页加载

### 3. 移动端适配
- 当前主要针对桌面端优化
- 移动端体验需要改进

---

## 📚 文档索引

### 核心文档
- `README.md` - 项目总览
- `PROJECT-HANDOVER.md` - 本文档（交接文档）
- `backend/README.md` - 后端 API 文档
- `backend/README_AUTH.md` - 认证系统文档

### 功能文档（临时，可删除）
- `CONTOUR-FEATURE-GUIDE.md` - 粒子轮廓功能指南
- `CONTOUR-FINAL-FIX.md` - 轮廓提取问题修复
- `PARTICLE-FEATURE-FIX.md` - 粒子功能修复记录
- `CREATURE-PROFILE-REDESIGN.md` - 档案卡片重设计
- `IMPROVEMENTS-SUMMARY.md` - 功能改进总结
- `NEW-CREATURE-FLOW.md` - 新创建流程说明

### 规格文档
- `.kiro/specs/cosmic-drift/` - 项目规格
- `.kiro/specs/creature-gallery/` - 生物画廊规格
- `.kiro/specs/particle-outline-feature/` - 粒子轮廓规格

---

## 🔧 常用命令

### 开发
```bash
# 启动后端开发服务器
cd backend && npm run dev

# 启动前端开发服务器
cd frontend && npm start

# 运行数据库迁移
cd backend && npm run migrate

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 测试
```bash
# 测试轮廓提取
cd backend && npx ts-node test-contour-extraction.ts

# 测试生物轮廓
cd backend && npx ts-node test-creature-contour.ts

# 检查轮廓数据
cd backend && node check-contour-data.js

# 清除轮廓数据
cd backend && node clear-contour-data.js
```

### 数据库
```bash
# 连接数据库
mysql -u root -p cosmic_drift

# 查看所有生物
SELECT id, name, species, creator_id FROM creatures;

# 查看轮廓数据
SELECT id, name, JSON_LENGTH(contour_data->'$.points') as point_count 
FROM creatures WHERE contour_data IS NOT NULL;
```

---

## 🎯 下一步开发建议

### 短期（1-2 周）
1. **完善星系 3D 可视化**
   - 实现生物在 3D 空间中的位置
   - 添加相机控制（缩放、旋转）
   - 优化性能（LOD、实例化）

2. **实现对话系统基础**
   - WebSocket 连接
   - 简单的对话界面
   - AI 对话生成（基于生物性格）

3. **优化移动端体验**
   - 响应式布局
   - 触摸手势支持
   - 性能优化

### 中期（1-2 月）
1. **认养机制**
   - 契合度算法
   - 认养邀请流程
   - 认养关系管理

2. **宇宙日志**
   - 对话记录公开
   - 生物成长日志
   - 社区故事流

3. **用户系统完善**
   - 个人主页
   - 创作历史
   - 社交功能

### 长期（3+ 月）
1. **高级功能**
   - 生物进化系统
   - 多人互动
   - 活动系统

2. **性能优化**
   - CDN 部署
   - 图片优化
   - 缓存策略

3. **商业化**
   - 付费功能
   - 会员系统
   - 数据分析

---

## 💡 设计理念

### 视觉风格
- **赛博朋克 + 科幻**：黑色背景、青色边框、网格纹理
- **柔和神秘**：渐变光效、粒子动画、扫描线
- **诗意共情**：温柔的文案、情感化的交互

### 交互原则
- **用户控制**：提供 AI 生成和手动编辑两种方式
- **即时反馈**：加载状态、错误提示、成功动画
- **渐进式引导**：分步骤完成复杂操作

### 技术原则
- **类型安全**：全面使用 TypeScript
- **分层架构**：Controller → Service → Repository
- **错误处理**：统一的错误格式和日志
- **性能优先**：缓存、懒加载、优化算法

---

## 🤝 联系方式

如有问题，请通过以下方式联系：
- GitHub Issues
- 项目文档
- 代码注释

---

**祝开发顺利！用心创造，用爱连接 ✨🪐**
