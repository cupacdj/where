# NightOut – Belgrade Date & Café Finder

This repository contains a **monorepo** for the NightOut app:

- `backend/` – NestJS + Prisma + PostgreSQL API
- `mobile/` – React Native + Expo mobile app (Android & iOS)

The goal is to provide a **clean base project** that you can extend:
- Home tab: recommended & trending cafés / restaurants with filters.
- Account tab: login/register, visited places, reviews.
- Assistant tab: AI chat that helps users pick a place.

> NOTE: Treat this as a starting point. You can adjust versions, add features, and refine architecture as the project grows.

---

## 1. Prerequisites

Install these globally on your machine:

- **Node.js** (LTS recommended, e.g. 18 or 20)
- **npm** (comes with Node)
- **Git**
- **PostgreSQL** (local or via Docker)
- **Expo tooling**
  - Install the **Expo Go** app on your phone (Android / iOS) for easy testing.

---

## 2. Backend Setup (NestJS + Prisma + PostgreSQL)

### 2.1. Database

Create a PostgreSQL database, for example:

```sql
CREATE DATABASE nightout_db;
```

Remember your DB credentials (user, password, host, port, db name).

### 2.2. Configure backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set your database URL, e.g.:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nightout_db?schema=public"
PORT=4000
OPENAI_API_KEY=your_openai_api_key_here
```

### 2.3. Install dependencies

```bash
cd backend
npm install
```

### 2.4. Prisma migrations

Generate the DB schema from `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name init
# and generate the client (if not auto-generated)
npx prisma generate
```

### 2.5. Run the backend

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:4000
```

Check:

```bash
curl http://localhost:4000/health
```

You should get a small JSON `{ "status": "ok" }`.

---

## 3. Mobile Setup (React Native + Expo)

> **Hint**: If `npm install` for the mobile project gives version conflicts,  
> you can create a fresh Expo app with `npx create-expo-app` and copy the `src/` folder + config files from this template.

### 3.1. Configure mobile app

```bash
cd mobile
cp .env.example .env
```

Set the backend URL in `.env`:

```env
API_BASE_URL=http://localhost:4000
```

> On a physical phone, replace `localhost` with your computer’s LAN IP (e.g. `http://192.168.0.10:4000`).

### 3.2. Install dependencies

```bash
cd mobile
npm install
```

### 3.3. Run the app

```bash
npm run start
# or
npx expo start
```

This opens Expo Dev Tools in your browser. Then:

- Scan the QR code with Expo Go on your phone, **or**
- Press `a` for Android emulator, `i` for iOS simulator (macOS only).

---

## 4. Project Structure

```text
nightout-base/
  README.md

  backend/
    src/
      main.ts
      app.module.ts
      app.controller.ts
      app.service.ts
      prisma/
        prisma.module.ts
        prisma.service.ts
      modules/
        users/
        places/
    prisma/
      schema.prisma
    .env.example
    package.json
    tsconfig.json
    tsconfig.build.json
    nest-cli.json

  mobile/
    App.tsx
    app.json
    babel.config.js
    tsconfig.json
    .env.example
    src/
      navigation/
      screens/
      api/
      state/
      components/
      types/
```

---

## 5. Next Steps

- Implement real auth (register/login, JWT).
- Add AI assistant endpoint in backend and hook it up to the Assistant tab.
- Implement search & filter logic on the `/places` endpoint.
- Add seeding scripts for Belgrade cafés & restaurants.
- Implement events/parties tables later and show them on a new tab or inside the Home flow.

Have fun building 🚀
