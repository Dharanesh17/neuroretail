# NeuroRetail

> **Enterprise-grade AI retail decision platform** — dynamic pricing, demand forecasting, autonomous inventory control, and explainable business recommendations in one unified dashboard.

NeuroRetail converts raw sales, pricing, and inventory data into actionable intelligence. Managers see not just what is happening, but **why**, and the exact next step to take — all backed by auditable AI reasoning.

---

## Features

### AI & Intelligence

| Module | Description |
| --- | --- |
| **Executive Dashboard** | Revenue, gross profit, margin, units sold, inventory value, stockout/overstock rates, forecast accuracy, average selling price, and price-change impact |
| **Demand Forecast** | ML-driven 7–30 day demand predictions per SKU with historical trend charts |
| **Dynamic Pricing** | Real-time optimal price recommendations using Ridge/Gradient Boosting models with confidence scores |
| **Inventory Optimization** | EOQ, safety stock, ABC classification, reorder alerts, and auto-PO generation |
| **What-if Simulator** | Scenario analysis for price, promotion %, inventory level, and competitor price changes |

### Analytics & Monitoring

| Module | Description |
| --- | --- |
| **Model Performance** | MAPE, RMSE, MAE, R² comparison across Gradient Boosting, Random Forest, and Ridge models with forecast-vs-actual chart |
| **Data Quality Monitor** | Missing values, duplicates, invalid prices/dates, negative quantities, outliers — all tracked and quality-scored |
| **Alerts Center** | Real-time inventory and system alerts with severity levels |
| **Reports & Export** | Executive PDF reports and CSV export with full metrics snapshot |

### Operations & Governance

| Module | Description |
| --- | --- |
| **Products** | Full product catalogue with pricing, stock levels, demand scores, and cost data |
| **Activity Trail** | Immutable audit log of every pricing action, model retrain, role change, and data event |
| **Users & Roles** | RBAC demo personas — Admin, Store Manager, Analyst, Supplier |
| **Settings** | Store configuration, currency, GSTIN, and multi-store switching |
| **Data Upload** | 7-stage AI pipeline — automated cleaning, validation, column mapping, model training, and dashboard activation |

### NeuroRetail Assistant

Optional AI chat assistant that explains dashboard data and recommended actions. Intentionally kept secondary to the main decision workspace.

---

## 7-Stage Data Upload Pipeline

When a CSV/JSON file is uploaded, the system runs these stages **sequentially and automatically**:

```
1. File Upload          →  POST /api/datasets/upload
2. Schema Validation    →  Detect and verify required columns
3. Data Cleaning        →  Remove duplicates, impute missing values, fix outliers
4. Column Mapping       →  Auto-map fields to AI feature schema
5. Data Processing      →  Normalise, encode, and engineer features
6. AI Model Training    →  Train demand forecasting & pricing models
7. Dashboard Activation →  Publish live results → auto-redirect to Executive Dashboard
```

Each stage shows a live animated progress bar with **real upload progress** (bytes transferred) during Stage 1. A **Data Cleaning Report** (quality score, duplicates removed, missing imputed, outliers fixed, rows processed) is displayed after Stage 3. On completion the Executive Dashboard updates automatically with the new data.

> **Persistence:** Pipeline state (file, progress, results) is stored in `App.jsx` — navigating to another dashboard and returning to Data Upload keeps all progress and results intact.

---

## Architecture

```text
CSV / JSON Upload
  → [1] File Upload
  → [2] Schema Validation
  → [3] Data Cleaning & Quality Scoring
  → [4] Column Mapping
  → [5] Feature Engineering & Processing
  → [6] AI Model Training (Gradient Boosting / Ridge / Random Forest)
  → [7] Dashboard Activation
       ↓
  Executive Dashboard  ←  Live KPI Updates
  Pricing Engine · Demand Forecaster · Inventory Optimizer
  Explainable Recommendations → Manager Decision → Activity Trail
```

### Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, Recharts, Lucide Icons, jsPDF |
| **Backend API** | Python Flask REST API (CORS-enabled) |
| **ML Models** | Ridge Regression (pricing), Gradient Boosting Regressor (demand), Random Forest (ensemble comparison) |
| **Data Store** | SQLite (`backend/neuroretail.db`) — auto-initialised on first start |
| **Dataset Service** | `DatasetService` — multi-dataset management with versioning, validation, and training lifecycle |
| **Deployment** | Docker Compose · Render.com (`render.yaml`) |

---

## Run Locally

### Prerequisites

- Python 3.10+
- Node.js 18+

### 1. Start the Backend API

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The Flask API starts on `http://localhost:5000`. SQLite is initialised automatically on first run.

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` (or the port shown in the terminal if 5173 is busy).

> **Note:** `@babel/types` is pinned to `7.26.10` via `package.json` overrides to permanently prevent a known npm registry issue with newer versions where `validators/react/isReactComponent.js` is missing from the published tarball.

---

## Docker Deployment

From the project root:

```bash
docker compose up --build
```

| Service | URL |
| --- | --- |
| Dashboard | `http://localhost` |
| REST API | `http://localhost:5000` |

---

## API Reference

### Dataset Pipeline

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/datasets/upload` | POST | Upload a new CSV/JSON dataset (multipart `FormData`) |
| `/api/datasets/{id}/validate` | POST | Validate schema and column types |
| `/api/upload/clean` | POST | Run data cleaning and return quality report |
| `/api/datasets/{id}/process` | POST | Feature engineering and normalisation |
| `/api/datasets/{id}/train` | POST | Train AI models on the dataset |
| `/api/datasets/{id}/activate` | POST | Set dataset as live and refresh dashboards |

### Core Dashboard

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/executive/dashboard` | GET | Executive KPIs and decision briefing |
| `/api/decision/recommendations` | GET | Explainable price/replenishment actions |
| `/api/scenario/simulate` | POST | What-if scenario analysis |
| `/api/model-performance` | GET | Model comparison and back-test data |
| `/api/data-quality` | GET | Data validation report |

### Products & Pricing

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/products` | GET | Full product catalogue |
| `/api/pricing/dynamic-calculate` | POST | Calculate optimal price for a SKU |
| `/api/pricing/update` | POST | Apply and log a price change |
| `/api/forecast/{product_id}` | GET | Demand forecast for a product |

### Inventory & Alerts

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/inventory/status` | GET | Inventory intelligence with EOQ and ABC class |
| `/api/inventory/reorder` | POST | Approve replenishment and generate PO |
| `/api/alerts` | GET | Generated inventory and system alerts |
| `/api/iot/shelves` | GET | Smart shelf sensor readings |

### Governance & System

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/audit-logs` | GET | Immutable activity trail |
| `/api/reports` | GET | Export-ready executive report payload |
| `/api/users` | GET | Users, current user, and available roles |
| `/api/auth/switch-role` | POST | Switch active demo role |
| `/api/ai/retrain` | POST | Trigger model retrain on active dataset |

---

## Navigation

| Section | Pages |
| --- | --- |
| **Overview** | Executive Dashboard |
| **Intelligence** | Demand Forecast · Dynamic Pricing · Inventory Optimization |
| **Analysis** | What-if Simulator · Model Performance · Data Quality |
| **Management** | Products · Alerts · Reports & Export · Activity Trail |
| **System** | Users & Roles · Settings · Data Upload |

---

## Demo Roles

Switch roles from the Navbar or Users & Roles page to simulate realistic access control:

| Role | Access |
| --- | --- |
| **Admin** | Full access — users, settings, models, data, activity trail |
| **Store Manager** | Dashboard, pricing, inventory, forecasting, actions, reports |
| **Analyst** | Data, forecasting, model performance, analytics, scenarios |
| **Supplier** | Limited — reorder status and inventory visibility only |

---

## Project Structure

```
major_project01/
├── backend/
│   ├── app.py                # Flask REST API — all routes
│   ├── data_store.py         # In-memory + SQLite data layer
│   ├── dataset_service.py    # Dataset lifecycle management
│   ├── ml_engine.py          # Pricing, demand, and recommendation engines
│   ├── requirements.txt
│   └── reference_doc.csv     # Seed / sample retail dataset
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Root app, routing, data loading, and persisted upload state
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   │   ├── Navbar.jsx            # Top bar with alerts and AI status
│   │   │   ├── DataUploadModule.jsx  # 7-stage upload pipeline (state from App props)
│   │   │   ├── DemandForecast.jsx
│   │   │   ├── DynamicPricing.jsx
│   │   │   ├── InventoryIntelligence.jsx
│   │   │   ├── EnterpriseViews.jsx   # All enterprise page views
│   │   │   └── VoiceAssistantModal.jsx
│   │   └── api/client.js     # Typed API client with fallback data
│   ├── package.json          # @babel/types pinned to 7.26.10 via overrides
│   └── vite.config.js        # host: true for IPv4/IPv6 compatibility
├── docker-compose.yml
├── render.yaml
└── .gitignore
```

---

## Known Issues & Fixes

| Issue | Fix Applied |
| --- | --- |
| `Cannot find module './validators/react/isReactComponent.js'` | `@babel/types` and `@babel/core` pinned to `7.26.10` via `package.json` overrides |
| Vite binding to IPv6 only on Windows | `host: true` set in `vite.config.js` |
| Slow data upload (large CSV sent as JSON string) | Stage 1 now uses `FormData` multipart + `XMLHttpRequest` with real `upload.onprogress` tracking |
| Upload pipeline state lost when switching dashboards | All pipeline state lifted to `App.jsx`; `DataUploadModule` receives it via props — state survives navigation |

---

*Built as an enterprise-grade final-year AI project. All ML models, pricing engines, and data flows follow production-pattern implementations.*
