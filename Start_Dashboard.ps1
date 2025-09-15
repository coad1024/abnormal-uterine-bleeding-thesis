# PowerShell script to start the dashboard server
# This script makes it easy to launch the dashboard with a double-click

Write-Host "Starting AUB Thesis Dashboard Server..." -ForegroundColor Green

# Get the script's directory
$scriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

# Navigate to the script directory
Set-Location -Path $scriptDir

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "Found $pythonVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Python not found! Please install Python 3.6 or later." -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Start the server
Write-Host "Launching server at http://localhost:8080/" -ForegroundColor Yellow
Write-Host "Opening browser automatically..." -ForegroundColor Yellow

# Start the Python HTTP server
Start-Process python -ArgumentList "./start_dashboard_server.py" -NoNewWindow

# Open the browser after a short delay
Start-Sleep -Seconds 2
Start-Process "http://localhost:8080/dashboard/"

# Keep the window open
Write-Host "`nServer is running. Press Ctrl+C or close this window to stop the server." -ForegroundColor Cyan
while ($true) {
    Start-Sleep -Seconds 10
}