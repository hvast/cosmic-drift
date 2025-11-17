# 🛠️ Cosmic Drift 开发指南

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd cosmic-drift
```

### 2. 安装依赖
```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 3. 配置环境变量

复制示例文件并修改：
```bash
# 后端
cp backend/.env.example backend/.env

# 前端
cp frontend/.env.example frontend/.env
```

### 4. 初始化数据库
```bash
cd backend
npm run migrate
```

### 5. 启动服务
```bash
# 终端 1 - 后端
cd backend
npm run dev

# 终端 2 - 前端
cd frontend
npm start
```

---

## 项目架构

### 后端架构（分层设计）

```
请求 → 路由 → 控制器 → 服务 → 仓库 → 数据库
       ↓       ↓        ↓      ↓
    验证器   中间件   业务逻辑  数据访问
```

#### 各层职责

**1. 路由层** (`src/routes/`)
- 定义 API 端点
- 应用中间件（认证、验证）
- 绑定控制器方法

**2. 控制器层** (`src/controllers/`)
- 处理 HTTP 请求/响应
- 调用服务层
- 错误处理

**3. 服务层** (`src/services/`)
- 核心业务逻辑
- 调用多个仓库
- 事务管理

**4. 仓库层** (`src/repositories/`)
- 数据库操作
- SQL 查询
- 数据映射

**5. 模型层** (`src/models/`)
- TypeScript 类型定义
- 数据结构

**6. 验证器** (`src/validators/`)
- 输入数据验证
- Joi Schema

**7. 中间件** (`src/middleware/`)
- 认证检查
- 错误处理
- 日志记录

### 前端架构

```
src/
├── components/      # 可复用组件
│   ├── common/     # 通用组件（按钮、输入框等）
│   └── features/   # 功能组件（生物卡片、画布等）
├── pages/          # 页面组件
├── services/       # API 服务
├── context/        # React Context
├── hooks/          # 自定义 Hooks
├── types/          # TypeScript 类型
└── utils/          # 工具函数
```

---

## 开发规范

### 命名规范

**文件命名**：
- 组件：`PascalCase.tsx`（如 `CreatureCard.tsx`）
- 工具函数：`camelCase.ts`（如 `formatDate.ts`）
- 类型定义：`camelCase.ts`（如 `creature.ts`）

**变量命名**：
- 变量/函数：`camelCase`
- 类/接口：`PascalCase`
- 常量：`UPPER_SNAKE_CASE`
- 私有属性：`_camelCase`

**数据库命名**：
- 表名：`snake_case`（如 `creatures`）
- 字段名：`snake_case`（如 `creator_id`）

### 代码风格

**TypeScript**：
- 使用严格模式
- 避免 `any`，使用具体类型
- 导出类型定义

**React**：
- 函数组件 + Hooks
- Props 使用接口定义
- 避免内联样式，使用 TailwindCSS

**注释**：
```typescript
/**
 * 创建新生物
 * @param request - 创建请求数据
 * @param userId - 用户 ID（可选）
 * @returns 创建的生物对象
 */
async createCreature(
  request: CreatureCreationRequest,
  userId: string | null = null
): Promise<Creature> {
  // 实现...
}
```

### Git 提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**：
```
feat(creature): 添加粒子轮廓动画

- 实现轮廓提取算法
- 添加粒子渲染组件
- 优化性能

Closes #123
```

---

## 常见开发任务

### 添加新的 API 端点

#### 1. 定义类型 (`backend/src/models/`)
```typescript
export interface NewFeature {
  id: string;
  name: string;
  createdAt: Date;
}
```

#### 2. 创建仓库 (`backend/src/repositories/`)
```typescript
export class NewFeatureRepository {
  async create(data: any): Promise<NewFeature> {
    // SQL 操作
  }
}
```

#### 3. 创建服务 (`backend/src/services/`)
```typescript
export class NewFeatureService {
  async createFeature(data: any): Promise<NewFeature> {
    // 业务逻辑
    return await NewFeatureRepository.create(data);
  }
}
```

#### 4. 创建控制器 (`backend/src/controllers/`)
```typescript
export class NewFeatureController {
  async create(req: Request, res: Response): Promise<void> {
    const result = await NewFeatureService.createFeature(req.body);
    res.json(result);
  }
}
```

#### 5. 创建验证器 (`backend/src/validators/`)
```typescript
export const createFeatureSchema = Joi.object({
  name: Joi.string().required(),
});
```

#### 6. 添加路由 (`backend/src/routes/`)
```typescript
router.post(
  '/',
  validate(createFeatureSchema),
  authenticate,
  NewFeatureController.create
);
```

### 添加新的 React 组件

#### 1. 创建组件文件
```typescript
// src/components/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  title: string;
  onAction: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({ 
  title, 
  onAction 
}) => {
  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold">{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

#### 2. 添加类型定义（如需要）
```typescript
// src/types/newFeature.ts
export interface NewFeature {
  id: string;
  name: string;
}
```

#### 3. 创建 API 服务（如需要）
```typescript
// src/services/newFeatureService.ts
import { apiClient } from './api';

export const newFeatureService = {
  async getAll(): Promise<NewFeature[]> {
    return await apiClient.get('/api/new-features');
  },
};
```

### 数据库迁移

#### 创建新迁移
```sql
-- migrations/003_add_new_table.sql
CREATE TABLE IF NOT EXISTS new_table (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 运行迁移
```bash
cd backend
npm run migrate
```

---

## 调试技巧

### 后端调试

**1. 查看日志**
```typescript
console.log('Debug:', variable);
console.error('Error:', error);
```

**2. 使用 VS Code 调试器**
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/backend/src/index.ts",
  "preLaunchTask": "tsc: build - backend/tsconfig.json",
  "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
}
```

**3. 测试 API**
```bash
# 使用 curl
curl -X POST http://localhost:3001/api/creatures \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'

# 或使用 api-tests.http 文件（VS Code REST Client 插件）
```

### 前端调试

**1. React DevTools**
- 安装浏览器扩展
- 查看组件树和 Props

**2. Console 日志**
```typescript
console.log('Component rendered:', props);
```

**3. Network 面板**
- 查看 API 请求
- 检查响应数据

**4. Redux DevTools**（如使用 Redux）
- 查看状态变化
- 时间旅行调试

---

## 性能优化

### 后端优化

**1. 数据库查询**
```typescript
// ❌ N+1 查询问题
for (const creature of creatures) {
  const creator = await UserRepository.findById(creature.creatorId);
}

// ✅ 使用 JOIN
const creatures = await db.query(`
  SELECT c.*, u.username 
  FROM creatures c 
  LEFT JOIN users u ON c.creator_id = u.id
`);
```

**2. 缓存**
```typescript
// 使用 Redis 缓存
const cached = await redis.get(`creature:${id}`);
if (cached) return JSON.parse(cached);

const creature = await CreatureRepository.findById(id);
await redis.set(`creature:${id}`, JSON.stringify(creature), 'EX', 3600);
```

**3. 分页**
```typescript
async findAll(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;
  return await db.query(
    'SELECT * FROM creatures LIMIT ? OFFSET ?',
    [limit, offset]
  );
}
```

### 前端优化

**1. 懒加载**
```typescript
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

**2. Memo 化**
```typescript
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});
```

**3. 虚拟滚动**
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={100}
>
  {({ index, style }) => (
    <div style={style}>{items[index]}</div>
  )}
</FixedSizeList>
```

---

## 测试

### 后端测试

```typescript
// tests/services/CreatureService.test.ts
import { CreatureService } from '../../src/services/CreatureService';

describe('CreatureService', () => {
  it('should create a creature', async () => {
    const creature = await CreatureService.createCreature({
      imageData: 'base64...',
      userCustomization: { name: 'Test' }
    });
    
    expect(creature.name).toBe('Test');
  });
});
```

### 前端测试

```typescript
// src/components/__tests__/CreatureCard.test.tsx
import { render, screen } from '@testing-library/react';
import { CreatureCard } from '../CreatureCard';

test('renders creature name', () => {
  render(<CreatureCard creature={mockCreature} />);
  expect(screen.getByText('Test Creature')).toBeInTheDocument();
});
```

---

## 部署

### 后端部署

```bash
# 构建
npm run build

# 启动生产服务器
npm start
```

### 前端部署

```bash
# 构建
npm run build

# 部署到静态托管（Vercel/Netlify）
# 或使用 Nginx 托管 build 目录
```

---

## 故障排查

### 常见问题

**1. 数据库连接失败**
- 检查 MySQL 是否运行
- 验证 `.env` 配置
- 检查防火墙设置

**2. 前端无法连接后端**
- 检查后端是否启动
- 验证 `REACT_APP_API_URL`
- 检查 CORS 配置

**3. 图片上传失败**
- 检查 `uploads` 目录权限
- 验证文件大小限制
- 检查磁盘空间

**4. AI 功能不工作**
- 验证 `OPENAI_API_KEY`
- 检查 API 配额
- 查看错误日志

---

## 资源链接

- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Express 文档](https://expressjs.com/)
- [TailwindCSS 文档](https://tailwindcss.com/)
- [Three.js 文档](https://threejs.org/)
- [OpenAI API 文档](https://platform.openai.com/docs)

---

**Happy Coding! 🚀**
