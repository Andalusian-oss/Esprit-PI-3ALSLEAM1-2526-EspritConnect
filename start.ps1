# ============================================================
#  EspritConnect — Script de démarrage (Windows PowerShell)
#  Usage : clic-droit > "Exécuter avec PowerShell"
#       ou : powershell -ExecutionPolicy Bypass -File start.ps1
# ============================================================

$ErrorActionPreference = "Stop"

function Write-OK   { param($msg) Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "[ERREUR] $msg" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "╔═══════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║        EspritConnect — Démarrage      ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# ─── 1. Vérification des dépendances ────────────────────────
Write-Info "Vérification des dépendances..."

# Docker
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Fail "Docker non trouvé. Installez Docker Desktop : https://www.docker.com/products/docker-desktop"
}
Write-OK "Docker $(docker --version | Select-String -Pattern '\d+\.\d+\.\d+' | ForEach-Object { $_.Matches[0].Value })"

# Docker daemon
try {
    docker info | Out-Null
} catch {
    Write-Fail "Docker Desktop n'est pas démarré. Lancez Docker Desktop puis réessayez."
}
Write-OK "Docker daemon actif"

# docker compose (v2)
$DC = "docker compose"
try {
    docker compose version | Out-Null
} catch {
    if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
        $DC = "docker-compose"
    } else {
        Write-Fail "docker compose non trouvé. Mettez Docker Desktop à jour."
    }
}
Write-OK "docker compose disponible"

# ─── 2. Fichier .env ─────────────────────────────────────────
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Warn "Fichier .env absent — copie depuis .env.example"
        Copy-Item ".env.example" ".env"
        Write-Warn "Pensez à modifier les mots de passe dans .env avant la mise en production !"
    } else {
        Write-Warn "Création du fichier .env avec les valeurs par défaut..."
        @"
MYSQL_ROOT_PASSWORD=root
DB_USERNAME=root
DB_PASSWORD=root
JWT_SECRET=esprit-connect-super-secret-key-must-be-at-least-256-bits-long
CORS_ALLOWED_ORIGINS=http://localhost:4200
"@ | Set-Content ".env" -Encoding UTF8
    }
}
Write-OK "Fichier .env présent"

# ─── 3. Ports disponibles ────────────────────────────────────
Write-Info "Vérification des ports..."
$Ports = @(3306, 8080, 8081, 8082, 8083, 8084, 8085, 8086, 8761)
$Blocked = @()
foreach ($port in $Ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) { $Blocked += $port }
}
if ($Blocked.Count -gt 0) {
    Write-Warn "Ports déjà utilisés : $($Blocked -join ', ')"
    Write-Warn "Arrêtez les processus occupant ces ports ou modifiez docker-compose.yml"
    $ans = Read-Host "Continuer quand même ? (o/N)"
    if ($ans -notmatch '^[oOyY]$') { exit 0 }
} else {
    Write-OK "Tous les ports sont disponibles"
}

# ─── 4. Build & démarrage ────────────────────────────────────
Write-Info "Build et démarrage des conteneurs (première fois = ~5-10 min)..."
Invoke-Expression "$DC up --build -d"
if ($LASTEXITCODE -ne 0) { Write-Fail "Échec du docker compose up. Vérifiez les logs ci-dessus." }

# ─── 5. Attente des services ─────────────────────────────────
Write-Info "Attente du démarrage de MariaDB..."
$Timeout = 120; $Elapsed = 0
do {
    Start-Sleep 3; $Elapsed += 3; Write-Host -NoNewline "."
    $result = docker exec esprit-mysql mysqladmin ping -h localhost --silent 2>$null
} while ($LASTEXITCODE -ne 0 -and $Elapsed -lt $Timeout)
Write-Host ""
if ($LASTEXITCODE -ne 0) { Write-Fail "MariaDB n'a pas démarré. Vérifiez : docker compose logs mysql" }
Write-OK "MariaDB prêt"

Write-Info "Attente d'Eureka (peut prendre ~60s)..."
$Timeout = 180; $Elapsed = 0
do {
    Start-Sleep 5; $Elapsed += 5; Write-Host -NoNewline "."
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:8761/actuator/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        $ready = $resp.Content -match '"UP"'
    } catch { $ready = $false }
} while (-not $ready -and $Elapsed -lt $Timeout)
Write-Host ""
if (-not $ready) { Write-Fail "Eureka n'a pas démarré dans les ${Timeout}s. Vérifiez : docker compose logs eureka-server" }
Write-OK "Eureka démarré : http://localhost:8761"

Write-Info "Attente de l'API Gateway..."
$Timeout = 120; $Elapsed = 0
do {
    Start-Sleep 5; $Elapsed += 5; Write-Host -NoNewline "."
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        $ready = $resp.Content -match '"UP"'
    } catch { $ready = $false }
} while (-not $ready -and $Elapsed -lt $Timeout)
Write-Host ""
if (-not $ready) { Write-Warn "API Gateway lent. Vérifiez : docker compose logs api-gateway" }
else { Write-OK "API Gateway prêt : http://localhost:8080" }

# ─── 6. Résumé ───────────────────────────────────────────────
Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║       EspritConnect est démarré !          ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  Frontend Angular  → http://localhost:4200 ║" -ForegroundColor Green
Write-Host "║  API Gateway       → http://localhost:8080 ║" -ForegroundColor Green
Write-Host "║  Eureka Dashboard  → http://localhost:8761 ║" -ForegroundColor Green
Write-Host "║  Swagger auth      → http://localhost:8081/swagger-ui.html ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Warn "Le frontend Angular doit être lancé séparément :"
Write-Host "  cd frontend ; npm install ; npm start" -ForegroundColor Cyan
Write-Host ""
Write-Info "Pour arrêter : docker compose down"
Write-Info "Pour voir les logs : docker compose logs -f [service]"

# Ouvrir le navigateur
Start-Process "http://localhost:4200"
