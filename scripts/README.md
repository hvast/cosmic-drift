# 📂 Scripts 文件夹说明

这个文件夹包含项目的启动和管理脚本。

## 📝 文件说明

| 文件 | 用途 | 使用方式 |
|-----|------|---------|
| `start-dev.bat` | 启动完整开发环境（Windows批处理） | 双击运行 或 `.\scripts\start-dev.bat` |
| `install-all.bat` | 安装所有依赖（根目录+前端+后端） | 双击运行 或 `.\scripts\install-all.bat` |
| `clean-start.js` | 智能启动脚本（自动清理端口） | 通过 npm 命令调用 |
| `kill-ports.js` | 清理端口占用 | 通过 npm 命令调用 |

## 🚀 推荐使用方式

### 方式一：命令行（最推荐）

在项目根目录运行：

```bash
# 启动完整环境（自动清理端口）
npm start

# 仅启动后端
npm run start:backend

# 仅启动前端
npm run start:frontend

# 清理所有端口
npm run kill:ports
```

### 方式二：图形界面

双击项目根目录的 `启动开发环境.bat`，然后选择启动方式。

### 方式三：直接运行脚本

```bash
# 启动完整环境（需手动清理端口）
.\scripts\start-dev.bat

# 安装所有依赖
.\scripts\install-all.bat
```

## 🧹 已清理的文件

以下重复或冗余的脚本已被移除：

- ❌ `start-dev.ps1` - 功能与 start-dev.bat 重复
- ❌ `clean-and-start.ps1` - 被 clean-start.js 替代
- ❌ `快速启动.bat` - 主目录已有启动脚本
- ❌ `start-backend.bat` - 使用 `npm run start:backend` 替代
- ❌ `start-frontend.bat` - 使用 `npm run start:frontend` 替代
- ❌ `kill-port.bat` - 使用 `npm run kill:ports` 替代

## 💡 设计原则

1. **最小化文件数量** - 只保留必需的脚本
2. **避免重复** - 每个功能只有一个实现
3. **优先 npm 命令** - 通过 package.json 统一管理
4. **跨平台兼容** - Node.js 脚本可在多平台运行

## 🔗 相关文档

- [命令行启动指南](../docs/命令行启动指南.md)
- [运行和调试指南](../docs/运行和调试指南.md)
