# EspritConnect Demo

## Start

1. Build backend jars:

```powershell
.\api-gateway\apache-maven-3.9.6\bin\mvn.cmd -f .\eureka-server\pom.xml -DskipTests package
.\api-gateway\apache-maven-3.9.6\bin\mvn.cmd -f .\api-gateway\pom.xml -DskipTests package
.\api-gateway\apache-maven-3.9.6\bin\mvn.cmd -f .\auth-service\pom.xml -DskipTests package
.\api-gateway\apache-maven-3.9.6\bin\mvn.cmd -f .\post-service\pom.xml -DskipTests package
.\api-gateway\apache-maven-3.9.6\bin\mvn.cmd -f .\event-service\pom.xml -DskipTests package
.\api-gateway\apache-maven-3.9.6\bin\mvn.cmd -f .\job-service\pom.xml -DskipTests package
.\api-gateway\apache-maven-3.9.6\bin\mvn.cmd -f .\message-service\pom.xml -DskipTests package
.\api-gateway\apache-maven-3.9.6\bin\mvn.cmd -f .\foyer-service\pom.xml -DskipTests package
```

2. Start Docker:

```powershell
docker compose up --build
```

3. Start frontend:

```powershell
cd frontend
npm run start -- --host localhost --port 4200
```

Frontend: http://localhost:4200
Gateway: http://localhost:8089
Eureka: http://localhost:8761

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@esprit.tn | admin123 |
| Student | student@esprit.tn | student123 |
| Mentor | mentor@esprit.tn | mentor123 |

The first login upgrades these demo passwords to BCrypt hashes automatically.

## Suggested Scenario

1. Login as admin and open the Admin Dashboard.
2. Create or update a club, event, residence and room.
3. Login as student and register for an event, apply for a job, reserve a room and report an incident.
4. Login as mentor and create a job offer or mentoring request.
5. Show search, filters, pagination, confirmations, loaders and toast notifications.
