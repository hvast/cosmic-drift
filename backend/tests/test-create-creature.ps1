# Test creature creation API

# First, login to get token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Body (@{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json) -ContentType "application/json"

$token = $loginResponse.accessToken
Write-Host "Logged in successfully. Token: $($token.Substring(0, 20))..."

# Create a simple test image (1x1 red pixel PNG in base64)
$imageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="

# Test creature creation
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        imageData = $imageData
        userCustomization = @{
            name = "测试生物"
        }
    } | ConvertTo-Json
    
    Write-Host "`nSending creature creation request..."
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/creatures" -Method Post -Headers $headers -Body $body
    
    Write-Host "`nCreature created successfully!"
    Write-Host "ID: $($response.id)"
    Write-Host "Name: $($response.name)"
    Write-Host "Species: $($response.species)"
} catch {
    Write-Host "`nError creating creature:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}
