# Architecture EspritConnect

## Vue d'ensemble

EspritConnect est une plateforme campus construite en **architecture microservices**. Le frontend Angular communique exclusivement avec l'API Gateway, qui route les requêtes vers les services backend via Eureka (service discovery). Chaque service possède sa propre base de données MySQL isolée.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Angular 17                        │
│                       http://localhost:4200                      │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP + WebSocket
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway  :8080                           │
│            Spring Cloud Gateway — load-balanced (lb://)         │
│                     CORS: http://localhost:4200                  │
└───┬──────┬──────┬──────┬──────┬──────┬──────┬──────────────────┘
    │      │      │      │      │      │      │
    ▼      ▼      ▼      ▼      ▼      ▼      ▼
  auth   post  event   job   msg   foyer  (Eureka)
  :8081  :8082  :8083  :8084  :8085  :8086   :8761
    │      │      │      │      │      │
    ▼      ▼      ▼      ▼      ▼      ▼
  db_auth db_post db_event db_job db_msg db_foyer
                    (MySQL 8.0 :3306)
```

---

## Services backend

### 1. eureka-server (:8761)
- **Rôle** : Registre de services Netflix Eureka.
- **Technologie** : `spring-cloud-starter-netflix-eureka-server`.
- **Comportement** : Ne se déclare pas lui-même (`register-with-eureka: false`). Tous les autres services s'y enregistrent au démarrage.

---

### 2. api-gateway (:8080)
- **Rôle** : Point d'entrée unique. Route les requêtes HTTP vers le bon microservice.
- **Technologie** : `spring-cloud-starter-gateway`.
- **Routage** :

| Préfixe URL | Service cible |
|---|---|
| `/api/auth/**` | auth-service |
| `/api/posts/**` | post-service |
| `/api/events/**`, `/api/clubs/**` | event-service |
| `/api/jobs/**`, `/api/mentoring/**` | job-service |
| `/api/messages/**`, `/api/notifications/**` | message-service |
| `/api/foyer/**` | foyer-service |

- **CORS** : configuré globalement pour `http://localhost:4200`.

---

### 3. auth-service (:8081, db_auth)
- **Rôle** : Authentification, gestion des utilisateurs.
- **Sécurité** : Spring Security complet — `DaoAuthenticationProvider`, `BCryptPasswordEncoder`, `JwtAuthFilter` avec `UserDetailsService`.
- **JWT** : Génère le token à la connexion/inscription. Claims : `sub` (email), `userId` (Long), `role` (String).
- **Endpoints** :
  - `POST /api/auth/register` → `AuthResponseDTO` (token + user)
  - `POST /api/auth/login` → `AuthResponseDTO`
  - `GET/PUT/DELETE /api/auth/users/{id}` (PUT : vérification de propriété ou rôle ADMIN)
  - `GET /api/auth/users` (ADMIN uniquement via `@PreAuthorize`)

**Entité principale :**
```
User { id, email (unique), password (BCrypt), prenom, nom,
       role (STUDENT/ADMIN/MENTOR), promo, avatarUrl, createdAt }
```

---

### 4. post-service (:8082, db_post)
- **Rôle** : Fil d'actualité — posts, commentaires, likes, photos.
- **Cascade** : Supprimer un `Post` supprime automatiquement ses `Comment`, `Like`, `Photo` (JPA `CascadeType.ALL` + `orphanRemoval=true`).
- **Like toggle** : vérifie l'existence → supprime si présent, crée sinon (contrainte `UNIQUE(post_id, userId)`).
- **Sécurité** : `JwtAuthFilter` simplifié (pas de `UserDetailsService`) — extrait email + role du token pour alimenter le `SecurityContext`.
- **`userId`** : toujours extrait du token JWT (jamais du body de la requête).

**Modèle de données :**
```
Post ──< Comment
     ──< Like   (unique post_id+userId)
     ──< Photo
```

---

### 5. event-service (:8083, db_event)
- **Rôle** : Clubs étudiants et événements.
- **Logique métier** : Créer un club ajoute automatiquement le créateur comme membre `ADMIN`.
- **Endpoints** : CRUD clubs, rejoindre/quitter un club, CRUD événements, s'inscrire/se désinscrire.

**Modèle de données :**
```
Club ──< ClubMembership  (unique club_id+userId, rôle: MEMBER/ADMIN)
     ──< Event ──< EventRegistration  (unique event_id+userId)
```

---

### 6. job-service (:8084, db_job)
- **Rôle** : Offres d'emploi, candidatures, mentorat.
- **Candidature** : contrainte `UNIQUE(job_id, applicantUserId)` — un utilisateur ne peut postuler qu'une fois.
- **Mentorat** : relation Mentor/Mentoré avec sessions planifiées (`SCHEDULED/DONE/CANCELLED`).
- **Statuts** : `Application` (PENDING/ACCEPTED/REJECTED), `Mentoring` (ACTIVE/COMPLETED).

**Modèle de données :**
```
Job ──< Application  (unique job_id+applicantUserId)

Mentoring ──< MentoringSession
```

---

### 7. message-service (:8085, db_msg)
- **Rôle** : Messagerie temps réel, notifications.
- **WebSocket** : STOMP over SockJS — endpoint `/ws`, broker simple `/topic` + `/queue`, prefix utilisateur `/user`.
- **Push temps réel** : À chaque message envoyé, `SimpMessagingTemplate.convertAndSendToUser(recipientId, "/queue/messages", dto)`.
- **Déduplication des conversations** : `p1 = Math.min(senderId, recipientId)`, `p2 = Math.max(...)` → pas de doublon.
- **Notifications** : créées automatiquement à chaque nouveau message.

**Modèle de données :**
```
Conversation (participant1UserId < participant2UserId) ──< Message
Notification { recipientUserId, type, lu }
```

---

### 8. foyer-service (:8086, db_foyer)
- **Rôle** : Gestion de résidences étudiantes.
- **Logique métier** : Confirmer une réservation passe automatiquement la chambre en `OCCUPEE`. Annuler une réservation confirmée repasse la chambre en `DISPONIBLE`.

**Modèle de données :**
```
Residence ──< Chambre (SIMPLE/DOUBLE/STUDIO, DISPONIBLE/OCCUPEE/EN_MAINTENANCE)
               ──< Reservation (EN_ATTENTE/CONFIRMEE/ANNULEE)
               ──< Incident (OUVERT/EN_COURS/RESOLU)
```

---

## Sécurité transversale — JWT

Tous les services (sauf auth-service) utilisent un `JwtAuthFilter` simplifié :

```
Requête HTTP
    → Extraire "Authorization: Bearer <token>"
    → Valider signature HMAC-SHA256 avec JWT_SECRET (partagé via env var)
    → Extraire email + role → alimenter SecurityContext
    → userId extrait à la demande dans les controllers (jamais du body)
```

Le `JWT_SECRET` est injecté via variable d'environnement dans tous les services. La valeur par défaut en développement est définie dans chaque `application.yml`.

---

## Frontend Angular 17

```
src/app/
├── app.module.ts           ← BrowserModule, HttpClientModule, HTTP_INTERCEPTORS
├── app-routing.module.ts   ← Routes lazy-loaded, toutes protégées par AuthGuard
│
├── core/
│   ├── models/models.ts         ← Interfaces TypeScript (User, Post, Event, …)
│   ├── services/
│   │   ├── auth.service.ts      ← JWT dans localStorage, BehaviorSubject currentUser$
│   │   ├── post.service.ts      ← CRUD posts, likes, commentaires
│   │   └── message.service.ts   ← REST + WebSocket STOMP (@stomp/stompjs + SockJS)
│   ├── interceptors/
│   │   └── jwt.interceptor.ts   ← Ajoute "Authorization: Bearer <token>" à chaque requête
│   └── guards/
│       └── auth.guard.ts        ← Redirige vers /auth/login si non connecté
│
└── features/               ← Modules lazy-loaded
    ├── auth/    (login, register)
    ├── feed/    (liste des posts, création, commentaires, likes)
    ├── events/
    ├── jobs/
    ├── messages/
    ├── foyer/
    └── profile/
```

**Proxy de développement** (`proxy.conf.json`) :
- `/api/*` → `http://localhost:8080` (API Gateway)
- `/ws/*` → `http://localhost:8085` (WebSocket direct vers message-service)

---

## Infrastructure Docker

```yaml
# Ordre de démarrage garanti par health checks
MySQL (health: mysqladmin ping)
  └─▶ eureka-server (health: /actuator/health)
        └─▶ api-gateway
        └─▶ auth-service
        └─▶ post-service
        └─▶ event-service
        └─▶ job-service
        └─▶ message-service
        └─▶ foyer-service
```

Toutes les credentials (mot de passe DB, `JWT_SECRET`) sont injectées via le fichier `.env` — ne jamais committer ce fichier.

---

## Stack technique complète

| Couche | Technologie |
|---|---|
| Backend framework | Spring Boot 3.2.5 + Java 17 |
| Service discovery | Spring Cloud Netflix Eureka 2023.0.1 |
| API Gateway | Spring Cloud Gateway |
| Sécurité | Spring Security 6 + JWT (jjwt 0.11.5) |
| Persistance | Spring Data JPA / Hibernate + MySQL 8.0 |
| WebSocket | Spring WebSocket + STOMP + SockJS |
| Validation | Jakarta Validation (`@Valid`, `@NotBlank`, etc.) |
| Documentation API | SpringDoc OpenAPI 2.3.0 (Swagger UI : `/swagger-ui.html`) |
| Génération code | Lombok + MapStruct 1.5.5 |
| Frontend | Angular 17 (modules lazy-loaded, NgRx non utilisé) |
| HTTP client | Angular HttpClient + intercepteur JWT |
| WebSocket client | @stomp/stompjs + sockjs-client |
| Containerisation | Docker (multi-stage build) + Docker Compose |
