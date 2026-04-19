# RentUp — Real Estate Platform

A full-stack property listing platform with AI-powered search, NavIC-assisted map discovery, and admin verification workflow.

**Live demo**
- Frontend: https://rentup-aitr.netlify.app
- Backend API: https://rentup-api.onrender.com

---

## Features

### Property marketplace
- **Buyer / Seller toggle** on the properties page — buyers filter listings (Buy / Rent), sellers choose how to list their property.
- **Listing types:** For Sale or For Rent (with monthly/yearly period).
- **Image carousel** on each listing row with prev/next chevrons + dots.
- **Image gallery** on property detail page with thumbnail strip.
- **Multi-image upload** (up to 10 images per property) with cover badge + drag-reorder previews.

### AI chatbot assistant
- Floating bottom-right chat widget powered by **Google Gemini (gemini-2.5-flash-lite)**.
- Natural-language property search — e.g. *"find me a 2BHK in Mumbai under 2 crore"*.
- Two-step pipeline:
  1. Gemini extracts structured filters (location, price range, listing type, keywords) from free text.
  2. MongoDB query matches properties → Gemini writes a friendly reply + generates **pros/cons** per property.
- Inline property cards in chat — click to open the property detail page.

### NavIC-assisted map search
- Interactive **Leaflet + OpenStreetMap** component.
- Pan/zoom to any location; map auto-fetches verified properties within **5 km** (geo-indexed `$nearSphere` query).
- **"Use my location"** button triggers `navigator.geolocation` with `enableHighAccuracy: true` — on Indian NavIC-capable devices the OS uses NavIC satellites automatically.
- Green reticle crosshair + radius circle overlay.
- Property markers with click-popup → detail page.
- Mounted on both the properties listing page (full) and the home page (preview).

### Auth & admin
- JWT-based authentication (register, login, logout).
- Admin role flag (`isAdmin`) — admins can verify listings, non-admin listings are invisible to buyers until verified.
- First-time admin creation via seed script.

### Purchases
- Authenticated buyers can "purchase" a property — marks it sold/rented and stores the buyer reference.

---

## Tech stack

### Frontend
- **React 18** (Create React App)
- **React Router 6** — routing
- **Redux Toolkit** — auth state + property slice
- **Leaflet 1.9** + **react-leaflet 4.2** — map UI
- **Axios** — HTTP client
- **Lucide React** — icons
- **Framer Motion** — auth page animations
- **CSS Modules** — component-scoped styling (no CSS framework)

### Backend
- **Node.js 22** + **Express 4** — HTTP server
- **Mongoose 8** — MongoDB ODM
- **@google/generative-ai** — Gemini SDK for the chatbot
- **bcryptjs** — password hashing
- **jsonwebtoken** — JWT auth tokens
- **multer 2** — multipart image uploads
- **axios** — Nominatim geocoding calls
- **dotenv** — env config loader
- **cors** — hand-rolled CORS middleware (env-configurable origins)

### Database
- **MongoDB Atlas** (free tier M0) with `2dsphere` geo index on properties.

### Hosting
- Frontend → **Netlify** (static, GitHub auto-deploy)
- Backend → **Render.com** (free web service, auto-sleep after 15 min idle)
- Database → MongoDB Atlas cloud

### 3rd-party services
- **Google Gemini API** — chatbot intelligence.
- **Nominatim (OpenStreetMap)** — free geocoding, no API key needed.
- **Unsplash** — seed image URLs for demo listings.

---

## Project structure

```
major project/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js         # register, login, logout, getUserDetails
│   │   ├── chat.controller.js         # Gemini filter extraction + reply generation
│   │   └── property.Controller.js     # CRUD + verify + purchase + nearby + search
│   ├── middlewear/                    # (sic — folder name as-is)
│   │   ├── authMiddleware.js          # JWT verification
│   │   ├── admin.middlewear.js        # isAdmin guard
│   │   └── upload.middlewear.js       # multer config (10 files, 5MB each, images only)
│   ├── model/
│   │   ├── user.model.js              # name, email, password, avatar, isAdmin
│   │   └── Property.model.js          # title, description, price, location, coordinates (GeoJSON),
│   │                                  # listingType, rentPeriod, seller, image, images[],
│   │                                  # verified, purchased{user,status}
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── property.routes.js
│   │   └── chat.route.js
│   ├── utils/
│   │   └── geocode.js                 # Nominatim wrapper
│   ├── uploads/                       # runtime-created image storage (gitignored)
│   ├── index.js                       # Express entry, CORS, Mongo connect, route mounting
│   ├── seedAdmin.js                   # creates first admin user from .env
│   ├── seedProperties.js              # seeds 10 demo properties with coordinates + images
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── _redirects                 # SPA fallback for Netlify
│   ├── src/
│   │   ├── components/
│   │   │   ├── all_properties/        # PropertyListingPage — main marketplace
│   │   │   ├── auth/                  # AuthForm (login + register tabs)
│   │   │   ├── chat/                  # ChatWidget (floating AI assistant)
│   │   │   ├── map/                   # PropertyMap (reusable Leaflet map)
│   │   │   ├── property_detail/       # PropertyDetails + edit form
│   │   │   ├── register_property/     # PropertyRegistrationForm
│   │   │   ├── verify_property/       # Admin-only verification queue
│   │   │   ├── user_dashboard/        # My listings
│   │   │   ├── home/                  # Hero, Featured, map preview
│   │   │   ├── pages/                 # Pages.jsx — router root
│   │   │   └── common/                # Header, Footer
│   │   ├── store/
│   │   │   ├── authSlice.js           # Redux: token, userId, isAdmin, isLoggedIn
│   │   │   └── propertySlice.js       # Redux: properties, thunks (fetch all, verify)
│   │   ├── config.js                  # API_BASE_URL (reads REACT_APP_API_URL)
│   │   └── index.js                   # React entry
│   ├── netlify.toml                   # Netlify build config (CI=false, SPA redirects)
│   ├── .env.example
│   └── package.json
│
├── .gitignore                         # node_modules, build, .env, .claude, media files
└── README.md
```

---

## API reference

Base URL: `https://rentup-api.onrender.com`

All image URLs returned by the API are relative paths like `uploads/xxx.jpg` — prefix them with the API base URL on the client.

### Auth — `/api/auth`

| Method | Path | Body | Auth | Purpose |
|---|---|---|---|---|
| `POST` | `/register` | `{ name, email, password, isAdmin? }` | — | Create user. `isAdmin: true` requires caller to already be admin. |
| `POST` | `/login` | `{ email, password }` | — | Returns `{ token, userId, isAdmin }`. |
| `POST` | `/logout` | — | — | Client-side token clear (stateless). |
| `GET` | `/fetch-data` | — | — | Proxy to external API (legacy). |
| `GET` | `/:userId` | — | — | Returns `{ name, email }` for a user id. |

### Properties — `/api/properties`

| Method | Path | Body / Query | Auth | Purpose |
|---|---|---|---|---|
| `GET` | `/verified` | `?listingType=sale\|rent` | — | Verified, available properties (marketplace feed). |
| `GET` | `/all` | — | Admin | Every property in the database (includes unverified). |
| `GET` | `/search` | `?location&propertyType&minPrice&maxPrice&listingType` | — | Filtered search. |
| `GET` | `/nearby` | `?lat&lng&radius&listingType` | — | GeoJSON `$nearSphere` query (default 5000 m, max 50000 m). |
| `GET` | `/:id` | — | — | Single property details. |
| `GET` | `/user/:userId` | — | — | All properties listed by a given seller. |
| `POST` | `/list` | multipart form + up to 10 `images[]` | User | Create a listing (auto-geocodes via Nominatim if no lat/lng). |
| `PUT` | `/:id` | multipart form + `keepImages` JSON | Owner | Update listing (only the seller who created it). |
| `DELETE` | `/:id` | — | Owner | Delete listing. |
| `POST` | `/verify/:id` | — | Admin | Flip `verified` to true — property becomes visible in marketplace. |
| `POST` | `/:id/purchase` | — | User | Mark property as sold/rented and record buyer. |

### Chat — `/api/chat`

| Method | Path | Body | Auth | Purpose |
|---|---|---|---|---|
| `POST` | `/` | `{ message }` | — | Returns `{ reply, matches[], filters }` after Gemini pipeline. |

---

## Request/response examples

### Login
```
POST /api/auth/login
{ "email": "admin@example.com", "password": "password" }

→ 200 OK
{ "token": "eyJhbGc...", "userId": "69e...", "isAdmin": true }
```

### Create a listing (seller)
```
POST /api/properties/list
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: Modern 2BHK
description: Near metro
price: 9500000
location: Sector 43, Gurgaon
listingType: sale
images: <file>
images: <file>

→ 201 Created
{ "message": "Property listed successfully", "property": { ... } }
```

### Nearby geo search
```
GET /api/properties/nearby?lat=19.0596&lng=72.8296&radius=5000

→ 200 OK
{ "count": 1, "radius": 5000, "center": { ... }, "properties": [ ... ] }
```

### Chatbot
```
POST /api/chat
{ "message": "find me a 2BHK in Mumbai under 2 crore" }

→ 200 OK
{
  "reply": "I found 2 matching properties in Mumbai...",
  "matches": [
    { "_id": "...", "title": "Modern 3BHK Apartment in Bandra",
      "pros": ["Sea-facing", "Reserved parking"],
      "cons": ["3BHK not 2BHK", "High budget"] },
    ...
  ],
  "filters": { "location": "Mumbai", "maxPrice": 20000000, "keywords": ["2BHK"] }
}
```

---

## Data model

### User
```
{ _id, name, email (unique), password (bcrypt hash),
  avatar, isAdmin, createdAt, updatedAt }
```

### Property
```
{ _id,
  title, description, price, location,
  coordinates: { type: 'Point', coordinates: [lng, lat] },   // 2dsphere indexed
  listingType: 'sale' | 'rent',
  rentPeriod: 'monthly' | 'yearly',
  seller: <User ref>,
  image: string,              // primary (first image)
  images: [string],           // full gallery
  verified: boolean,
  purchased: { user: <User ref>, status: boolean },
  createdAt }
```

---

## Workflow

### Seller flow
1. Register / login → JWT stored in Redux + localStorage.
2. Go to properties page → **Seller** tab → "List for Sale" or "List for Rent".
3. Fill form (title, description, price, location, images).
4. Submit → backend geocodes location, stores coords, `verified: false`.
5. Wait for admin verification.

### Admin flow
1. Login with admin account.
2. Navigate to verification queue.
3. Review unverified listings → click "Verify".
4. Listing now appears in buyer marketplace.

### Buyer flow
1. Browse `/all-property` (no login required).
2. Use **Buy/Rent** filter + search box.
3. Pan the map to explore nearby properties by area.
4. Or use **AI assistant** (bottom right) — natural language search.
5. Click any property → see gallery + details.
6. Login → click "Buy This" / "Rent This" → marked purchased.

---

## Local development

### Prerequisites
- Node.js ≥ 18
- npm
- A MongoDB Atlas cluster (free tier works) with network access allowing your IP

### Setup

Clone and install:
```bash
git clone git@github.com:Anay-Mittal/rentup.git
cd rentup

# Backend
cd backend
npm install
cp .env .env    # fill in values (see below)

# Frontend
cd ../frontend
npm install
```

### Backend `.env`
```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/rentup?retryWrites=true&w=majority
JWT_SECRET=some-long-random-string
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=password
GEMINI_API_KEY=AIza...
ALLOWED_ORIGINS=http://localhost:3000
# PORT=5000       # optional, defaults to 5000
```

Get a free Gemini API key at https://aistudio.google.com/apikey.

### Frontend `.env` (optional for local dev)
```
REACT_APP_API_URL=http://localhost:5000
```

If omitted, `config.js` falls back to `http://localhost:5000` automatically.

### Seed the database
```bash
cd backend
npm run seed:admin        # creates admin user from .env credentials
npm run seed:properties   # inserts 10 demo properties (idempotent — upserts by title)
```

### Run
Two terminals:
```bash
# Terminal 1 — backend
cd backend
npm run dev              # nodemon on port 5000

# Terminal 2 — frontend
cd frontend
npm run dev              # CRA dev server on port 3000
```

Open http://localhost:3000.

### Demo credentials (from seed)
- Email: `admin@example.com`
- Password: `password`

---

## Deployment

The project is configured for a 3-tier cloud deployment:

| Component | Platform | Config |
|---|---|---|
| Frontend | Netlify | [`frontend/netlify.toml`](frontend/netlify.toml) |
| Backend | Render.com | `backend/` as root, `npm install` + `npm start` |
| Database | MongoDB Atlas | Free tier M0 cluster |

### Deploy backend (Render)
1. Create a new **Web Service** on https://render.com from this repo.
2. Root directory: `backend`. Build: `npm install`. Start: `npm start`.
3. Instance type: **Free**.
4. Add environment variables (same keys as local `.env`) plus:
   - `ALLOWED_ORIGINS` = `https://your-site.netlify.app,http://localhost:3000`
5. Deploy. Note the URL, e.g. `https://rentup-api.onrender.com`.

### Deploy frontend (Netlify)
1. Create a new site on https://netlify.com from this repo.
2. Base dir: `frontend`. Build: `npm run build`. Publish: `frontend/build`.
3. Environment variable: `REACT_APP_API_URL` = your Render URL.
4. `netlify.toml` handles `CI=false` + SPA redirects automatically.
5. Deploy.

### First-time admin on prod
After the backend is live, run seeds locally against prod DB (Atlas URI in `.env`), OR hit the `/register` endpoint manually — the guard on `isAdmin` is bypassed only when no existing admin is authenticating, so either use the seed script or temporarily drop the guard, register, then restore.

### Cold start
Render free tier sleeps the service after 15 min of inactivity. The first request after a sleep takes ~30–60 s while the container wakes up. Subsequent requests are normal.

---

## Available npm scripts

### Backend
- `npm start` — production (node)
- `npm run dev` — development (nodemon)
- `npm run seed:admin` — create / promote admin user
- `npm run seed:properties` — insert or update 10 demo listings

### Frontend
- `npm run start` / `npm run dev` — CRA dev server on port 3000
- `npm run build` — production build → `frontend/build/`
- `npm run test` — Jest tests
- `npm run eject` — CRA eject (not recommended)

---

## Environment variables summary

### Backend
| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes | Atlas connection string |
| `JWT_SECRET` | yes | Token signing secret |
| `GEMINI_API_KEY` | yes (for chatbot) | Google AI Studio key |
| `ADMIN_EMAIL` | seed only | Default admin email |
| `ADMIN_PASSWORD` | seed only | Default admin password |
| `ALLOWED_ORIGINS` | prod | Comma-separated CORS origins |
| `PORT` | no | Default 5000 |
| `GEMINI_MODEL` | no | Override model id; defaults to `gemini-2.5-flash-lite` |

### Frontend
| Variable | Required | Purpose |
|---|---|---|
| `REACT_APP_API_URL` | prod | Backend base URL |

---

## Known limitations

- **Render free tier cold start** — first request after 15 min idle is slow.
- **Image uploads are ephemeral on Render free tier** — the `uploads/` folder is wiped on container restart. Move to S3/Cloudinary for persistence.
- **Nominatim rate limits** — 1 request / second per the OSM usage policy. Fine for demo volume.
- **Gemini free tier quota** — ~15 req/min and 1000 req/day on `gemini-2.5-flash-lite`. Each chat message uses 2 Gemini calls (filter extraction + reply).
- **Admin creation** is gated on an existing admin existing first — bootstrap via `npm run seed:admin`.

---

## Credits

- Map tiles: [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- Geocoding: [Nominatim](https://nominatim.org).
- Demo images: [Unsplash](https://unsplash.com).
- AI: [Google Gemini](https://ai.google.dev).

---

## License

ISC — see `backend/package.json`.
