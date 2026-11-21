# Thai Language — P1–M6 Curriculum Audit

**Curriculum:** `TH-BASIC-CORE-2008-2017` — Thai Basic Education Core Curriculum B.E. 2551 (2008), revised 2017  
**Subject:** `THAI-LANGUAGE` — Thai Language  
**Priority source:** OBEC, *Indicators and Core Learning Content: Must-Know and Should-Know*, 2021  
**Status:** Complete — all 319 unique indicators, 391 grade alignments and priority classifications verified

## Database coverage

| Grade | Indicators | Must-know | Should-know | Grade alignments |
|---|---:|---:|---:|---:|
| P1 | 22 | 17 | 5 | 22 |
| P2 | 27 | 20 | 7 | 27 |
| P3 | 31 | 24 | 7 | 31 |
| P4 | 33 | 26 | 7 | 33 |
| P5 | 33 | 28 | 5 | 33 |
| P6 | 34 | 28 | 6 | 34 |
| M1 | 35 | 31 | 4 | 35 |
| M2 | 32 | 26 | 6 | 32 |
| M3 | 36 | 30 | 6 | 36 |
| M4 | 36 | 31 | 5 | 36 |
| M5 | 36 | 31 | 5 | 36 |
| M6 | 36 | 31 | 5 | 36 |
| **Unique indicator total** | **319** | **261** | **58** | — |
| **Alignment total** | — | **323** | **68** | **391** |

M4–M6 share the same 36 official indicators. Each shared indicator is stored once and aligned to all three grade levels, resulting in 108 alignment rows for that shared set.

## Standards coverage

All five Thai Language standards are represented in each grade:
- ท 1.1 — Reading
- ท 2.1 — Writing
- ท 3.1 — Listening, viewing and speaking
- ท 4.1 — Principles of Thai language
- ท 5.1 — Literature and literary works

## Teacher resources

Four teacher starter packs now cover all 319 unique indicators:
| Pack | Unique lessons | Formative assessment tasks |
|---|---:|---:|
| P1–P3 | 80 | 240 |
| P4–P6 | 100 | 300 |
| M1–M3 | 103 | 309 |
| Shared M4–M6 | 36 | 108 |
| **Total** | **319** | **957** |

Each lesson preserves the internal objective code, official Thai indicator code, original Thai indicator wording and OBEC 2021 priority classification. Each lesson includes a suggested learning activity and three formative assessment tasks with expected evidence. These are teacher-planning and formative-assessment resources, not published app content or final standardized examinations.

## Data integrity

- All 319 unique objective records are linked to the Thai national curriculum.
- All 391 grade-level alignments are classified as must-know or should-know.
- The shared M4–M6 set remains 36 objectives with 108 grade alignments; no duplicate objective records were created.
- The four packs cover exactly 319 unique objective codes with no missing code placeholders.
- The staging verification script is `THAI-LANGUAGE-STAGING-VERIFICATION.sql`.

## Official source

OBEC's official curriculum portal lists the Thai Language indicator document and the 2021 must-know / should-know indicator tables:  
https://www.academic.obec.go.th/web/news/view/75

The Thai indicator wording and priority labels in the database are retained as the source-of-truth curriculum records. Teaching activities and formative assessment tasks are teacher-created supporting materials.


## Indicator-specific assessment authoring — 21 November 2026

All 319 lessons now contain three Thai-language formative tasks (957 total). Each task includes the exact official Thai indicator text and a Thai answer/evidence guide. Tasks are aligned to the five Thai Language standards: reading, writing, listening/viewing/speaking, Thai language principles and literature. They are differentiated across early primary, upper primary, lower secondary and upper secondary. Task types include reading comprehension and evidence, genre-specific writing and revision, listening/viewing response, grammar and language-use application, and literature interpretation/recitation.

The importer parser now recognises Thai activity, practice and answer-guidance labels. It supports the shared code form `THx.y-M4-6-nn`; the importer expands each of the 36 shared outcomes into three grade-specific content drafts with unique question codes.

GitHub Actions run 238 passed all curriculum pack validators, including Thai Language, Social Studies, Health & PE, Arts, Foreign Languages, Science, Mathematics and Career, plus the Thai B.E. 2568 competency pack, production build and ESLint.


## Importer parser verification — 21 November 2026

The actual TypeScript teacher-pack parser now reads all four Thai Language packs: 319 unique objectives and 957 answer-keyed formative tasks. The dedicated validator checks each official Thai indicator code, exact Thai indicator wording in all three assessment prompts, non-empty answer/evidence guidance, and grade-scope extraction. The 36 shared `M4-6` outcomes correctly resolve to M4, M5 and M6 rather than being incorrectly collapsed to M4. GitHub Actions run 258 passed this validator together with the other curriculum validators, production build and ESLint. No authenticated import or publication was performed.
