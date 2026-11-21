# M4–M6 Science and Technology Core — Source Audit

**Curriculum:** Thai Basic Education Core Curriculum B.E. 2551 (2008), revised 2017  
**Official source:** OBEC / IPST, *Indicators and Core Learning Content: Must-Know and Should-Know* (2021)  
**Source PDF:** https://www.academic.obec.go.th/images/official/1622514876_d_1.pdf  
**Status:** All 102 upper-secondary core indicators are now staged and verified in both curricula: M4 28/28, M5 49/49 and M6 25/25. Every objective is aligned only to its source grade. Priority reconciliation is complete: detailed rows now total 85 Must-Know and 17 Should-Know, plus the dual Should-Know classification for M6/4, matching the official summary of 85 Must-Know and 18 Should-Know.

## Correct interpretation of the 102 indicators

The OBEC summary on page 58 reports **102 indicators across the upper-secondary band M4–M6**, with 85 Must-Know and 18 Should-Know classifications. The summary notes that ว 3.1 ม.6/4 is dual-classified, explaining why the two priority totals sum to 103 while the unique indicator total is 102.

The 102 is an aggregate of grade-specific M4, M5 and M6 indicators. It is **not** one shared 102-row set to duplicate across all three grades. The detailed source uses grade-specific codes such as ว 1.1 ม.4/1, ว 2.1 ม.5/14 and ว 3.1 ม.6/4. Each objective must be linked only to its actual grade.

## Live database baseline — 21 November 2026

- At the baseline audit date, TH-SCI-M1-M6 had active M4–M6 grade levels but no core SCI objective alignments. Current status: 102/102 grade-specific alignments are present.
- At the baseline audit date, TH-BASIC-CORE-2008-2017 also had active M4–M6 grade levels but no core SCI objective alignments. Current status: the same 102/102 grade-specific alignments are now present.
- The existing 300 Biology, Chemistry, Physics and Earth/Space specialist outcomes are separate subject tracks. They do not replace or duplicate the 102 national core indicators.
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

The second tranche adds all 18 remaining M4 indicators in standards W1.2 and W1.3. M4 now has 22/22 unique indicators: 14 Must-Know and 8 Should-Know after the page-146 correction to M4/11. Each new objective is aligned only to M4 in both curriculum catalogues (36 new alignments). The companion pack adds 18 lesson starters and 54 answer-keyed formative questions. Source priority flags were transcribed from OBEC 2021 pp. 143–148.

Migration: 20261121042000_seed_science_m4_cell_biology_genetics_core_indicators_5_22.sql. Teacher pack: M4-science-cell-biology-genetics-evolution-teacher-starter-pack.md.


## Implemented tranche 3 — M5 W2.1 matter and chemical change

The initial text extraction recovered M5 W2.1 M5/1–10 and M5/14–25 (22 indicators). A scanned segment containing M5/11–13 was skipped by that extraction and is now recovered and implemented in a corrective migration. The completed W2.1 set has 25 indicators (19 Must-Know, 6 Should-Know), aligned only to M5 in both curricula (50 alignments total). The teacher pack contains 25 lesson starters and 75 answer-keyed formative questions.

Migration: 20261121052000_seed_science_m5_w2_1_chemistry_core_indicators.sql. Teacher pack: M5-science-matter-chemistry-teacher-starter-pack.md.


## M5 W2.1 source recovery — indicators 11–13

The first text extraction of printed page 151 skipped a scanned segment. A subsequent official-source search recovered the rows for ว 2.1 ม.5/11–13 and confirmed all three as Must-Know. They are now seeded as a corrective migration, not treated as absent from the curriculum. M5 W2.1 is complete at 25 indicators: 20 Must-Know and 5 Should-Know.

Migration: 20261121073000_seed_science_m5_w2_1_indicators_11_13.sql. Source: OBEC 2021 official PDF, printed p. 151.


## Implemented tranche 4 — M4/M5 technology and computational thinking

The official OBEC technology rows are now aligned to their source grades: M4 has five W4.1 indicators (M4/2, /3, /4, /5, /9) and one W4.2 indicator (M4/1); M5 has one W4.1 indicator (M5/1) and one W4.2 indicator (M5/1). This adds six M4 indicators and two M5 indicators. The M4 total is now 28/28; the M5 total is 49/49. All eight rows are aligned only to their actual grade in both curricula. The companion pack contains eight lesson starters and 24 answer-keyed questions.

Migration: 20261121082000_seed_science_m4_m5_technology_core_indicators.sql. Teacher pack: M4-M5-science-technology-computational-thinking-teacher-starter-pack.md.

## Current upper-secondary coverage

| Grade | Expected | Staged | Must-Know | Should-Know | Remaining |
|---|---:|---:|---:|---:|---:|
| M4 | 28 | 28 | 19 | 9 | 0 |
| M5 | 49 | 49 | 42 | 7 | 0 |
| M6 | 25 | 25 | 24 | 1 | 0 |
| **Total** | **102** | **102** | **85** | **17** | **0** |

Priority totals are reconciled to the official upper-secondary summary: 85 Must-Know and 18 Should-Know classifications, including the dual M6/4 label. M4/11 was corrected to Should-Know using the official page-146 row.


## Final grade implementation — M6 and 102/102 coverage

The final grade-specific tranche adds all 25 M6 indicators: W3.1 (10), W3.2 (14) and W4.2 (1). They are aligned only to M6 in both curricula (50 alignments). The companion M6 pack contains 25 lesson starters and 75 answer-keyed formative questions.

Migration: `20261121093000_seed_science_m6_universe_earth_climate_core_indicators.sql`. Teacher pack: `M6-science-universe-earth-climate-teacher-starter-pack.md`.

**Coverage verification — both curricula**

| Grade | Official total | Staged | Stored Must-Know | Stored Should-Know | Dual note |
|---|---:|---:|---:|---:|---:|
| M4 | 28 | 28 | 19 | 9 | 0 |
| M5 | 49 | 49 | 42 | 7 | 0 |
| M6 | 25 | 25 | 24 | 1 | 1 |
| **Total** | **102** | **102** | **85** | **17** | **1** |

The M6 stored counts are 24 Must-Know and 1 Should-Know; M6 ว 3.1 ม.6/4 is additionally marked Should-Know in notes. Following the correction of M4 ว 1.2 ม.4/11 from Must-Know to Should-Know (official page 146), the upper-secondary totals are 85 Must-Know and 17 stored Should-Know, plus the dual Should-Know label for M6/4 = 18. This matches the official page-58 summary exactly.

Teacher resources for this core grade band now total 102 lesson starters and 306 answer-keyed formative questions (M4 28/84, M5 49/147, M6 25/75). These remain Markdown teacher resources; no school, class, student or learner-progress records were touched.


## M3 priority reconciliation — ecosystem indicator ว 1.1 ม.3/6

The official OBEC 2021 M3 source table (printed page 127) marks ว 1.1 ม.3/6 as **Should-Know**. Both curriculum catalogues previously had this indicator unclassified. The classification has now been corrected in both catalogues and verified.

Migration: `20261121103000_classify_science_m3_ecosystem_indicator_6.sql`.

The nine legacy W3.2 records (`M3-S3_2-01` through `M3-S3_2-09`) have been retained as non-required supplementary outcomes. The nine official M3 technology indicators (W4.1/1–5 and W4.2/1–4) are now seeded and aligned in both curricula. M3 has 59 required official indicators and reconciled priorities of 41 Must-Know / 18 Should-Know.


## M3 official technology coverage completed — 21 November 2026

The OBEC 2021 M3 source table on printed page 127 contains five W4.1 and four W4.2 indicators (rows 51–59). These nine official indicators are now aligned to M3 in both curricula. The nine legacy W3.2 records remain in the database but are marked non-required and unclassified; they are not part of the official M3 core count. M3 now has 59 required indicators, 41 Must-Know and 18 Should-Know, matching the official M3 summary.

Migration: `20261121110000_seed_science_m3_official_technology_indicators_and_archive_legacy_w3_2.sql`.


## Upper-secondary priority reconciliation completed — 21 November 2026

The remaining one-row difference was traced to ว 1.2 ม.4/11. The database and M4 teacher pack had labelled it Must-Know, but the official OBEC 2021 table on printed page 146 places it in the Should-Know column. Both catalogue alignments have been corrected. Verified grade totals are M4 19 Must-Know / 9 Should-Know, M5 42 / 7, and M6 24 / 1 plus the dual M6/4 Should-Know label. Aggregate totals are 85 Must-Know and 18 Should-Know classifications, with 102 unique indicators.

Migration: `20261121114500_correct_science_m4_w1_2_indicator_11_priority.sql`.
