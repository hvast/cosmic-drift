# API 测试指南

## 📋 测试准备

### 1. 确保服务运行
```bash
# 后端应该在运行
# http://localhost:3001

# 检查后端状态
curl http://localhost:3001/api/creatures
```

### 2. 安装测试工具

**方式 1: 使用 VS Code REST Client（推荐）**
1. 安装 VS Code 插件：`REST Client`
2. 打开 `api-tests.http` 文件
3. 点击每个请求上方的 "Send Request" 按钮

**方式 2: 使用 Postman**
1. 打开 Postman
2. 导入 `api-tests.http` 文件
3. 运行测试集合

**方式 3: 使用 curl 命令**
```bash
# 示例：注册用户
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test_user","email":"test@example.com","password":"Test123456"}'
```

## 🧪 测试内容

### 1. 用户认证测试 ✅

#### 1.1 注册功能
- ✅ 正常注册
- ✅ 邮箱重复检测
- ✅ 用户名重复检测
- ✅ 密码强度验证
- ✅ 邮箱格式验证

#### 1.2 登录功能
- ✅ 正常登录
- ✅ 密码错误处理
- ✅ 用户不存在处理
- ✅ Token 生成

#### 1.3 Token 管理
- ✅ 获取当前用户信息
- ✅ Token 刷新
- ✅ Token 验证

### 2. 生物创建测试 ✅

#### 2.1 创建功能
- ✅ 正常创建生物
- ✅ 自定义名称和故事
- ✅ 图片上传和存储
- ✅ 认证检查（需要登录）

#### 2.2 错误处理
- ✅ 未登录创建
- ✅ 缺少必需字段
- ✅ 无效图片数据

### 3. 生物查询测试 ✅

#### 3.1 公开查询（无需登录）
- ✅ 获取所有生物（分页）
- ✅ 获取单个生物详情
- ✅ 随机遇见生物
- ✅ 分页参数处理

#### 3.2 私有查询（需要登录）
- ✅ 获取我的生物列表
- ✅ 认证检查

### 4. 生物更新测试 ✅

#### 4.1 更新功能
- ✅ 更新名称
- ✅ 更新背景故事
- ✅ 部分更新
- ✅ 权限检查（只能更新自己的）

#### 4.2 错误处理
- ✅ 未登录更新
- ✅ 更新他人生物
- ✅ 生物不存在

### 5. 生物删除测试 ✅

#### 5.1 删除功能
- ✅ 正常删除
- ✅ 权限检查（只能删除自己的）
- ✅ 删除验证

#### 5.2 错误处理
- ✅ 未登录删除
- ✅ 删除他人生物
- ✅ 生物不存在

## 🎯 测试步骤

### 快速测试（5分钟）

1. **打开 `api-tests.http`**
2. **运行基础测试**：
   - 1.1 注册新用户
   - 1.3 登录用户
   - 2.1 创建生物
   - 3.1 获取所有生物
   - 3.4 随机遇见

3. **检查结果**：
   - 所有请求返回 200/201
   - 数据格式正确
   - Token 正常生成

### 完整测试（15分钟）

按照 `api-tests.http` 中的顺序，从上到下运行所有测试。

### 综合流程测试

运行第 7 节"综合测试场景"，模拟完整用户流程：
1. 注册 → 2. 登录 → 3. 创建生物 → 4. 查看 → 5. 更新 → 6. 浏览

## 📊 预期结果

### 成功响应示例

**注册成功 (201)**
```json
{
  "user": {
    "id": "uuid",
    "username": "test_user",
    "email": "test@example.com",
    "role": "explorer",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**创建生物成功 (201)**
```json
{
  "id": "uuid",
  "name": "测试生物001",
  "species": "AI生成的物种名",
  "personality": ["温柔", "好奇"],
  "habitat": "星云的气泡带",
  "backstory": "这是一个测试生物的故事",
  "imageUrl": "http://localhost:3001/uploads/creatures/xxx.png",
  "creatorId": "uuid",
  "status": "drifting",
  "emotionValue": 50,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**获取生物列表 (200)**
```json
{
  "creatures": [...],
  "total": 10,
  "page": 1,
  "totalPages": 2
}
```

### 错误响应示例

**未授权 (401)**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Not authenticated",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**资源不存在 (404)**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Creature not found",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**验证错误 (400)**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🐛 常见问题

### 1. 连接被拒绝
**问题**: `ECONNREFUSED 127.0.0.1:3001`
**解决**: 确保后端服务正在运行
```bash
cd backend
npm run dev
```

### 2. 数据库错误
**问题**: `Database connection error`
**解决**: 
1. 检查 MySQL 是否运行
2. 检查 `backend/.env` 配置
3. 运行数据库迁移：`npm run migrate`

### 3. Token 过期
**问题**: `Token expired`
**解决**: 重新登录获取新 token

### 4. 图片上传失败
**问题**: `Failed to save image`
**解决**: 
1. 检查 `backend/uploads/creatures` 目录是否存在
2. 检查文件权限

### 5. 生物不存在
**问题**: `Creature not found`
**解决**: 
1. 确保先创建生物
2. 使用正确的生物 ID
3. 检查数据库中是否有数据

## 📈 测试覆盖率

当前已实现的功能测试覆盖：

- ✅ **用户认证**: 100%
  - 注册、登录、Token 管理
  
- ✅ **生物管理**: 100%
  - 创建、查询、更新、删除
  
- ✅ **权限控制**: 100%
  - 认证检查、所有权验证
  
- ✅ **错误处理**: 100%
  - 各种边界情况和异常

- ⏳ **对话系统**: 0% (未实现)
- ⏳ **认养机制**: 0% (未实现)
- ⏳ **宇宙日志**: 0% (未实现)

## 🔍 调试技巧

### 查看后端日志
```bash
# 后端终端会显示所有请求日志
# 包括 SQL 查询、错误信息等
```

### 查看数据库数据
```bash
mysql -u root -p
USE cosmic_drift;

# 查看用户
SELECT * FROM users;

# 查看生物
SELECT * FROM creatures;

# 查看最近创建的生物
SELECT * FROM creatures ORDER BY created_at DESC LIMIT 5;
```

### 使用浏览器开发者工具
1. 打开 http://localhost:3000
2. F12 打开开发者工具
3. Network 标签查看 API 请求
4. Console 标签查看错误信息

## 📝 测试报告模板

```markdown
## 测试日期: 2024-XX-XX

### 测试环境
- 后端: http://localhost:3001 ✅
- 数据库: MySQL 8.0 ✅
- Node.js: v18.x ✅

### 测试结果
- 用户认证: ✅ 通过 (9/9)
- 生物创建: ✅ 通过 (4/4)
- 生物查询: ✅ 通过 (5/5)
- 生物更新: ✅ 通过 (5/5)
- 生物删除: ✅ 通过 (5/5)

### 发现的问题
1. [问题描述]
2. [问题描述]

### 建议
1. [改进建议]
2. [改进建议]
```

## 🎓 下一步

测试通过后，可以继续开发：
1. Galaxy Map 3D 可视化
2. WebSocket 对话系统
3. 契合度计算引擎
4. 认养机制
5. 宇宙日志功能

---

**祝测试顺利！** 🚀
