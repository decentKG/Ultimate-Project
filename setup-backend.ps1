# Setup Backend Script
Write-Host "Setting up backend..." -ForegroundColor Green

# Navigate to backend directory
Set-Location -Path "$PSScriptRoot\backend" -ErrorAction Stop

# Install all required dependencies
$dependencies = @(
    "express",
    "cors",
    "helmet",
    "morgan",
    "winston",
    "jsonwebtoken",
    "bcryptjs",
    "uuid",
    "pdf-parse",
    "form-data",
    "multer",
    "express-validator",
    "mongoose",
    "dotenv",
    "nodemon --save-dev",
    "jest --save-dev"
)

# Install dependencies one by one
foreach ($dep in $dependencies) {
    Write-Host "Installing $dep..." -ForegroundColor Cyan
    npm install $dep --save
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install $dep" -ForegroundColor Red
        exit 1
    }
}

# Create required directories
$directories = @(
    "uploads",
    "logs"
)

foreach ($dir in $directories) {
    $dirPath = Join-Path -Path $PSScriptRoot -ChildPath "backend\$dir"
    if (-not (Test-Path $dirPath)) {
        New-Item -ItemType Directory -Path $dirPath | Out-Null
        Write-Host "Created directory: $dirPath" -ForegroundColor Green
    }
}

# Create a basic .env file if it doesn't exist
$envFile = Join-Path -Path $PSScriptRoot -ChildPath "backend\.env"
if (-not (Test-Path $envFile)) {
    @"
# Server Configuration
PORT=5001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/hiring-platform

# OpenRouter API
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Frontend URL
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "Created .env file" -ForegroundColor Green
}

Write-Host ""
Write-Host "Backend setup completed successfully!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit the .env file with your configuration" -ForegroundColor Yellow
Write-Host "2. Start the backend server with: node src/index.js" -ForegroundColor Yellow
Write-Host "3. Or start in development mode with: npm run dev" -ForegroundColor Yellow
