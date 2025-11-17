# 🧪 测试脚本

本目录包含用于测试 API 的脚本和工具。

## API 测试

### api-tests.http
使用 VS Code REST Client 插件测试 API 端点。

**安装插件**：
- 在 VS Code 中搜索 "REST Client"
- 安装后打开 `api-tests.http` 文件
- 点击 "Send Request" 发送请求

### PowerShell 测试脚本

#### test-api.ps1
测试基础 API 连接。

```powershell
.\backend\tests\test-api.ps1
```

#### test-create-creature.ps1
测试生物创建 API。

```powershell
.\backend\tests\test-create-creature.ps1
```

#### test-creature-no-auth.ps1
测试无认证模式下的生物 API。

```powershell
.\backend\tests\test-creature-no-auth.ps1
```

#### restart-backend.ps1
快速重启后端服务。

```powershell
.\backend\tests\restart-backend.ps1
```

## 使用建议

### 开发时测试
1. 启动后端服务：`cd backend && npm run dev`
2. 运行测试脚本验证功能
3. 查看后端日志确认请求处理

### 调试 API 问题
1. 使用 `api-tests.http` 逐个测试端点
2. 检查响应状态码和数据
3. 查看后端控制台的错误信息

### 自动化测试
未来可以将这些脚本改造为自动化测试：
- 使用 Jest 或 Mocha
- 添加断言和测试用例
- 集成到 CI/CD 流程

## 相关工具

开发工具脚本位于 `backend/tools/`：
- 轮廓数据检查
- 轮廓可视化
- 数据清理

详见 [backend/tools/README.md](../tools/README.md)
