# E&P Learning — Foreign Languages Rollout Readiness

**Verification date:** 27 November 2026  
**Working branch:** `edna/subject-rollout`  
**Curriculum:** `TH-BASIC-CORE-2008-2017`  
**Scope:** Foreign Languages, P1–M6

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
| Must-Know classifications | 194 |
| Should-Know classifications | 41 |
| Unclassified alignments | 0 |
| Duplicate objective-code groups | 0 |
| Duplicate grade/objective alignment groups | 0 |
| Source-note matches to the objective's standard code | 235 of 235 |
| Source-note mismatches or missing notes | 0 |
| Imported content items linked to Foreign Languages objectives | 0 |

The database currently contains eight distinct Foreign Languages standard/topic codes: ต 1.1, ต 1.2, ต 1.3, ต 2.1, ต 2.2, ต 3.1, ต 4.1 and ต 4.2. This is the count represented in the live catalogue; it supersedes the earlier informal note that referred to nine standards.

## Grade-level alignment

| Grade | Alignments | Must-Know | Should-Know |
|---|---:|---:|---:|
| P1 | 16 | 9 | 7 |
| P2 | 16 | 9 | 7 |
| P3 | 18 | 13 | 5 |
| P4 | 20 | 17 | 3 |
| P5 | 20 | 19 | 1 |
| P6 | 20 | 19 | 1 |
| M1 | 20 | 19 | 1 |
| M2 | 21 | 19 | 2 |
| M3 | 21 | 19 | 2 |
| M4 | 21 | 17 | 4 |
| M5 | 21 | 17 | 4 |
| M6 | 21 | 17 | 4 |
| **Total** | **235** | **194** | **41** |

All 12 expected grades have required alignments. All 235 alignment records carry a source note beginning with the corresponding official standard code and the OBEC 2021 priority-classification provenance.

## Subject status

**Curriculum catalogue verification: passed for structural coverage and classification.** The active objective count, distinct code count, grade alignment count, priority classification totals and source-note/standard-code consistency reconcile without duplicate groups or unclassified rows.

**This is not yet academic sign-off.** The 193 objective descriptions still require an independent line-by-line comparison against the official curriculum source. The source-note check verifies the stored standard-code reference and provenance label; it does not prove that every objective description is a faithful transcription or that every priority classification has been independently re-reviewed.

No Foreign Languages teacher packs have been imported. The live database currently has zero content items linked to these objectives; no drafts were created and nothing was published. The curriculum remains in draft status.

## Remaining work

1. Independently reconcile all 193 objective descriptions and their grade allocations against the official Thai curriculum/OBEC source material.
2. Review the 194 Must-Know and 41 Should-Know classifications against the official source.
3. Prepare grade-appropriate teacher packs with lesson outcomes, learning activities, formative questions and answer/marking guidance.
4. Validate all packs through the existing teacher-pack parser and duplicate-code preflight.
5. Import only through the authenticated `/teacher/content/import` workflow into an authorized isolated environment.
6. Run post-import checks for objective links, question counts, answer-key integrity, language, draft status and publication visibility.
7. Complete teacher review and student-facing acceptance before any publication decision.

## Verification artifact

The read-only SQL checks are maintained in `supabase/verification/foreign-languages-curriculum-verification.sql`. It does not mutate curriculum, content, school or student data.
