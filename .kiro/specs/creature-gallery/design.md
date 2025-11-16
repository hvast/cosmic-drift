# 设计文档

## 概述

生物图鉴功能为用户提供一个集中的浏览界面，以卡片网格的形式展示所有生物。用户可以点击卡片查看详情，并对喜欢的生物进行点赞。该功能包括前端展示组件、后端API端点和数据库扩展。

## 架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (React)                         │
├─────────────────────────────────────────────────────────────┤
│  GalleryPage                                                 │
│    ├─ CreatureGalleryGrid (卡片网格)                         │
│    │   └─ CreatureGalleryCard (单个卡片) × N                 │
│    ├─ GallerySortControls (排序控制)                         │
│    └─ CreatureDetailModal (详情弹窗)                         │
│         └─ LikeButton (点赞按钮)                             │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                      后端层 (Express)                         │
├─────────────────────────────────────────────────────────────┤
│  Routes                                                      │
│    ├─ GET  /api/creatures?sort=...&page=...                 │
│    ├─ GET  /api/creatures/:id                               │
│    ├─ POST /api/creatures/:id/like                          │
│    └─ DELETE /api/creatures/:id/like                        │
│                                                              │
│  Controllers                                                 │
│    └─ CreatureController (扩展)                             │
│                                                              │
│  Services                                                    │
│    ├─ CreatureService (扩展)                                │
│    └─ LikeService (新增)                                    │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL
┌─────────────────────────────────────────────────────────────┐
│                      数据库层 (MySQL)                         │
├─────────────────────────────────────────────────────────────┤
│  creatures 表 (扩展)                                         │
│    └─ like_count (新增字段)                                 │
│                                                              │
│  creature_likes 表 (新增)                                   │
│    ├─ id                                                    │
│    ├─ creature_id                                           │
│    ├─ user_id (可为 NULL，支持匿名点赞)                     │
│    ├─ session_id (匿名用户标识)                             │
│    └─ created_at                                            │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

- **前端**: React, TypeScript, TailwindCSS, Framer Motion
- **后端**: Node.js, Express, TypeScript
- **数据库**: MySQL
- **状态管理**: React Context (AuthContext)
- **路由**: React Router v6

## 组件和接口

### 前端组件

#### 1. GalleryPage (页面组件)

主图鉴页面，负责整体布局和状态管理。

```typescript
interface GalleryPageProps {}

interface GalleryPageState {
  creatures: CreatureProfile[];
  loading: boolean;
  error: string | null;
  sortBy: 'newest' | 'popular' | 'random';
  currentPage: number;
  totalPages: number;
  selectedCreature: CreatureProfile | null;
}
```

**职责**:
- 获取生物列表数据
- 管理排序和分页状态
- 处理详情弹窗的打开/关闭
- 协调子组件

#### 2. CreatureGalleryGrid (网格容器组件)

响应式网格布局容器。

```typescript
interface CreatureGalleryGridProps {
  creatures: CreatureProfile[];
  onCardClick: (creature: CreatureProfile) => void;
  onLikeToggle: (creatureId: string, isLiked: boolean) => Promise<void>;
  userLikes: Set<string>; // 用户已点赞的生物ID集合
}
```

**职责**:
- 响应式网格布局 (Tailwind: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
- 渲染生物卡片
- 处理空状态和加载状态

#### 3. CreatureGalleryCard (卡片组件)

单个生物的卡片展示。

```typescript
interface CreatureGalleryCardProps {
  creature: CreatureProfile;
  onClick: () => void;
  onLikeToggle: (isLiked: boolean) => Promise<void>;
  isLiked: boolean;
}
```

**显示内容**:
- 生物图片 (aspect-square, object-cover)
- 生物名称
- 物种
- 点赞数
- 点赞按钮 (心形图标)

**交互**:
- 点击卡片 → 打开详情
- 点击点赞按钮 → 切换点赞状态 (阻止事件冒泡)

#### 4. GallerySortControls (排序控制组件)

```typescript
interface GallerySortControlsProps {
  currentSort: 'newest' | 'popular' | 'random';
  onSortChange: (sort: 'newest' | 'popular' | 'random') => void;
}
```

**选项**:
- 最新创建 (created_at DESC)
- 最多点赞 (like_count DESC)
- 随机排序 (RAND())

#### 5. CreatureDetailModal (详情弹窗组件)

```typescript
interface CreatureDetailModalProps {
  creature: CreatureProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onLikeToggle: (isLiked: boolean) => Promise<void>;
  isLiked: boolean;
}
```

**显示内容**:
- 完整生物信息 (复用 CreatureProfileCard 的展示逻辑)
- 大图展示
- 点赞按钮和点赞数
- 关闭按钮

**实现方式**:
- 使用 Framer Motion 的 AnimatePresence 实现动画
- 背景遮罩 (backdrop-blur)
- ESC 键关闭
- 点击遮罩关闭

#### 6. LikeButton (点赞按钮组件)

```typescript
interface LikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  onToggle: () => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
}
```

**状态**:
- 未点赞: 空心心形 (text-gray-400)
- 已点赞: 实心心形 (text-red-500)
- 加载中: 禁用状态

**动画**:
- 点击时缩放动画
- 点赞数变化时的数字动画

### 后端接口

#### 1. 获取生物列表 (扩展现有接口)

```
GET /api/creatures?sort={sort}&page={page}&limit={limit}
```

**查询参数**:
- `sort`: 'newest' | 'popular' | 'random' (默认: 'newest')
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20)

**响应**:
```typescript
{
  creatures: CreatureProfile[]; // 包含 likeCount 字段
  total: number;
  page: number;
  totalPages: number;
  userLikes?: string[]; // 当前用户已点赞的生物ID列表 (如果已登录)
}
```

**SQL 查询**:
```sql
-- 最新创建
SELECT c.*, COALESCE(c.like_count, 0) as like_count
FROM creatures c
ORDER BY c.created_at DESC
LIMIT ? OFFSET ?;

-- 最多点赞
SELECT c.*, COALESCE(c.like_count, 0) as like_count
FROM creatures c
ORDER BY c.like_count DESC, c.created_at DESC
LIMIT ? OFFSET ?;

-- 随机
SELECT c.*, COALESCE(c.like_count, 0) as like_count
FROM creatures c
ORDER BY RAND()
LIMIT ?;
```

#### 2. 点赞生物

```
POST /api/creatures/:id/like
```

**请求头**:
- `Authorization`: Bearer token (可选，支持匿名点赞)
- `X-Session-ID`: 匿名会话ID (如果未登录)

**响应**:
```typescript
{
  success: true;
  likeCount: number;
  isLiked: true;
}
```

**逻辑**:
1. 检查用户是否已点赞 (通过 user_id 或 session_id)
2. 如果未点赞，插入 creature_likes 记录
3. 更新 creatures 表的 like_count 字段 (+1)
4. 返回新的点赞数

#### 3. 取消点赞

```
DELETE /api/creatures/:id/like
```

**请求头**:
- `Authorization`: Bearer token (可选)
- `X-Session-ID`: 匿名会话ID (如果未登录)

**响应**:
```typescript
{
  success: true;
  likeCount: number;
  isLiked: false;
}
```

**逻辑**:
1. 删除 creature_likes 记录
2. 更新 creatures 表的 like_count 字段 (-1)
3. 返回新的点赞数

#### 4. 获取用户点赞列表

```
GET /api/creatures/likes/my
```

**响应**:
```typescript
{
  likedCreatureIds: string[];
}
```

### 服务层

#### LikeService

```typescript
class LikeService {
  /**
   * 点赞生物
   */
  async likeCreature(
    creatureId: string,
    userId: string | null,
    sessionId: string | null
  ): Promise<{ likeCount: number }>;

  /**
   * 取消点赞
   */
  async unlikeCreature(
    creatureId: string,
    userId: string | null,
    sessionId: string | null
  ): Promise<{ likeCount: number }>;

  /**
   * 检查是否已点赞
   */
  async isLiked(
    creatureId: string,
    userId: string | null,
    sessionId: string | null
  ): Promise<boolean>;

  /**
   * 获取用户点赞的生物ID列表
   */
  async getUserLikes(
    userId: string | null,
    sessionId: string | null
  ): Promise<string[]>;

  /**
   * 获取生物的点赞数
   */
  async getLikeCount(creatureId: string): Promise<number>;
}
```

## 数据模型

### 数据库扩展

#### 1. 扩展 creatures 表

```sql
ALTER TABLE creatures
ADD COLUMN like_count INTEGER DEFAULT 0 NOT NULL;

CREATE INDEX idx_creatures_like_count ON creatures(like_count DESC);
```

#### 2. 新增 creature_likes 表

```sql
CREATE TABLE creature_likes (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  creature_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  session_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_like UNIQUE (creature_id, user_id),
  CONSTRAINT unique_session_like UNIQUE (creature_id, session_id),
  CONSTRAINT check_identifier CHECK (user_id IS NOT NULL OR session_id IS NOT NULL),
  FOREIGN KEY (creature_id) REFERENCES creatures(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_creature_likes_creature ON creature_likes(creature_id);
CREATE INDEX idx_creature_likes_user ON creature_likes(user_id);
CREATE INDEX idx_creature_likes_session ON creature_likes(session_id);
```

**设计说明**:
- `user_id` 和 `session_id` 至少有一个非空
- 支持已登录用户和匿名用户点赞
- 使用唯一约束防止重复点赞
- 级联删除：删除生物时自动删除相关点赞记录

### TypeScript 类型扩展

```typescript
// 扩展 CreatureProfile 接口
export interface CreatureProfile {
  // ... 现有字段
  likeCount: number; // 新增
}

// 新增点赞相关类型
export interface LikeInfo {
  isLiked: boolean;
  likeCount: number;
}

export interface GalleryFilters {
  sort: 'newest' | 'popular' | 'random';
  page: number;
  limit: number;
}
```

## 错误处理

### 前端错误处理

1. **网络错误**
   - 显示友好的错误提示
   - 提供重试按钮
   - 使用 toast 通知

2. **点赞失败**
   - 乐观更新：立即更新UI
   - 如果请求失败，回滚UI状态
   - 显示错误提示

3. **加载失败**
   - 显示错误状态
   - 提供刷新按钮

### 后端错误处理

1. **生物不存在** (404)
   ```json
   { "error": "Creature not found" }
   ```

2. **重复点赞** (409)
   ```json
   { "error": "Already liked this creature" }
   ```

3. **数据库错误** (500)
   ```json
   { "error": "Failed to process like" }
   ```

4. **无效的会话** (400)
   ```json
   { "error": "Invalid session identifier" }
   ```

## 测试策略

### 单元测试

#### 前端组件测试
- CreatureGalleryCard 渲染测试
- LikeButton 交互测试
- GallerySortControls 状态测试

#### 后端服务测试
- LikeService.likeCreature() 测试
- LikeService.unlikeCreature() 测试
- 重复点赞防护测试
- 匿名点赞测试

### 集成测试

1. **完整点赞流程**
   - 用户点击点赞按钮
   - 前端发送请求
   - 后端更新数据库
   - 返回新的点赞数
   - 前端更新UI

2. **排序功能**
   - 测试三种排序方式的正确性
   - 验证分页功能

3. **详情弹窗**
   - 打开/关闭动画
   - 数据正确显示
   - 点赞状态同步

### 性能测试

1. **大量生物加载**
   - 测试 1000+ 生物的渲染性能
   - 虚拟滚动优化 (如果需要)

2. **并发点赞**
   - 测试多用户同时点赞同一生物
   - 验证数据一致性

## 实现注意事项

### 性能优化

1. **图片懒加载**
   - 使用 Intersection Observer
   - 卡片进入视口时才加载图片

2. **分页加载**
   - 初始加载 20 个生物
   - 滚动到底部时加载更多

3. **点赞去抖动**
   - 防止快速重复点击
   - 使用乐观更新提升体验

4. **缓存策略**
   - 缓存已加载的页面数据
   - 点赞后只更新本地缓存

### 用户体验

1. **加载状态**
   - 骨架屏 (Skeleton)
   - 加载动画

2. **空状态**
   - 友好的空状态提示
   - 引导用户创建生物

3. **响应式设计**
   - 移动端: 1 列
   - 平板: 2-3 列
   - 桌面: 3-4 列

4. **动画效果**
   - 卡片悬停效果
   - 点赞动画
   - 弹窗过渡动画

### 安全性

1. **匿名点赞限制**
   - 使用 session_id 防止刷赞
   - 可选：IP 限流

2. **数据验证**
   - 验证 creature_id 格式
   - 防止 SQL 注入

3. **权限控制**
   - 点赞功能无需登录
   - 但记录用户/会话信息

## 路由设计

### 前端路由

```typescript
// 在 App.tsx 中添加
<Route
  path="/gallery"
  element={
    <Layout>
      <GalleryPage />
    </Layout>
  }
/>

<Route
  path="/gallery/:creatureId"
  element={
    <Layout>
      <GalleryPage />
    </Layout>
  }
/>
```

**路由行为**:
- `/gallery` - 显示图鉴列表
- `/gallery/:creatureId` - 显示图鉴列表 + 打开指定生物的详情弹窗
- 关闭详情弹窗时返回 `/gallery`

### 导航集成

在 Layout 组件的导航栏中添加图鉴入口：

```typescript
<Link to="/gallery">
  📚 生物图鉴
</Link>
```

## 迁移计划

### 数据库迁移

创建迁移文件: `003_add_creature_likes.sql`

```sql
-- 1. 添加 like_count 字段
ALTER TABLE creatures
ADD COLUMN like_count INTEGER DEFAULT 0 NOT NULL;

-- 2. 创建索引
CREATE INDEX idx_creatures_like_count ON creatures(like_count DESC);

-- 3. 创建 creature_likes 表
CREATE TABLE creature_likes (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  creature_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  session_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_like UNIQUE (creature_id, user_id),
  CONSTRAINT unique_session_like UNIQUE (creature_id, session_id),
  CONSTRAINT check_identifier CHECK (user_id IS NOT NULL OR session_id IS NOT NULL),
  FOREIGN KEY (creature_id) REFERENCES creatures(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 创建索引
CREATE INDEX idx_creature_likes_creature ON creature_likes(creature_id);
CREATE INDEX idx_creature_likes_user ON creature_likes(user_id);
CREATE INDEX idx_creature_likes_session ON creature_likes(session_id);
```

### 向后兼容

- 现有 API 不受影响
- 新增的 `likeCount` 字段默认为 0
- 前端可以逐步迁移到新的图鉴页面

## 未来扩展

1. **高级筛选**
   - 按物种筛选
   - 按性格特征筛选
   - 按栖息地筛选

2. **搜索功能**
   - 按名称搜索
   - 全文搜索背景故事

3. **收藏功能**
   - 用户可以收藏生物
   - 查看收藏列表

4. **分享功能**
   - 分享生物卡片
   - 生成分享图片

5. **统计数据**
   - 最受欢迎的生物排行榜
   - 用户点赞统计
