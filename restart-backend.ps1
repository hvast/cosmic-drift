# Kill process on port 3001
Write-Host "Checking for processes on port 3001..."
$process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    Write-Host "Found process $process on port 3001, killing it..."
    Stop-Process -Id $process -Force
    Start-Sleep -Seconds 2
    Write-Host "Process killed."
} else {
    Write-Host "No process found on port 3001."
}

# Start backend
Write-Host "`nStarting backend server..."
Set-Location backend
npm run dev
