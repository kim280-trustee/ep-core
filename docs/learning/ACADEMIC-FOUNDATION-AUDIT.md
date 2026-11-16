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

### 2. School-structure writes were allowed by organization membership alone

**Original issue**

The academic foundation's `FOR ALL` manage policies on academic years, terms, class groups and class subjects checked only `is_organization_member`. This was broader than the School Administration UI's `learning.academic.manage` permission gate.

**Remediation committed**

Migration: `20261116071500_learning_academic_record_integrity.sql`

- Replaces the four manage policies with `public.learning_can_manage_academic_records(organization_id)`.
- Keeps the separate member-read policies.
- The existing permission function checks the active organization role for `learning.academic.manage` and excludes active student memberships.

**Expected result:** organization membership grants read access; academic setup writes require the explicit academic-management permission.

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

- Adds a trigger requiring an active student membership when a gradebook entry or term grade is inserted.
- Rechecks membership if the organization, class group or student is changed.
- Existing historical rows are not retroactively rejected solely because a membership later became inactive.

## Outstanding issue — global academic catalogue administration

The School Administration page exposes controls to create global subjects, add subjects to curricula and create global grade levels. In the reviewed migrations, authenticated users have read grants for `learning_subjects`, `learning_curriculum_subjects` and `learning_grade_levels`, but no corresponding write policies/grants were found. Those UI actions are therefore not supported by the current database permissions.

This is separate from creating school classes and assigning already-configured subjects. The Maths rollout uses migration-seeded catalogue records, so it does not depend on those controls. A future change should either introduce a narrowly scoped platform-catalogue administrator permission or remove/relocate those controls; it should not grant every school manager global curriculum-editing rights.

Objective-alignment insertion has a separate permission policy. The current UI supports adding alignments; broader catalogue editing remains outside this remediation.

## Migration sequence added by the audit

1. `20261116070000_learning_academic_year_multi_curriculum.sql`
2. `20261116071500_learning_academic_record_integrity.sql`

The Maths curriculum and knowledge-graph migrations have earlier timestamps and must run before the Maths rollout is considered complete.

## Safety and verification status

- No migration has been applied to Supabase.
- No live rows have been changed, deleted or backfilled.
- The year migration preserves existing curriculum values; it does not rewrite existing classes.
- The integrity migration has preflight checks and will abort if it detects existing term-date or gradebook relationship mismatches.
- Repository files and TypeScript database types were updated together.
- Local lint/build have not been run in this environment. Run the consolidated local checks only after the full implementation batch is complete.

## Recommended next sequence

1. Inspect the actual Supabase migration history and live academic-year, term, class-group and gradebook records.
2. Run the migration preflight queries against a safe database copy or staging environment.
3. Review any preflight mismatches before applying the two audit migrations.
4. Apply the curriculum and knowledge-graph migrations in timestamp order.
5. Create the Maths pilot class under the existing school academic year and verify the English pilot remains unchanged.
6. Run the final local lint and build once the implementation batch is ready.
