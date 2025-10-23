# Models layer structure

This folder organizes dbt models by logical layer. Use these layers to keep transformations clear and maintainable.

Layers:

- `staging/` — Lightweight cleansed views of source tables. Keep transformations minimal (types, renames, null handling).
- `intermediate/` — Transformation helpers and expanded datasets used by core/mart models (e.g. `events_by_hour`).
- `mart/` — Core business models and dimensions (e.g. `dim_event`, `final_occupancy_event`). These are intended to be depended on by application/report models.
- `application/` — Final, user-facing datasets and reports optimized for BI and downstream apps (e.g. `occupancy_hourly_report`).

Quick mapping of important models in this project:

- `models/staging/stg_events.sql` — raw events cleaned and normalized
- `models/mart/dim_event.sql` — enriched event dimension (standardized start/end, tag_name)
- `models/intermediate/events_by_hour.sql` — expand events into hourly grain
- `models/mart/final_occupancy_event.sql` — join occupancy with events/facilities/weather
- `models/application/occupancy_hourly_report.sql` — BI-ready occupancy hourly report

If you'd like, I can also add tag metadata in `dbt_project.yml` or add `schema.yml` entries per directory to register tests and descriptions.
