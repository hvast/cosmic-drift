# ⚡ 快速部署指南：Vercel + Railway

最简单的部署方案，10 分钟搞定！

---

## 📋 准备工作

- [ ] GitHub 账号
- [ ] 代码已推送到 GitHub
- [ ] 通义千问 API Key

---

## 🚂 第一步：部署后端到 Railway（5分钟）

### 1. 注册并创建项目

1. 访问 https://railway.app
2. 点击 "Login" 使用 GitHub 登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择你的 `cosmicDrift` 仓库

### 2. 配置后端服务

Railway 会自动检测到项目，但需要指定后端目录：

1. 点击项目进入设置
2. 在 "Settings" 中找到 "Root Directory"
3. 设置为：`backend`
4. 保存

### 3. 添加 MySQL 数据库

1. 在项目页面点击 "New"
2. 选择 "Database" → "Add MySQL"
3. Railway 会自动创建数据库

### 4. 配置环境变量

点击后端服务 → "Variables" → "Raw Editor"，粘贴以下内容：

```env
NODE_ENV=production
PORT=3001

# 数据库配置（使用 Railway 提供的变量）
DB_HOST=${{MYSQLHOST}}
DB_PORT=${{MYSQLPORT}}
DB_USER=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}
DB_NAME=${{MYSQLDATABASE}}

# JWT 密钥（改成你自己的随机字符串）
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# 通义千问 API Key
QWEN_API_KEY=sk-your-qwen-api-key-here

# CORS（先留空，部署前端后再填）
CORS_ORIGIN=
```

点击 "Save"

### 5. 运行数据库迁移

1. 等待部署完成（约 2-3 分钟）
2. 点击后端服务 → "Deployments" → 最新的部署
3. 点击 "View Logs"
4. 如果看到服务启动成功，继续下一步

**运行迁移：**
- 方法 1：在 Railway 控制台中打开 Shell，运行 `npm run migrate`
- 方法 2：本地连接数据库运行迁移（需要配置数据库连接）

### 6. 获取后端 URL

1. 点击后端服务 → "Settings"
2. 找到 "Domains" 部分
3. 点击 "Generate Domain"
4. 复制生成的 URL，例如：`https://cosmicDrift-production.up.railway.app`

**记下这个 URL！前端需要用到。**

---

## ▲ 第二步：部署前端到 Vercel（5分钟）

### 1. 注册并导入项目

1. 访问 https://vercel.com
2. 点击 "Sign Up" 使用 GitHub 登录
3. 点击 "Add New..." → "Project"
4. 选择你的 `cosmicDrift` 仓库
5. 点击 "Import"

### 2. 配置项目

在配置页面：

**Framework Preset**: 选择 `Create React App`

**Root Directory**: 点击 "Edit"，选择 `frontend`

**Build and Output Settings**:
- Build Command: `npm run build`（默认）
- Output Directory: `build`（默认）
- Install Command: `npm install`（默认）

### 3. 添加环境变量

在 "Environment Variables" 部分：

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://your-backend-url.railway.app` |

**注意**：把 `your-backend-url.railway.app` 替换成你在第一步获取的 Railway URL

### 4. 部署

点击 "Deploy" 按钮，等待 2-3 分钟。

### 5. 获取前端 URL

部署完成后，Vercel 会显示你的网站 URL，例如：
- `https://cosmic-drift.vercel.app`

---

## 🔄 第三步：更新后端 CORS 配置

现在你有了前端 URL，需要更新后端的 CORS 配置：

1. 回到 Railway
2. 点击后端服务 → "Variables"
3. 找到 `CORS_ORIGIN` 变量
4. 设置为你的 Vercel URL：`https://cosmic-drift.vercel.app`
5. 保存

Railway 会自动重新部署后端。

---

## ✅ 第四步：测试

1. 访问你的 Vercel URL
2. 尝试注册账号
3. 创建一个生物
4. 测试对话功能

如果一切正常，恭喜你部署成功！🎉

---

## 🐛 常见问题

### 问题 1：前端无法连接后端

**症状**：Network Error 或 CORS 错误

**解决**：
1. 检查前端环境变量 `REACT_APP_API_URL` 是否正确
2. 检查后端 `CORS_ORIGIN` 是否设置为前端 URL
3. 确保后端服务正在运行（Railway 控制台查看日志）

### 问题 2：数据库连接失败

**症状**：后端日志显示数据库连接错误

**解决**：
1. 确认 MySQL 服务在 Railway 中正常运行
2. 检查环境变量是否正确使用了 Railway 的数据库变量
3. 等待几分钟，数据库可能还在初始化

### 问题 3：图片上传失败

**症状**：上传图片后无法显示

**解决**：
- Railway 的文件系统是临时的，重启后会丢失
- **推荐方案**：使用阿里云 OSS 或其他对象存储服务
- **临时方案**：接受文件会在重启后丢失

### 问题 4：AI 功能不工作

**症状**：对话或档案生成失败

**解决**：
1. 检查 `QWEN_API_KEY` 是否正确配置
2. 确认 API Key 有足够的额度
3. 查看后端日志了解具体错误

### 问题 5：部署后修改代码不生效

**解决**：
- **Vercel**：推送代码到 GitHub 会自动重新部署
- **Railway**：推送代码到 GitHub 会自动重新部署
- 如果没有自动部署，手动触发重新部署

---

## 💰 费用说明

### Railway
- **免费额度**：$5/月
- **使用量**：小型项目通常在免费额度内
- **超出后**：按使用量计费，约 $5-10/月

### Vercel
- **免费套餐**：个人项目完全够用
- **限制**：100GB 带宽/月，无限部署

### 总成本
- **个人学习/展示**：基本免费
- **小规模生产**：约 $5-10/月

---

## 🔧 进阶配置

### 自定义域名

**Vercel（前端）**：
1. 在项目设置中点击 "Domains"
2. 添加你的域名
3. 按提示配置 DNS

**Railway（后端）**：
1. 在服务设置中点击 "Domains"
2. 添加自定义域名
3. 配置 DNS CNAME 记录

### 配置 HTTPS
- Vercel 和 Railway 都自动提供 HTTPS
- 使用自定义域名时也会自动配置 SSL 证书

### 环境变量管理
- 敏感信息（API Key、密钥）只在平台上配置
- 不要提交到 Git 仓库
- 使用 `.env.example` 作为模板

---

## 📊 监控和日志

### Railway 日志
1. 点击服务 → "Deployments"
2. 选择部署 → "View Logs"
3. 实时查看服务器日志

### Vercel 日志
1. 项目页面 → "Deployments"
2. 点击部署 → "View Function Logs"
3. 查看构建和运行日志

---

## 🎯 下一步优化

1. **配置 Redis 缓存**（Railway 提供）
2. **使用对象存储**（阿里云 OSS）
3. **添加监控告警**（Sentry、LogRocket）
4. **配置 CDN 加速**（Vercel 自带）
5. **数据库备份**（Railway 自动备份）

---

## 📚 相关文档

- [完整部署指南](./部署指南.md) - 更多部署方案
- [Railway 文档](https://docs.railway.app)
- [Vercel 文档](https://vercel.com/docs)

---

**部署愉快！** 🚀✨

有问题随时查看日志或提 Issue！
