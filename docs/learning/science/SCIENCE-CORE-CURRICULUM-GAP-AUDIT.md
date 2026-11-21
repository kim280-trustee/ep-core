# Science and Technology — National Core Curriculum Gap Audit

**Curriculum:** Thai Basic Education Core Curriculum B.E. 2551 (2008), revised 2017  
**Source:** OBEC / IPST, *Indicators and Core Learning Content: Must-Know and Should-Know*, 2021  
**Official source PDF:** https://www.academic.obec.go.th/images/official/1622514876_d_1.pdf  
**Status:** Open — do not mark Science complete

**Repository/live distinction (verified 21 November 2026):** Live Supabase contains all 139 primary P1–P6 indicators and all 174 lower-secondary M1–M3 indicators in both the canonical Science curriculum and the draft national master curriculum. M1 and M2 priority totals match OBEC exactly. M3 has 59 required official indicators in both catalogues with 41 Must-Know and 18 Should-Know labels. Nine legacy W3.2 outcomes are retained as non-required supplementary records and are excluded from the national-core count. The 102 grade-specific M4–M6 core indicators remain outstanding.


## Official grade totals

| Grade | Official indicators | Current catalogue state |
|---|---:|---|
| P1 | 15 | 10 W1–W3 + 5 W4.2; complete in live staging |
| P2 | 16 | 12 W1–W3 + 4 W4.2; complete in live staging |
| P3 | 25 | 20 W1–W3 + 5 W4.2; complete in live staging |
| P4 | 21 | 16 W1–W3 + 5 W4.2; complete in live staging |
| P5 | 32 | 27 W1–W3 + 5 W4.2; complete in live staging |
| P6 | 30 | 26 W1–W3 + 4 W4.2; complete in live staging |
| M1 | 52 | 43 existing W1–W3; 9 W4.1/W4.2 missing |
| M2 | 63 | 48 existing W1–W3; 6 W2.1 plus 9 W4.1/W4.2 missing |
| M3 | 59 | 59 official indicators including W4.1 (5) and W4.2 (4); nine legacy W3.2 records are supplementary/non-required |
| M4–M6 aggregate | 102 | Grade-specific M4, M5 and M6 indicators; exact grade split and codes must be transcribed before seeding |

The official total is 415 unique indicators. The 102 is an aggregate across the M4, M5 and M6 grade-specific tables in the OBEC source. Each indicator must be aligned only to its actual grade; do not duplicate one shared set across all three grades. The source summary also notes ว 3.1 ม.6/4 is dual-classified.

## Completed in the current batch

The 28 primary W4.2 indicators have been added under the existing `SCI` subject and `TECH` skill, aligned to the national curriculum:

| Grade | W4.2 indicators seeded | Priority labels |
|---|---:|---|
| P1 | 5 | Applied from OBEC 2021 table; code-level recheck pending |
| P2 | 4 | Applied from OBEC 2021 table; code-level recheck pending |
| P3 | 5 | Applied from OBEC 2021 table; code-level recheck pending |
| P4 | 5 | Applied from OBEC 2021 table; code-level recheck pending |
| P5 | 5 | Applied from OBEC 2021 table; code-level recheck pending |
| P6 | 4 | Applied from OBEC 2021 table; code-level recheck pending |
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

## Remaining national-core implementation\n\n1. **Primary P1–P6:** complete in live staging (139/139); teacher packs reconcile to 139 lesson starters and 417 formative tasks.\n2. **M1:** complete (52/52); new nine-indicator W4.1/W4.2 batch is aligned and priority totals reconcile to OBEC 35 Must-Know / 17 Should-Know.\n3. **M2:** complete (63/63); six W2.1 and nine W4.1/W4.2 indicators are aligned; priority totals reconcile to OBEC 48 Must-Know / 15 Should-Know.\n4. **M3:** complete indicator count (59/59) after adding six W1.1 ecosystem indicators. Ten priority labels remain intentionally unresolved: nine existing W3.2 rows and the source-ambiguous W1.1 ม.3/6 row. Do not infer their Must/Should classification.\n5. **M4–M6 core:** transcribe and seed the 102 grade-specific Science and Technology indicators across M4, M5 and M6. First reconcile exact per-grade totals and priority flags from the OBEC tables. Do not duplicate the same 102 rows into all three grades or substitute the 300 specialist Biology/Chemistry/Physics/Earth-Space outcomes.\n## Lower-secondary completion batch — M1–M3\n\n- M1: nine missing W4.1/W4.2 indicators seeded; grade total now 52/52.\n- M2: six W2.1 indicators and nine W4.1/W4.2 indicators seeded; grade total now 63/63.\n- M3: six W1.1 ecosystem indicators seeded; grade total now 59/59.\n- Both the canonical `TH-SCI-M1-M6` curriculum and the draft `TH-BASIC-CORE-2008-2017` master curriculum now carry the same M1/M2/M3 totals. The draft master remains draft.\n- New teacher packs add 30 lesson starters and 90 answer-keyed formative questions. Combined M1–M3 import pack now contains 174 lesson starters and 522 questions.\n- M3 priority labels: nine legacy W3.2 rows and W1.1 ม.3/6 are held unclassified until the official source table is reconciled.\n\n## Existing specialist outcomes — separate from the core set

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