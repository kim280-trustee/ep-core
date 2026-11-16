# E&P Learning — Academic Foundation Schema Audit

**Branch:** `paul/learning-academic-integrity-audit`  
**Audit type:** Static repository/schema review  
**Status:** Remediation migrations and application changes committed; live Supabase data has not been inspected or changed.

## Executive result

The academic foundation already separates global curricula, subjects, grade levels, class groups, class subjects, terms and gradebook records. However, several constraints did not match the intended multi-subject school model or enforce all cross-record relationships at the database boundary.

The audit remediation is additive and preserves existing class and academic-year identifiers. It does not rewrite the English pilot or migrate any live records.

## Findings and remediation

### 1. School academic years were incorrectly bound to one curriculum

**Original issue**

- `learning_academic_years.curriculum_id` was mandatory.
- `learning_class_groups` had a composite foreign key requiring its curriculum to equal the academic year's curriculum.
- Academic-year codes were unique per organization.

This prevented a school from using one shared school year for classes under different curricula without creating duplicate year/term records.

**Remediation committed**

Migration: `20261116070000_learning_academic_year_multi_curriculum.sql`

- Drops `class_year_curriculum_fk`.
- Makes `learning_academic_years.curriculum_id` nullable.
- Preserves existing curriculum IDs as optional legacy metadata.
- Keeps each class group's own required `curriculum_id` and `grade_level_id`, including the grade-to-curriculum foreign key.
- School Administration no longer asks for a curriculum when creating a school year; curriculum remains selected per class.
- Updates TypeScript models, generated database types, repository mapping and English/Thai help text.

**Expected result:** one school academic year and its terms can contain classes from multiple curricula. Existing English class records retain their original class curriculum and grade.

### 2. School-structure write permissions — already hardened before this batch

**Original issue**

The original academic-foundation migration created membership-only manage policies. However, this had already been corrected by the existing `20261030040401_scope_learning_rls_admin_permissions.sql` migration, which scopes academic-year, term, class-group and class-subject writes to `public.learning_can_manage_academic_records(organization_id)`.

**Live verification**

The connected Supabase database already has separate INSERT, UPDATE and DELETE policies using `learning_can_manage_academic_records`, while member-read policies remain separate. The permission function exists. No additional RLS policy change was needed in this audit batch.

**Result:** this item was verified as already resolved. The new audit migration does not duplicate or replace the existing policies.

### 3. Terms were not constrained to their academic-year date range in the database

**Original issue**

The table checked only that a term ended on or after it started. The School Administration form checked that term dates fell inside the selected academic year, but direct database writes were not protected by that same rule.

**Remediation committed**

Migration: `20261116071500_learning_academic_record_integrity.sql`

- Adds a trigger validating each term's dates against its parent academic year.
- Adds a trigger preventing an academic-year date change that would exclude an existing term.
- Includes a preflight check that stops if existing term dates are already outside their year.

### 4. Gradebook records could connect a term, class and class subject inconsistently

**Original issue**

Gradebook entries and term grades had separate organization-scoped foreign keys to a term, class group and class subject. Those independent references did not guarantee that the class subject belonged to the same class group, or that the term and class belonged to the same academic year.

**Remediation committed**

Migration: `20261116071500_learning_academic_record_integrity.sql`

- Adds a unique key for the organization/class-group/class-subject tuple.
- Replaces the gradebook class-subject foreign keys with composite foreign keys that require the class subject to belong to the exact class group.
- Adds triggers requiring the selected term and class to share an academic year.
- Adds preflight checks for existing gradebook mismatches before adding constraints.
- Prevents moving a term or class to another academic year while gradebook records depend on the current relationship.

### 5. Gradebook rows could be inserted for students outside the selected class

**Original issue**

The gradebook RPCs checked class membership, but authenticated academic managers also had direct table write policies. The table itself did not require an active student membership on direct inserts or reassignment.

**Remediation committed**

Migration: `20261116071500_learning_academic_record_integrity.sql`

- Adds a trigger requiring a student membership record in the exact class when a gradebook entry or term grade is inserted.
- Rechecks membership if the organization, class group or student is changed.
- Historical membership records remain valid even if their status later becomes inactive.

## Global academic catalogue administration — implemented, pending migration

The School Administration page includes controls to create reusable global subjects, attach subjects to curricula and create curriculum grade levels. The branch contains the database grants and insert policies required by these existing workflows:

- `20261116030000_learning_subject_catalog_manage.sql` grants subject and curriculum-subject inserts to authenticated academic managers.
- `20261116031500_learning_grade_level_catalog_manage.sql` grants grade-level inserts to authenticated academic managers.
- `20261116033000_learning_objective_alignment_manage.sql` grants curriculum-grade objective alignment inserts to authenticated academic managers.

These use the existing `learning.academic.manage` permission and do not add a new role. They are not yet applied to the live database. Once applied, the catalogue forms already present in School Administration are enabled; no additional UI module is required.

The catalogue is shared across schools, so these permissions are intentionally an administrative capability rather than school-specific catalogue ownership. The platform should keep catalogue changes limited to trusted academic managers and migration-reviewed curriculum data.

## Pending migration sequence

The live database migration history ends at `20261116015418`. The branch migrations from `20261116030000` onward remain pending and must be applied in timestamp order:

1. `20261116030000_learning_subject_catalog_manage.sql`
2. `20261116031500_learning_grade_level_catalog_manage.sql`
3. `20261116033000_learning_objective_alignment_manage.sql`
4. `20261116043000_learning_content_objective_subject_integrity.sql`
5. `20261116044500_learning_question_academic_scope.sql`
6. `20261116060000_learning_maths_curriculum_catalog.sql`
7. `20261116061500_learning_maths_m1_knowledge_graph.sql`
8. `20261116063000_learning_maths_m2_m3_knowledge_graph.sql`
9. `20261116064500_learning_maths_m4_m6_knowledge_graph.sql`
10. `20261116070000_learning_academic_year_multi_curriculum.sql`
11. `20261116071500_learning_academic_record_integrity.sql`
12. `20261116080000_learning_science_curriculum_catalog.sql`
13. `20261116081500_learning_science_m1_knowledge_graph.sql`\n14. `20261116083000_learning_science_m2_m3_biology_knowledge_graph.sql`\n15. `20261116084500_learning_science_m2_physical_science_knowledge_graph.sql`\n16. `20261116090000_learning_science_m2_earth_space_knowledge_graph.sql`\n17. `20261116091500_learning_science_m3_matter_chemistry_knowledge_graph.sql`\n18. `20261116093000_learning_science_m3_energy_earth_space_knowledge_graph.sql`

The order is important because content and assessment integrity constraints rely on the academic catalogue and knowledge graph. The Science knowledge graph migrations extend the existing M1 catalogue through M3 and must be applied in the same timestamp order. Upper-secondary subject-track and learning-outcome migrations follow the M1–M3 Science migrations, in timestamp order.

## Live Supabase read-only verification

The connected project is `ep-core`. Its applied migration history currently ends at `20261116015418`; the later branch migrations are not applied.

The live academic data currently contains:
- 1 academic year (`2026-2027`) using curriculum `TH-MEP-EN`.
- 1 class (`M1-MEP-A`), grade M1, using `TH-MEP-EN`.
- 1 term, 1 class subject, 8 gradebook entries and 1 term-grade row.

Read-only preflight queries returned zero mismatches for:
- term dates outside academic-year dates;
- gradebook term/class academic-year mismatches;
- gradebook class-subject/class-group mismatches;
- gradebook rows without a student membership record.

The live RLS policy inspection confirmed academic setup writes are already protected by the organization-scoped academic-management permission. No live rows were changed by these checks.

The committed read-only preflight script was also executed against the live project. All nine integrity checks returned `PASS` with zero issues, covering term dates, term/class academic-year consistency, class-subject/class consistency, gradebook student membership and content-objective subject/alignment integrity.

A separate read-only content/assessment snapshot found:
- 6 content items and 6 content-objective mappings.
- 0 content items mapped to objectives from multiple subjects.
- 0 content-objective mappings with inactive knowledge records or without an active curriculum/grade/subject alignment.
- 2 questions, 2 question versions and 2 question-objective mappings.
- 0 question versions without an objective mapping.

These results indicate the current pilot data satisfies the preflight conditions checked by the pending integrity migrations.

## Safety and verification status

- No migration has been applied to Supabase.
- No live rows have been changed, deleted or backfilled.
- The year migration preserves existing curriculum values; it does not rewrite existing classes.
- The integrity migration has preflight checks and will abort if it detects existing term-date or gradebook relationship mismatches. The current read-only preflight returned zero mismatches.
- Repository files and TypeScript database types were updated together.
- Local lint/build have not been run in this environment. Run the consolidated local checks only after the full implementation batch is complete.

## Read-only verification script

A repeatable preflight query is committed at `supabase/verification/learning-academic-maths-preflight.sql`. It checks the same term, class, gradebook, membership and content-objective conditions used by the pending integrity migrations, then reports whether the Maths subject, curriculum and six grade levels are present. It performs SELECT statements only and does not apply migrations or change records.

## Recommended next sequence

1. Run the read-only preflight script against the target Supabase project and inspect any non-zero issue counts.
2. Review any preflight mismatches before applying pending migrations.
3. Apply the branch migrations in timestamp order, first on a safe database copy or staging environment.
4. Verify the Maths catalogue and knowledge graph, then create the Maths pilot class under the existing school academic year.
5. Confirm the English pilot remains unchanged.
6. Run the final local lint and build once the implementation batch is ready.


## Upper-secondary Science migrations

19. `20261116100000_learning_science_upper_secondary_subject_tracks.sql` — adds the specialist Biology, Chemistry, Physics and Earth/Space Science subjects to the Thai Science curriculum.
20. `20261116101500_learning_biology_m4_cellular_foundations.sql` — seeds 17 M4 Biology additional-study outcomes in strand 1 and their grade alignments.\n21. `20261116103000_learning_biology_m4_genetics_evolution.sql` — seeds 15 M4 Biology additional-study outcomes in strand 2 and their grade alignments.\n22. `20261116104500_learning_biology_m5_plant_structure_function.sql` — seeds 18 M5 Biology additional-study outcomes in strand 3 and their grade alignments.

These migrations follow the M1–M3 Science migrations. Upper-secondary learning outcomes are distinct from the M1–M3 basic-course indicators and must be recorded under their specialist subject tracks. The M4 Biology strand 1 and strand 2 migrations seed 32 M4 outcomes. The M5 Biology strand 3 migration adds 18 outcomes; the official curriculum has no M4 outcomes in strand 3. Remaining specialist-subject and grade coverage is still pending.


23. `20261116110000_learning_biology_m5_animal_physiology.sql` — seeds 21 M5 Biology additional-study outcomes in strand 4 and their M5 grade alignments.

The M5 Biology strand 4 migration follows the M5 plant-structure strand migration. The official curriculum contains no M4 outcomes for this strand; all 21 outcomes are aligned to M5. Its companion planning pack contains 21 lesson starters and 63 answer-keyed practice questions. Upper-secondary specialist Science migrations remain pending application to the live database.
