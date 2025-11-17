# ⚡ 快速启动指南

## 5 分钟启动 Cosmic Drift

### 步骤 1：克隆项目
```bash
git clone <repository-url>
cd cosmicDrift
```

### 步骤 2：安装依赖
```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 步骤 3：配置数据库

**安装 MySQL**（如果还没有）：
- Windows: 下载 [MySQL Installer](https://dev.mysql.com/downloads/installer/)
- Mac: `brew install mysql`
- Linux: `sudo apt-get install mysql-server`

**创建数据库**：
```bash
mysql -u root -p
```

```sql
CREATE DATABASE cosmicDrift;
EXIT;
```

### 步骤 4：配置环境变量

**后端** - 复制并编辑 `backend/.env`：
```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 数据库配置（必填）
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=cosmicDrift

# JWT 配置（必填）
JWT_SECRET=your-secret-key-change-in-production

# OpenAI 配置（可选，不填会使用 fallback）
OPENAI_API_KEY=sk-your-openai-api-key

# 服务器配置
PORT=3001
NODE_ENV=development
```

**前端** - 复制并编辑 `frontend/.env`：
```bash
cd ../frontend
cp .env.example .env
```

编辑 `.env` 文件：
```env
REACT_APP_API_URL=http://localhost:3001
```

### 步骤 5：初始化数据库
```bash
cd backend
npm run migrate
```

看到 `✅ Migration completed successfully` 表示成功。

### 步骤 6：启动服务

**终端 1 - 启动后端**：
```bash
cd backend
npm run dev
```

看到以下信息表示成功：
```
Server running on port 3001
✅ MySQL database connected successfully
```

**终端 2 - 启动前端**：
```bash
cd frontend
npm start
```

浏览器会自动打开 `http://localhost:3000`

---

## 🎉 开始使用

### 创建你的第一个生物

1. 点击首页的 **"创造"** 按钮
2. 选择 **"画布绘制"** 或 **"上传图片"**
3. 绘制或上传一个生物图片
4. 点击 **"提交证件照 📸"**
5. 选择 **"AI 生成"** 或 **"自己编写"**
6. 编辑档案信息
7. 点击 **"保存"** 并 **"发布到宇宙"**

### 查看星系

1. 点击 **"星际漂流"** 进入星系页面
2. 浏览所有生物
3. 点击生物卡片查看详情
4. 观看粒子轮廓动画

---

## 🐛 常见问题

### 问题 1：数据库连接失败
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解决方案**：
1. 确认 MySQL 服务正在运行
2. 检查 `backend/.env` 中的数据库配置
3. 测试连接：`mysql -u root -p`

### 问题 2：端口被占用
```
Error: listen EADDRINUSE: address already in use :::3001
```

**解决方案**：
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <进程ID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### 问题 3：前端无法连接后端
```
Network Error
```

**解决方案**：
1. 确认后端正在运行（`http://localhost:3001`）
2. 检查 `frontend/.env` 中的 `REACT_APP_API_URL`
3. 清除浏览器缓存并刷新

### 问题 4：图片上传失败
```
Error: ENOENT: no such file or directory
```

**解决方案**：
```bash
# 创建上传目录
mkdir -p backend/uploads/creatures
mkdir -p backend/uploads/temp
```

### 问题 5：AI 功能不工作

**不影响核心功能**！如果没有配置 OpenAI API Key，系统会使用 fallback 数据。

如需启用 AI：
1. 获取 OpenAI API Key：https://platform.openai.com/api-keys
2. 在 `backend/.env` 中设置 `OPENAI_API_KEY`
3. 重启后端服务

---

## 📚 下一步

- 阅读 [PROJECT-HANDOVER.md](./PROJECT-HANDOVER.md) 了解项目详情
- 阅读 [DEVELOPMENT-GUIDE.md](./DEVELOPMENT-GUIDE.md) 学习开发规范
- 查看 [backend/README.md](./backend/README.md) 了解 API 文档

---

## 🆘 需要帮助？

- 查看项目文档：`docs/` 目录
- 查看代码注释
- 提交 GitHub Issue

**祝你玩得开心！✨🪐**
