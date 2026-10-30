# E&P Learning — Migration Inventory Delta (Read-only Snapshot)

Date: 2026-10-30
Repository: `kim280-trustee/ep-core`
Branch: `paul/integrate-edna-content`
Supabase project: `ep-core` (`zcutsqbzvydyosfgrbdi`)

## Current exact-version inventory

A fresh read-only comparison of the canonical branch's `supabase/migrations` directory against the live `supabase_migrations.schema_migrations` ledger returned:

| Measure | Count |
|---|---:|
| Repository SQL migration files | 183 |
| Live ledger entries | 193 |
| Exact version matches | 110 |
| Repository versions absent from live ledger | 73 |
| Live versions absent from repository | 83 |

These counts supersede the earlier 68-repository-only estimate. The repository inventory has changed since that earlier snapshot.

## Name-based correlation (not proof of equivalence)

After normalizing migration names by removing a trailing `_reconciled` suffix:

- 64 repository-only files have at least one live ledger entry with the same normalized name.
- 76 live-only ledger entries have at least one repository file with the same normalized name.
- Seven live-only ledger entries have no same-name repository file in the current branch.
- Some names map to multiple live versions, including original and `_reconciled` entries. Name equality does not prove SQL equality or that the migration was safely replayed.

The following seven live ledger entries need source recovery or explicit object-level explanation because no same-name source file exists in the current branch:

| Live version | Live ledger name |
|---|---|
| `20261002023648` | `learning_teacher_student_user_rls_safe` |
| `20261013064537` | `fix_class_assignment_grading_target` |
| `20261026044618` | `learning_content_response_integrity_hardening` |
| `20261026044623` | `learning_timetable_access_hardening` |
| `20261026044629` | `learning_attendance_submission_identity_hardening` |
| `20261026044659` | `teacher_student_user_rls_recursion_fix` |
| `20261026044701` | `assignment_targets_select_rls_recursion_fix` |

## Risk classification

1. **Timestamp/name remaps:** common in the ledger; must be matched by SQL body/checksum or by a verified Git history/deployment artifact, not merely by a similar name.
2. **Duplicate/reconciled entries:** some live migrations have both a normal and a `_reconciled` entry. Determine whether one is a no-op marker, an actual replay, or a distinct change by retrieving the exact source/deployment artifact for each version.
3. **Live-only unmatched entries:** recover original SQL from Git history, deployment logs, or a trusted migration artifact. If unrecoverable, compare live catalog definitions and data effects against expected behavior and document the evidence.
4. **Repository-only versions:** do not assume these should be applied. Some may already have equivalent effects under a different live timestamp; others may be genuinely unapplied. Verify SQL semantics and live objects before classification.

## Safe next steps

- Preserve the production ledger unchanged.
- Recover source SQL for the seven live-only unmatched entries.
- For each of the 73 repository-only and 83 live-only versions, create a mapping row with: repo version, live version, source SHA/checksum, SQL equivalence result, affected objects, data effects, and evidence.
- Compare affected live catalog objects (tables, columns, constraints, indexes, functions, triggers, policies, grants) with the final intended source state.
- Classify each mapping as exact, equivalent replay, no-op marker, superseded, intentionally omitted, or unresolved.
- Only after every row is explained should an isolated staging database be built from the recovered history and the release migrations be tested.

## Deployment decision

**Migration history remains unresolved. Do not run `supabase db push`, apply migrations, rewrite ledger rows, or change migration timestamps in production.**

This was a read-only inventory comparison. No production schema, data, Auth settings, grants, policies, indexes, or migration ledger rows were changed.
