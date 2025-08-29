<h1 align="center">⚡️ EnergyStack Storefront</h1> <p align="center">A production-grade monorepo for a solar-equipment storefront with a mock financing checkout.</p> <p align="center"> <a href="https://energystack-web.onrender.com"><img src="https://img.shields.io/badge/Live%20Web-energystack--web.onrender.com-2ea44f?style=for-the-badge" alt="Live Web"></a> <a href="https://energystack.onrender.com"><img src="https://img.shields.io/badge/Live%20API-energystack.onrender.com-2ea44f?style=for-the-badge" alt="Live API"></a> <a href="https://energystack.onrender.com/docs"><img src="https://img.shields.io/badge/Swagger-Docs-0a7cff?style=for-the-badge" alt="Swagger Docs"></a> <a href="https://energystack.onrender.com/healthz"><img src="https://img.shields.io/badge/Health-OK-00c853?style=for-the-badge" alt="Health"></a> </p> <p align="center"> <img src="https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=white&style=flat-square" /> <img src="https://img.shields.io/badge/Express-^4-000000?logo=express&logoColor=white&style=flat-square" /> <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white&style=flat-square" /> <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=000&style=flat-square" /> <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=flat-square" /> <img src="https://img.shields.io/badge/Sequelize-ORM-52B0E7?logo=sequelize&logoColor=white&style=flat-square" /> <img src="https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white&style=flat-square" /> </p> <p align="center"> <strong>Monorepo:</strong> <code>rivy-store</code><br/> <code>api/</code> — Node.js + Express + TypeScript, Sequelize (PostgreSQL) • <code>web/</code> — React + TypeScript + Vite </p>
📑 Table of Contents

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

💡 Overview & Tech Choices

What it is
EnergyStack lists solar products, supports search/filters, product detail, cart, checkout, and a recent-orders page. Payments are simulated per the brief.

Why this stack

Express + TypeScript + Sequelize for a typed API, migrations, and indexed queries on PostgreSQL.

React + Vite + TypeScript for fast DX and clean loading/empty/error states.

OpenAPI + Swagger UI for self-documenting APIs.

Security/Ops: Helmet, CORS, rate-limit (100/15min), morgan logs, /healthz.

🧭 Architecture & Request Flow
[Browser]
   │
   ├── (HTTP/HTTPS) → [web/ static or Vite dev]  ← reads VITE_API_BASE_URL
   │
   └── fetch /api/* → [api/ Express]
                      ├─ validate (Zod) + rate limit
                      ├─ Sequelize → PostgreSQL (Neon)
                      ├─ JSON (OpenAPI)
                      └─ /docs (Swagger), /healthz


Ports: Web 5173 • API 4000 • Postgres 5432
CORS: Origin https://energystack-web.onrender.com
, credentials true, methods GET,POST,PUT,PATCH,DELETE,OPTIONS, headers Content-Type, Authorization, Idempotency-Key.

🌐 Deployed URLs

Frontend (Render Static Site): https://energystack-web.onrender.com

Backend API (Render Web Service): https://energystack.onrender.com

Swagger UI: https://energystack.onrender.com/docs

Health: https://energystack.onrender.com/healthz

Quick cURL

curl "https://energystack.onrender.com/api/products?limit=3"

curl -X POST "https://energystack.onrender.com/api/checkout" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-123" \
  -d '{"customer":{"name":"Demo","email":"demo@example.com","phone":"+2340000000","address":"Lagos"},"lines":[{"productId":1,"qty":1}]}'

curl "https://energystack.onrender.com/api/orders?limit=5"
