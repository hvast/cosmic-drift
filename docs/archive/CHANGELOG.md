# 更新日志

本文档记录 Cosmic Drift 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 计划中
- 星际漂流 3D 可视化
- 对话互动系统
- 认养机制
- 宇宙日志功能

## [0.2.0] - 2024-11-17

### 新增
- 粒子轮廓动画系统
  - 智能轮廓提取（Alpha 通道 → 背景移除 → 边缘检测）
  - 彩虹渐变粒子效果
  - 多层动画（呼吸、流动、闪烁、摆动）
  - 情绪值驱动动画
- 生物创建流程优化
  - 证件照预览步骤
  - AI 生成 vs 手动编写选择
  - 科幻风格档案卡片
- 物种和栖息地系统
  - 下拉选择 + 自定义输入
  - LocalStorage 数据持久化
- 开发工具集
  - 轮廓数据检查工具
  - 轮廓可视化工具
  - 数据清理工具

### 改进
- 优化生物档案编辑体验
  - 随机名称生成器
  - 情绪值滑块调整
  - 性格特征标签系统
- 完善数据验证
  - 明确的错误提示
  - 灵活的必填字段
  - 背景故事可选
- 项目文档重构
  - 新增项目交接文档
  - 新增开发指南
  - 新增快速启动指南
  - 整理历史文档到归档目录

### 修复
- 修复轮廓提取路由问题
- 修复 400 验证错误
- 修复非透明背景图片轮廓提取
- 优化轮廓提取算法性能

### 技术债务
- 临时禁用部分路由认证（用于快速测试）
- 需要恢复完整的用户认证流程

## [0.1.0] - 2024-11-10

### 新增
- 用户认证系统
  - 注册/登录功能
  - JWT Token 认证
  - 密码加密（bcrypt）
  - 角色权限管理
- 生物创建模块
  - 画布绘图（Fabric.js）
  - 图片上传
  - AI 图像分析（OpenAI Vision）
  - AI 档案生成（GPT-4）
  - 档案编辑器
- 星系展示页面
  - 3D 星空背景
  - 生物卡片展示
  - 详情查看
- 基础架构
  - 前后端分离架构
  - TypeScript 全栈
  - MySQL 数据库
  - Express REST API
  - React 前端

### 技术栈
- 前端：React 18 + TypeScript + TailwindCSS
- 后端：Node.js + Express + TypeScript
- 数据库：MySQL 8.0
- AI：OpenAI GPT-4 + Vision
- 3D：Three.js
- 画布：Fabric.js

---

## 版本说明

### 版本号格式
- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 变更类型
- **新增**：新功能
- **改进**：对现有功能的改进
- **修复**：Bug 修复
- **移除**：移除的功能
- **废弃**：即将移除的功能
- **安全**：安全相关的修复

---

[未发布]: https://github.com/yourusername/cosmic-drift/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/yourusername/cosmic-drift/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yourusername/cosmic-drift/releases/tag/v0.1.0
