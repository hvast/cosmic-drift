# 创建生物功能诊断

## 问题现象
点击"生成档案"按钮后报错："创建生物失败，请重试"

## 可能原因分析

### 1. 后端服务未启动或端口被占用
- 端口3001被占用
- 需要先清理端口再启动

### 2. 认证问题
- 用户未登录或token过期
- 前端没有正确发送Authorization header

### 3. OpenAI API配置
- 如果未配置OPENAI_API_KEY，会使用fallback模式（这应该不会导致失败）
- 检查 `.env` 文件

### 4. 数据库连接
- MySQL数据库未启动
- 数据库表未创建

### 5. 图片数据格式
- Canvas导出的base64格式不正确
- 图片大小超过5MB限制

## 解决步骤

### 步骤1：清理并重启后端
```powershell
# 在项目根目录运行
.\restart-backend.ps1
```

### 步骤2：检查数据库
```sql
-- 确认creatures表存在
SHOW TABLES;
DESC creatures;
```

### 步骤3：测试API
```powershell
# 运行测试脚本
.\test-create-creature.ps1
```

### 步骤4：检查前端控制台
- 打开浏览器开发者工具
- 查看Network标签中的请求详情
- 查看Console中的错误信息

## 快速修复

如果是端口占用问题，手动终止进程：
1. 打开任务管理器
2. 找到占用3001端口的Node.js进程
3. 结束该进程
4. 重新运行 `cd backend && npm run dev`
