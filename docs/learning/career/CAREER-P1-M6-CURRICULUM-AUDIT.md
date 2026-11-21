# Occupations and Career — P1–M6 Curriculum Audit

**Curriculum:** Thai Basic Education Core Curriculum B.E. 2551 (2008), applied with the relevant B.E. 2560 (2017) revisions and subsequent OBEC scope orders  
**Subject code:** `CAREER`  
**Coverage:** P1–M6  
**Status:** Curriculum catalogue and teacher starter packs complete; final application testing is deferred to the consolidated release test.

## Official scope

Use the official Occupations and Career learning-area indicators from the OBEC Basic Education Core Curriculum source register. Apply OBEC Order 921/2561 when interpreting the historical Career and Technology documents: Design and Technology and ICT standards ว 4.1 and ว 4.2 were removed from the former Occupations and Technology learning area and relocated to Science and Technology. They must not be duplicated under Career.

The 2025 B.E. 2568 early-primary competency curriculum is separate. Its integrated Economy and Finance capability is not a replacement for the Career subject indicators in the 2008/2017 curriculum.

## Catalogue reconciliation

| Measure | Verified result |
|---|---:|
| Unique Career indicators | 54 |
| Grade/interval alignments | 76 |
| Priority classification | Verified for all required alignments |
| Teacher starter-pack lessons | 54 |
| Answer-keyed formative questions | 162 |
| Teacher starter-pack files | 3 |

The alignment count exceeds the unique indicator count because grade/interval outcomes may be aligned to more than one grade. Do not interpret 76 alignments as 76 unique indicators.

## Teacher resource packs

| Pack | Lessons | Questions |
|---|---:|---:|
| `CAREER-P1-P3-TEACHER-STARTER-PACK.md` | 9 | 27 |
| `CAREER-P4-P5-TEACHER-STARTER-PACK.md` | 11 | 33 |
| `CAREER-P6-M6-TEACHER-STARTER-PACK.md` | 34 | 102 |
| **Total** | **54** | **162** |

Each pack uses the official Career outcome as its learning objective and provides an original lesson starter with three answer-keyed formative questions. The packs remain Markdown source material until the consolidated teacher import phase.

## Verification and release boundary

- The cross-curriculum teacher-pack validator checks all 54 Career objective codes, per-lesson mapping, uniqueness and expected pack counts.
- The national staging verification query checks the Career subject totals and grade alignments in the 2008/2017 national master catalogue.
- The curriculum seed does not create school, class, student, assignment or progress records.
- No Career pack has been imported or published by this audit.
- Authenticated teacher preview/import, student access, assessment submission and teacher review are part of the single consolidated application-testing phase.


## Importer parser verification — 21 November 2026

The actual TypeScript teacher-pack parser now reads all three Career packs: 54 unique objectives and 162 answer-keyed formative questions. Grade-specific codes resolve to their exact grade; the 11 shared `M46` outcomes expand to M4, M5 and M6. GitHub Actions run 258 passed the combined Thai Language/Career parser validation, all other curriculum validators, production build and ESLint. No authenticated import or publication was performed.
