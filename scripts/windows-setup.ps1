# ====================================================================
# ƐÏ3 Browser - Windows Setup PowerShell Helper
# IONITY (PTY) LTD | Centurion, South Africa
# ====================================================================

Write-Host "Configuring ƐÏ3 Browser & AI Cache Cleaner Windows Environment..." -ForegroundColor Cyan

$tempCacheDir = Join-Path $env:LOCALAPPDATA "ƐÏ3-Browser\Cache"
$aiTempDir = Join-Path $env:TEMP "ei3-ai-temp"

if (-not (Test-Path $tempCacheDir)) {
    New-Item -Path $tempCacheDir -ItemType Directory -Force | Out-Null
    Write-Host "Created cache directory: $tempCacheDir" -ForegroundColor Green
}

if (-not (Test-Path $aiTempDir)) {
    New-Item -Path $aiTempDir -ItemType Directory -Force | Out-Null
    Write-Host "Created AI temp directory: $aiTempDir" -ForegroundColor Green
}

Write-Host "Windows environment setup complete." -ForegroundColor Green
