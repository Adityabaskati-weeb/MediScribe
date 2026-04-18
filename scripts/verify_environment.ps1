$ErrorActionPreference = "Continue"

Write-Host "MediScribe environment verification`n"

function Test-Command($Name, $Command) {
  Write-Host "Checking $Name..."
  try {
    Invoke-Expression $Command
    if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
      Write-Host "OK: $Name`n"
    } else {
      Write-Host "WARN: $Name command exited with $LASTEXITCODE`n"
    }
  } catch {
    Write-Host "MISSING: $Name - $($_.Exception.Message)`n"
  }
}

Test-Command "Node.js" "node --version"
Test-Command "npm" "npm --version"
Test-Command "Git" "git --version"
Test-Command "Python" "python --version"
Test-Command "Docker" "docker --version"
Test-Command "Ollama" "ollama --version"

Write-Host "Checking Ollama API..."
try {
  Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 3 | Out-Null
  Write-Host "OK: Ollama API reachable`n"
} catch {
  Write-Host "WARN: Ollama API not reachable. Start Ollama with: ollama serve`n"
}

Write-Host "Checking project commands..."
Push-Location "$PSScriptRoot\.."
Test-Command "Root roadmap tests" "pytest"
Test-Command "Backend build" "npm run build --prefix backend"
Test-Command "Backend integration test" "npm run test:integration --prefix backend"
Test-Command "Dashboard build" "npm run build --prefix dashboard"
Push-Location "mobile"
Test-Command "Mobile TypeScript" "npx tsc --noEmit"
Test-Command "Expo dependency check" "npx expo install --check"
Pop-Location
Pop-Location

Write-Host "Verification complete."
