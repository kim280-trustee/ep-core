# E&P Learning dependency security remediation — 2026-11-03

## Initial finding

The integration branch reported 23 npm audit findings: 8 high and 15 moderate, across the browser-targeting data, glob matching, CSS tooling, routing, validation, and ESLint dependency trees.

## Remediation

- Ran `npm audit fix` without `--force`. This refreshed compatible versions within the existing direct dependency ranges, including Vite, React Router, Zod, Browserslist, baseline-browser-mapping, brace-expansion, nanoid, PostCSS, and source-map-js.
- The only remaining advisory was GHSA-g3hv-75wg-m249 in `minimatch`, fixed upstream in 11.0.1 and later. The locked ESLint and TypeScript-ESLint dependency ranges still selected vulnerable 10.x releases.
- Added a root npm override for `minimatch@^11.0.4`. The override is confined to this one transitive package; no direct dependency major versions were downgraded or forced.
- Added a dependency security audit to Learning Branch Validation so future pull requests fail if moderate-or-higher npm advisories remain.

## Verification

The remediation branch passed:

- `npm ci`
- `npm audit --audit-level=moderate` — no moderate or higher advisories
- `npm run build` — TypeScript and Vite production build
- `npm run lint` — repository-wide ESLint

The application source and Supabase migrations were not changed. No production database or deployment action was performed.
