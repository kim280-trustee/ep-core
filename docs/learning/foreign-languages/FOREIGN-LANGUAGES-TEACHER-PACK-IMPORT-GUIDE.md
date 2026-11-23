# Foreign Languages — Teacher Pack Import Guide

**Curriculum:** `TH-BASIC-CORE-2008-2017`  
**Subject:** `FOREIGN-LANGUAGES` — English  
**Branch:** `paul/subject-rollout`

## Prepared packs

| File | Grade scope | Unique lessons | Assessment tasks |
|---|---|---:|---:|
| `FOREIGN-LANGUAGES-P1-P3-TEACHER-STARTER-PACK.md` | P1–P3 | 50 | 150 |
| `FOREIGN-LANGUAGES-P4-P6-TEACHER-STARTER-PACK.md` | P4–P6 | 60 | 180 |
| `FOREIGN-LANGUAGES-M1-M3-TEACHER-STARTER-PACK.md` | M1–M3 | 62 | 186 |
| `FOREIGN-LANGUAGES-M4-M6-SHARED-TEACHER-STARTER-PACK.md` | Shared M4–M6 | 21 | 63 |
| **Total** | **P1–M6** | **193** | **579** |

## Import rules

1. Select the existing Thai Basic Education curriculum and `FOREIGN-LANGUAGES` subject.
2. Match each lesson by its internal objective code and official Thai indicator code.
3. Preserve the OBEC 2021 must-know / should-know classification.
4. Keep imported lessons and assessment tasks unpublished drafts until a teacher reviews them.
5. Retain the M4–M6 shared objective as one objective with three grade alignments. The importer creates three grade-specific draft lessons and grade-scoped question codes for the shared content without duplicating the curriculum objective.
6. Adapt text length, vocabulary and speaking demands to the learners' grade and proficiency.
7. Use culturally respectful examples and avoid stereotypes.
8. For research tasks, use approved sources and require learners to record where information came from.

## Current state

The curriculum contains 193 unique indicators and 235 grade-level alignments. All 235 alignments have verified OBEC priority classifications.

The teacher packs are prepared in Markdown, but no Foreign Languages lesson drafts or question-bank drafts have been imported. Import remains a teacher-authorised action; this guide does not create school or learner records.


## Assessment authoring and validation

All 193 indicators have three indicator-specific formative tasks (579 total). Each prompt includes the official Thai indicator and answer/evidence guidance. The tasks cover the eight official standards and are differentiated by grade band.

Run `npm run validate:foreign-languages-packs` to validate all packs through the actual TypeScript importer parser. GitHub Actions run 220 passed this check, all other curriculum validators, production build and ESLint.


## Practical lesson and assessment differentiation — 23 November 2026

Each of the 193 source lessons now has an objective-specific practical activity, expected-evidence statement and teacher check. Activities are differentiated across early primary, upper primary, lower secondary and upper secondary, and mapped to the lesson's official standard:

- ต 1.1: listening/reading comprehension supported by evidence from the source.
- ต 1.2: interpersonal interaction, relevant responses and follow-up turns.
- ต 1.3: organised presentations or written products for a defined audience.
- ต 2.1: contextual and respectful use of cultural/social conventions.
- ต 2.2: evidence-based comparison of English and Thai language/culture.
- ต 3.1: accurate cross-curricular content communicated in English.
- ต 4.1: successful communication in real or simulated situations.
- ต 4.2: credible research, accurate synthesis and source acknowledgement.

The 193 source lessons expand to 235 grade-scoped lesson drafts and 705 grade-scoped question drafts after the 21 shared M4–M6 indicators expand to three grades each. These are expected import counts, not records already imported.

The validator checks all 193 objective-specific practical activities and their grade-band/indicator links, in addition to the existing 579 indicator-linked answer-keyed tasks. Run `npm run validate:foreign-languages-packs` before import.
