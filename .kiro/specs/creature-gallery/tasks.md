# 实现计划

- [ ] 1. 数据库扩展和迁移
  - 创建数据库迁移文件 `003_add_creature_likes.sql`
  - 在 creatures 表中添加 `like_count` 字段（默认值为 0）
  - 创建 `creature_likes` 表，包含 id, creature_id, user_id, session_id, created_at 字段
  - 添加必要的索引和约束（唯一约束、外键、检查约束）
  - 运行迁移脚本更新数据库
  - _Requirements: 3.5, 4.1, 4.2, 4.3, 4.4_

- [ ] 2. 后端点赞服务实现
  - [ ] 2.1 创建 LikeService 类
    - 实现 `likeCreature()` 方法：插入点赞记录并更新 like_count
    - 实现 `unlikeCreature()` 方法：删除点赞记录并更新 like_count
    - 实现 `isLiked()` 方法：检查用户/会话是否已点赞
    - 实现 `getUserLikes()` 方法：获取用户已点赞的生物ID列表
    - 实现 `getLikeCount()` 方法：获取生物的点赞数
    - 添加事务处理确保数据一致性
    - _Requirements: 3.5, 3.6, 4.5_

  - [ ] 2.2 扩展 CreatureController 添加点赞接口
    - 添加 `POST /api/creatures/:id/like` 路由处理器
    - 添加 `DELETE /api/creatures/:id/like` 路由处理器
    - 添加 `GET /api/creatures/likes/my` 路由处理器
    - 从请求头获取 user_id 或 session_id
    - 调用 LikeService 处理点赞逻辑
    - 返回更新后的点赞数和状态
    - 处理错误情况（生物不存在、重复点赞等）
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 2.3 扩展 CreatureService 支持排序和点赞数据
    - 修改 `getAll()` 方法支持 sort 参数（newest, popular, random）
    - 在查询中包含 like_count 字段
    - 添加获取用户点赞列表的逻辑
    - 在响应中包含 userLikes 数组（如果用户已登录）
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 2.4 更新路由配置
    - 在 `backend/src/routes/creatures.ts` 中添加点赞相关路由
    - 配置路由为公开访问（支持匿名点赞）
    - _Requirements: 3.1, 3.2_

- [ ] 3. 前端类型和服务层
  - [ ] 3.1 扩展 TypeScript 类型定义
    - 在 `CreatureProfile` 接口中添加 `likeCount` 字段
    - 创建 `LikeInfo` 接口
    - 创建 `GalleryFilters` 接口
    - _Requirements: 1.3, 3.4_

  - [ ] 3.2 扩展 creatureService
    - 修改 `getCreatures()` 方法支持 sort 参数
    - 添加 `likeCreature()` 方法
    - 添加 `unlikeCreature()` 方法
    - 添加 `getUserLikes()` 方法
    - 实现会话ID管理（localStorage）
    - _Requirements: 3.1, 3.2, 3.3, 5.1_

- [ ] 4. 核心UI组件实现
  - [ ] 4.1 创建 LikeButton 组件
    - 实现心形图标切换（空心/实心）
    - 显示点赞数
    - 添加点击动画效果（缩放、颜色变化）
    - 实现加载状态
    - 支持不同尺寸（sm, md, lg）
    - 阻止事件冒泡
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 4.2 创建 CreatureGalleryCard 组件
    - 显示生物图片（aspect-square, object-cover）
    - 显示生物名称和物种
    - 集成 LikeButton 组件
    - 添加悬停效果（阴影、缩放）
    - 实现点击打开详情功能
    - 添加图片懒加载
    - _Requirements: 1.3, 3.1, 6.2, 6.4_

  - [ ] 4.3 创建 CreatureGalleryGrid 组件
    - 实现响应式网格布局（1/2/3/4列）
    - 渲染 CreatureGalleryCard 列表
    - 实现加载状态（骨架屏）
    - 实现空状态展示
    - 处理点赞回调
    - _Requirements: 1.1, 1.4, 1.5, 6.1, 6.2_

  - [ ] 4.4 创建 GallerySortControls 组件
    - 实现三个排序按钮（最新、最多点赞、随机）
    - 高亮当前选中的排序方式
    - 添加图标和标签
    - 实现响应式布局
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ] 4.5 创建 CreatureDetailModal 组件
    - 使用 Framer Motion 实现弹窗动画
    - 显示完整生物信息（复用展示逻辑）
    - 集成 LikeButton 组件
    - 实现背景遮罩（backdrop-blur）
    - 支持 ESC 键关闭
    - 支持点击遮罩关闭
    - 添加关闭按钮
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1_

- [ ] 5. 图鉴页面实现
  - [ ] 5.1 创建 GalleryPage 组件
    - 实现页面布局和状态管理
    - 集成 GallerySortControls 组件
    - 集成 CreatureGalleryGrid 组件
    - 集成 CreatureDetailModal 组件
    - 实现生物数据获取逻辑
    - 实现排序切换逻辑
    - 实现分页加载逻辑
    - 管理用户点赞状态（userLikes Set）
    - 实现详情弹窗打开/关闭逻辑
    - 处理 URL 参数（支持直接打开详情）
    - 实现错误处理和重试逻辑
    - _Requirements: 1.1, 1.2, 1.4, 2.1, 5.1, 5.2, 5.3_

  - [ ] 5.2 添加路由配置
    - 在 `App.tsx` 中添加 `/gallery` 路由
    - 添加 `/gallery/:creatureId` 路由（支持直接打开详情）
    - 配置 Layout 包裹
    - _Requirements: 1.1, 2.1_

  - [ ] 5.3 更新导航栏
    - 在 Layout 组件中添加图鉴入口链接
    - 添加图标和文字标签
    - 高亮当前页面
    - _Requirements: 1.1_

- [ ] 6. 点赞功能集成和优化
  - [ ] 6.1 实现乐观更新
    - 点击点赞按钮立即更新UI
    - 发送请求到后端
    - 如果请求失败，回滚UI状态并显示错误
    - _Requirements: 3.2, 3.3_

  - [ ] 6.2 实现点赞状态同步
    - 页面加载时获取用户点赞列表
    - 在卡片和详情弹窗中同步点赞状态
    - 点赞后更新全局状态
    - _Requirements: 3.4, 4.3_

  - [ ] 6.3 实现会话管理
    - 为匿名用户生成唯一 session_id
    - 存储在 localStorage
    - 在请求头中发送 X-Session-ID
    - _Requirements: 4.3, 4.4_

- [ ] 7. 性能优化和用户体验
  - [ ] 7.1 实现图片懒加载
    - 使用 Intersection Observer API
    - 卡片进入视口时加载图片
    - 显示占位符
    - _Requirements: 6.2, 6.5_

  - [ ] 7.2 实现分页加载
    - 初始加载 20 个生物
    - 滚动到底部时加载下一页
    - 显示加载更多指示器
    - 处理最后一页情况
    - _Requirements: 1.2, 5.3_

  - [ ] 7.3 添加加载和空状态
    - 实现骨架屏加载状态
    - 实现友好的空状态提示
    - 添加重试按钮
    - _Requirements: 1.4, 1.5, 2.5_

  - [ ] 7.4 实现响应式设计
    - 测试移动端布局（1列）
    - 测试平板布局（2-3列）
    - 测试桌面布局（3-4列）
    - 确保触摸友好的按钮尺寸
    - 测试详情弹窗在移动端的表现
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 7.5 添加动画效果
    - 卡片悬停动画
    - 点赞按钮点击动画
    - 弹窗打开/关闭动画
    - 数字变化动画
    - _Requirements: 3.2, 6.4_

- [ ] 8. 集成测试和调试
  - [ ] 8.1 测试完整点赞流程
    - 测试登录用户点赞
    - 测试匿名用户点赞
    - 测试取消点赞
    - 测试重复点赞防护
    - 测试点赞数同步
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 4.5_

  - [ ] 8.2 测试排序和分页
    - 测试三种排序方式的正确性
    - 测试分页加载
    - 测试排序切换时的状态保持
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [ ] 8.3 测试详情弹窗
    - 测试打开/关闭动画
    - 测试 ESC 键关闭
    - 测试点击遮罩关闭
    - 测试 URL 参数直接打开
    - 测试点赞状态同步
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 8.4 测试错误处理
    - 测试网络错误处理
    - 测试生物不存在情况
    - 测试点赞失败回滚
    - 测试空状态显示
    - _Requirements: 1.5, 2.5_

  - [ ] 8.5 测试响应式设计
    - 在不同设备尺寸下测试布局
    - 测试触摸交互
    - 测试性能（大量生物）
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
