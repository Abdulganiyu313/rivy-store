EnergyStack Storefront

A production-grade monorepo for a solar-equipment storefront with a mock financing checkout.

Monorepo: rivy-store
Packages

api/ — Node.js + Express + TypeScript, Sequelize (PostgreSQL)

web/ — React + TypeScript + Vite

Quick Links:
Web: https://energystack-web.onrender.com
 • API: https://energystack.onrender.com
 • Docs: https://energystack.onrender.com/docs
 • Health: https://energystack.onrender.com/healthz

Table of Contents

Overview & Tech Choices

Architecture & Request Flow

Deployed URLs

Run Locally (without Docker)

Backend — macOS/Linux

Backend — Windows PowerShell

Frontend — macOS/Linux

Frontend — Windows PowerShell

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
EnergyStack lists solar products, supports search/filters, PDP, cart, checkout, and a recent orders page. Payments are simulated per the brief.

Why this stack

Express + TypeScript + Sequelize for a typed API, migrations, and indexes on PostgreSQL.

React + Vite + TypeScript for fast DX and production builds with clean loading/empty/error states.

OpenAPI + Swagger UI for self-documenting APIs.

Security & Ops basics: Helmet, CORS, rate limiting, morgan logs, /healthz.

Architecture & Request Flow

Ports: Web(5173), API(4000), Postgres(5432)

[Browser]
   │
   ├── (HTTP/HTTPS) → [web/ static OR Vite dev]  ← reads VITE_API_BASE_URL
   │
   └── fetch /api/* → [api/ Express]
                      ├─ validate (Zod) + rate limit
                      ├─ Sequelize → PostgreSQL
                      ├─ JSON (OpenAPI)
                      └─ /docs (Swagger), /healthz


CORS (API)
Allows origin https://energystack-web.onrender.com, credentials=true, methods GET,POST,PUT,PATCH,DELETE,OPTIONS, headers Content-Type, Authorization, Idempotency-Key.

Deployed URLs

Frontend (Render Static Site): https://energystack-web.onrender.com

Backend API (Render Web Service): https://energystack.onrender.com

Swagger UI: https://energystack.onrender.com/docs

Health: https://energystack.onrender.com/healthz

Smoke test

curl "https://energystack.onrender.com/api/products?limit=3"

curl -X POST "https://energystack.onrender.com/api/checkout" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-123" \
  -d '{"customer":{"name":"Demo","email":"demo@example.com","phone":"+2340000000","address":"Lagos"},"lines":[{"productId":1,"qty":1}]}'

curl "https://energystack.onrender.com/api/orders?limit=5"

Run Locally (without Docker)

Prereqs: Node 18+ (20 recommended), npm, and a local Postgres DB named rivy_store_dev.

Backend — macOS/Linux
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

# Seed (choose one)
npx sequelize-cli db:seed --seed 20250828-load-products.js
# or
node scripts/bootstrap-products.js   # reads seeders/data/products.json

npm run dev   # http://localhost:4000

Backend — Windows PowerShell
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
# or:
node scripts/bootstrap-products.js

npm run dev   # http://localhost:4000

Frontend — macOS/Linux
cd web
npm i
echo VITE_API_BASE_URL=http://localhost:4000 > .env.local
npm run dev   # http://localhost:5173

Frontend — Windows PowerShell
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
DATABASE_SSL	Enable SSL to DB	false (local), true (prod/Neon)
CORS_ORIGIN	Allowed browser origin	http://localhost:5173
SEED	Optional: auto-seed on boot	false
Web (web/.env.local for local)
Name	Description	Example
VITE_API_BASE_URL	Base URL for API requests	http://localhost:4000
Production (Render) — placeholders

Backend

DATABASE_URL=<NEON_DATABASE_URL_WITH_SSL_PARAMS>
DATABASE_SSL=true
CORS_ORIGIN=https://energystack-web.onrender.com


Frontend

VITE_API_BASE_URL=https://energystack.onrender.com

Migrations & Seeding
# from api/
npx sequelize-cli db:migrate
npx sequelize-cli db:seed --seed 20250828-load-products.js
# or
node scripts/bootstrap-products.js


Seed data: api/seeders/data/products.json.
Bootstrap script: api/scripts/bootstrap-products.js.

Key API Routes

Base: ${VITE_API_BASE_URL} (local: http://localhost:4000)

GET /api/products — list with filters & pagination
Query: q, categoryId, minPriceKobo, maxPriceKobo, inStock, financingEligible, sort=(relevance|price_asc|price_desc|newest), page, limit

GET /api/products/:id — product by id

POST /api/checkout — simulate checkout & create order
Body:

{
  "customer": { "name":"", "email":"", "phone":"", "address":"" },
  "lines": [{ "productId": 1, "qty": 1 }]
}


Header: Idempotency-Key: <string>

GET /api/orders — recent orders (page, limit)

GET /healthz — health

GET /docs — OpenAPI/Swagger UI

Validation & errors
Zod for queries/bodies. Error shape:

{ "error": { "code": "SERVER_ERROR", "message": "..." } }


Models: Products, Orders, OrderItems (+ indexes).
Payments: simulated only.

How to Run Tests

Tests live in api/src/tests/* (unit totals/tax + a handler/e2e). Ensure a DB is available and .env is set.

# from api/
npm test


If you want to extend locally, install devDeps like vitest or jest, supertest, and @types/*.

Link to API Docs

Swagger UI: https://energystack.onrender.com/docs

Docs are generated from OpenAPI and served at /docs. Health probe: /healthz.

Known Trade-offs

No authentication/admin UI (stretch).

Payments simulated; no external gateway.

Minimal analytics; basic logs only.

Inventory reservation simplified.

Tests emphasize pricing logic; broader e2e pending.

Basic image optimization; no CDN rules.

Future Improvements

Admin auth + product/order CRUD.

Discount codes & price rules.

Inventory hold/reservation windows.

Image/CDN optimization; Lighthouse perf budget.

Observability: structured logs, tracing, metrics.

CI/CD with automated DB migrations + preview deploys.

A11y audits (skip-links, keyboard traps).

Playwright e2e + contract tests (OpenAPI-driven).

Troubleshooting

CORS: Match CORS_ORIGIN with your web origin; set VITE_API_BASE_URL correctly.
Ports in use: Free 5173, 4000, 5432.

PowerShell to free API port:

Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process


Neon SSL: Use the SSL connection string and set DATABASE_SSL=true.
Idempotency: Reuse the same Idempotency-Key to prevent duplicate orders on retries.
Vite dev 403/404: Ensure .env.local has the correct VITE_API_BASE_URL.

Appendix

Frontend pages: Catalog (search + filters + pagination), Product detail, Cart, Checkout, Orders (recent).
Example product JSON

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


Why priceKobo: integers avoid floating-point errors.
Wireframes: <WIREFRAME_URL>

Deploy (Render) Reference

API (Web Service / Node)

Root: api

Build: npm ci && npm run build

Start: npm run start

Env: DATABASE_URL, DATABASE_SSL=true, CORS_ORIGIN=...

Web (Static Site)

Root: web

Build: npm ci && npm run build

Publish dir: dist

Env: VITE_API_BASE_URL=https://ene
