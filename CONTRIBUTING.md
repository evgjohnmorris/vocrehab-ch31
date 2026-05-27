# Contributing

Thanks for helping improve `vocrehab-ch31`.

This project sits at the intersection of veteran advocacy, legal reference material, workflow tooling, and local-first software. Good contributions here are not only polished UI changes. They also improve trust, traceability, data quality, and real-world usefulness.

## Before you start

- Read the [README](README.md) for the current product scope and script map.
- Read [SECURITY.md](SECURITY.md) before working with anything that resembles case data.
- Open or join an issue before starting a large architectural change.
- Keep legal, policy, forms, rates, and contact updates source-backed.

## Local setup

```bash
npm install
npm run seed
npm run dev
```

Useful commands:

- `npm run lint`
- `npm run build`
- `npm run server:smoke`
- `npm run check`

## Where changes usually belong

- `client/src/`
  - screens, components, state flow, calculators, navigation, and UX improvements
- `client/scripts/authority/`
  - authority ingest, manifest generation, and eCFR indexing
- `server/routes/`
  - API contracts for authority, cases, plans, library, and user state
- `server/lib/`
  - validation, taxonomy, reference catalogs, and backend domain logic
- `server/scripts/`
  - database seeding and backend validation helpers

## Pull request expectations

- Keep PRs focused. Smaller PRs are much easier to review and merge.
- Update docs when behavior, setup, or contributor expectations change.
- Include screenshots or short videos for visible frontend changes.
- Include source links when changing legal text, rates, forms, contacts, or workflow guidance.
- Call out any intentional limitations or follow-up work directly in the PR description.

## Data and source integrity rules

- Do not invent citations, legal summaries, or effective dates.
- Do not paste full copyrighted sources into the repo when a shorter derived record or fetch pipeline is sufficient.
- Do not store real veteran SSNs, VA file numbers, medical records, or raw C-File material.
- Use synthetic, anonymized, or redacted examples for demos and tests.
- If a workflow or rate is uncertain, preserve that uncertainty instead of overstating it.

## Quality bar

Before opening a PR, run:

```bash
npm run check
```

If your change affects browser behavior, also smoke test the relevant flow in the app.

Examples:

- open the affected module and verify the main path manually
- confirm autosave or backend sync still works if you touched draft logic
- verify legal search and source cards still render if you touched authority features

## High-value areas for contributors

- Real routing and deep-link support
- Search contract unification
- Backend test coverage
- Document generation and template versioning
- Forms, rates, contacts, and school-data verification
- Directory and dataset cleanup
- Lazy loading and bundle-size reduction
- Accessibility and workflow QA

## When in doubt

Open an issue, describe the problem you want to solve, and link any source material you plan to rely on. That makes it much easier to keep the repo accurate and useful for the people depending on it.
