# E&P Learning — Mathematics Teacher Pack Import Guide

## Academic scope

- **Curriculum:** `TH-MATH-M1-M6`
- **Subject:** `MATH` — Mathematics
- **Coverage:** 41 Thai core-curriculum indicators across M1–M6
- **Teacher resources:** 41 lesson starters and 123 original answer-keyed practice questions

The Mathematics catalogue is already applied to the existing Supabase project. All 41 objectives are aligned to the correct grade.

## Import files

| File | Grades | Lessons | Questions |
|---|---|---:|---:|
| `M1-mathematics-teacher-starter-pack.md` | M1 | 9 | 27 |
| `M2-M3-mathematics-teacher-starter-pack.md` | M2–M3 | 24 | 72 |
| `M4-M6-mathematics-teacher-starter-pack.md` | M4–M6 | 8 | 24 |
| **Total** | **M1–M6** | **41** | **123** |

All 41 lesson sections contain explicit objective codes. The importer resolves the grade from each objective code, so the combined M2–M3 and M4–M6 files can be imported in one pass each.

## Authorized teacher import

1. Sign in with an authorized teacher account in the target school organization.
2. Open **Teacher Content Library → Import teacher pack** (`/teacher/content/import`).
3. Select the assigned teacher class for organization access.
4. Select curriculum `TH-MATH-M1-M6` and subject `MATH`.
5. Upload one of the three Markdown files above.
6. Review all detected lessons, questions, objective codes and inferred grade mappings.
7. Choose **Import validated drafts** only when there are no mapping errors.
8. Repeat for the other two files.

The selected class is used only to establish the teacher's organization access. The importer does not change class subjects, add students, create assignments or publish content.

## Draft and assessment behaviour

- Each lesson is created as a versioned content draft linked to its exact Mathematics objective.
- Three short-answer question drafts are created for each lesson.
- Expected answers are stored in the protected evaluation-key table, not student-facing content.
- Questions use manual teacher review; nothing is auto-published.
- Teachers review and publish through the existing content and assessment workflows.

## Current status

- Mathematics curriculum and grade catalogue: applied.
- Knowledge graph: applied and verified (M1=9, M2=12, M3=12, M4=3, M5=4, M6=1; 41 total).
- Teacher packs: prepared and parser-validated (41 lessons, 123 questions, 41 unique objective codes).
- Objective-code verification against the live Mathematics catalogue: all 41 codes found.
- Import into the school's organization: not yet run; it requires an authorized teacher session.
- End-to-end teacher/student testing and final local lint/build: pending.
- No Maths pilot class, term, subject assignment or student membership has been created.