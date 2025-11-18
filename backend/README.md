# NightOut Backend (NestJS + Prisma + PostgreSQL)

## Quick start

```bash
cd backend
cp .env.example .env   # configure DATABASE_URL and PORT
npm install
npx prisma migrate dev --name init
npm run start:dev
```

The API will run on `http://localhost:4000` by default.

Available endpoints in this base project:

- `GET /health` – health check
- `GET /` – basic API info
- `GET /users` – list users (empty until you insert some)
- `GET /places` – list places with tags, stats and images
