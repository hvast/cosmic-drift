@echo off
cd ..
echo ========================================
echo   🪐 星际漂流计划 Cosmic Drift
echo   启动开发环境...
echo ========================================
echo.

REM 检查并清理端口占用
echo [检查] 检测端口占用情况...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo [清理] 发现端口 3001 被进程 %%a 占用，正在关闭...
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo [清理] 发现端口 3000 被进程 %%a 占用，正在关闭...
    taskkill /PID %%a /F >nul 2>&1
)
echo [完成] 端口检查完成
echo.

REM 检查 node_modules 是否存在
if not exist "node_modules\" (
    echo [1/3] 安装根目录依赖...
    call npm install
    echo.
)

if not exist "backend\node_modules\" (
    echo [2/3] 安装后端依赖...
    cd backend
    call npm install
    cd ..
    echo.
)

if not exist "frontend\node_modules\" (
    echo [3/3] 安装前端依赖...
    cd frontend
    call npm install
    cd ..
    echo.
)

echo ========================================
echo   ✨ 启动开发服务器
echo ========================================
echo   后端: http://localhost:3001
echo   前端: http://localhost:3000
echo ========================================
echo.

REM 启动开发服务器
npm run dev
