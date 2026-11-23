# Health and Physical Education — P1–M6 Curriculum Audit

**Curriculum:** `TH-BASIC-CORE-2008-2017` — Thai Basic Education Core Curriculum B.E. 2551 (2008), revised 2017  
**Subject:** `HEALTH-PE` — Health and Physical Education  
**Priority source:** OBEC, *Indicators and Core Learning Content: Must-Know and Should-Know*, 2021  
**Status:** Curriculum mapping verified; 221 lesson packs authored; staging import and teacher acceptance pending

## Database coverage

| Grade | Unique indicators | Must-know | Should-know | Grade alignments |
|---|---:|---:|---:|---:|
| P1 | 15 | 8 | 7 | 15 |
| P2 | 21 | 11 | 10 | 21 |
| P3 | 18 | 9 | 9 | 18 |
| P4 | 19 | 13 | 6 | 19 |
| P5 | 25 | 12 | 13 | 25 |
| P6 | 22 | 6 | 16 | 22 |
| M1 | 23 | 17 | 6 | 23 |
| M2 | 25 | 15 | 10 | 25 |
| M3 | 24 | 12 | 12 | 24 |
| M4 | 29 | 12 | 17 | 29 |
| M5 | 29 | 12 | 17 | 29 |
| M6 | 29 | 12 | 17 | 29 |
| **Unique indicator total** | **221** | **115** | **106** | — |
| **Alignment total** | — | **139** | **140** | **279** |

M4–M6 share the same 29 official indicators. Each shared indicator has three grade-level alignments, so the teacher pack contains one shared lesson per indicator rather than three duplicate lessons.

## Teacher starter packs

| File | Coverage | Unique lessons | Assessment prompts |
|---|---|---:|---:|
| `HEALTH-PE-P1-P3-TEACHER-STARTER-PACK.md` | P1–P3 | 54 | 162 |
| `HEALTH-PE-P4-P6-TEACHER-STARTER-PACK.md` | P4–P6 | 66 | 198 |
| `HEALTH-PE-M1-M3-TEACHER-STARTER-PACK.md` | M1–M3 | 72 | 216 |
| `HEALTH-PE-M4-M6-SHARED-TEACHER-STARTER-PACK.md` | Shared M4–M6 | 29 | 87 |
| **Total** | **P1–M6** | **221** | **663** |

Every lesson records:
- The database objective code.
- The official Thai indicator code and original Thai wording.
- The OBEC 2021 must-know / should-know classification.
- A practical teaching activity.
- Three indicator-specific formative tasks with expected-answer or observable-evidence guidance.

The M4–M6 official indicator codes use the shared `ม.4-6/n` grade notation. Indicator suffixes are sequenced within each official standard.

## Verification results

- [x] 221 unique objectives exist in the national curriculum.
- [x] 279 grade-level alignments exist.
- [x] All 279 alignments have an OBEC priority classification.
- [x] Priority totals reconcile: 139 must-know and 140 should-know alignment rows.
- [x] M4–M6 shared indicators are aligned to all three grades.
- [x] Four teacher packs cover all 221 unique indicators and provide 663 indicator-linked formative tasks with answer/evidence guidance.
- [x] Every task explicitly quotes the official Thai indicator and addresses the relevant HPE strand and grade band.
- [x] The importer expands all 29 shared M4–M6 indicators to three grade-specific draft lessons and grade-scoped question codes.
- [x] No duplicate objective-to-skill assignments were found.
- [x] No HPE lesson-content drafts or question-bank drafts have been imported.

## Import status and safeguards

The four Markdown packs are prepared for teacher-authorised import as unpublished drafts. The live database currently contains the curriculum objectives and alignments only; it contains zero HPE lesson drafts and zero HPE question drafts.

No pilot school, class, student, assignment or learner records were created or changed. App-wide testing remains deferred until all curriculum subject rollouts are complete.

## Source

OBEC 2021 priority-classification document, Health and Physical Education section, summary and grade tables (printed pages 263–286). The grade totals and must-know / should-know counts match the live curriculum alignments.


## Indicator-specific assessment authoring — 21 November 2026

All 221 lesson entries now include a practical activity, expected evidence, teacher check and three answer-keyed independent-practice tasks (663 total). Each prompt quotes the exact official Thai indicator. Task design is strand-specific across body systems/development, relationships and boundaries, movement/sport, health promotion/prevention, and safety/life skills. Task complexity is differentiated across early primary, upper primary, lower secondary and shared upper secondary.

Answer guidance is formative criteria, not a single rigid response for practical or open-ended tasks. Health and safety safeguards remain explicit: fictional scenarios for sensitive topics, no required personal disclosures, safe alternatives for learner ability/facilities, and trained supervision/mannequins for first aid or CPR.

The importer now recognises HPE grade codes and expands the 29 `HPE-M46` shared indicators into 87 grade-specific lesson drafts and 261 grade-scoped questions. Grade-scoped codes prevent duplicate collisions while preserving the one shared official objective aligned to M4, M5 and M6.

GitHub Actions run 176 passed all curriculum validators, including the actual TypeScript importer-parser check for 221 unique HPE indicators and 663 answer-keyed tasks, the production build and ESLint.


## Objective-specific assessment authoring — 23 November 2026

The four packs have now been revised across all 221 indicators (663 tasks). The repeated generic prompts were replaced with a three-part assessment sequence tied to each exact official Thai indicator and its HPE topic:
1. **Knowledge and understanding:** requires two distinct objective-relevant facts, decisions or steps.
2. **Application:** uses a fictional age-appropriate case and requires a sequenced decision with a reason.
3. **Demonstration/evidence:** requires an observable product or performance, a success criterion and an explanation linking evidence to the indicator.

For each indicator, the teaching activity, practical activity, expected evidence and teacher check now identify the relevant HPE topic and grade band. Expected answers specify what acceptable evidence must demonstrate rather than merely referring to a generic concept. Shared task structure remains intentional so teachers can apply consistent formative assessment; the objective, topic, case context and evidence criteria vary with the official indicator.

Safeguarding remains explicit: sensitive relationship and health topics use fictional scenarios without personal disclosures; physical activities require safe adaptation; first aid and CPR require trained supervision and appropriate mannequins. These are formative drafts and still require teacher review against local facilities, approved health guidance and learner needs.

The validator now checks the real TypeScript importer parser plus the three task types, answer guidance, required lesson-level teaching/evidence/marking fields, exact Thai indicator linkage and removal of the old generic task scaffold.

**Acceptance status:** authoring and automated structural/content-contract checks are in progress through CI. Staging import and teacher acceptance remain blocked until an isolated staging environment and authorised staging teacher session are explicitly available. No content has been imported or published.

## Live database re-verification — 23 November 2026

Read-only queries against the existing ep-core Supabase project reconfirmed:
- 221 unique HPE objectives and 279 grade-level alignments.
- 139 must-know and 140 should-know alignment rows; zero unclassified rows.
- All 12 grade rows (P1–M6) exactly match the expected objective and priority counts.
- All shared M4–M6 indicators have all three grade alignments; missing shared-grade alignments: 0.
- HPE lesson content items: 0; HPE questions: 0.

These were SELECT-only checks. No migration was applied, and no school, class, student, assignment, lesson draft or question record was changed.
