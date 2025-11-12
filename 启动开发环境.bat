@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🪐 星际漂流计划 Cosmic Drift
echo ========================================
echo.
echo   选择启动方式:
echo.
echo   [1] 启动完整开发环境 (前端 + 后端)
echo   [2] 仅启动前端
echo   [3] 仅启动后端
echo   [4] 安装所有依赖
echo   [5] 运行数据库迁移
echo   [0] 退出
echo.
echo ========================================
echo.

set /p choice="请输入选项 (0-5): "

if "%choice%"=="1" (
    echo.
    echo 启动完整开发环境...
    call scripts\start-dev.bat
) else if "%choice%"=="2" (
    echo.
    echo 启动前端开发服务器...
    npm run start:frontend
) else if "%choice%"=="3" (
    echo.
    echo 启动后端开发服务器...
    npm run start:backend
) else if "%choice%"=="4" (
    echo.
    echo 安装所有依赖...
    call scripts\install-all.bat
) else if "%choice%"=="5" (
    echo.
    echo 运行数据库迁移...
    npm run migrate
    echo.
    echo 迁移完成！
    pause
) else if "%choice%"=="0" (
    echo.
    echo 再见！
    exit
) else (
    echo.
    echo 无效选项，请重新运行脚本
    pause
)
