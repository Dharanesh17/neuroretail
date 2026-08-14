<<<<<<< HEAD
# NeuroRetail

**NeuroRetail is an AI-powered retail decision-support system that converts sales, pricing, and inventory data into explainable business recommendations.**

It is designed as a focused enterprise-style final-year project: managers can understand what is happening, why it is happening, and the specific action to take next.

## What is included

- Executive KPI dashboard: revenue, gross profit, margin, units sold, inventory value, stockout/overstock rates, forecast accuracy, average selling price, and price-change impact.
- Demand forecasting, dynamic pricing, and inventory optimisation in one decision loop.
- AI Recommendation Center with expected revenue/profit, replenishment quantities, confidence, and manager-readable explanations.
- What-if simulator for price, promotion, inventory, and competitor-price scenarios.
- Competitor analysis, stock alerts, product management, and data-upload validation.
- Model Performance Center with MAPE, RMSE, MAE, R², forecast-vs-actual chart, training date, dataset size, and version.
- Data Quality Monitor for missing values, duplicates, invalid prices/dates, negative quantities, missing product IDs, and outliers.
- Audit trail, simple RBAC demo roles (Admin, Store Manager, Analyst, Supplier), CSV export, and PDF executive reports.
- Optional NeuroRetail Assistant for explaining the data; it is kept secondary to the main decision workspace.

## Architecture

```text
Data Sources
  → Data Validation & Quality Check
  → Preprocessing & Feature Engineering
  → Demand Forecasting
  → Dynamic Pricing Engine
  → Inventory Optimisation
  → AI Decision Engine
  → Explainable Recommendations
  → Dashboard, Alerts & Reports
  → Manager Decision
  → Audit Log
```

### Stack

| Layer | Implementation |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Recharts, jsPDF |
| API | Flask REST API |
| ML | Ridge-based pricing model and demand forecaster; model-performance comparison includes Random Forest, Gradient Boosting, and LSTM candidates |
| Development data store | SQLite (`backend/neuroretail.db`) with JSON seed data |
| Production migration path | MySQL-compatible relational schema / API repository layer |

## Run locally

### 1. Start the API

```bash
cd backend
python -m pip install -r requirements.txt
python app.py
```

The API listens on `http://localhost:5000`. SQLite is initialised automatically on first start.

### 2. Start the dashboard

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Docker deployment

From the project root:

```bash
docker compose up --build
```

- Dashboard: `http://localhost`
- REST API: `http://localhost:5000`

## Main API routes

| Route | Purpose |
| --- | --- |
| `GET /api/executive/dashboard` | Executive KPI and decision briefing |
| `GET /api/decision/recommendations` | Explainable price/replenishment actions |
| `POST /api/scenario/simulate` | What-if analysis |
| `GET /api/model-performance` | Model comparison and back-test data |
| `GET /api/data-quality` | Validation report |
| `GET /api/alerts` | Generated inventory alerts |
| `GET /api/audit-logs` | Governance trail |
| `GET /api/reports` | Export-ready management report payload |

## Demo roles

The Users & Roles page provides simple, realistic demo personas:

- **Admin** — users, settings, models, data, and audit logs.
- **Store Manager** — dashboard, pricing, inventory, forecasting, actions, and reports.
- **Analyst** — data, forecasting, performance, analytics, and scenarios.
- **Supplier** — limited reorder and inventory visibility.
=======
# neuroretail
NeuroRetail is an enterprise-grade AI web application designed for dynamic pricing, ML-driven demand forecasting, autonomous inventory control, customer behavior analytics, hybrid product recommendations, and IoT smart shelf monitoring.
>>>>>>> 7517aad80226d00c18a99e31cc23081853a67521
