# vocrehab-ch31

[![CI](https://github.com/evgjohnmorris/vocrehab-ch31/actions/workflows/ci.yml/badge.svg)](https://github.com/evgjohnmorris/vocrehab-ch31/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/evgjohnmorris/vocrehab-ch31/actions/workflows/deploy.yml/badge.svg)](https://github.com/evgjohnmorris/vocrehab-ch31/actions/workflows/deploy.yml)

VR&E Chapter 31 advocacy workspace with authority research, case workflows, career planning, calculators, and an optional SQLite backend.

Live app: [https://evgjohnmorris.github.io/vocrehab-ch31/](https://evgjohnmorris.github.io/vocrehab-ch31/)

This repository is building toward a practical self-advocacy platform for veterans, caregivers, school staff, and advocates working through Chapter 31 Vocational Rehabilitation and Employment cases. The frontend runs as a static React app on GitHub Pages. When you want persistence and structured workflows locally, the optional Express and SQLite backend adds scoped drafts, case management, authority search, and a backend reference library.

## What the app includes

- Authority Library with 38 U.S.C. Chapter 31, Part 21 authority records, M28C material, coverage reporting, source diffs, and related eCFR title indexing.
- Dashboard-first VR&E workflows for counselor delay, supplies and tuition disputes, case closure problems, feasibility issues, plan amendments, and escalation scenarios.
- Eligibility and Entitlement wizard, Chapter 31 and Post-9/11 payment calculator, case packet builder, forms center, and school payment tracker.
- IPE / Plan Builder, Career Strategy and O*NET target-goal tooling, self-employment support, independent living planning, and written decision analysis surfaces.
- VRE regional office directory, resource center, benefits and rights index, glossary, and accessibility controls.
- Optional local backend for scoped browser sync, structured case records, draft autosave, issue taxonomy, backend code-library fields, forms metadata, and regional office records.

## Current architecture

- `client/`
  - React 19 + Vite single-page app.
  - Frontend views, calculators, workflows, legal-ingest scripts, and Playwright accessibility coverage.
- `server/`
  - Express + SQLite backend.
  - Routes for `/api/authority`, `/api/cases`, `/api/library`, `/api/plans`, and `/api/user`.
  - Auto-seeded workflow taxonomy and backend reference catalog.
- Root workspace
  - Shared npm workspaces and repo-level scripts.
  - GitHub Actions for CI and Pages deploy.
- Reference PDFs
  - `CFR-2025-title38-vol1-chapI.pdf`
  - `CFR-2025-title38-vol2-chapI.pdf`
  - `m28_manual.pdf`

## Quick start

### Run the full local workspace

```bash
npm install
npm run seed
npm run dev
```

- Frontend: `http://localhost:5173/vocrehab-ch31/`
- Backend: `http://localhost:5000`

The backend is recommended for draft autosave, structured case tracking, and the backend code-library panels. If the backend is offline, the frontend falls back to browser storage where supported.

### Frontend only

```bash
npm install
npm run client:dev
```

### Production build

```bash
npm run build
```

## Repo scripts

- `npm run dev` starts the frontend and backend together.
- `npm run client:dev` starts the Vite frontend only.
- `npm run server:dev` starts the backend only.
- `npm run seed` seeds the backend authority corpus.
- `npm run lint` runs the frontend lint rules.
- `npm run build` runs legal validation and builds the frontend.
- `npm run server:smoke` boots the backend schema against a temporary SQLite database and verifies core tables and seeded catalogs.
- `npm run check` runs the current contributor health gate.

## Contribution priorities

Contributions are wanted. The highest-value work right now is not just adding more screens. It is tightening trust, workflow depth, and maintainability across the whole stack.

- Route-backed navigation and deep links so the app survives reloads and supports shareable states.
- Search unification so header search and backend authority search share one contract.
- Bundle splitting and frontend architecture cleanup around `App.jsx` and the larger workflow views.
- Backend expansion for document generation, deadline engines, versioned templates, and richer per-draft schemas.
- Verified ingest pipelines for forms, rate tables, O*NET and BLS data, WEAMS and school approvals, and contact refreshes.
- Data-quality cleanup in directory, school, and forms datasets.
- More backend tests and stronger Playwright coverage around key veteran workflows.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

If you are improving any of the following, include source links and effective dates in your PR:

- legal authority text
- VA forms and public URLs
- payment rates
- school approval information
- regional office or contact data
- workflow logic that makes legal or case-handling claims

Please do not commit real veteran case files, SSNs, VA file numbers, medical records, or unredacted correspondence.

## Security and privacy

Read [SECURITY.md](SECURITY.md) for reporting guidance and handling rules.

Important defaults in this repo:

- Keep case data minimal.
- Prefer synthetic or redacted examples.
- Treat browser-entered AI API keys as local testing credentials only. A static frontend cannot truly keep them secret.
- Do not claim legal authority freshness unless the source has been verified.

## Good first contribution areas

- Add backend tests for `/api/cases`, `/api/library`, and `/api/plans`.
- Improve the route model and navigation persistence.
- Normalize data imports and remove malformed directory records.
- Expand the backend code library with additional CIP, SOC, O*NET, forms, and labor-market sources.
- Add verified workflows and templates for more Chapter 31 dispute types.

## Maintainer note

This repo is moving from a static reference app toward a full VR&E case-support platform. The most helpful contributions are the ones that improve trust, traceability, and real task completion for veterans using the tool.
