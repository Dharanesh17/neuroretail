# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: Planning unlocked. Specification verified and finalized.

## Vision

NeuroRetail is an enterprise-grade AI retail decision platform delivering dynamic pricing, demand forecasting, autonomous inventory replenishment, and auditable business explanations. This milestone solidifies the platform into a robust, maintainable system by consolidating backend architecture onto the Flask API service, hardening the 7-stage ML pipeline, and establishing reproducible automated test suites.

## Goals

1. **Backend Architecture Consolidation**: Unify all API routing, data store bindings, and service contracts into the canonical Flask REST API (`backend/app.py`), deprecating and removing redundant logic from `backend/server.py`.
2. **ML Pipeline Hardening**: Strengthen the 7-stage dataset ingestion and training pipeline with comprehensive schema validation, thread-safe asynchronous training, graceful error recovery, and consistent multi-model evaluation metrics (MAPE, RMSE, R²).
3. **Automated Test Suite**: Implement automated unit and integration test coverage (`pytest` for backend, test runners for ML components) verifying API status codes, data sanitization, pricing multipliers, and inventory optimization algorithms.
4. **End-to-End System Verification**: Empirically prove system health across all 23 live API endpoints and ensure the React frontend connects smoothly without relying on mock data fallbacks.

## Non-Goals (Out of Scope)

- Rewriting the frontend framework or redesigning UI layouts (retains React 18, Vite, Tailwind CSS, Recharts).
- Migrating from SQLite to external cloud-managed databases (PostgreSQL/MySQL) during this milestone.
- Replacing the scikit-learn models with external deep learning frameworks (retains Ridge, Gradient Boosting, and Random Forest).

## Constraints

- Runtime: Python 3.10+ and Node.js 18+.
- Backward compatibility: All JSON response schemas expected by `frontend/src/api/client.js` must remain stable.
- Cross-platform: Must operate on local Windows shells (PowerShell) and Docker Compose containers.

## Success Criteria

- [ ] All 23 API endpoints pass with live status 200/201 via automated test runners.
- [ ] Backend is unified on `backend/app.py` with zero reliance on `backend/server.py`.
- [ ] 7-stage data upload pipeline processes sample CSVs, outputs clean reports, trains models, and updates live dashboard metrics without hangs or unhandled exceptions.
- [ ] Unit tests for dynamic pricing logic, EOQ calculation, and data cleaning pass 100% reliably.

## Technical Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| REQ-01: Canonical Flask API Consolidation | Must-have | Ensure `backend/app.py` serves all required endpoints with CORS and JSON responses |
| REQ-02: Deprecate Redundant Server Script | Should-have | Retire or archive `backend/server.py` and ensure scripts invoke `app.py` |
| REQ-03: ML Pipeline Hardening | Must-have | Robust type checking, NaN imputation, and thread status tracking in `dataset_service.py` |
| REQ-04: Automated Backend Test Suite | Must-have | `pytest` test suite covering API routes, auth/role switches, and data cleaning |
| REQ-05: Live Integration Verification | Must-have | Full pass on live execution of `run_api_tests.py` against active server |

---

*Last updated: 2026-10-25*
