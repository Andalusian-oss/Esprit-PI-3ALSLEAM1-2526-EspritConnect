#!/usr/bin/env bash
# ============================================================
#  EspritConnect — Script de démarrage (Linux / macOS)
# ============================================================
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC}  $*"; }
info() { echo -e "${BLUE}[INFO]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
fail() { echo -e "${RED}[ERREUR]${NC} $*"; exit 1; }

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║        EspritConnect — Démarrage      ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ─── 1. Vérification des dépendances ────────────────────────
info "Vérification des dépendances..."

command -v docker &>/dev/null     || fail "Docker non trouvé. Installez Docker : https://docs.docker.com/get-docker/"
command -v docker compose &>/dev/null 2>&1 \
  || command -v docker-compose &>/dev/null \
  || fail "docker compose non trouvé. Mettez Docker à jour (v2.x minimum)."

ok "Docker $(docker --version | grep -oP '\d+\.\d+\.\d+')"

# Vérifier que le daemon Docker tourne
docker info &>/dev/null || fail "Le daemon Docker n'est pas démarré. Lancez Docker Desktop puis réessayez."
ok "Docker daemon actif"

# ─── 2. Fichier .env ─────────────────────────────────────────
if [[ ! -f ".env" ]]; then
  if [[ -f ".env.example" ]]; then
    warn "Fichier .env absent — copie depuis .env.example"
    cp .env.example .env
    warn "⚠️  Pensez à modifier les mots de passe dans .env avant la mise en production !"
  else
    warn "Création du fichier .env avec les valeurs par défaut..."
    cat > .env << 'ENVEOF'
MYSQL_ROOT_PASSWORD=root
DB_USERNAME=root
DB_PASSWORD=root
JWT_SECRET=esprit-connect-super-secret-key-must-be-at-least-256-bits-long
CORS_ALLOWED_ORIGINS=http://localhost:4200
ENVEOF
  fi
fi
ok "Fichier .env présent"

# ─── 3. Ports disponibles ────────────────────────────────────
info "Vérification des ports..."
PORTS=(3306 8080 8081 8082 8083 8084 8085 8086 8761)
BLOCKED=()
for port in "${PORTS[@]}"; do
  if lsof -iTCP:"$port" -sTCP:LISTEN &>/dev/null 2>&1 || \
     ss -tlnp "sport = :$port" 2>/dev/null | grep -q LISTEN; then
    BLOCKED+=("$port")
  fi
done
if [[ ${#BLOCKED[@]} -gt 0 ]]; then
  warn "Ports déjà utilisés : ${BLOCKED[*]}"
  warn "Arrêtez les processus occupant ces ports ou modifiez docker-compose.yml"
  read -rp "Continuer quand même ? (o/N) " ans
  [[ "$ans" =~ ^[oOyY]$ ]] || exit 0
else
  ok "Tous les ports sont disponibles"
fi

# ─── 4. Build & démarrage ────────────────────────────────────
info "Build et démarrage des conteneurs (première fois = ~5-10 min)..."

# Utiliser 'docker compose' ou 'docker-compose' selon ce qui est disponible
DC="docker compose"
command -v docker compose &>/dev/null 2>&1 || DC="docker-compose"

$DC up --build -d

# ─── 5. Attente de la disponibilité des services ─────────────
info "Attente du démarrage de MariaDB..."
until $DC exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; do
  printf "."
  sleep 3
done
echo ""
ok "MariaDB prêt"

info "Attente d'Eureka (peut prendre ~60s)..."
TIMEOUT=180
ELAPSED=0
until curl -sf http://localhost:8761/actuator/health 2>/dev/null | grep -q '"UP"'; do
  if [[ $ELAPSED -ge $TIMEOUT ]]; then
    fail "Eureka n'a pas démarré dans les ${TIMEOUT}s. Vérifiez : docker compose logs eureka-server"
  fi
  printf "."
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done
echo ""
ok "Eureka démarré : http://localhost:8761"

info "Attente de l'API Gateway..."
ELAPSED=0
until curl -sf http://localhost:8080/actuator/health 2>/dev/null | grep -q '"UP"'; do
  if [[ $ELAPSED -ge 120 ]]; then
    warn "API Gateway lent à démarrer. Vérifiez : docker compose logs api-gateway"
    break
  fi
  printf "."
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done
echo ""
ok "API Gateway prêt : http://localhost:8080"

# ─── 6. Résumé ───────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       EspritConnect est démarré !          ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC}  Frontend Angular  → http://localhost:4200 ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  API Gateway       → http://localhost:8080 ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Eureka Dashboard  → http://localhost:8761 ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Swagger auth      → http://localhost:8081/swagger-ui.html ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
warn "Le frontend Angular doit être lancé séparément :"
echo -e "  ${BLUE}cd frontend && npm install && npm start${NC}"
echo ""
info "Pour arrêter : docker compose down"
info "Pour voir les logs : docker compose logs -f [service]"

# Ouvrir le navigateur si possible
if command -v xdg-open &>/dev/null; then
  xdg-open http://localhost:4200 &>/dev/null &
elif command -v open &>/dev/null; then
  open http://localhost:4200
fi
