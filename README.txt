EnergyStack Storefront

A production-grade monorepo for a solar-equipment storefront with a mock financing checkout.

Repository: rivy-store
Packages:

api/ — Node.js + Express + TypeScript, Sequelize (PostgreSQL)

web/ — React + TypeScript + Vite

Table of Contents

Overview & Tech Choices

Architecture & Request Flow

Deployed URLs

Run Locally (without Docker)

API — macOS/Linux

API — Windows PowerShell

Web — macOS/Linux

Web — Windows PowerShell

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

EnergyStack lists solar products, supports search/filters, product detail, cart, checkout, and a recent-orders page. Payments are simulated per the brief.

Why this stack

Express + TypeScript + Sequelize for a typed API, migrations, and indexed queries on PostgreSQL.

React + Vite for fast DX and production builds with clean loading/empty/error states.

OpenAPI + Swagger UI for self-documenting APIs.

Security/Ops: Helmet, CORS, rate-limit (100/15min), morgan logs, /healthz.

Architecture & Request Flow
[Browser]
   |
   +-- (HTTP/HTTPS) --> [web/ static or Vite dev]  (reads VITE_API_BASE_URL)
   |
   +-- fetch /api/* --> [api/ Express]
                        - validate (Zod) + rate limit
                        - Sequelize -> PostgreSQL (Neon)
                        - JSON responses (OpenAPI)
                        - /docs (Swagger), /healthz


Ports: Web 5173 · API 4000 · Postgres 5432

CORS (API): origin https://energystack-web.onrender.com, credentials true, methods GET,POST,PUT,PATCH,DELETE,OPTIONS, headers Content-Type, Authorization, Idempotency-Key.

Deployed URLs

Frontend (Render Static Site): https://energystack-web.onrender.com

Backend API (Render Web Service): https://energystack.onrender.com

Swagger UI: https://energystack.onrender.com/docs

Health: https://energystack.onrender.com/healthz

Quick cURL
# Products (first 3)
curl "https://energystack.onrender.com/api/products?limit=3"

# Checkout (simulated)
curl -X POST "https://energystack.onrender.com/api/checkout" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-123" \
  -d '{"customer":{"name":"Demo","email":"demo@example.com","phone":"+2340000000","address":"Lagos"},"lines":[{"productId":1,"qty":1}]}'

# Orders (recent 5)
curl "https://energystack.onrender.com/api/orders?limit=5"

Run Locally (without Docker)

Prerequisites: Node 18+ (Node 20 recommended), npm, and a local Postgres database named rivy_store_dev.

API — macOS/Linux
cd api
npm i

cat > .env << 'EOF'
NODE_ENV=development
PORT=4000
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/rivy_store_dev
DATABASE_SSL=false
CORS_ORIGIN=http://localhost:5173
SEED=false
EOF

npx sequelize-cli db:migrate

# Seed data (choose one)
npx sequelize-cli db:seed --seed 20250828-load-products.js
# or
node scripts/bootstrap-products.js   # reads api/seeders/data/products.json

npm run dev   # API on http://localhost:4000

API — Windows PowerShell
cd api
npm i

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
# or
node scripts/bootstrap-products.js

npm run dev   # http://localhost:4000

Web — macOS/Linux
cd web
npm i
echo VITE_API_BASE_URL=http://localhost:4000 > .env.local
npm run dev   # Web on http://localhost:5173

Web — Windows PowerShell
cd web
npm i
"VITE_API_BASE_URL=http://localhost:4000" | Set-Content -Path .env.local -NoNewline
npm run dev   # http://localhost:5173

Run with Docker Compose

The repo root contains compose.yml (and optionally docker-compose.dev.yml) for Postgres + API + Web.

macOS/Linux
docker compose -f compose.yml up --build
# API -> http://localhost:4000
# Web -> http://localhost:5173

Windows PowerShell
docker compose -f compose.yml up --build

Environment Variables & Seeding
API (api/.env for local)
Name	Description	Example
NODE_ENV	Environment	development
PORT	API port	4000
DATABASE_URL	Postgres connection string	postgres://postgres:postgres@127.0.0.1:5432/rivy_store_dev
DATABASE_SSL	Use SSL for DB connection	false (local), true (prod/Neon)
CORS_ORIGIN	Allowed browser origin	http://localhost:5173
SEED	Optional: auto-seed on boot	false
Web (web/.env.local for local)
Name	Description	Example
VITE_API_BASE_URL	Base URL for API requests	http://localhost:4000
Production (Render) — placeholders
# Backend (Web Service / Node)
DATABASE_URL=<NEON_DATABASE_URL_WITH_SSL_PARAMS>
DATABASE_SSL=true
CORS_ORIGIN=https://energystack-web.onrender.com

# Frontend (Static Site)
VITE_API_BASE_URL=https://energystack.onrender.com

Migrations & Seeding
# from api/
npx sequelize-cli db:migrate
npx sequelize-cli db:seed --seed 20250828-load-products.js
# or
node scripts/bootstrap-products.js


Seed data: api/seeders/data/products.json
Bootstrap script: api/scripts/bootstrap-products.js

Key API Routes

Base URL: ${VITE_API_BASE_URL} (local: http://localhost:4000)

GET /api/products — list with filters & pagination

Query params: q, categoryId, minPriceKobo, maxPriceKobo, inStock, financingEligible, sort=(relevance|price_asc|price_desc|newest), page, limit

GET /api/products/:id — product by id
POST /api/checkout — create order (simulated payment)

Body

{
  "customer": { "name": "", "email": "", "phone": "", "address": "" },
  "lines": [{ "productId": 1, "qty": 1 }]
}


Headers: Idempotency-Key: <string>

GET /api/orders — recent orders

Supports: page, limit

Health & Docs

GET /healthz

GET /docs (Swagger UI)

Validation & Error Shape

Input validation: Zod on query/body.

Errors:

{ "error": { "code": "SERVER_ERROR", "message": "..." } }

Models & Tables

Products, Orders, OrderItems (+ indexes).
Payments are simulated only.

How to Run Tests

Tests live under api/src/tests/* (unit tests for totals/tax and a handler/e2e). Ensure a DB is available and .env is configured.

# from api/
npm test


If you want to extend locally: install devDeps such as vitest or jest, supertest, and relevant @types.

Link to API Docs

Swagger UI: https://energystack.onrender.com/docs

Docs are served at /docs from the OpenAPI spec in the codebase. Health: /healthz.

Known Trade-offs

No authentication/admin UI (stretch).

Payments simulated; no third-party gateway.

Minimal analytics; basic logs only.

Inventory reservation simplified.

Tests emphasize pricing logic; broader e2e pending.

Basic image optimization; no CDN rules.

Future Improvements

Admin auth + product/order CRUD

Discount codes & price rules

Inventory hold/reservation windows

Image/CDN optimization; Lighthouse perf budget

Observability: structured logs, tracing, metrics

CI/CD: automated DB migrations; preview deploys

Accessibility audits (skip-links, keyboard traps)

Playwright e2e & contract tests (OpenAPI-driven)

Troubleshooting
CORS

Ensure CORS_ORIGIN (API) matches your web origin.

Ensure VITE_API_BASE_URL (web) points to the API.

Ports in use

Free 5173, 4000, 5432. On Windows:

Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process

Neon / SSL

Use the SSL connection string and set DATABASE_SSL=true.

Idempotency

Reuse the same Idempotency-Key for POST /api/checkout retries to prevent duplicates.

Vite 403/404

Verify .env.local has the correct VITE_API_BASE_URL and that the API is reachable.

Appendix
Frontend Pages

Catalog (search + filters + pagination), Product Detail, Cart, Checkout, Orders (recent). Mobile-first with graceful loading/empty/error states.

Example Product JSON
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

priceKobo Rationale

Store prices as integers (kobo) to avoid floating-point rounding issues.

Wireframes

<WIREFRAME_URL>

Deploy (Render) Reference

API (Web Service / Node)

Root: api

Build: npm ci && npm run build

Start: npm run start

Env: DATABASE_URL, DATABASE_SSL=true, CORS_ORIGIN=...

Web (Static Site)

Root: web

Build: npm ci && npm run build

Publish directory: dist

Env: VITE_API_BASE_URL=https://energystack.onrender.com

Build & Start (API only)
cd api
npm run build     # compiles to dist/
npm run start     # node dist/server.js


Windows PowerShell

cd api
npm run build
npm run start
