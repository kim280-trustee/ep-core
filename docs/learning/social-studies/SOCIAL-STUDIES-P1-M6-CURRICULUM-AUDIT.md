# Social Studies P1–M6 Curriculum Rollout Audit

**Curriculum:** TH-BASIC-CORE-2008-2017  
**Subject:** SOCIAL-STUDIES — Social Studies, Religion and Culture  
**Repository branch:** paul/thai-national-curriculum-foundation  
**Audit date:** 18 November 2026

## Scope and database inventory

The curriculum database contains **418 distinct Social Studies indicators** and **540 grade-level alignments**.

| Grade | Indicators | Grade alignments |
|---|---:|---:|
| P1 | 31 | 31 |
| P2 | 34 | 34 |
| P3 | 39 | 39 |
| P4 | 38 | 38 |
| P5 | 36 | 36 |
| P6 | 39 | 39 |
| M1 | 45 | 45 |
| M2 | 45 | 45 |
| M3 | 50 | 50 |
| M4 | 61 | 61 |
| M5 | 61 | 61 |
| M6 | 61 | 61 |
| **Total** | **418 unique indicators** | **540** |

M4–M6 use one shared set of 61 upper-secondary indicators, aligned to each of the three grade levels. This accounts for 122 additional alignments beyond the 418 unique indicators.

## Official source reconciliation

The OBEC-authored Social Studies pathway document reports the following totals:

| Grade | Total | Between-learning | Terminal |
|---|---:|---:|---:|
| P1 | 31 | 22 | 9 |
| P2 | 34 | 22 | 12 |
| P3 | 39 | 30 | 9 |
| P4 | 38 | 26 | 12 |
| P5 | 36 | 22 | 14 |
| P6 | 39 | 24 | 15 |
| M1 | 45 | 27 | 18 |
| M2 | 45 | 30 | 15 |
| M3 | 50 | 33 | 17 |
| M4–M6 | 61 | 42 | 19 |
| **Total** | **418** | **278** | **140** |

The 2021 OBEC must-know / should-know classification is a separate classification system and is not interchangeable with the later between-learning / terminal classification. The 2021 PDF's printed grand total (408) is an arithmetic discrepancy: its grade rows add to 418, and the must-know / should-know column totals add to 418.

## Verified pathway classification status

All 12 grade levels are now reconciled against the OBEC between-learning / terminal tables. Every grade alignment has a pathway value; there are zero missing classifications.

The live-catalogue required-flag correction also marks all 540 official Social Studies grade alignments as required. This includes all 405 alignments that previously had `required=false`: 172 Should-Know indicators and 111 indicators that carry an official pathway classification but no Must-Know / Should-Know priority label. The priority and pathway classifications were not changed. The catalogue now contains 418 required unique indicators and 540 required grade alignments.

| Grade | Total | Between-learning | Terminal | Missing |
|---|---:|---:|---:|---:|
| P1 | 31 | 22 | 9 | 0 |
| P2 | 34 | 22 | 12 | 0 |
| P3 | 39 | 30 | 9 | 0 |
| P4 | 38 | 26 | 12 | 0 |
| P5 | 36 | 22 | 14 | 0 |
| P6 | 39 | 24 | 15 | 0 |
| M1 | 45 | 27 | 18 | 0 |
| M2 | 45 | 30 | 15 | 0 |
| M3 | 50 | 33 | 17 | 0 |
| M4 | 61 | 42 | 19 | 0 |
| M5 | 61 | 42 | 19 | 0 |
| M6 | 61 | 42 | 19 | 0 |

The original 2021 must_know / should_know classifications remain in the separate `indicator_classification` field for P1–M2. Database verification confirms their per-grade counts are unchanged. M3–M6 pathway labels are stored only in `pathway_classification`, as designed.

## Teacher starter packs added

Eight teacher starter packs were added, covering all 418 unique indicators:

| Pack | Lessons |
|---|---:|
| P1–P3 | 104 |
| P4 | 38 |
| P5 | 36 |
| P6 | 39 |
| M1 | 45 |
| M2 | 45 |
| M3 | 50 |
| M4–M6 | 61 |
| **Total** | **418** |

Each lesson retains the database indicator code, standard code and original Thai indicator wording, with a practical activity, expected evidence, teacher check and three answer-keyed, indicator-linked formative tasks. All three task prompts quote the exact Thai indicator. Task design varies by Social Studies strand (religion/ethics, civics, economics, history or geography) and by grade band; answer guidance states the expected evidence and acceptable reasoning rather than imposing one wording as the only correct response. These are formative classroom tasks, not standardized examination items.

## Classification data model

The alignment table now has a dedicated `pathway_classification` field for `between_learning` / `terminal`. The existing `indicator_classification` field retains the separate `must_know` / `should_know` priority classification. This avoids treating the two OBEC classification systems as interchangeable.

Current pathway classification coverage: all 540 grade-level alignments are classified (362 between-learning and 178 terminal alignment rows). Across the 418 unique indicators, the official grade-level summary is 278 between-learning and 140 terminal; M4–M6 share 61 indicators aligned across three grades.

## Acceptance status and remaining work

- [x] All 418 unique indicators are mapped to the official OBEC between-learning / terminal pathway.
- [x] All 540 grade-level alignments have a pathway classification; zero missing.
- [x] Official totals reconcile to 278 between-learning and 140 terminal indicators.
- [x] All eight teacher starter packs contain the pathway labels for their covered indicators.
- [x] The separate 2021 must_know / should_know priority classification remains preserved.
- [x] All 540 official Social Studies alignments are marked required; pathway and priority classifications are preserved.
- [x] Replace generic prompt stems with three indicator-linked formative tasks and answer guidance for every one of the 418 indicators (1,254 tasks total).
- [x] Add objective-code, practical-activity and answer-keyed independent-practice sections compatible with the shared Markdown teacher-pack parser.
- [x] Extend the import workflow to expand the 61 shared M4–M6 outcomes across all three grade alignments with grade-scoped content/question codes.
- [ ] Do not begin app-wide feature testing until all curriculum rollouts are complete.

## Sources

1. OBEC, *ตัวชี้วัดระหว่างทางและตัวชี้วัดปลายทาง กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนาและวัฒนธรรม*, authored by the Bureau of Academic Affairs and Educational Standards, OBEC, Ministry of Education. Source copy: https://web.tpp.ac.th/60/wp-content/uploads/2020/12/ตัวชี้วัดระหว่างทางและปลายทางกลุ่มสาระการเรียนรู้สังคมศึกษา-ศาสนาและวัฒนธรรม.pdf
2. OBEC, *ตัวชี้วัดและสาระการเรียนรู้แกนกลางที่ต้องรู้และควรรู้ กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม*, 2021. https://academic.obec.go.th/images/official/1622514876_d_1.pdf

## Assessment authoring completion — 21 November 2026

All eight packs have now been upgraded. The 418 lesson sections contain 418 objective-code declarations, 418 practical activities, 418 expected-evidence statements, 418 teacher checks and exactly 1,254 answer-keyed independent-practice tasks. Every task prompt explicitly includes its exact official Thai indicator text. The task sequence covers recall/identification, explanation/analysis and application/demonstration. The application task is differentiated by Social Studies standard and grade band.

The answer guidance is formative marking guidance: it describes the evidence required for credit and permits equivalent correct responses. It does not claim a single fixed answer for open-ended civic, ethical, economic, historical or geographic tasks. Religion-related tasks explicitly do not grade personal faith or require worship.

The shared upper-secondary pack uses 61 M46 outcome codes aligned to M4, M5 and M6 (183 grade alignments). The parser deliberately does not collapse M46 to one grade. A remaining importer enhancement must expand these shared outcomes across the three aligned grade levels with grade-scoped content and question codes before the consolidated import test.


## Shared M4–M6 import handling

The parser exposes an explicit multi-grade scope helper: `SOx.y-M46-nn` resolves to M4, M5 and M6, while grade-specific Social Studies codes resolve to exactly one grade. The teacher importer expands each shared outcome into three grade-specific draft rows and generates distinct grade-scoped lesson and question codes, so importing the shared pack does not collide with itself or suppress later grades. The official Thai indicator wording is used as the imported lesson title. This mapping is covered by the Social Studies pack validator and is included in the consolidated CI build.
