# Science and Technology — National Core Curriculum Gap Audit

**Curriculum:** Thai Basic Education Core Curriculum B.E. 2551 (2008), revised 2017  
**Source:** OBEC / IPST, *Indicators and Core Learning Content: Must-Know and Should-Know*, 2021  
**Official source PDF:** https://www.academic.obec.go.th/images/official/1622514876_d_1.pdf  
**Status:** Official P1–M6 core indicator coverage and priority reconciliation are complete; authenticated importer and application release validation remain open.

**Repository/live distinction (verified 21 November 2026):** Live Supabase contains all 415 required official P1–M6 Science and Technology core indicators in the draft national master curriculum and all 276 required M1–M6 indicators in the canonical secondary Science curriculum. The 139 primary indicators and 174 lower-secondary indicators are present in both catalogues. Primary P1–P6 priority totals now match OBEC: 99 Must-Know and 45 Should-Know classifications across 139 indicators, including five dual-classified indicators. P2 ว 4.2 ป.2/3 and P3 ว 3.2 ป.3/2 were corrected to Must-Know from the official page 65 and 68 rows. M1 and M2 priority totals match OBEC exactly. M3 has 59 required official indicators in both catalogues with 41 Must-Know and 18 Should-Know labels. Nine legacy W3.2 outcomes are retained as non-required supplementary records and are excluded from the national-core count. The 102 grade-specific M4–M6 core indicators are now staged and aligned in both curricula (M4 28, M5 49, M6 25). Upper-secondary priority totals now match the official 85 Must-Know / 18 Should-Know summary, including the dual-classified M6/4 indicator; separate M4–M6 specialist subject outcomes are tracked outside this core indicator total.


## Official grade totals

| Grade | Official indicators | Current catalogue state |
|---|---:|---|
| P1 | 15 | 10 W1–W3 + 5 W4.2; complete in live staging |
| P2 | 16 | 12 W1–W3 + 4 W4.2; complete in live staging |
| P3 | 25 | 20 W1–W3 + 5 W4.2; complete in live staging |
| P4 | 21 | 16 W1–W3 + 5 W4.2; complete in live staging |
| P5 | 32 | 27 W1–W3 + 5 W4.2; complete in live staging |
| P6 | 30 | 26 W1–W3 + 4 W4.2; complete in live staging |
| M1 | 52 | 52 official indicators; W4.1 (5) and W4.2 (4) complete |
| M2 | 63 | 63 official indicators; W2.1 (6), W4.1 (5) and W4.2 (4) complete |
| M3 | 59 | 59 official indicators including W4.1 (5) and W4.2 (4); nine legacy W3.2 records are supplementary/non-required |
| M4–M6 aggregate | 102 | Complete: M4 28, M5 49, M6 25; all aligned to their actual grade |

The official total is 415 unique indicators. The 102 is an aggregate across the M4, M5 and M6 grade-specific tables in the OBEC source. Each indicator must be aligned only to its actual grade; do not duplicate one shared set across all three grades. The source summary also notes ว 3.1 ม.6/4 is dual-classified.

## Completed in the current batch

The 28 primary W4.2 indicators have been added under the existing `SCI` subject and `TECH` skill, aligned to the national curriculum:

| Grade | W4.2 indicators seeded | Priority labels |
|---|---:|---|
| P1 | 5 | Reconciled against OBEC 2021; code-level verified |
| P2 | 4 | Reconciled against OBEC 2021; code-level verified |
| P3 | 5 | Reconciled against OBEC 2021; code-level verified |
| P4 | 5 | Reconciled against OBEC 2021; code-level verified |
| P5 | 5 | Reconciled against OBEC 2021; code-level verified |
| P6 | 4 | Reconciled against OBEC 2021; code-level verified |
| **Total** | **28** | **28 classified and code-level labels reconciled against the OBEC 2021 grade tables** |

The teacher pack `SCIENCE-TECHNOLOGY-W4.2-P1-P6-TEACHER-STARTER-PACK.md` contains 28 lesson starters and 84 formative tasks with expected evidence. This is national Science and Technology standard ว 4.2, not Click Start international Computer Studies. The indicator records and teacher pack now use the source-checked priority mapping. Corrections: P4 ว 4.2 ป.4/3 is Should-Know; P5 ว 4.2 ป.5/4 is Must-Know; P6 ว 4.2 ป.6/3 is Must-Know. The read-only verification script asserts per-grade Must-Know and Should-Know totals for all 28 indicators.

## Primary W1–W3 seed reconciliation

The P1–P3 W1–W3 migration contributes 42 indicators (10, 12 and 20); the P4–P6 W1–W3 migration contributes 69 (16, 27 and 26). Both batches are now applied in live staging. The original P1–P3 and P4–P6 migrations had a PostgreSQL data-modifying-CTE ordering defect: objective upserts read the base topic table instead of consuming the topic CTE's RETURNING rows. Corrective migrations `20261118214000_fix_science_primary_p1_p3_objective_alignment.sql` and `20261118213000_fix_science_primary_p4_p6_objective_alignment.sql` now explicitly sequence the writes. Reconciliation confirms 111 W1–W3 indicators and 28 W4.2 indicators, for 139 unique primary indicators total. The teacher packs provide 111 W1–W3 lesson starters and 333 formative tasks, plus 28 W4.2 lesson starters and 84 formative tasks.
### Primary priority totals and dual-classification exceptions

The OBEC 2021 summary table reports the following classification totals for the remaining primary grades:

| Grade | Unique indicators | Must-Know classifications | Should-Know classifications | Dual-classified indicator |
|---|---:|---:|---:|---|
| P4 | 21 | 16 | 6 | ว 2.1 ป.4/1 |
| P5 | 32 | 24 | 8 | None listed |
| P6 | 30 | 20 | 11 | ว 2.1 ป.6/1 |

Must-Know and Should-Know counts are not mutually exclusive. P4 and P6 each have one indicator included in both classifications. The current alignment schema stores one classification value; any seed must preserve the second classification explicitly in notes/metadata. The SQL verification script checks the expected totals and flags these exceptions for review.

## Current national-core implementation status

1. **Primary P1–P6:** 139/139 official indicators staged and required in both catalogues. The 42 Should-Know alignments were corrected to `required=true`; Should-Know is a priority label, not an optional curriculum status.
2. **M1:** 52/52 official indicators complete, including nine W4.1/W4.2 indicators; priorities 35 Must-Know / 17 Should-Know.
3. **M2:** 63/63 official indicators complete, including six W2.1 and nine W4.1/W4.2 indicators; priorities 48 Must-Know / 15 Should-Know.
4. **M3:** 59/59 official indicators complete, including five W4.1 and four W4.2 indicators; priorities 41 Must-Know / 18 Should-Know. Nine legacy W3.2 outcomes remain preserved as non-required supplementary records.
5. **M4–M6 core:** 102/102 grade-specific indicators staged in both catalogues (M4 28, M5 49, M6 25). Upper-secondary priorities reconcile to 85 Must-Know and 18 Should-Know classifications, including the dual M6/4 label. M4 ว 1.2 ม.4/11 was corrected to Should-Know from official page 146.

## Lower-secondary completion batch — M1–M3

- M1: 52 official indicators, including nine W4.1/W4.2 indicators; complete.
- M2: 63 official indicators, including six W2.1 and nine W4.1/W4.2 indicators; complete.
- M3: 59 official indicators, including six W1.1 ecosystem indicators and nine W4.1/W4.2 technology indicators; complete.
- Nine legacy W3.2 records are preserved separately as non-required supplementary outcomes and excluded from the official core import.
- Both the canonical `TH-SCI-M1-M6` curriculum and the draft `TH-BASIC-CORE-2008-2017` master curriculum carry the same M1/M2/M3 required-core totals. The draft master remains draft.
- The consolidated M1–M3 import pack contains 174 official-core lesson starters and 522 answer-keyed formative questions. The nine official M3 technology lessons replace the nine legacy W3.2 lessons in the core import.

## Existing specialist outcomes — separate from the core set

| Specialist subject | M4–M6 outcomes |
|---|---:|
| Biology | 108 |
| Chemistry | 81 |
| Physics | 67 |
| Earth, Astronomy and Space | 44 |
| **Total additional outcomes** | **300** |

These 300 outcomes are additional upper-secondary specialist content. They remain separate from the 102 grade-specific M4–M6 core Science and Technology indicators.

## Acceptance criteria before Science can close

- [x] P1–P6 W1–W3 indicators seeded, aligned and classified (111 total).
- [x] P1–P6 W4.2 indicators seeded, aligned and classified (28).
- [ ] M1–M3 W1–W4 indicator codes reconciled exactly to OBEC.
- [ ] Transcribe all 102 upper-secondary core indicators from the OBEC M4/M5/M6 tables, verify per-grade counts and priorities, then seed each indicator only to its source grade.
- [ ] Both `TH-BASIC-CORE-2008-2017` and `TH-SCI-M1-M6` have consistent M1–M6 SCI core alignments.
- [ ] The final unique-indicator and grade-alignment totals reconcile to the official 415-indicator table.
- [ ] All Science teacher packs cover the completed official indicator set; specialist packs remain separately identified.
- [ ] Only after every curriculum rollout is complete: run app-wide tests, local lint/build and teacher-import smoke tests.



## Primary P4–P6 source lock — OBEC 2021

Primary source for the remaining primary indicators is the OBEC/Institute for the Promotion of Teaching Science and Technology 2021 document, “ตัวชี้วัดและสาระการเรียนรู้แกนกลางต้องรู้และควรรู้”, Science and Technology section. The verified grade sections are printed pages 71–76 (P4), 77–83 (P5), and 84 onward (P6). The summary table reports P4=21, P5=32, P6=30; W4.2 already contributes 5, 5 and 4 respectively, leaving W1–W3 gaps of 16, 27 and 26.

**Source exceptions that must survive data modelling:** P4 ว 2.1 ป.4/1 is explicitly both Must-Know and Should-Know. Preserve the dual classification in source metadata/notes; do not flatten it into a single exclusive priority. The source summary also identifies P6 ว 2.1 ป.6/1 as dual-classified. Existing alignment schema stores one `indicator_classification` value, so the migration must record the second priority in notes or a dedicated metadata field rather than silently discarding it.

The source gives the national unique total as 415, with 308 Must-Know and 113 Should-Know classifications; the difference is explained by dual-classified indicators. These are classification counts, not mutually exclusive objective counts.

The P4–P6 W1–W3 seed has now been transcribed from these grade sections and applied. The live catalogue passes all six primary grade totals; the read-only SQL verification remains the acceptance check for future changes.


## M3 W4.1/W4.2 completion — 21 November 2026

The official M3 source table (page 127, rows 51–59) includes five W4.1 indicators and four W4.2 indicators. All nine have now been seeded and aligned in both curricula. The nine former M3 W3.2 alignments are retained as non-required supplementary outcomes pending a separate crosswalk; no legacy content was deleted. M3 now has 59 required official indicators, 41 Must-Know and 18 Should-Know, with zero unclassified or duplicate core alignments.

The consolidated M1–M3 teacher import remains 174 lessons and 522 answer-keyed questions: nine official technology lessons replace the nine legacy W3.2 lessons in the core import. Legacy W3.2 teaching material is preserved separately.

## Primary Should-Know required-flag correction

The 42 official P1–P6 Should-Know alignments were previously marked `required=false`. They are official curriculum indicators and are now correctly marked required. A full cross-catalogue verification returns 415 required indicators in `TH-BASIC-CORE-2008-2017` and 276 in `TH-SCI-M1-M6`, with no duplicate rows or unclassified required indicators.

Migration: `20261121113000_correct_primary_science_should_know_required_flag.sql`.


## Upper-secondary priority correction

OBEC 2021 printed page 146 classifies ว 1.2 ม.4/11 as Should-Know. Both catalogue rows and the M4 teacher starter pack were corrected. The resulting M4–M6 totals are 85 Must-Know and 18 Should-Know classifications (including dual M6/4), with 102 unique indicators.

Migration: `20261121114500_correct_science_m4_w1_2_indicator_11_priority.sql`.


## Primary priority reconciliation completed

OBEC 2021 printed page 65 confirms ว 4.2 ป.2/3 is Must-Know; printed page 68 confirms ว 3.2 ป.3/2 is Must-Know. Both had been stored as Should-Know and are now corrected in both catalogues and in their teacher packs. Primary priority totals reconcile to 99 Must-Know and 45 Should-Know classifications (five dual-classified indicators) across 139 unique indicators.

Migration: `20261121122000_correct_primary_science_p2_p3_must_know_priorities.sql`.


## Official core teacher-pack parity verification

The primary packs contain 139/139 unique P1–P6 objective codes and 417 formative tasks. The lower-secondary consolidated import contains 174/174 objective codes and 522 answer-keyed questions. The new upper-secondary consolidated import `SCIENCE-M4-M6-COMPLETE-IMPORT.md` contains 102/102 objective codes and 306 answer-keyed questions. Across P1–M6, all 415 official core objective codes match the live national master catalogue with no missing, extra or duplicate codes (1,245 formative tasks). Nine legacy M3 W3.2 outcomes are kept separately as supplementary content.


## Consolidated teacher-import parser check

The repository parser rules were checked against the two mixed-grade Science core import files. The M1–M3 file was corrected so all 174 lessons have numbered headings; all 174 objective codes are recognized and all 522 answer keys are extracted as three questions per lesson. The M4–M6 file contains 102 numbered lessons, 102 recognized grade-coded objective codes and 306 answer keys. Both pass the parser-rule smoke check with no duplicate codes or lesson numbers. This is a source-level parser check, not an authenticated UI import; the latter remains part of final release validation.


## Final source and catalogue closure — 21 November 2026

The full read-only verification in `SCIENCE-STAGING-VERIFICATION.sql` has now been executed against live Supabase. All 18 curriculum/grade core checks pass: 12 national-master grade rows and six canonical secondary rows. Primary W1–W3 and W4.2 grade splits pass; all 415 national-master core indicators and all 276 canonical secondary core indicators are required, grade-aligned and classified. Priority totals match OBEC, including all six dual-classified labels. The 300 specialist outcomes also match their grade-specific subject totals. The only non-required SCI rows are the nine preserved legacy M3 W3.2 supplementary outcomes in each curriculum. The duplicate-alignment query returns zero rows.

The repository now has a repeatable parser check for both consolidated core packs, and the full curriculum CI also validates all eight subject-pack sets, builds the application and runs ESLint. Authenticated teacher import and end-to-end application testing remain intentionally deferred until the complete curriculum rollout is ready for one consolidated test.
