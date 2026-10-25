# TODO.md — Action Items & Future Enhancements

> **Purpose**: Capture future backlog items, technical debt, and ideas.

## Completed in Milestone v1.0

- [x] Consolidate `backend/server.py` into `backend/app.py`
- [x] Add `pytest` test suite in `backend/tests/`
- [x] Verify dynamic pricing multiplier bounds (0.75x to 1.45x) in unit tests
- [x] Test inventory status and classification logic
- [x] Add test cases for CSV cleaning with corrupted timestamps, currency symbols, and negative quantities
- [x] Harden feature preparation in `dataset_service.py` and outlier calculations in `data_store.py`
- [x] Validate live API test suite (23/23 tests passed)

## Future Roadmap Ideas

- [ ] Implement Vitest unit tests for React frontend components
- [ ] Add Redis/Celery queue for large asynchronous dataset ingestion
- [ ] Migrate SQLite to PostgreSQL for multi-region clustering
- [ ] Add Docker Compose healthcheck commands for backend service
