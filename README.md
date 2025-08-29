EnergyStack Storefront — README

A production-grade monorepo for a solar-equipment storefront and mock financing checkout.

Repo: rivy-store
Packages:

api/ — Node.js + Express + TypeScript, Sequelize (PostgreSQL)

web/ — React + TypeScript + Vite

Table of Contents

Overview & Tech Choices

Architecture & Request Flow

Deployed URLs

Run Locally (without Docker)

Run with Docker Compose

Environment Variables & Seeding

Key API Routes

How to Run Tests

Link to API Docs

Known Trade-offs

Future Improvements

Troubleshooting

Appendix

Overview & Tech Choices

What it is
EnergyStack is a full-stack reference implementation for an e-commerce storefront that lists solar products, supports search/filters, a product detail page, cart & checkout, and a recent-orders view. Payments are simulated per the brief.

Why this stack

Express + TypeScript + Sequelize: familiar, strongly-typed API with a mature ORM and straightforward migrations; PostgreSQL for relational integrity and indexes.

React + Vite + TypeScript: fast DX and production builds; component-driven UI with clear loading/empty/error states.

OpenAPI + Swagger UI: self-documenting HTTP API for assessors and consumers.

Security & Ops basics: Helmet, CORS, rate limiting, request logging, health checks.

Architecture & Request Flow

High level

web/ (Vite + React) reads VITE_API_BASE_URL and calls the backend.

api/ validates inputs (Zod), queries PostgreSQL (Sequelize), returns typed JSON.

OpenAPI docs are served at /docs; health at /healthz.

Ports

Web (Vite dev): 5173

API: 4000

PostgreSQL (local/dev): 5432

Sequence (text diagram)

[Browser] ──(HTTPS/HTTP)──> [web/ static or Vite dev]
      UI actions -> fetch ->  VITE_API_BASE_URL (/api/*)
                                |
                                v
                           [api/ Express]
                      validate (Zod) + rate limit
                                |
                                v
                         [PostgreSQL via Sequelize]
                                |
                                v
                         JSON response (OpenAPI)
                                |
                                v
                           UI state updates

Deployed URLs

Frontend (Render Static Site): https://energystack-web.onrender.com

Backend API (Render Web Service): https://energystack.onrender.com

Swagger UI: https://energystack.onrender.com/docs

Health check: https://energystack.onrender.com/healthz

Quick cURL smoke-tests

# Products (first 3)
curl "https://energystack.onrender.com/api/products?limit=3"

# Checkout (simulated payment)
curl -X POST "https://energystack.onrender.com/api/checkout" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-123" \
  -d '{"customer":{"name":"Demo","email":"demo@example.com","phone":"+2340000000","address":"Lagos"},"lines":[{"productId":1,"qty":1}]}'

# Orders (most recent 5)
curl "https://energystack.onrender.com/api/orders?limit=5"

Run Locally (without Docker)

Prereqs: Node 18+ (Node 20 recommended), npm, and a running PostgreSQL instance.
Create a local DB named rivy_store_dev.

1) Backend (api/)
cd api
npm i

# .env (example — do NOT commit real credentials)
cat > .env << 'EOF'
NODE_ENV=development
PORT=4000
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/rivy_store_dev
DATABASE_SSL=false
CORS_ORIGIN=http://localhost:5173
SEED=false
EOF

# Migrate and seed (choose one of the two seed paths)
npx sequelize-cli db:migrate

# Option A: dedicated seeder file (example filename)
npx sequelize-cli db:seed --seed 20250828-load-products.js

# Option B: bootstrap script (reads api/seeders/data/products.json)
node scripts/bootstrap-products.js

npm run dev   # API at http://localhost:4000


Windows (PowerShell)

cd api
npm i

# Write .env
@"
NODE_ENV=development
PORT=4000
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/rivy_store_dev
DATABASE_SSL=false
CORS_ORIGIN=http://localhost:5173
SEED=false
"@ | Set-Content -Path .env -NoNewline

npx sequelize-cli db:migrate
npx sequelize-cli db:seed --seed 20250828-load-products.js
# or: node scripts/bootstrap-products.js

npm run dev   # http://localhost:4000

2) Frontend (web/)
cd web
npm i
# point to local API:
echo VITE_API_BASE_URL=http://localhost:4000 > .env.local

npm run dev   # Web at http://localhost:5173


Windows (PowerShell)

cd web
npm i
"VITE_API_BASE_URL=http://localhost:4000" | Set-Content -Path .env.local -NoNewline

npm run dev   # http://localhost:5173

Run with Docker Compose

The root includes Compose files for Postgres + API + Web (compose.yml and optionally docker-compose.dev.yml).
Adjust environment placeholders before first run.

macOS/Linux

# From repo root
docker compose -f compose.yml up --build
# API  -> http://localhost:4000
# Web  -> http://localhost:5173
# DB   -> localhost:5432 (if exposed)


Windows (PowerShell)

# From repo root
docker compose -f compose.yml up --build


If you also keep a dev-oriented file:

docker compose -f docker-compose.dev.yml up --build

Environment Variables & Seeding
API (api/.env for local)
Name	Description	Example
NODE_ENV	Environment name	development
PORT	API port	4000
DATABASE_URL	Postgres connection string	postgres://postgres:postgres@127.0.0.1:5432/rivy_store_dev
DATABASE_SSL	Whether to use SSL for DB connection	false (local), true (prod/Neon)
CORS_ORIGIN	Allowed origin for browser requests	http://localhost:5173
SEED	Optional flag to seed on boot	false
Web (web/.env.local for local)
Name	Description	Example
VITE_API_BASE_URL	API base URL used by the UI	http://localhost:4000
Production (Render) — set safely in dashboard

Backend (Web Service / Node)

DATABASE_URL=<NEON_DATABASE_URL_WITH_SSL_PARAMS>
DATABASE_SSL=true
CORS_ORIGIN=https://energystack-web.onrender.com


Frontend (Static Site)

VITE_API_BASE_URL=https://energystack.onrender.com

Migrations & Seeding
# from api/
npx sequelize-cli db:migrate

# Seed path A: dedicated seeder file
npx sequelize-cli db:seed --seed 20250828-load-products.js

# Seed path B: bootstrap script
node scripts/bootstrap-products.js   # reads api/seeders/data/products.json


Seed data location: api/seeders/data/products.json.

Key API Routes

Base URL: ${VITE_API_BASE_URL} (local: http://localhost:4000)

GET /api/products — list w/ filters & pagination
Query: q, categoryId, minPriceKobo, maxPriceKobo, inStock, financingEligible, sort=(relevance|price_asc|price_desc|newest), page, limit

GET /api/products/:id — product by id

POST /api/checkout — simulate checkout & create order
Body:

{
  "customer": { "name": "", "email": "", "phone": "", "address": "" },
  "lines": [{ "productId": 1, "qty": 1 }]
}


Headers: Idempotency-Key: <string>

GET /api/orders — recent orders (page, limit)

GET /healthz — health probe

GET /docs — OpenAPI/Swagger UI

Response error shape

{ "error": { "code": "SERVER_ERROR", "message": "..." } }


Security & basics: Helmet, CORS, rate-limit (100/15min), morgan logs.
Sequelize models/tables: Products, Orders, OrderItems (+ indexes).
Payments: simulated only.

How to Run Tests

Tests live under api/src/tests/* (unit tests for totals/tax and a handler/e2e).
Prereqs: local DB available and .env configured (or a test DATABASE_URL).

# from api/
npm test
# (If using Vitest/Jest locally, ensure devDeps like vitest/jest, supertest, @types/* are installed)


Windows (PowerShell)

cd api
npm test

Link to API Docs

Swagger UI: https://energystack.onrender.com/docs

Docs are served by the API at /docs from the OpenAPI spec defined in the codebase.

Health endpoint for probes: /healthz.

Known Trade-offs

No authentication/admin UI (stretch goal).

Payments simulated; no third-party gateway integration.

Minimal analytics; basic request logs only.

Inventory reservation simplified; no timed holds.

Tests focus on pricing logic; limited end-to-end coverage.

Image optimization is basic; no CDN rules yet.

Future Improvements

Admin auth + product/order CRUD.

Discount codes & price rules.

Inventory reservation/hold window & stock reconciliation.

Image/CDN optimization and Lighthouse perf budget.

Observability: structured logs, tracing, metrics.

CI/CD: automated DB migrations; preview deploys.

Accessibility audits (keyboard traps, skip-links).

Playwright e2e and contract tests (OpenAPI-driven).

Troubleshooting

CORS

Ensure CORS_ORIGIN (API) matches your frontend origin.

Ensure VITE_API_BASE_URL (web) points to the API.

Windows/PowerShell quirks

Writing .env/.env.local: use Set-Content (see examples above).

Port conflicts: stop other processes using 5173, 4000, or 5432.

PowerShell: Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process

Neon / SSL

Production DB requires SSL. Set DATABASE_SSL=true and use the SSL-enabled DATABASE_URL.

Idempotency

For POST /api/checkout, send a unique Idempotency-Key. Reusing the same key avoids duplicate orders on retries.

Vite 403/404

If dev server starts but API calls fail, verify VITE_API_BASE_URL and that the API is reachable at that URL.

Appendix

Frontend pages
Catalog (search + filters + pagination), Product Detail, Cart, Checkout, Orders (recent orders / confirmation). Mobile-first with graceful loading/empty/error states.

Example product JSON shape (simplified)

{
  "id": 1,
  "name": "Solar Kit 2kW",
  "description": "All-in-one starter kit",
  "priceKobo": 25000000,
  "categoryId": 3,
  "inStock": true,
  "financingEligible": true,
  "imageUrl": "https://..."
}


Why priceKobo
Prices are stored as integers in kobo to avoid floating-point rounding issues.

Wireframes
Mid-fi links to be added: <WIREFRAME_URL>

Deploy (Render) — Reference

API (Web Service / Node)

Root dir: api

Build: npm ci && npm run build

Start: npm run start

Env: DATABASE_URL, DATABASE_SSL=true, CORS_ORIGIN=...

Web (Static Site)

Root dir: web

Build: npm ci && npm run build

Publish dir: dist

Env: VITE_API_BASE_URL=https://energystack.onrender.com

Build & Start (API only)
cd api
npm run build     # compiles to dist/
npm run start     # node dist/server.js


Windows (PowerShell)

cd api
npm run build
npm run start


Assessor note: The frontend reads VITE_API_BASE_URL. All pages handle empty/error states gracefully. Health checks are exposed at /healthz; API docs at /docs.
