@echo off
cd ..
echo ========================================
echo   📦 安装所有依赖
echo ========================================
echo.

echo [1/3] 安装根目录依赖...
call npm install
echo.

echo [2/3] 安装后端依赖...
cd backend
call npm install
cd ..
echo.

echo [3/3] 安装前端依赖...
cd frontend
call npm install
cd ..
echo.

echo ========================================
echo   ✅ 所有依赖安装完成！
echo ========================================
pause
