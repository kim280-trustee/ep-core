# M4–M6 Science and Technology Core — Source Audit

**Curriculum:** Thai Basic Education Core Curriculum B.E. 2551 (2008), revised 2017  
**Official source:** OBEC / IPST, *Indicators and Core Learning Content: Must-Know and Should-Know* (2021)  
**Source PDF:** https://www.academic.obec.go.th/images/official/1622514876_d_1.pdf  
**Status:** M4 is complete (22/22 grade-specific core indicators) and verified in both curricula. M5 W2.1 is complete at 25/25 indicators; M5 W2.2 and W2.3 add 22 further indicators. M5 has 47/47 source-sequenced indicators represented across these three standards. M6 remains to be completed; 33 of the 102 upper-secondary indicators remain.

## Correct interpretation of the 102 indicators

The OBEC summary on page 58 reports **102 indicators across the upper-secondary band M4–M6**, with 85 Must-Know and 18 Should-Know classifications. The summary notes that ว 3.1 ม.6/4 is dual-classified, explaining why the two priority totals sum to 103 while the unique indicator total is 102.

The 102 is an aggregate of grade-specific M4, M5 and M6 indicators. It is **not** one shared 102-row set to duplicate across all three grades. The detailed source uses grade-specific codes such as ว 1.1 ม.4/1, ว 2.1 ม.5/14 and ว 3.1 ม.6/4. Each objective must be linked only to its actual grade.

## Live database baseline — 21 November 2026

- TH-SCI-M1-M6 has active grade levels M4, M5 and M6, but no core SCI objective alignments for those grades.
- TH-BASIC-CORE-2008-2017 also has active M4, M5 and M6 grade levels, but no core SCI objective alignments for those grades.
- The existing 300 Biology, Chemistry, Physics and Earth/Space specialist outcomes are separate subject tracks. They do not satisfy the 102 national core indicators.
- Do not modify specialist outcomes or treat their grade counts as core Science coverage.

## Required extraction and implementation sequence

1. Transcribe all 102 official rows from the M4, M5 and M6 sections of the OBEC source PDF (pages 143–170).
2. Capture, for every row: source grade, exact Thai indicator code, exact Thai indicator wording, Must-Know / Should-Know flag, and a concise English learning objective.
3. Reconcile the grade-specific counts so they total exactly 102 unique indicators.
4. Reconcile priority totals to 85 Must-Know and 18 Should-Know classifications, preserving the dual classification for ว 3.1 ม.6/4 in notes/metadata.
5. Create grade-specific topic/objective records under the existing SCI subject and align each objective to only its source grade in both curricula.
6. Add teacher lesson starters and three answer-keyed formative questions per indicator, then verify the source pack against the database codes.
7. Execute read-only verification for 102 unique indicators, all grade mappings, priority totals and zero duplicate objective/grade alignments.

## Acceptance criteria

- Exactly 102 unique upper-secondary core indicators.
- Each indicator mapped to its actual grade M4, M5 or M6; no blanket cross-grade duplication.
- 85 Must-Know and 18 Should-Know classifications, with ว 3.1 ม.6/4 explicitly dual-classified.
- The same 102 grade-specific alignments present in the canonical Science curriculum and the draft national master curriculum.
- No changes to the 300 specialist outcomes, school, class, student or learner-progress data.


## Implemented tranche 1 — M4 ecology (W1.1 indicators 1–4)

Source pages 143–144 of the OBEC 2021 Must-Know / Should-Know PDF. The source classifies M4/1 as Should-Know, M4/2 and M4/3 as Must-Know, and M4/4 as Should-Know.

| Official code | Grade | Classification | Objective |
|---|---|---|---|
| ว 1.1 ม.4/1 | M4 | Should-Know | Geography and biome diversity |
| ว 1.1 ม.4/2 | M4 | Must-Know | Ecological succession |
| ว 1.1 ม.4/3 | M4 | Must-Know | Physical/biological factors affecting population size |
| ว 1.1 ม.4/4 | M4 | Should-Know | Environmental impacts and conservation |

Live staging: 4 unique objectives, aligned once each to M4 in both TH-SCI-M1-M6 and TH-BASIC-CORE-2008-2017 (8 alignments total). Read-only verification returned all eight expected rows with exact grade and priority. No M5/M6 alignment was created.

Resources: M4-science-ecology-environment-teacher-starter-pack.md contains four lesson starters and 12 original answer-keyed formative questions.

Migration: 20261121034100_seed_science_m4_ecology_core_indicators_1_4.sql.

Remaining upper-secondary core indicators: 98 of 102. Do not extrapolate M4 wording or classifications to M5/M6.


## Implemented tranche 2 — M4 cell biology, plant physiology, genetics and evolution

The second tranche adds all 18 remaining M4 indicators in standards W1.2 and W1.3. M4 now has 22/22 unique indicators: 15 Must-Know and 7 Should-Know. Each new objective is aligned only to M4 in both curriculum catalogues (36 new alignments). The companion pack adds 18 lesson starters and 54 answer-keyed formative questions. Source priority flags were transcribed from OBEC 2021 pp. 143–148.

Migration: 20261121042000_seed_science_m4_cell_biology_genetics_core_indicators_5_22.sql. Teacher pack: M4-science-cell-biology-genetics-evolution-teacher-starter-pack.md.


## Implemented tranche 3 — M5 W2.1 matter and chemical change

The initial text extraction recovered M5 W2.1 M5/1–10 and M5/14–25 (22 indicators). A scanned segment containing M5/11–13 was skipped by that extraction and is now recovered and implemented in a corrective migration. The completed W2.1 set has 25 indicators (20 Must-Know, 5 Should-Know), aligned only to M5 in both curricula (50 alignments total). The teacher pack contains 25 lesson starters and 75 answer-keyed formative questions.

Migration: 20261121052000_seed_science_m5_w2_1_chemistry_core_indicators.sql. Teacher pack: M5-science-matter-chemistry-teacher-starter-pack.md.


## M5 W2.1 source recovery — indicators 11–13

The first text extraction of printed page 151 skipped a scanned segment. A subsequent official-source search recovered the rows for ว 2.1 ม.5/11–13 and confirmed all three as Must-Know. They are now seeded as a corrective migration, not treated as absent from the curriculum. M5 W2.1 is complete at 25 indicators: 20 Must-Know and 5 Should-Know.

Migration: 20261121073000_seed_science_m5_w2_1_indicators_11_13.sql. Source: OBEC 2021 official PDF, printed p. 151.
