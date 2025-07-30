# Start Backend Script
Write-Host "Starting backend server on port 5001..." -ForegroundColor Green

# Navigate to backend directory
Set-Location -Path "$PSScriptRoot\backend" -ErrorAction Stop

# Install missing dependencies
$dependencies = @(
    "jsonwebtoken",
    "bcryptjs",
    "cors",
    "express",
    "uuid",
    "pdf-parse",
    "form-data",
    "multer"
)

Write-Host "Checking dependencies..." -ForegroundColor Cyan
foreach ($dep in $dependencies) {
    Write-Host "Checking $dep..." -NoNewline
    $installed = npm list $dep --depth=0 2>$null
    if (-not $installed) {
        Write-Host " [NOT FOUND]" -ForegroundColor Red
        Write-Host "Installing $dep..." -ForegroundColor Yellow
        npm install $dep --save
    } else {
        Write-Host " [OK]" -ForegroundColor Green
    }
}

# Start the server on port 5001
Write-Host "`nStarting backend server on http://localhost:5001" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

# Set the port and start the server
$env:PORT=5001
node src/index.js
