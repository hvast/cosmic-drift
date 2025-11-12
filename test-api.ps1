# API 测试脚本
$baseUrl = "http://localhost:3001"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🧪 星际漂流计划 API 测试" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 测试 1: 获取所有生物（公开接口）
Write-Host "[测试 1] 获取所有生物..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/creatures" -Method GET
    Write-Host "✅ 成功! 找到 $($response.total) 个生物" -ForegroundColor Green
    Write-Host "   分页: 第 $($response.page) 页，共 $($response.totalPages) 页" -ForegroundColor Gray
} catch {
    Write-Host "❌ 失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试 2: 注册新用户
Write-Host "[测试 2] 注册新用户..." -ForegroundColor Yellow
$registerData = @{
    username = "test_user_$(Get-Random -Maximum 9999)"
    email = "test$(Get-Random -Maximum 9999)@example.com"
    password = "Test123456"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ 成功! 用户ID: $($registerResponse.user.id)" -ForegroundColor Green
    Write-Host "   用户名: $($registerResponse.user.username)" -ForegroundColor Gray
    Write-Host "   邮箱: $($registerResponse.user.email)" -ForegroundColor Gray
    $accessToken = $registerResponse.tokens.accessToken
} catch {
    Write-Host "❌ 失败: $($_.Exception.Message)" -ForegroundColor Red
    exit
}
Write-Host ""

# 测试 3: 登录
Write-Host "[测试 3] 登录用户..." -ForegroundColor Yellow
$loginData = @{
    email = $registerResponse.user.email
    password = "Test123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ 成功! 登录成功" -ForegroundColor Green
    $accessToken = $loginResponse.tokens.accessToken
} catch {
    Write-Host "❌ 失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试 4: 获取当前用户信息
Write-Host "[测试 4] 获取当前用户信息..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method GET -Headers $headers
    Write-Host "✅ 成功! 当前用户: $($meResponse.user.username)" -ForegroundColor Green
} catch {
    Write-Host "❌ 失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试 5: 创建生物
Write-Host "[测试 5] 创建生物..." -ForegroundColor Yellow
$creatureData = @{
    imageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    userCustomization = @{
        name = "测试生物_$(Get-Random -Maximum 999)"
        story = "这是一个自动化测试创建的生物"
    }
} | ConvertTo-Json -Depth 3

try {
    $headers = @{
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "application/json"
    }
    $creatureResponse = Invoke-RestMethod -Uri "$baseUrl/api/creatures" -Method POST -Body $creatureData -Headers $headers
    Write-Host "✅ 成功! 生物ID: $($creatureResponse.id)" -ForegroundColor Green
    Write-Host "   名称: $($creatureResponse.name)" -ForegroundColor Gray
    Write-Host "   物种: $($creatureResponse.species)" -ForegroundColor Gray
    Write-Host "   状态: $($creatureResponse.status)" -ForegroundColor Gray
    $creatureId = $creatureResponse.id
} catch {
    Write-Host "❌ 失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   详情: $($_.ErrorDetails.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试 6: 获取我的生物列表
Write-Host "[测试 6] 获取我的生物列表..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    $myCreaturesResponse = Invoke-RestMethod -Uri "$baseUrl/api/creatures/my/list" -Method GET -Headers $headers
    Write-Host "✅ 成功! 我创建了 $($myCreaturesResponse.total) 个生物" -ForegroundColor Green
} catch {
    Write-Host "❌ 失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试 7: 获取单个生物详情
if ($creatureId) {
    Write-Host "[测试 7] 获取生物详情..." -ForegroundColor Yellow
    try {
        $detailResponse = Invoke-RestMethod -Uri "$baseUrl/api/creatures/$creatureId" -Method GET
        Write-Host "✅ 成功! 生物名称: $($detailResponse.name)" -ForegroundColor Green
    } catch {
        Write-Host "❌ 失败: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# 测试 8: 更新生物
if ($creatureId) {
    Write-Host "[测试 8] 更新生物信息..." -ForegroundColor Yellow
    $updateData = @{
        name = "更新后的生物名称"
        backstory = "这是更新后的背景故事"
    } | ConvertTo-Json

    try {
        $headers = @{
            "Authorization" = "Bearer $accessToken"
            "Content-Type" = "application/json"
        }
        $updateResponse = Invoke-RestMethod -Uri "$baseUrl/api/creatures/$creatureId" -Method PATCH -Body $updateData -Headers $headers
        Write-Host "✅ 成功! 新名称: $($updateResponse.name)" -ForegroundColor Green
    } catch {
        Write-Host "❌ 失败: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# 测试 9: 随机遇见
Write-Host "[测试 9] 随机遇见生物..." -ForegroundColor Yellow
try {
    $randomResponse = Invoke-RestMethod -Uri "$baseUrl/api/creatures/random" -Method GET
    if ($randomResponse) {
        Write-Host "✅ 成功! 遇见了: $($randomResponse.name)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  暂无生物可遇见" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ 失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试 10: 测试未授权访问
Write-Host "[测试 10] 测试未授权访问（应该失败）..." -ForegroundColor Yellow
try {
    $unauthorizedData = @{
        imageData = "data:image/png;base64,test"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/creatures" -Method POST -Body $unauthorizedData -ContentType "application/json"
    Write-Host "❌ 测试失败: 应该返回401错误" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ 成功! 正确拒绝了未授权访问" -ForegroundColor Green
    } else {
        Write-Host "⚠️  返回了意外的错误: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
Write-Host ""

# 测试总结
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✨ 测试完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示: 查看详细的 API 文档请访问 docs/API测试指南.md" -ForegroundColor Gray
