<# Install Git hooks for this repository (Windows PowerShell)
Usage: run from repo root in PowerShell:
  .\scripts\install_hooks.ps1

This script sets git config core.hooksPath to the local .githooks folder so the bundled hooks run.
#>

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Definition)
Set-Location -LiteralPath $repoRoot
$hooksPath = Join-Path $repoRoot '.githooks'
if (-not (Test-Path $hooksPath)) {
    Write-Host "Creating hooks path: $hooksPath"
    New-Item -ItemType Directory -Path $hooksPath -Force | Out-Null
}
# Copy bundled hooks into .githooks if not already present
$bundledPrePush = Join-Path $repoRoot '.githooks\pre-push'
if (-not (Test-Path $bundledPrePush)) {
    Write-Host "Error: expected bundled hook not found at $bundledPrePush" -ForegroundColor Yellow
} else {
    Write-Host "Bundled hook found: pre-push"
}
# Set git config to use .githooks
Write-Host "Configuring repository to use .githooks as hooks path..."
& git config core.hooksPath .githooks
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to set core.hooksPath. Run 'git config core.hooksPath .githooks' manually." -ForegroundColor Red
    exit 1
}
Write-Host "core.hooksPath set to .githooks. Hooks are active for this repository." -ForegroundColor Green
Write-Host "If you ever want to revert, run: git config --unset core.hooksPath" -ForegroundColor Cyan
Write-Host "Note: Server-side branch protection rules are still recommended for final enforcement." -ForegroundColor Yellow
