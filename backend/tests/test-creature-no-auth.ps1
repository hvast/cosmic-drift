# Test creature creation without authentication

Write-Host "Testing Creature Creation (No Auth)" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Create a simple test image (1x1 red pixel PNG in base64)
$imageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="

# Test creature creation
try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $body = @{
        imageData = $imageData
        userCustomization = @{
            name = "测试生物"
        }
    } | ConvertTo-Json
    
    Write-Host "Sending creature creation request..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/creatures" -Method Post -Headers $headers -Body $body
    
    Write-Host "`n✅ Creature created successfully!" -ForegroundColor Green
    Write-Host "================================`n" -ForegroundColor Green
    Write-Host "ID: $($response.id)"
    Write-Host "Name: $($response.name)"
    Write-Host "Species: $($response.species)"
    Write-Host "Personality: $($response.personality -join ', ')"
    Write-Host "Habitat: $($response.habitat.Substring(0, 50))..."
    Write-Host "Image URL: $($response.imageUrl)"
    Write-Host "`nFull response saved to test-result.json"
    
    $response | ConvertTo-Json -Depth 10 | Out-File "test-result.json"
    
} catch {
    Write-Host "`n❌ Error creating creature:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}
