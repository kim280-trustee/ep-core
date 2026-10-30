# E&P Learning / POS Migration-History Reconciliation — 2026-10-30

## Scope and safety

This is a read-only inventory and content spot-check of the canonical branch `paul/integrate-edna-content` against the connected production Supabase migration ledger. No database schema, data, Auth setting, or migration-ledger row was changed.

Do not run `supabase db push`, apply pending migrations, or edit production migration history until the remaining content/schema reconciliation is complete.

## Current inventory

- Canonical repository migration directory: **183** timestamped `.sql` files.
- Production `supabase_migrations.schema_migrations` ledger: **193** rows.
- Repository includes one zero-byte file: `20260819000100_create_purchase_orders.sql`. This is an existing POS migration and must be reviewed separately; it is not evidence that the production table is absent.
- The earlier inventory count of 178 repository files is superseded by this current count.

The repository and production ledger are not directly aligned by timestamp and filename. Prior exact-version comparison found 68 repository versions absent from the live ledger, 83 live versions absent from the repository, and one shared version with a different recorded name. A normalized-name comparison found many timestamp-shifted matches. These are inventory differences, not proof that the corresponding SQL is missing from production.

## Content spot-checks

The following files were fetched from the canonical branch and their actual SQL text inspected:

1. `20260915000100_create_supplier_credit_ledger.sql` contains the actual supplier-credit table, index, RLS policy, and grants.
2. `20260915054857_create_supplier_credit_ledger.sql` is explicitly a historical no-op marker. The live ledger has the actual migration name at version `20260915054857`, while the original version `20260915000100` is recorded under a different historical name. This is a timestamp/name remapping pattern, not proof of a missing table.
3. `20260919040000_learning_assessment_runtime.sql` contains the assessment runtime function implementation.
4. `20260920044149_learning_assessment_runtime.sql` is a historical no-op marker. Both versions appear in the live ledger under the same migration name. The repository has the original implementation at the first timestamp and a marker at the later timestamp.
5. `20261016160000_learning_attendance_authorization_hardening.sql` contains the original attendance policy hardening SQL. The live ledger records both a `_reconciled` variant and a non-reconciled name for this migration family; the repository currently contains one SQL implementation.
6. `20261020210000_learning_intervention_cases.sql` contains the table, RPC definitions, and authorization logic. The live ledger has both `learning_intervention_cases_reconciled` and `learning_intervention_cases` entries.

These checks demonstrate why matching migration names or timestamps is insufficient: the repository contains deliberate historical marker files, and the live ledger contains duplicate/reconciled entries. A ledger row stores a version/name, not a checksum of the SQL that was executed.

## Reconciliation classification

The following categories must remain separate:

- **Historical marker:** repository SQL explicitly says it makes no schema change. Do not treat this as a missing implementation.
- **Timestamp/name remap:** live and repository entries refer to the same migration family under different timestamps. Verify the actual database objects before classifying.
- **Duplicate/reconciled ledger entry:** multiple live rows refer to one migration family. Determine whether the second row was intentionally a no-op or applied SQL before any ledger repair.
- **Repository-only migration:** not found by exact version in the live ledger. It may already have been applied under another timestamp/name.
- **Live-only ledger entry:** no exact repository timestamp/file. Recover the original SQL from Git history or deployment artifacts before deciding whether it is safe to remove or recreate.
- **Content/schema divergence:** SQL in source does not match the current live object definition. This requires a semantic migration review, not a ledger-only repair.

## Next verification required

1. Export and compare the complete repository migration SQL set with Git history/deployment artifacts for all live-only ledger entries.
2. For each timestamp/name remap, compare the expected post-migration objects with live `pg_catalog` definitions: tables/columns/constraints/indexes, policies, functions/triggers, grants, and RLS flags.
3. Identify which duplicate ledger entries correspond to no-op markers and which represent distinct SQL changes.
4. Reconcile source ordering only after content equivalence is demonstrated; preserve the full production ledger as evidence.
5. Validate all pending source-only security migrations in staging before production deployment.

## Current deployment gate

**Blocked:** migration history is not yet reconciled, and the recent source-only authorization hardening migrations have not been deployed or validated in staging. Production remains unchanged by this audit.
