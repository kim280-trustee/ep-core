# E&P Learning — Foreign Languages Teacher Pack Import Guide

## Academic scope

- **Curriculum:** `TH-BASIC-CORE-2008-2017`
- **Subject:** `FOREIGN-LANGUAGES` — Foreign Languages (English)
- **Coverage prepared:** P1–P6, 110 indicator lessons and 330 answer-keyed questions
- **Remaining authoring:** M1–M6
- **Catalogue:** 193 distinct indicators; 235 grade alignments because the 21 M4–M6 interval indicators map to M4, M5 and M6

The curriculum catalogue is already present in Supabase. This guide covers teacher-pack drafts only; it does not authorize direct database writes or publication.

## Prepared import files

| File | Grade | Lessons | Questions |
|---|---|---:|---:|
| `FOREIGN-LANGUAGES-P1-TEACHER-STARTER-PACK.md` | P1 | 16 | 48 |
| `FOREIGN-LANGUAGES-P2-TEACHER-STARTER-PACK.md` | P2 | 16 | 48 |
| `FOREIGN-LANGUAGES-P3-TEACHER-STARTER-PACK.md` | P3 | 18 | 54 |
| `FOREIGN-LANGUAGES-P4-TEACHER-STARTER-PACK.md` | P4 | 20 | 60 |
| `FOREIGN-LANGUAGES-P5-TEACHER-STARTER-PACK.md` | P5 | 20 | 60 |
| `FOREIGN-LANGUAGES-P6-TEACHER-STARTER-PACK.md` | P6 | 20 | 60 |
| **Total** | **P1–P6** | **110** | **330** |

Each lesson has its catalogue objective code, original Thai indicator wording, a learning outcome, a practical activity and exactly three answer-keyed questions. P4–P6 tasks progress from supported practice to more independent short texts, explanations and simple research.

## Validation

Run `node scripts/validate-foreign-languages-teacher-packs.mjs` from the repository root. The validator uses the shared teacher-pack parser and checks grade counts, code uniqueness, source-register membership, outcomes, activities and all three answer keys per lesson.

## Authorized teacher import

1. Sign in with an authorized teacher account in the intended school organization.
2. Open **Teacher Content Library → Import teacher pack** (`/teacher/content/import`).
3. Select the assigned teacher class to establish organization access.
4. Select curriculum `TH-BASIC-CORE-2008-2017` and subject `FOREIGN-LANGUAGES`.
5. Upload one grade pack at a time.
6. Review every detected lesson, objective code, question and expected answer.
7. Choose **Import validated drafts** only when the importer reports no objective or grade mapping errors.
8. Repeat for each assigned grade pack.

The selected class is used only to establish teacher organization access. Do not change class subjects, add students, create assignments or publish content as part of this import.

## Draft and assessment behaviour

- Each lesson should be imported as a versioned content draft linked to its exact objective.
- Three question drafts should be linked to each lesson.
- Expected answers must remain in the protected evaluation-key workflow, not student-facing content.
- No pack should auto-publish.
- A teacher must review content and marking guidance before any publication decision.

## Source and academic review caveat

The indicator-level audit register is `FOREIGN-LANGUAGES-INDICATOR-SOURCE-RECONCILIATION.csv`. Its Thai-description and core-content comparison fields remain pending line-by-line academic review. The 2021 Must-Know/Should-Know classifications are historical OBEC COVID-period priorities, not a statement of permanent current policy. Structural validation is not academic sign-off.

## Current status

- Foreign Languages catalogue: structurally verified against the OBEC source-stage counts.
- P1–P6 teacher packs: prepared, 110 lessons and 330 answer-keyed questions.
- Pack validator: updated for P1–P6; execution in the repository environment remains pending.
- Authorized teacher import: not yet run.
- Post-import objective/question/answer-key checks: pending.
- M1–M6 packs: not yet prepared.
- Teacher review, student acceptance and publication: pending.
- No Foreign Languages content drafts have been imported or published.
