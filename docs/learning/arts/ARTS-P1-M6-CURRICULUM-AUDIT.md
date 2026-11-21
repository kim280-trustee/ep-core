# Arts Curriculum Import Audit — P1–M6

**Curriculum:** Thai Basic Education Core Curriculum B.E. 2551 (2008)  
**Curriculum code:** `TH-BASIC-CORE-2008-2017`  
**Subject:** Arts (`ARTS`)  
**Source:** OBEC, *ตัวชี้วัดและสาระการเรียนรู้แกนกลางต้องรู้และควรรู้*, Arts section, printed pages 290–319.  
**Official source PDF:** https://www.academic.obec.go.th/images/official/1622514876_d_1.pdf

## Database verification

The Arts subject contains **279 distinct indicators**, **357 grade-level alignments**, and **0 unclassified alignments**. M4–M6 use the same 39 shared indicators, each aligned to all three grade levels.

| Grade | Indicators | Must know | Should know |
|---|---:|---:|---:|
| P1 | 18 | 10 | 8 |
| P2 | 25 | 12 | 13 |
| P3 | 29 | 12 | 17 |
| P4 | 29 | 15 | 14 |
| P5 | 26 | 13 | 13 |
| P6 | 27 | 17 | 10 |
| M1 | 27 | 15 | 12 |
| M2 | 27 | 17 | 10 |
| M3 | 32 | 19 | 13 |
| M4–M6 (shared) | 39 | 27 | 12 |

**OBEC total:** 279 indicators; 157 must-know and 122 should-know. The grade-level classification totals above match the OBEC summary.

## Teacher starter packs

| Pack | Lessons | Assessment prompts |
|---|---:|---:|
| P1–P3 | 72 | 216 |
| P4 | 29 | 87 |
| P5 | 26 | 78 |
| P6 | 27 | 81 |
| M1 | 27 | 81 |
| M2 | 27 | 81 |
| M3 | 32 | 96 |
| M4–M6 (shared) | 39 | 117 |
| **Total** | **279** | **837** |

Each lesson includes a 50-minute teaching sequence, practical activity, expected evidence, teacher check and three indicator-specific formative tasks with answer guidance. The tasks are differentiated across visual arts, music and dramatic arts, and by grade band.

## Source reconciliation notes

- P1, P5, M2, M3, and shared M4–M6 classifications were reconciled against the source table and OBEC summary totals.
- M2 indicator wording for the advertising indicator was corrected to the source wording: `บรรยายวิธีการใช้งานทัศนศิลป์ในการโฆษณาเพื่อโน้มน้าวใจ และนำเสนอตัวอย่างประกอบ`.
- M3 dramatic-arts indicators 26–32 were corrected to restore the source sequence and wording. The previously inferred extra wording was removed from the sequence; the official final conservation indicator is retained as indicator 32.
- P4 wording was corrected in the P4 source-alignment pass.
- No app-wide feature tests are recorded here; this is a curriculum-data and teaching-pack audit only.


## Indicator-specific assessment authoring — 21 November 2026

All 279 lessons now contain 837 answer-keyed formative tasks. Every task includes the exact official Thai indicator text and is aligned to the database standard. Visual arts tasks address observation, design, analysis, creation and cultural interpretation; music tasks address listening, notation, composition, performance and musical context; dramatic-arts tasks address movement, expression, performance and cultural meaning.

The expected-answer guidance describes observable evidence and accepts equivalent correct responses. Assessment focuses on skill, process, evidence and reflection—not personal taste. Cultural examples are treated respectfully and are not ranked.

The teacher-pack parser now accepts the Arts heading formats, dotted/dashed lesson numbering and objective-code labels. It recognises `ARTS-Pn`, `ARTS-Mn` and shared `ARTS-M46` codes. The importer expands the 39 shared M4–M6 outcomes into 117 grade-specific lesson drafts and 351 grade-scoped question codes.

GitHub Actions run 204 passed all national pack checks, Thai B.E. 2568, Science, Social Studies, Health & PE and Arts importer-parser validation, production build and ESLint.
