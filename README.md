# WHERE – Belgrade Date & Café Finder

WHERE is a full‑stack mobile app for discovering cafés and similar places in Belgrade.  
It focuses on real‑world use cases like “quiet place to study”, “romantic date spot”, or “pet‑friendly brunch”.

---

## Features

### Mobile app (Expo / React Native)

- **Home tab**
  - Lists places grouped by type (e.g. CAFE).
  - Horizontal, swipeable carousels of places with:
    - Primary image
    - Name, city, address
    - Top tags (e.g. “Specialty coffee”, “Quiet / relaxed”)
  - Tapping a card opens a **Place Details** screen.

- **Place Details**
  - Hero image with fullscreen zoom.
  - Gallery of all images (also zoomable).
  - Description, address, city.
  - Tags (categories) and average rating (from stats).
  - Working hours per weekday.

- **Search tab**
  - Text search by place name, description, city, or address.
  - **“Select categories”** filter panel:
    - Categories are loaded from backend `Tag` seed (quiet, garden_terrace, laptop_friendly, etc.).
    - Selecting categories filters places by tags.
  - Combined search: query + multiple categories at once.
  - Results shown as reusable `PlaceCard` components; tapping opens Place Details.

- **Account tab**
  - Signup / login with email or username + password.
  - Profile view with:
    - Avatar (local image upload, stored on device / profile).
    - Name, surname, email.
    - Simple stats cards (favorites / visited / reviews placeholders).
  - Settings modal:
    - Edit name & surname.
    - Change password (wired to backend `/auth/change-password`).

- **Assistant tab**
  - Simple chat UI (mock AI for now).
  - Animated bubbles, typing indicator, keyboard‑aware layout.
  - Designed to later integrate a real recommendation engine.

---

## Backend (NestJS + Prisma + PostgreSQL)

### Tech stack

- **NestJS** for the HTTP API
- **Prisma** as ORM
- **PostgreSQL** as the database
- **JWT** (Passport) for authentication
- Static file serving for uploaded images (`/uploads`)

### Main modules

- **Auth**
  - `POST /auth/register` – register user.
  - `POST /auth/login` – login with email or username + password.
  - `POST /auth/change-password` – authenticated password change.

- **Users**
  - `GET /users` – list basic user info (for debugging / admin usage).

- **Places**
  - `GET /places` – list places (used by Home), returns:
    - `id`, `name`, `type`, `city`, `primaryImage`.
  - `GET /places/:id` – full place details, including:
    - Images (with fully qualified URLs)
    - Tags (joined through `PlaceTag`)
    - Working hours
    - Stats (avgRating, totals)
  - `GET /places/search` – search endpoint used by Search tab:
    - `q` – free text (name, description, city, address).
    - `tags` – comma‑separated tag names.
    - `type` – optional `PlaceType` filter.
  - `GET /places/tags` – returns all `Tag` rows (seeded categories) for the Search UI.

- **Place Images**
  - `POST /places/:placeId/images/upload` – upload an image (Multer + disk storage).
  - `POST /places/:placeId/images/import` – download from external URL and store locally.
  - `GET /places/:placeId/images` – list images.
  - `DELETE /places/:placeId/images/:imageId` – delete image.
  - `PATCH /places/:placeId/images/:imageId/primary` – mark image as primary.
  - Files are stored under `backend/uploads/places`, exposed via `/uploads/...`.

---

## Data model (Prisma)

Key models in `prisma/schema.prisma`:

- `Place` – core entity describing a café / venue.
- `Tag` – categorical labels (e.g. `quiet`, `specialty_coffee`, `garden_terrace`) grouped by `TagCategory`.
- `PlaceTag` – many‑to‑many join between `Place` and `Tag`.
- `PlaceImage` – image metadata (url, isPrimary, order).
- `PlaceWorkingHour` – working hours per weekday.
- `PlaceStats` – aggregate stats (visits, reviews, avgRating).
- `User`, `Review`, `Visit`, `Favorite` – user‑side entities.

Seeds in `backend/prisma/seed.ts` create:

- A set of reusable tags (quiet, lively, romantic, laptop_friendly, etc.).
- A curated list of Belgrade specialty coffee places with:
  - Descriptions, addresses, working hours, tags.
  - Local image URLs (`/uploads/places/{slug}.jpg`) – you provide actual image files.

---

## Running locally (high‑level)

Backend:

1. Set `DATABASE_URL` and optionally `PUBLIC_BASE_URL` in `backend/.env`.
2. Run Prisma migrations and seed:
   ```bash
   cd backend
   npx prisma migrate dev
   npx ts-node prisma/seed.ts
   ```
3. Start NestJS API:
   ```bash
   npm run start:dev
   ```

Mobile:

1. Configure API base in `mobile/.env`:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:4000
   ```
2. Install dependencies and run Expo:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```

---

## Navigation structure

- Root **Stack Navigator**
  - `Tabs` (bottom Material Top Tabs)
    - `Account`
    - `Home`
    - `Search`
    - `Assistant`
  - `PlaceDetails` – shared details screen, navigated from:
    - Home carousels (`PlaceCard`)
    - Search results (`PlaceCard`)

---

## TODO / Future ideas

- Real AI integration in Assistant (recommendation engine using place stats + tags).
- Favorites / “Save place” from Place Details, synced with backend.
- Auth‑protected “My visits” and review creation.
- Per‑user preferences (e.g. noise tolerance, price sensitivity) to refine search & Assistant results.
- Theming (light / dark) extended across all components.

This repo is structured for easy extension: the backend is modular (NestJS) and the mobile app heavily reuses `PlaceCard` and common layouts so you can add new views quickly.



