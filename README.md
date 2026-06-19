# EspritConnect

A campus social platform for ESPRIT students, built as a **Spring Boot / Angular microservices** application. It brings together a news feed, student clubs & events, a job/mentoring board, real-time messaging, residence management, shared resources, an AI CV analyzer, and an AI chatbot — all behind a single API Gateway.

---

## Architecture overview

The Angular frontend talks **only** to the API Gateway, which routes requests to the backend services discovered through Eureka. Each Java service owns an isolated MySQL/MariaDB database. The two AI services (CV analyzer, chatbot) are Python/FastAPI.

```
┌──────────────────────────────────────────────────────────┐
│                    Angular 17 frontend                     │
│                   http://localhost:4200                    │
└───────────────────────────┬────────────────────────────────┘
                            │ HTTP + WebSocket (STOMP/SockJS)
                            ▼
┌──────────────────────────────────────────────────────────┐
│              API Gateway  :8089  (host) → :8080            │
│         Spring Cloud Gateway — discovery via Eureka        │
└──┬─────┬─────┬─────┬─────┬─────┬──────┬──────┬─────────────┘
   ▼     ▼     ▼     ▼     ▼     ▼      ▼      ▼
 auth  post  event  job   msg  resrc  cv-ai  chatbot   (Eureka :8761)
 8081  8082  8083  8084  8085  8086   8090    8091
   └─────┴─────┴─────┴─────┴─────┴──────────── MariaDB :3307→3306
```

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the detailed service-by-service breakdown, data models, and JWT security flow.

---

## Services

| Service | Port (host) | Stack | Responsibility |
|---|---|---|---|
| **eureka-server** | 8761 | Spring Cloud Netflix Eureka | Service discovery / registry |
| **api-gateway** | 8089 → 8080 | Spring Cloud Gateway | Single entry point, routing, CORS |
| **auth-service** | 8081 | Spring Boot + Spring Security | Auth, users, JWT issuing, email |
| **post-service** | 8082 | Spring Boot + JPA | News feed: posts, comments, likes, photos |
| **event-service** | 8083 | Spring Boot + JPA | Clubs & events, memberships, registrations |
| **job-service** | 8084 | Spring Boot + JPA | Job offers, applications, mentoring |
| **message-service** | 8085 | Spring Boot + WebSocket/STOMP | Real-time messaging & notifications |
| **resource-service** | 8086 | Spring Boot + JPA | Shared learning resources & likes |
| **cv-analyzer** | 8090 | Python + FastAPI | CV parsing, ATS score, job matching, tips |
| **chatbot-service** | 8091 | Python + FastAPI | AI assistant (OpenAI → Groq → rule-based) |
| **frontend** | 4200 | Angular 17 | Single-page application |
| **mysql** | 3307 → 3306 | MariaDB 10.11 | One database per service |

---

## Tech stack

- **Backend:** Spring Boot 3.2.5 · Java 17 · Spring Cloud 2023.0.1 (Eureka + Gateway) · Spring Security 6 + JWT (jjwt 0.11.5) · Spring Data JPA / Hibernate · Spring WebSocket (STOMP + SockJS) · SpringDoc OpenAPI · Lombok + MapStruct
- **AI services:** Python · FastAPI · pdfplumber (CV parsing) · OpenAI / Groq clients
- **Frontend:** Angular 17 (lazy-loaded modules) · RxJS · @stomp/stompjs + sockjs-client · Chart.js / ng2-charts · qrcode
- **Data:** MariaDB 10.11 (MySQL-compatible), one isolated DB per service
- **Infra:** Docker (multi-stage builds) + Docker Compose

---

## Getting started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (with Docker Compose v2)
- [Node.js](https://nodejs.org/) 18+ and npm (to run the Angular frontend in dev mode)

### 1. Configure environment

Copy the example env file and adjust values as needed:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `MYSQL_ROOT_PASSWORD`, `DB_USERNAME`, `DB_PASSWORD` | Database credentials |
| `JWT_SECRET` | HMAC-SHA256 signing key (min. 256 bits). Generate with `openssl rand -hex 64` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origin (default `http://localhost:4200`) |
| `OPENAI_API_KEY` / `GROQ_API_KEY` | Optional — enable the AI chatbot. OpenAI takes priority; falls back to Groq, then to a rule-based bot |

> **Never commit `.env`.** It holds secrets and is git-ignored.

### 2. Start the backend stack

**Windows (PowerShell):**

```powershell
powershell -ExecutionPolicy Bypass -File start.ps1
```

**macOS / Linux:**

```bash
./start.sh
```

These scripts check dependencies and ports, create `.env` if missing, then run `docker compose up --build -d` and wait for MariaDB, Eureka, and the API Gateway to become healthy.

Alternatively, start everything manually:

```bash
docker compose up --build -d
```

### 3. Run the frontend

The Angular app is started separately in dev mode:

```bash
cd frontend
npm install
npm start
```

The frontend is also available as a container (`docker compose up frontend`), but local `npm start` is recommended during development.

---

## Useful URLs

| What | URL |
|---|---|
| Frontend (Angular) | http://localhost:4200 |
| API Gateway | http://localhost:8089 |
| Eureka dashboard | http://localhost:8761 |
| Swagger UI (auth-service) | http://localhost:8081/swagger-ui.html |
| CV analyzer health | http://localhost:8090/health |
| Chatbot health | http://localhost:8091/health |

Each Spring service exposes its own Swagger UI at `http://localhost:<port>/swagger-ui.html`.

---

## API routing

All client traffic goes through the gateway. Main route prefixes:

| Prefix | Target service |
|---|---|
| `/api/auth/**` | auth-service |
| `/api/posts/**` | post-service |
| `/api/events/**`, `/api/clubs/**` | event-service |
| `/api/jobs/**`, `/api/mentoring/**` | job-service |
| `/api/messages/**`, `/api/notifications/**` | message-service |
| `/api/resources/**` | resource-service |
| `/api/cv/**` | cv-analyzer |
| `/api/chatbot/**` | chatbot-service |
| `/ws/**` | message-service (WebSocket, direct) |

### Authentication

`auth-service` issues a JWT on register/login. The Angular `jwt.interceptor` attaches it as `Authorization: Bearer <token>` on every request. Each backend service validates the signature with the shared `JWT_SECRET` and extracts the user's email, `userId`, and role into the security context. `userId` is always taken from the token — never from the request body.

---

## Common operations

```bash
# View logs for a service
docker compose logs -f api-gateway

# Stop everything
docker compose down

# Stop and wipe databases / volumes
docker compose down -v

# Rebuild a single service
docker compose up --build -d post-service
```

---

## Testing & utilities

| File | Purpose |
|---|---|
| `test_all_apis.py` | End-to-end smoke test across all REST endpoints |
| `seed_applications.py` | Seed sample job applications |
| `cv-analyzer/test_cvs.py` | Tests for the CV analyzer (sample CVs in `test_cvs/`) |
| `DEMO-commercial.html`, `frontend-preview.html` | Standalone preview / demo pages |

---

## Project layout

```
Esprit-connect/
├── docker-compose.yml      # Orchestrates all services + MariaDB
├── start.ps1 / start.sh    # One-command startup scripts
├── .env.example            # Environment template
├── ARCHITECTURE.md         # Detailed architecture & data models
├── eureka-server/          # Service discovery
├── api-gateway/            # Spring Cloud Gateway
├── auth-service/           # Java services (Spring Boot)
├── post-service/
├── event-service/
├── job-service/
├── message-service/
├── resource-service/
├── cv-analyzer/            # Python / FastAPI
├── chatbot-service/        # Python / FastAPI
└── frontend/               # Angular 17 SPA
```
