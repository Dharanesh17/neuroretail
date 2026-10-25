---
milestone: v1.0 Production Hardening & Test Suite
version: 1.0.0
updated: 2026-10-25T22:30:00+05:30
---

# Roadmap

> **Current Phase:** Phase 1: Backend Architecture Consolidation
> **Status:** ⬜ Not Started

## Must-Haves (from SPEC)

- [ ] Unify API endpoints exclusively on `backend/app.py`
- [ ] Harden 7-stage ML training pipeline and async thread management
- [ ] Implement automated test suite with high test coverage
- [ ] Empirically verify 100% pass on all 23 live API endpoints

---

## Phases

### Phase 1: Backend Architecture Consolidation
**Status:** ⬜ Not Started
**Objective:** Consolidate all server endpoints and configuration into canonical Flask API (`backend/app.py`), resolving duplicates and archiving `backend/server.py`.
**Requirements:** REQ-01, REQ-02

**Plans:**
- [ ] Plan 1.1: Audit and align all endpoint routes and response payloads in `backend/app.py`
- [ ] Plan 1.2: Consolidate store configuration and deprecate `backend/server.py`

---

### Phase 2: ML Pipeline Hardening & Error Resilience
**Status:** ⬜ Not Started
**Objective:** Harden `dataset_service.py` and `ml_engine.py` with rigorous input sanitization, safe concurrent thread training, and comprehensive metrics reporting.
**Requirements:** REQ-03
**Depends on:** Phase 1

**Plans:**
- [ ] Plan 2.1: Strengthen input validation, fuzzy column mapping, and cleaning edge cases in `dataset_service.py`
- [ ] Plan 2.2: Ensure thread safety for async training and validate model metric exports (MAPE, RMSE, R²)

---

### Phase 3: Automated Test Suite Implementation
**Status:** ⬜ Not Started
**Objective:** Establish reproducible automated tests (`pytest`) covering API endpoints, dynamic pricing formulas, inventory intelligence calculations, and data cleaning.
**Requirements:** REQ-04
**Depends on:** Phase 2

**Plans:**
- [ ] Plan 3.1: Create backend unit tests for pricing, forecasting, and inventory optimization
- [ ] Plan 3.2: Create API integration tests verifying all 23 routes with response schema checks

---

### Phase 4: End-to-End System Verification
**Status:** ⬜ Not Started
**Objective:** Execute live integration verification, capture empirical proof, test frontend connectivity, and audit milestone deliverables.
**Requirements:** REQ-05
**Depends on:** Phase 3

**Plans:**
- [ ] Plan 4.1: Execute live server test suite and capture empirical outputs
- [ ] Plan 4.2: Audit milestone quality and create release summary

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1: Backend Architecture Consolidation | ⬜ | 0/2 | 0% |
| 2: ML Pipeline Hardening | ⬜ | 0/2 | 0% |
| 3: Automated Test Suite | ⬜ | 0/2 | 0% |
| 4: End-to-End Verification | ⬜ | 0/2 | 0% |

---

## Status Icons

- ⬜ Not Started
- 🔄 In Progress
- ✅ Complete
- ⏸️ Paused
- ❌ Blocked
