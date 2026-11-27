# MediTrack

Application de gestion d'un centre médical : dossiers patients, rendez-vous, consultations, ordonnances et pharmacie.

Stack : Angular 17 (front) · Express + MongoDB (API) · Docker.

Backlog : projet Jira **MED** (4 sprints d'une semaine).

## Structure

```
frontend/       Angular 17, repris du site YT Smile Center (à nettoyer : US00, US03)
backend/        API Express + Mongoose (GET /api/health)
legacy-spring/  ancien backend Spring Boot, archivé pour référence
```

## Démarrer en local

```bash
cp .env.example .env          # puis remplir JWT_SECRET et ADMIN_PASSWORD
cd backend && npm install && npm run dev      # API sur http://localhost:3000
cd frontend && npm install && npm start       # front sur http://localhost:4200 (proxy /api -> 3000)
```

Il faut une base MongoDB qui tourne sur `localhost:27017` (Docker arrive avec US02).

## Convention Git

Une branche par ticket Jira, avec la clé dans le nom et les commits : `MED-12-docker`, `MED-12 ajoute docker-compose`.
