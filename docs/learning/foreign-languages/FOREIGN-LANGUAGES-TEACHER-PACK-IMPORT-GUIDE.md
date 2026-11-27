# E&P Learning — Foreign Languages Teacher Pack Import Guide

## Academic scope

- **Curriculum:** `TH-BASIC-CORE-2008-2017`
- **Subject:** `FOREIGN-LANGUAGES` — Foreign Languages (English)
- **Coverage prepared:** P1–M6, 193 distinct indicator lessons and 579 answer-keyed questions; the 21 M4–M6 interval indicators are represented once
- **Shared interval:** One M4–M6 pack covers all three upper-secondary grades without duplicating the 21 catalogue objectives
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
| `FOREIGN-LANGUAGES-M1-TEACHER-STARTER-PACK.md` | M1 | 20 | 60 |
| `FOREIGN-LANGUAGES-M2-TEACHER-STARTER-PACK.md` | M2 | 21 | 63 |
| `FOREIGN-LANGUAGES-M3-TEACHER-STARTER-PACK.md` | M3 | 21 | 63 |
| `FOREIGN-LANGUAGES-M4-M6-TEACHER-STARTER-PACK.md` | M4–M6 shared interval | 21 | 63 |
| **Total distinct** | **P1–M6** | **193** | **579** |

Each lesson preserves its catalogue objective code and original Thai indicator wording, with a learning outcome, practical activity and exactly three answer-keyed questions. M1–M3 questions are individually aligned to the indicator skill, with increasing independence across the middle-school grades.

## Validation

Run `node scripts/validate-foreign-languages-teacher-packs.mjs` from the repository root. The validator uses the shared teacher-pack parser and checks all ten packs (nine grade-specific packs plus the single M4–M6 interval pack), lesson counts, code uniqueness, source-register membership, outcomes, activities and all three answer keys per lesson.

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
- P1–M6 teacher packs: prepared, 193 distinct lessons and 579 answer-keyed questions; the shared M4–M6 interval is counted once.
- Pack validator: updated for P1–M6; full Node execution remains pending.
- Authorized teacher import: not yet run.
- Post-import objective/question/answer-key checks: pending.
- M4–M6 shared interval pack: prepared; one lesson per shared objective, aligned to M4, M5 and M6.
- Teacher review, student acceptance and publication: pending.
- No Foreign Languages content drafts have been imported or published.
