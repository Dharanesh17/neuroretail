# DECISIONS.md — Architecture Decision Records

> **Purpose**: Log significant technical decisions and their rationale.

## Decisions

### [DECISION-001] Canonical Backend Service Selection
**Date**: 2026-10-25
**Status**: Accepted

#### Context
The repository contained both `backend/app.py` (Flask 3.0 API with full ML integration) and `backend/server.py` (`BaseHTTPRequestHandler` standard library script), leading to duplicated routes and potential drift.

#### Decision
Designate `backend/app.py` as the sole canonical backend API service. Deprecate and retire `backend/server.py`.

#### Rationale
Flask provides battle-tested routing, request body parsing, CORS handling, error trapping, and ecosystem compatibility required for production ML retail analytics.

#### Consequences
- Single entrypoint simplifies containerization, testing, and debugging.
- No impact on frontend, which already expects REST endpoints on port 5000.

---

### [DECISION-002] Automated Test Strategy
**Date**: 2026-10-25
**Status**: Accepted

#### Context
Integration tests currently run via an ad-hoc `run_api_tests.py` script. There is no automated unit test runner for the mathematical modules (pricing, forecasting, inventory EOQ) or dataset cleaning pipeline.

#### Decision
Introduce `pytest` test suites structured under `backend/tests/` to test both isolated algorithmic units and HTTP API contracts, while maintaining `run_api_tests.py` for live end-to-end verification.

#### Rationale
Fast, automated unit tests allow rapid feedback and catch regressions early, fulfilling GSD empirical proof requirements.

---

*Last updated: 2026-10-25*
