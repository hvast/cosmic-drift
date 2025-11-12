# Implementation Plan

- [x] 1. 项目初始化与基础架构搭建





  - 创建前后端项目结构，配置TypeScript、ESLint、Prettier
  - 设置开发环境配置文件（.env）
  - 配置数据库连接和迁移工具
  - _Requirements: 10.1, 10.2_

- [x] 1.1 初始化前端项目


  - 使用Create React App + TypeScript创建前端项目
  - 安装核心依赖：Three.js, Fabric.js, TailwindCSS, Framer Motion, Socket.io-client
  - 配置路由和基础布局组件
  - _Requirements: 10.1, 10.2_

- [x] 1.2 初始化后端项目


  - 创建Node.js + Express + TypeScript项目结构
  - 安装核心依赖：Express, Socket.io, pg, Redis client, Bull
  - 配置中间件（CORS, body-parser, error handler）
  - _Requirements: 10.2, 10.3_


- [x] 1.3 设置数据库和缓存

  - 编写PostgreSQL数据库schema（users, creatures, conversations, messages等表）
  - 创建数据库迁移脚本
  - 配置Redis连接用于缓存和会话管理
  - _Requirements: 10.4_

- [x] 2. 用户认证系统





  - 实现用户注册、登录、JWT token生成和验证
  - 创建用户模型和数据库操作
  - 实现密码加密（bcrypt）和token刷新机制
  - _Requirements: 1.1, 1.2_

- [x] 2.1 实现用户注册和登录API


  - 创建POST /api/auth/register端点
  - 创建POST /api/auth/login端点
  - 实现JWT token生成和验证中间件
  - _Requirements: 1.1, 1.2_


- [x] 2.2 创建用户服务和数据访问层

  - 实现User模型和数据库CRUD操作
  - 编写用户验证逻辑（邮箱唯一性、密码强度）
  - 实现用户统计数据更新

  - _Requirements: 1.1, 1.2_

- [x] 2.3 实现前端认证流程

  - 创建登录/注册表单组件
  - 实现token存储和自动刷新
  - 创建受保护路由和认证上下文
  - _Requirements: 1.1, 1.2_

- [x] 3. 生物创建模块





  - 实现画布绘图、图片上传和AI档案生成功能
  - 创建生物模型和数据库操作
  - 集成图片存储服务
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 3.1 实现前端画布绘图组件











  - 使用Fabric.js创建CreatureCanvas组件
  - 实现绘图工具（画笔、橡皮擦、颜色选择）
  - 添加画布导出为图片功能
  - _Requirements: 1.1_

- [x] 3.2 实现图片上传组件




  - 创建ImageUploader组件支持拖拽和点击上传
  - 实现图片预览和尺寸验证
  - 添加图片格式检查（PNG, JPG, WebP）
  - _Requirements: 1.2_

- [x] 3.3 实现AI图像分析服务


  - 创建AI服务接口调用CLIP进行图像分析
  - 实现视觉特征提取（主色调、风格、复杂度）
  - 添加重试机制和错误处理
  - _Requirements: 1.3, 7.1_

- [x] 3.4 实现AI档案生成服务


  - 使用GPT-4根据视觉特征生成生物档案
  - 实现物种名称、性格特征、栖息地描述生成
  - 确保生成结果符合JSON格式规范
  - _Requirements: 1.4, 7.2, 7.3, 7.4, 7.5_

- [x] 3.5 创建生物创建API端点


  - 实现POST /api/creatures端点接收图片和自定义信息
  - 调用AI服务生成档案
  - 保存生物数据到数据库，图片到对象存储
  - 确保10秒内完成处理
  - _Requirements: 1.3, 1.4_

- [x] 3.6 实现档案编辑器组件


  - 创建ProfileEditor组件展示AI生成的档案
  - 允许用户自定义名称和背景故事
  - 实现发布到宇宙功能
  - _Requirements: 1.5_

- [x] 4. 星际漂流展示（Galaxy Map）

  - 使用Three.js实现3D星空可视化
  - 实现生物节点渲染和交互
  - 优化大量节点的渲染性能
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.1_

- [x] 4.1 创建Three.js场景基础






  - 实现GalaxyScene组件初始化Three.js场景
  - 配置相机、光照和渲染器
  - 创建星空背景效果


  - _Requirements: 2.1_

- [x] 4.2 实现生物节点渲染
  - 创建CreatureNode组件表示单个生物


  - 根据情绪值设置节点颜色和发光效果
  - 实现instanced rendering优化性能
  - _Requirements: 2.1, 2.5, 10.1_


- [x] 4.3 实现相机控制和交互
  - 创建CameraController支持缩放和平移
  - 实现平滑过渡动画
  - 添加节点点击和悬停事件处理
  - _Requirements: 2.2, 2.3_

- [x] 4.4 实现档案卡片浮层

  - 创建ProfileCardOverlay组件展示生物信息
  - 显示图片、故事、情绪值和最后对话摘要
  - 添加开始对话按钮
  - _Requirements: 2.3, 2.5_



- [x] 4.5 实现随机遇见功能
  - 创建随机选择生物的API端点GET /api/creatures/random
  - 实现前端盲盒抽取UI和动画
  - 展示随机遇见的生物档案

  - _Requirements: 2.4_

- [x] 4.6 实现Galaxy Map数据加载和分页


  - 创建GET /api/creatures端点支持分页和过滤
  - 实现前端数据懒加载和虚拟化
  - 优化渲染1000+节点的性能
  - _Requirements: 2.1, 10.1_

- [ ] 5. 对话互动系统
  - 实现WebSocket实时通信
  - 创建对话引擎和记忆管理
  - 集成AI对话生成和情感分析
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 5.1 实现WebSocket服务器
  - 配置Socket.io服务器和事件处理
  - 实现用户连接认证和房间管理
  - 添加消息广播和错误处理
  - _Requirements: 3.1, 3.2_

- [ ] 5.2 创建对话数据模型和API
  - 实现Conversation和Message模型
  - 创建对话CRUD操作
  - 实现对话上下文检索
  - _Requirements: 3.3_

- [ ] 5.3 实现情感分析服务
  - 集成Sentiment Analysis库分析用户消息
  - 实现情绪分类（positive, neutral, negative）
  - 提取情感关键词
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 5.4 实现AI对话生成服务
  - 使用GPT-4生成生物回复
  - 构建对话上下文（生物性格、情绪值、历史消息）
  - 根据情绪值调整回复风格（冷淡/热情/神秘）
  - 确保3秒内生成响应
  - _Requirements: 3.2, 3.5_

- [ ] 5.5 实现临时记忆管理
  - 使用Redis存储临时对话记忆
  - 设置7天TTL和50条消息限制
  - 实现记忆检索和上下文构建
  - _Requirements: 3.3_

- [ ] 5.6 实现前端聊天界面
  - 创建ChatInterface组件
  - 实现消息发送和接收
  - 添加打字指示器和消息动画
  - 显示生物情绪状态
  - _Requirements: 3.1_

- [ ] 5.7 实现情绪值动态更新
  - 根据用户语气调整生物情绪值
  - 更新数据库中的emotion_value字段
  - 实时同步情绪变化到Galaxy Map
  - _Requirements: 3.4, 9.5_

- [ ] 6. 契合度计算与认养机制
  - 实现互动追踪和契合度计算
  - 创建认养邀请触发逻辑
  - 实现认养接受/拒绝流程
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6.1 实现互动追踪服务
  - 创建InteractionTracker记录用户与生物的互动
  - 追踪互动频率、语气兼容性、时间跨度
  - 计算对话深度和情感共鸣
  - _Requirements: 4.1_

- [ ] 6.2 实现契合度计算引擎
  - 创建AffinityCalculator实现评分算法
  - 根据多维度指标计算契合度（0-100）
  - 定期更新affinity_scores表
  - _Requirements: 4.2_

- [ ] 6.3 实现认养邀请触发器
  - 创建后台任务检查契合度阈值（>=80）
  - 验证触发条件（频率>=3次/天，时间跨度>=3天）
  - 使用AI生成个性化邀请消息
  - _Requirements: 4.3_

- [ ] 6.4 创建认养API端点
  - 实现POST /api/adoptions端点接受/拒绝邀请
  - 更新生物状态为"adopted"
  - 创建用户与生物的专属空间
  - _Requirements: 4.4, 4.5_

- [ ] 6.5 实现前端认养邀请UI
  - 创建邀请通知组件
  - 显示AI生成的邀请消息
  - 实现接受/拒绝按钮和动画
  - _Requirements: 4.4_

- [ ] 7. 认养后的专属体验
  - 实现长期记忆存储
  - 创建专属互动空间
  - 实现对话历史查看
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7.1 实现长期记忆存储
  - 创建LongTermMemoryStore使用PostgreSQL存储
  - 实现记忆重要性评估（AI评分0-10）
  - 添加记忆标签和检索功能
  - _Requirements: 5.2_

- [ ] 7.2 实现记忆引用功能
  - 在AI对话生成时检索相关历史记忆
  - 让生物在回复中引用过去的对话
  - 实现记忆时间衰减和重要性权重
  - _Requirements: 5.3_

- [ ] 7.3 创建专属空间UI
  - 实现认养后的专属页面
  - 显示生物详细信息和关系统计
  - 提供专属对话入口
  - _Requirements: 5.1_

- [ ] 7.4 实现对话历史查看
  - 创建对话历史列表组件
  - 支持按时间筛选和搜索
  - 显示完整对话记录
  - _Requirements: 5.4_

- [ ] 7.5 实现认养状态保护
  - 在生物查询中过滤已认养的生物
  - 防止其他用户认养已被认养的生物
  - 添加认养状态标识
  - _Requirements: 5.5_

- [ ] 8. 宇宙日志与社区功能
  - 实现对话发布到公共日志
  - 创建日志流和搜索功能
  - 实现反应和互动
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 8.1 实现日志发布功能
  - 创建POST /api/cosmic-log端点发布对话片段
  - 允许用户选择要发布的消息
  - 保存到cosmic_log_entries表
  - _Requirements: 6.1_

- [ ] 8.2 实现日志流展示
  - 创建GET /api/cosmic-log端点获取公共日志
  - 实现分页和时间排序
  - 创建LogFeed组件展示日志流
  - _Requirements: 6.4_

- [ ] 8.3 实现视觉化展示效果
  - 使用Framer Motion添加发光文字动画
  - 实现漂浮语句效果
  - 优化移动端展示
  - _Requirements: 6.2_

- [ ] 8.4 实现关键词搜索
  - 创建GET /api/cosmic-log/search端点
  - 支持关键词、标签、日期范围搜索
  - 实现全文搜索索引
  - _Requirements: 6.3_

- [ ] 8.5 实现反应和取消发布
  - 添加用户反应功能（共鸣/感动/启发）
  - 实现DELETE /api/cosmic-log/:id取消发布
  - 更新对话is_published状态
  - _Requirements: 6.5_

- [ ] 9. 每日生命状态更新系统
  - 实现定时任务更新生物状态
  - 生成每日自述
  - 更新Galaxy Map视觉表现
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9.1 实现每日状态更新任务
  - 使用Bull创建定时任务队列
  - 每日凌晨更新所有生物的情绪值
  - 基于互动模式调整情绪值
  - _Requirements: 8.1_

- [ ] 9.2 实现AI每日自述生成
  - 使用GPT-4生成生物的每日状态描述
  - 反映当前情绪值和互动情况
  - 保存到daily_statuses表
  - _Requirements: 8.2_

- [ ] 9.3 实现状态历史查询
  - 创建GET /api/creatures/:id/daily-status端点
  - 返回最近的每日状态
  - 支持历史状态查询
  - _Requirements: 8.3, 8.5_

- [ ] 9.4 更新Galaxy Map视觉表现
  - 根据情绪值动态调整节点颜色
  - 实现发光强度变化
  - 添加状态变化动画
  - _Requirements: 8.4_

- [ ] 10. 性能优化与监控
  - 实现缓存策略
  - 优化数据库查询
  - 添加监控和日志
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 10.1 实现Redis缓存策略
  - 缓存生物档案数据（5分钟TTL）
  - 缓存Galaxy Map数据（1分钟TTL）
  - 实现缓存失效和更新机制
  - _Requirements: 10.2_

- [ ] 10.2 优化数据库查询
  - 添加必要的索引
  - 实现查询结果分页
  - 使用连接池管理数据库连接
  - _Requirements: 10.2, 10.4_

- [ ] 10.3 实现API响应时间监控
  - 添加请求时间中间件
  - 记录慢查询日志
  - 设置响应时间告警（>200ms）
  - _Requirements: 10.2_

- [ ] 10.4 实现错误监控和日志
  - 集成Sentry进行错误追踪
  - 实现结构化日志（JSON格式）
  - 配置日志级别和输出
  - _Requirements: 10.2, 10.3_

- [ ] 10.5 实现负载测试
  - 使用k6编写负载测试脚本
  - 测试10000并发用户场景
  - 验证100对话/秒吞吐量
  - _Requirements: 10.3, 10.5_

- [ ] 11. 安全加固
  - 实现输入验证和清理
  - 配置速率限制
  - 添加内容审核
  - _Requirements: 1.1, 1.2, 3.1, 3.2_

- [ ] 11.1 实现输入验证中间件
  - 使用Joi或Zod验证所有API输入
  - 清理用户输入防止XSS攻击
  - 验证图片文件类型和大小
  - _Requirements: 1.2_

- [ ] 11.2 配置速率限制
  - 实现用户级别速率限制（100 req/min）
  - 实现IP级别速率限制（1000 req/min）
  - AI调用限制（10 req/min per user）
  - _Requirements: 3.2_

- [ ] 11.3 实现内容审核机制
  - 集成敏感词过滤
  - 实现用户举报系统
  - 添加AI生成内容审核
  - _Requirements: 3.1_

- [ ] 12. 前端UI/UX完善
  - 实现响应式设计
  - 添加加载状态和错误提示
  - 优化动画和过渡效果
  - _Requirements: 1.1, 2.1, 3.1, 6.2_

- [ ] 12.1 实现响应式布局
  - 使用TailwindCSS实现移动端适配
  - 优化Galaxy Map在不同屏幕尺寸的展示
  - 调整聊天界面移动端体验
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 12.2 实现加载状态和骨架屏
  - 添加数据加载时的骨架屏
  - 实现AI处理时的加载动画
  - 添加WebSocket连接状态提示
  - _Requirements: 1.3, 3.2_

- [ ] 12.3 实现错误提示和重试
  - 创建统一的错误提示组件
  - 实现网络错误自动重试
  - 添加友好的错误消息
  - _Requirements: 1.3, 3.2_

- [ ] 12.4 优化动画和过渡
  - 使用Framer Motion优化页面过渡
  - 添加微交互动画
  - 实现诗意的视觉效果
  - _Requirements: 6.2_

- [ ] 13. 部署准备
  - 配置Docker容器化
  - 编写部署文档
  - 设置CI/CD流程
  - _Requirements: 10.5_

- [ ] 13.1 创建Docker配置
  - 编写前端Dockerfile
  - 编写后端Dockerfile
  - 创建docker-compose.yml
  - _Requirements: 10.5_

- [ ] 13.2 配置环境变量管理
  - 创建.env.example文件
  - 文档化所有环境变量
  - 实现配置验证
  - _Requirements: 10.5_

- [ ] 13.3 编写部署文档
  - 创建README.md说明项目结构
  - 编写部署步骤文档
  - 添加故障排查指南
  - _Requirements: 10.5_
