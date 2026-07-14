# Fix script for photomap dependency issue
Write-Host "=== Step 1: Remove stale node_modules ===" -ForegroundColor Green

if (Test-Path node_modules) {
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    
    # Kill any processes using node_modules first
    $nodeModules = Get-ChildItem node_modules -Recurse -Filter "*.lock" | Select-Object -First 1
    if ($nodeModules) {
        Write-Host "Found lockfile at: $($nodeModules.FullName)" -ForegroundColor Cyan
    }
    
    # Try removing with error handling
    try {
        Remove-Item node_modules -Recurse -Force -ErrorAction Stop
        Write-Host "✓ node_modules removed successfully" -ForegroundColor Green
    } catch {
        Write-Host "! Could not remove node_modules (might be locked by another process)" -ForegroundColor Red
        
        # Try with higher recursion limit
        try {
            Remove-Item node_modules -Recurse -Force -Force -ErrorAction Stop
            Write-Host "✓ node_modules removed on retry" -ForegroundColor Green
        } catch {
            Write-Host "! WARNING: Some files might still be locked. Try running Task Manager first." -ForegroundColor Yellow
            Write-Host "   Look for 'node.exe' or 'electron.exe' processes and close them." -ForegroundColor Cyan
        }
    }
}

Write-Host ""
Write-Host "=== Step 2: Remove stale yarn.lock ===" -ForegroundColor Green

if (Test-Path yarn.lock) {
    Write-Host "Removing yarn.lock..." -ForegroundColor Yellow
    Remove-Item yarn.lock -Force
    
    Write-Host "✓ yarn.lock removed successfully" -ForegroundColor Green
} else {
    Write-Host "No yarn.lock found (good)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== Step 3: Fresh install with Yarn ===" -ForegroundColor Green
Write-Host "Running: yarn install --force" -ForegroundColor Cyan
Write-Host ""

# Execute yarn install
& yarn install --force | Select-Object -Last 50
