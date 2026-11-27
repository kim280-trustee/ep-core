# E&P Learning — Foreign Languages Rollout Readiness

**Verification date:** 27 November 2026  
**Working branch:** `edna/subject-rollout`  
**Curriculum:** `TH-BASIC-CORE-2008-2017`  
**Scope:** Foreign Languages (English indicators), P1–M6

## Live database verification

Read-only checks against Supabase project `zcutsqbzvydyosfgrbdi` returned:

| Check | Result |
|---|---:|
| Active objective records | 193 |
| Distinct active objective codes | 193 |
| Distinct standard/topic codes | 8 |
| Grade levels represented | 12 of 12 |
| Grade alignments | 235 |
| Required grade alignments | 235 |
| Distinct Must-Know objectives | 160 |
| Distinct Should-Know objectives | 33 |
| Distinct unclassified objectives | 0 |
| Must-Know grade alignments | 194 |
| Should-Know grade alignments | 41 |
| Unclassified grade alignments | 0 |
| Duplicate objective-code groups | 0 |
| Duplicate grade/objective alignment groups | 0 |
| Source-note matches to the objective's standard code | 235 of 235 |
| Source-note mismatches or missing notes | 0 |
| Imported content items linked to Foreign Languages objectives | 0 |

**Important counting distinction:** the curriculum contains **193 distinct indicators** (160 Must-Know and 33 Should-Know). It has **235 grade alignments** (194 Must-Know and 41 Should-Know) because the 21 upper-secondary interval indicators for M4–M6 are intentionally aligned to each of M4, M5 and M6. A live set comparison confirms the same 21 objective IDs are shared across all three upper-secondary grade records. The 235 alignment total must not be presented as 235 distinct indicators.

The database currently contains eight distinct Foreign Languages standard/topic codes: ต 1.1, ต 1.2, ต 1.3, ต 2.1, ต 2.2, ต 3.1, ต 4.1 and ต 4.2. This is the count represented in the live catalogue; it supersedes the earlier informal note that referred to nine standards.

## Grade/stage source reconciliation

The OBEC 2021 source's Foreign Languages (English) tables list ten curriculum stages. The live database matches the indicator totals and Must-Know/Should-Know counts at each stage:

| Official source stage | Printed page | Distinct indicators | Must-Know | Should-Know | Live database result |
|---|---:|---:|---:|---:|---|
| P1 | 333 | 16 | 9 | 7 | Match |
| P2 | 335 | 16 | 9 | 7 | Match |
| P3 | 337 | 18 | 13 | 5 | Match |
| P4 | 340 | 20 | 17 | 3 | Match |
| P5 | 344 | 20 | 19 | 1 | Match |
| P6 | 348 | 20 | 19 | 1 | Match |
| M1 | 352 | 20 | 19 | 1 | Match |
| M2 | 357 | 21 | 19 | 2 | Match |
| M3 | 362 | 21 | 19 | 2 | Match |
| M4–M6 interval | 367 | 21 | 17 | 4 | Match; mapped to M4, M5 and M6 |
| **Total distinct stages/indicators** | | **193** | **160** | **33** | **Match** |

The database's separate grade-alignment view therefore reports M4=21, M5=21 and M6=21. These are three mappings of the same M4–M6 interval indicator set, not three new sets of unique indicators.

All 12 database grade records have the expected alignment counts. All 235 alignment records carry a source note beginning with the corresponding official standard code and the OBEC 2021 priority-classification provenance.

## Official source references and scope

- OBEC Bureau of Academic Affairs and Educational Standards, **Foreign Languages: Core Indicators and Learning Standards, B.E. 2551**: https://www.academic.obec.go.th/web/document/view/283
- OBEC, **Must-Know and Should-Know Indicators**, Foreign Languages (English), 2021 compilation: https://academic.obec.go.th/images/official/1622514876_d_1.pdf
- OBEC Basic Education Core Curriculum B.E. 2551 (A.D. 2008), English translation: https://www.academic.obec.go.th/images/document/1559878841_d_1.pdf

The 2021 compilation explicitly frames its Must-Know/Should-Know prioritisation for academic year 2564 under the COVID-19 situation. Those labels are therefore stored as **historical, source-attributed priority classifications**. They must not be presented as a newly issued or universally permanent current policy. The database's `required` alignment flag is a separate field; all 235 alignments currently have it set to true. Its application meaning should be confirmed in product semantics before using it to imply that every Should-Know indicator has the same instructional priority as a Must-Know indicator.

The official 2008 curriculum distinguishes grade-level indicators for P1–M3 from interval indicators for upper-secondary M4–M6. The database's three-grade mapping of the upper-secondary interval set is consistent with that structure.

## Indicator-level audit register

A 193-row register has been generated from the live catalogue at `docs/learning/foreign-languages/FOREIGN-LANGUAGES-INDICATOR-SOURCE-RECONCILIATION.csv`. It records each database objective code, official indicator code from its stored provenance note, standard, official stage, 2021 priority classification and printed OBEC source page. The two comparison-status columns are intentionally marked `pending_line_by_line_review`; this register is a controlled review checklist, not evidence that every description has already been matched word-for-word.

## Subject status

**Structural and count reconciliation: passed.** The 193 distinct active objective records, 193 distinct codes, eight standard codes, 193 distinct indicator classifications, 235 grade alignments, 12 grade records and upper-secondary interval expansion reconcile. The official per-stage indicator and priority totals match the live database counts.

**Not yet full academic sign-off.** This pass reconciles source-stage counts, grade/interval structure, priority totals and stored standard-code provenance. It does not yet certify every one of the 193 Thai objective descriptions and central learning-content descriptions character by character against the official Thai source, nor independently validate every classification decision. A source-note prefix match is provenance evidence, not proof of exact text fidelity.

P1–P3 teacher packs are now prepared: 50 lessons and 150 answer-keyed questions across 50 unique objective codes. The subject-specific validator and import guide are in the repository. The live database still has zero content items linked to these objectives; no drafts were imported and nothing was published. P4–M6 teacher-pack authoring remains outstanding.

## Remaining work

1. Complete the 193-row, indicator-by-indicator Thai wording and source-content comparison against the official OBEC curriculum.
2. Confirm the product meaning of the separate `required` alignment flag; do not collapse it into the 2021 Must-Know/Should-Know priority classification.
3. Complete grade-appropriate teacher packs for P4–P6 and M1–M6; P1–P3 are prepared (50 lessons, 150 questions).
4. Validate all packs through the teacher-pack parser and duplicate-code preflight.
5. Import only through the authenticated `/teacher/content/import` workflow into an authorized isolated environment.
6. Run post-import checks for objective links, question counts, answer-key integrity, language, draft status and publication visibility.
7. Complete teacher review and student-facing acceptance before any publication decision.

## Verification artifact

The read-only SQL checks are maintained in `supabase/verification/foreign-languages-curriculum-verification.sql`. They include distinct-indicator totals, grade-alignment totals and an M4–M6 shared-set check. The P1–P3 teacher-pack files, validator, and import guide are maintained alongside this readiness record. The SQL script does not mutate curriculum, content, school or student data.
