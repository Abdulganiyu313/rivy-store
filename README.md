<h1>⚡️ EnergyStack Storefront</h1>
<p>A production-grade monorepo for a solar-equipment storefront with a mock financing checkout.</p>

<p><strong>Repository:</strong> <code>rivy-store</code></p>
<ul>
  <li><code>api/</code> — Node.js + Express + TypeScript, Sequelize (PostgreSQL)</li>
  <li><code>web/</code> — React + TypeScript + Vite</li>
</ul>

<hr/>

<nav>
  <h2 id="toc">📑 Table of Contents</h2>
  <ul>
    <li><a href="#overview">Overview &amp; Tech Choices</a></li>
    <li><a href="#architecture">Architecture &amp; Request Flow</a></li>
    <li><a href="#urls">Deployed URLs</a></li>
    <li><a href="#run-local">Run Locally (without Docker)</a></li>
    <li><a href="#compose">Run with Docker Compose</a></li>
    <li><a href="#env">Environment Variables &amp; Seeding</a></li>
    <li><a href="#routes">Key API Routes</a></li>
    <li><a href="#tests">How to Run Tests</a></li>
    <li><a href="#docs">Link to API Docs</a></li>
    <li><a href="#tradeoffs">Known Trade-offs</a></li>
    <li><a href="#future">Future Improvements</a></li>
    <li><a href="#troubleshooting">Troubleshooting</a></li>
    <li><a href="#appendix">Appendix</a></li>
    <li><a href="#deploy">Deploy (Render) Reference</a></li>
    <li><a href="#buildstart">Build &amp; Start (API only)</a></li>
  </ul>
</nav>

<hr/>

<section id="overview">
  <h2>💡 Overview &amp; Tech Choices</h2>

  <h3>What it is</h3>
  <p>
    EnergyStack lists solar products, supports search/filters, product detail, cart, checkout, recent orders page, and a contact us page where user can make inquires.
    Payments are simulated per the brief.
  </p>

  <h3>Why this stack</h3>
  <ul>
    <li><strong>Express + TypeScript + Sequelize</strong> for a typed API, migrations, and indexed queries on PostgreSQL.</li>
    <li><strong>React + Vite</strong> for fast DX and production builds with clean loading/empty/error states.</li>
    <li><strong>OpenAPI + Swagger UI</strong> for self-documenting APIs.</li>
    <li><strong>Security/Ops</strong>: Helmet, CORS, rate-limit (100 / 15min), morgan logs, <code>/healthz</code>.</li>
  </ul>

  <h3>Backend concerns implemented</h3>
  <ul>
    <li>Input validation with <strong>Zod</strong> (queries &amp; bodies for products and checkout).</li>
    <li>Consistent error shape: <code>{"error":{"code":"SERVER_ERROR","message":"..."}}</code>.</li>
    <li>OpenAPI served at <code>/docs</code>.</li>
    <li>Sequelize models/tables: <code>Products</code>, <code>Orders</code>, <code>OrderItems</code> (+ indexes).</li>
    <li>Payments: <strong>simulated only</strong>.</li>
  </ul>
</section>

<hr/>

<section id="architecture">
  <h2>🧭 Architecture &amp; Request Flow</h2>

  <pre><code>[Browser]
  |
  +-- (HTTP/HTTPS) --&gt; [web/ static or Vite dev]  (reads VITE_API_BASE_URL)
  |
  +-- fetch /api/* --&gt; [api/ Express]
                       - validate (Zod) + rate limit
                       - Sequelize --&gt; PostgreSQL (Neon)
                       - JSON responses (OpenAPI)
                       - /docs (Swagger), /healthz
</code></pre>

  <p><strong>Ports:</strong> Web 5173 · API 4000 · Postgres 5432</p>

  <p><strong>CORS (API):</strong>
    origin <code>https://energystack-web.onrender.com</code>,
    credentials <code>true</code>,
    methods <code>GET,POST,PUT,PATCH,DELETE,OPTIONS</code>,
    headers <code>Content-Type, Authorization, Idempotency-Key</code>.
  </p>
</section>

<hr/>

<section id="urls">
  <h2>🌐 Deployed URLs</h2>
  <ul>
    <li><strong>Frontend (Render Static Site):</strong> <a href="https://energystack-web.onrender.com">https://energystack-web.onrender.com</a></li>
    <li><strong>Backend API (Render Web Service):</strong> <a href="https://energystack.onrender.com">https://energystack.onrender.com</a></li>
    <li><strong>Swagger UI:</strong> <a href="https://energystack.onrender.com/docs">https://energystack.onrender.com/docs</a></li>
    <li><strong>Health:</strong> <a href="https://energystack.onrender.com/healthz">https://energystack.onrender.com/healthz</a></li>
  </ul>

  <h3>Quick cURL</h3>
  <pre><code># Products (first 3)
curl "https://energystack.onrender.com/api/products?limit=3"

# Checkout (simulated)
curl -X POST "https://energystack.onrender.com/api/checkout" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-123" \
  -d '{"customer":{"name":"Demo","email":"demo@example.com","phone":"+2340000000","address":"Lagos"},"lines":[{"productId":1,"qty":1}]}'

# Orders (recent 5)
curl "https://energystack.onrender.com/api/orders?limit=5"
</code></pre>
</section>

<hr/>

<section id="run-local">
  <h2>🧪 Run Locally (without Docker)</h2>
  <p><em>Prerequisites:</em> Node 18+ (Node 20 recommended), npm, and a local Postgres database named <code>rivy_store_dev</code>.</p>

  <h3>API — macOS/Linux</h3>
  <pre><code>cd api
npm i

cat &gt; .env &lt;&lt; 'EOF'
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
</code></pre>

  <h3>API — Windows PowerShell</h3>
  <pre><code>cd api
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
</code></pre>

  <h3>Web — macOS/Linux</h3>
  <pre><code>cd web
npm i
echo VITE_API_BASE_URL=http://localhost:4000 &gt; .env.local
npm run dev   # Web on http://localhost:5173
</code></pre>

  <h3>Web — Windows PowerShell</h3>
  <pre><code>cd web
npm i
"VITE_API_BASE_URL=http://localhost:4000" | Set-Content -Path .env.local -NoNewline
npm run dev   # http://localhost:5173
</code></pre>
</section>

<hr/>

<section id="compose">
  <h2>🐳 Run with Docker Compose</h2>
  <p>The repo root contains <code>compose.yml</code> (and optionally <code>docker-compose.dev.yml</code>) for Postgres + API + Web.</p>

  <h3>macOS/Linux</h3>
  <pre><code>docker compose -f compose.yml up --build
# API -&gt; http://localhost:4000
# Web -&gt; http://localhost:5173
</code></pre>

  <h3>Windows PowerShell</h3>
  <pre><code>docker compose -f compose.yml up --build
</code></pre>
</section>

<hr/>

<section id="env">
  <h2>🔧 Environment Variables &amp; Seeding</h2>

  <h3>API (<code>api/.env</code> for local)</h3>
  <table>
    <thead>
      <tr><th>Name</th><th>Description</th><th>Example</th></tr>
    </thead>
    <tbody>
      <tr><td><code>NODE_ENV</code></td><td>Environment</td><td><code>development</code></td></tr>
      <tr><td><code>PORT</code></td><td>API port</td><td><code>4000</code></td></tr>
      <tr><td><code>DATABASE_URL</code></td><td>Postgres connection string</td><td><code>postgres://postgres:postgres@127.0.0.1:5432/rivy_store_dev</code></td></tr>
      <tr><td><code>DATABASE_SSL</code></td><td>Use SSL for DB</td><td><code>false</code> (local), <code>true</code> (prod/Neon)</td></tr>
      <tr><td><code>CORS_ORIGIN</code></td><td>Allowed browser origin</td><td><code>http://localhost:5173</code></td></tr>
      <tr><td><code>SEED</code></td><td>Optional: auto-seed on boot</td><td><code>false</code></td></tr>
    </tbody>
  </table>

  <h3>Web (<code>web/.env.local</code> for local)</h3>
  <table>
    <thead>
      <tr><th>Name</th><th>Description</th><th>Example</th></tr>
    </thead>
    <tbody>
      <tr><td><code>VITE_API_BASE_URL</code></td><td>Base URL for API requests</td><td><code>http://localhost:4000</code></td></tr>
    </tbody>
  </table>

  <h3>Production (Render) — placeholders</h3>
  <pre><code># Backend (Web Service / Node)
DATABASE_URL=&lt;NEON_DATABASE_URL_WITH_SSL_PARAMS&gt;
DATABASE_SSL=true
CORS_ORIGIN=https://energystack-web.onrender.com

# Frontend (Static Site)
VITE_API_BASE_URL=https://energystack.onrender.com
</code></pre>

  <h3>Migrations &amp; Seeding</h3>
  <pre><code># from api/
npx sequelize-cli db:migrate
npx sequelize-cli db:seed --seed 20250828-load-products.js
# or
node scripts/bootstrap-products.js   # reads api/seeders/data/products.json
</code></pre>

  <p><strong>Seed data:</strong> <code>api/seeders/data/products.json</code><br/>
     <strong>Bootstrap script:</strong> <code>api/scripts/bootstrap-products.js</code></p>
</section>

<hr/>

<section id="routes">
  <h2>🔗 Key API Routes</h2>

  <p><strong>Base URL:</strong> <code>${VITE_API_BASE_URL}</code> (local: <code>http://localhost:4000</code>)</p>

  <h3>GET /api/products — list with filters &amp; pagination</h3>
  <p><strong>Query params:</strong> <code>q</code>, <code>categoryId</code>, <code>minPriceKobo</code>, <code>maxPriceKobo</code>, <code>inStock</code>, <code>financingEligible</code>, <code>sort</code> (<code>relevance|price_asc|price_desc|newest</code>), <code>page</code>, <code>limit</code></p>

  <h3>GET /api/products/:id — product by id</h3>

  <h3>POST /api/checkout — create order (simulated payment)</h3>
  <p><strong>Body</strong></p>
  <pre><code>{
  "customer": { "name": "", "email": "", "phone": "", "address": "" },
  "lines": [{ "productId": 1, "qty": 1 }]
}
</code></pre>
  <p><strong>Headers:</strong> <code>Idempotency-Key: &lt;string&gt;</code></p>

  <h3>GET /api/orders — recent orders</h3>
  <p>Supports: <code>page</code>, <code>limit</code></p>

  <h3>Health &amp; Docs</h3>
  <ul>
    <li><code>GET /healthz</code></li>
    <li><code>GET /docs</code> (Swagger UI)</li>
  </ul>

  <h3>Validation &amp; Error Shape</h3>
  <ul>
    <li>Input validation with <strong>Zod</strong> (queries &amp; bodies).</li>
  </ul>
  <pre><code>{ "error": { "code": "SERVER_ERROR", "message": "..." } }
</code></pre>

  <h3>Models &amp; Tables</h3>
  <p><code>Products</code>, <code>Orders</code>, <code>OrderItems</code> (+ indexes). Payments are <strong>simulated</strong> only.</p>
</section>

<hr/>

<section id="tests">
  <h2>✅ How to Run Tests</h2>
  <p>Tests live under <code>api/src/tests/*</code> (unit tests for totals/tax and a handler/e2e). Ensure a DB is available and <code>.env</code> is configured.</p>
  <pre><code># from api/
npm test
</code></pre>
  <p>If you want to extend locally: install devDeps such as <code>vitest</code> or <code>jest</code>, <code>supertest</code>, and relevant <code>@types</code>.</p>
</section>

<hr/>

<section id="docs">
  <h2>📘 Link to API Docs</h2>
  <p><strong>Swagger UI:</strong> <a href="https://energystack.onrender.com/docs">https://energystack.onrender.com/docs</a></p>
  <p>Docs are served at <code>/docs</code> from the OpenAPI spec in the codebase. Health: <code>/healthz</code>.</p>
</section>

<hr/>

<section id="tradeoffs">
  <h2>⚖️ Known Trade-offs</h2>
  <ul>
    <li>No authentication/admin UI (stretch).</li>
    <li>Payments simulated; no third-party gateway.</li>
    <li>Minimal analytics; basic logs only.</li>
    <li>Inventory reservation simplified.</li>
    <li>Tests emphasize pricing logic; broader e2e pending.</li>
    <li>Basic image optimization; no CDN rules.</li>
  </ul>
</section>

<hr/>

<section id="future">
  <h2>🧭 Future Improvements</h2>
  <ul>
    <li>Admin auth + product/order CRUD.</li>
    <li>Discount codes &amp; price rules.</li>
    <li>Inventory hold/reservation windows.</li>
    <li>Image/CDN optimization; Lighthouse perf budget.</li>
    <li>Observability: structured logs, tracing, metrics.</li>
    <li>CI/CD: automated DB migrations; preview deploys.</li>
    <li>Accessibility audits (skip-links, keyboard traps).</li>
    <li>Playwright e2e &amp; contract tests (OpenAPI-driven).</li>
  </ul>
</section>

<hr/>

<section id="troubleshooting">
  <h2>🛠️ Troubleshooting</h2>

  <h3>CORS</h3>
  <ul>
    <li>Ensure <code>CORS_ORIGIN</code> (API) matches your web origin.</li>
    <li>Ensure <code>VITE_API_BASE_URL</code> (web) points to the API.</li>
  </ul>

  <h3>Ports in use</h3>
  <p>Free <code>5173</code>, <code>4000</code>, <code>5432</code>. On Windows:</p>
  <pre><code>Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process
</code></pre>

  <h3>Neon / SSL</h3>
  <p>Use the SSL connection string and set <code>DATABASE_SSL=true</code>.</p>

  <h3>Idempotency</h3>
  <p>Reuse the same <code>Idempotency-Key</code> for <code>POST /api/checkout</code> retries to prevent duplicates.</p>

  <h3>Vite 403/404</h3>
  <p>Verify <code>.env.local</code> has the correct <code>VITE_API_BASE_URL</code> and that the API is reachable.</p>
</section>

<hr/>

<section id="appendix">
  <h2>📎 Appendix</h2>

  <h3>Frontend Pages</h3>
  <p>Catalog (search + filters + pagination), Product Detail, Cart, Checkout, Orders (recent). Mobile-first with graceful loading/empty/error states.</p>

  <h3>Example Product JSON</h3>
  <pre><code>{
  "id": 1,
  "name": "Solar Kit 2kW",
  "description": "All-in-one starter kit",
  "priceKobo": 25000000,
  "categoryId": 3,
  "inStock": true,
  "financingEligible": true,
  "imageUrl": "https://..."
}
</code></pre>

  <h3><code>priceKobo</code> Rationale</h3>
  <p>Store prices as integers (kobo) to avoid floating-point rounding issues.</p>

  <h3>Wireframes</h3>
  <p><a href=https://drive.google.com/file/d/1cPn_F6Rr2a7YyMiuXZzBhK3Y-5rkLEq5/view>https://drive.google.com/file/d/1cPn_F6Rr2a7YyMiuXZzBhK3Y-5rkLEq5/view</a></p>
</section>

<hr/>

<section id="deploy">
  <h2>🚀 Deploy (Render) — Reference</h2>

  <h3>API (Web Service / Node)</h3>
  <ul>
    <li><strong>Root:</strong> <code>api</code></li>
    <li><strong>Build:</strong> <code>npm ci &amp;&amp; npm run build</code></li>
    <li><strong>Start:</strong> <code>npm run start</code></li>
    <li><strong>Env:</strong> <code>DATABASE_URL</code>, <code>DATABASE_SSL=true</code>, <code>CORS_ORIGIN=...</code></li>
  </ul>

  <h3>Web (Static Site)</h3>
  <ul>
    <li><strong>Root:</strong> <code>web</code></li>
    <li><strong>Build:</strong> <code>npm ci &amp;&amp; npm run build</code></li>
    <li><strong>Publish directory:</strong> <code>dist</code></li>
    <li><strong>Env:</strong> <code>VITE_API_BASE_URL=https://energystack.onrender.com</code></li>
  </ul>
</section>

<hr/>

<section id="buildstart">
  <h2>🔧 Build &amp; Start (API only)</h2>
  <pre><code>cd api
npm run build     # compiles to dist/
npm run start     # node dist/server.js
</code></pre>

  <h3>Windows PowerShell</h3>
  <pre><code>cd api
npm run build
npm run start
</code></pre>
</section>
