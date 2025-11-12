# MySQL 数据库设置指南

## 📦 安装 MySQL

### Windows 用户

1. **下载 MySQL**
   - 访问 [MySQL 官网](https://dev.mysql.com/downloads/mysql/)
   - 下载 MySQL Community Server
   - 或使用 XAMPP/WAMP 等集成环境

2. **安装步骤**
   - 运行安装程序
   - 选择 "Developer Default" 或 "Server only"
   - 设置 root 密码（记住这个密码！）
   - 完成安装

3. **验证安装**
   ```bash
   mysql --version
   ```

## 🔧 创建数据库

### 方式 1: 使用命令行

```bash
# 登录 MySQL
mysql -u root -p

# 输入密码后，创建数据库
CREATE DATABASE cosmic_drift CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 查看数据库
SHOW DATABASES;

# 退出
EXIT;
```

### 方式 2: 使用 MySQL Workbench

1. 打开 MySQL Workbench
2. 连接到本地 MySQL 服务器
3. 点击 "Create a new schema" 图标
4. 输入数据库名: `cosmic_drift`
5. Character Set: `utf8mb4`
6. Collation: `utf8mb4_unicode_ci`
7. 点击 Apply

### 方式 3: 使用 phpMyAdmin (XAMPP/WAMP)

1. 启动 XAMPP/WAMP
2. 访问 http://localhost/phpmyadmin
3. 点击 "新建" 或 "New"
4. 数据库名: `cosmic_drift`
5. 排序规则: `utf8mb4_unicode_ci`
6. 点击 "创建"

## ⚙️ 配置项目

### 1. 修改 backend/.env 文件

```env
# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cosmic_drift
DB_USER=root
DB_PASSWORD=你的MySQL密码
```

### 2. 运行数据库迁移

```bash
# 在项目根目录运行
npm run migrate
```

这将创建所有必要的表和索引。

## 🔍 验证数据库

### 检查表是否创建成功

```bash
# 登录 MySQL
mysql -u root -p

# 使用数据库
USE cosmic_drift;

# 查看所有表
SHOW TABLES;

# 应该看到以下表：
# - users
# - creatures
# - conversations
# - messages
# - affinity_scores
# - adoption_invitations
# - cosmic_log_entries
# - reactions
# - daily_statuses
# - memory_entries
```

## 🐛 常见问题

### 1. 无法连接到 MySQL

**错误**: `ER_ACCESS_DENIED_ERROR`

**解决方案**:
- 检查用户名和密码是否正确
- 确保 MySQL 服务正在运行
- 检查 `backend/.env` 中的配置

```bash
# Windows: 检查 MySQL 服务
services.msc
# 找到 MySQL 服务，确保状态为"正在运行"
```

### 2. 数据库不存在

**错误**: `ER_BAD_DB_ERROR: Unknown database 'cosmic_drift'`

**解决方案**:
```bash
mysql -u root -p
CREATE DATABASE cosmic_drift CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 端口被占用

**错误**: `ECONNREFUSED 127.0.0.1:3306`

**解决方案**:
- 确保 MySQL 服务正在运行
- 检查端口 3306 是否被占用
- 如果使用其他端口，修改 `backend/.env` 中的 `DB_PORT`

### 4. 字符集问题

**错误**: 中文乱码

**解决方案**:
```sql
-- 修改数据库字符集
ALTER DATABASE cosmic_drift CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. 迁移失败

**错误**: 运行 `npm run migrate` 失败

**解决方案**:
1. 检查数据库连接配置
2. 确保数据库已创建
3. 检查 MySQL 用户权限
4. 查看详细错误信息

```bash
# 手动运行迁移查看详细错误
cd backend
npx ts-node migrations/run-migrations.ts
```

## 🔐 安全建议

### 生产环境

1. **不要使用 root 用户**
   ```sql
   -- 创建专用用户
   CREATE USER 'cosmic_drift_user'@'localhost' IDENTIFIED BY '强密码';
   GRANT ALL PRIVILEGES ON cosmic_drift.* TO 'cosmic_drift_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **使用强密码**
   - 至少 12 个字符
   - 包含大小写字母、数字和特殊字符

3. **限制远程访问**
   - 只允许必要的 IP 访问
   - 使用防火墙规则

## 📊 数据库管理工具

推荐使用以下工具管理 MySQL：

1. **MySQL Workbench** (官方工具)
   - 功能强大
   - 可视化设计
   - 免费

2. **phpMyAdmin** (Web 界面)
   - 简单易用
   - 适合初学者
   - XAMPP/WAMP 自带

3. **DBeaver** (通用数据库工具)
   - 支持多种数据库
   - 免费开源
   - 功能丰富

4. **Navicat** (商业软件)
   - 界面美观
   - 功能全面
   - 需要付费

## 🚀 快速开始

完整的启动流程：

```bash
# 1. 确保 MySQL 服务运行
# Windows: 在服务中启动 MySQL

# 2. 创建数据库
mysql -u root -p
CREATE DATABASE cosmic_drift CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 3. 配置环境变量
# 编辑 backend/.env，填写数据库密码

# 4. 运行迁移
npm run migrate

# 5. 启动项目
npm run dev
```

## 📚 更多资源

- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [MySQL 教程](https://www.runoob.com/mysql/mysql-tutorial.html)
- [项目快速启动指南](./快速启动指南.md)

---

**提示**: 如果遇到问题，请先检查 MySQL 服务是否运行，数据库是否创建，配置是否正确！
