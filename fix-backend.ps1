# Fix Backend Dependencies Script
Write-Host "Fixing backend dependencies..." -ForegroundColor Green

# Navigate to backend directory
Set-Location -Path "$PSScriptRoot\backend" -ErrorAction Stop

# Install missing production dependencies
$dependencies = @(
    "uuid",
    "pdf-parse",
    "form-data",
    "multer"
)

Write-Host "Installing required dependencies..." -ForegroundColor Cyan
foreach ($dep in $dependencies) {
    Write-Host "Installing $dep..." -ForegroundColor Cyan
    npm install $dep --save
}

# Start the server
Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "Server running at http://localhost:3001" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

# Start the server
node src/index.js
