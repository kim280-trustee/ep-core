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

## Classification status at audit start

- P1: 31 indicators reconciled against the OBEC-authored pathway table: 22 between-learning and 9 terminal; zero unclassified.
- P2: 34 indicators reconciled against the OBEC-authored pathway table: 22 between-learning and 12 terminal; zero unclassified.
- P3–P6, M1 and M2: existing must_know / should_know values remain preserved; independent pathway mapping remains outstanding.
- M3: all 50 indicators reconciled: 33 between-learning and 17 terminal; zero unclassified.
- M4–M6: all 61 shared indicators reconciled: 42 between-learning and 19 terminal; zero unclassified in each of the three grade alignments.
- The older must-know / should-know values remain separate and are never used as substitutes for pathway classifications.

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

Each lesson retains the database indicator code, standard code and original Thai indicator wording, with a suggested teaching sequence, three differentiated assessment prompt types, expected evidence and a teacher check. These are teacher-planning prompt stems, not individually authored answer-keyed examination items.

## Classification data model

The alignment table now has a dedicated `pathway_classification` field for `between_learning` / `terminal`. The existing `indicator_classification` field retains the separate `must_know` / `should_know` priority classification. This avoids treating the two OBEC classification systems as interchangeable.

Current pathway classification coverage: P1 = 22 / 9; P2 = 22 / 12; M3 = 33 / 17; M4–M6 = 42 / 19 each. P3–P6 and M1–M2 remain unclassified in the pathway field (242 grade alignments).

## Remaining acceptance criteria

- Complete code-by-code between-learning / terminal classification for P3–P6, M1 and M2 (242 alignments).
- Verify all grade-level totals against OBEC: 278 between-learning and 140 terminal across the 418 unique indicator set, with M4–M6 shared indicators aligned to all three grades.
- Current verified state: P1, P2 and M3–M6 have zero unclassified pathway alignments; P3–P6 and M1–M2 remain outstanding.
- Upgrade prompt stems into fully authored, indicator-specific assessment items and answer guidance where required.
- Do not begin app-wide feature testing until all curriculum rollouts are complete.

## Sources

1. OBEC, *ตัวชี้วัดระหว่างทางและตัวชี้วัดปลายทาง กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนาและวัฒนธรรม*, authored by the Bureau of Academic Affairs and Educational Standards, OBEC, Ministry of Education. Source copy: https://web.tpp.ac.th/60/wp-content/uploads/2020/12/ตัวชี้วัดระหว่างทางและปลายทางกลุ่มสาระการเรียนรู้สังคมศึกษา-ศาสนาและวัฒนธรรม.pdf
2. OBEC, *ตัวชี้วัดและสาระการเรียนรู้แกนกลางที่ต้องรู้และควรรู้ กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม*, 2021. https://academic.obec.go.th/images/official/1622514876_d_1.pdf