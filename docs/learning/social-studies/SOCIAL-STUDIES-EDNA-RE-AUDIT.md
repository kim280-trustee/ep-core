# Social Studies — Edna Independent Subject Re-audit

**Audit date:** 23 November 2026  
**Repository:** `kim280-trustee/ep-core`  
**Working branch:** `edna/subject-rollout`  
**Requested baseline:** `paul/learning-academic-integrity-audit`  
**Curriculum:** `TH-BASIC-CORE-2008-2017`  
**Subject:** `SOCIAL-STUDIES` — Social Studies, Religion and Culture  
**Scope:** P1–M6

## Executive status

The existing Social Studies curriculum catalogue and OBEC between-learning / terminal pathway classifications are complete and pass the current read-only database integrity checks. The subject is **not yet academically closed**: the 2021 OBEC Must-Know / Should-Know priority classification is missing for M3 and the shared M4–M6 indicator set, and the existing teacher packs still require a task-by-task academic specificity review before they can be treated as classroom-ready.

No curriculum records, school records, teacher content, questions, assignments or learner data were changed during this audit. Database checks were read-only.

## 1. Curriculum inventory and alignment integrity

Live Supabase read-only verification:

| Grade | Unique indicators | Grade alignments |
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
| **Total** | **418** | **540** |

M4–M6 use one shared set of 61 official indicators. Each of those 61 objectives is aligned once to M4, once to M5 and once to M6. This is intentional grade alignment, not duplicate objective creation.

Integrity results:
- 418 objective rows and 418 distinct objective codes.
- Zero duplicate objective-code rows.
- 540 grade-level alignment rows.
- Zero duplicate objective/curriculum/grade alignment groups.
- All 12 grade levels are represented.

## 2. OBEC between-learning / terminal classification

The live catalogue has pathway classification on all 540 grade-level alignments.

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

The unique-indicator pathway totals reconcile to **278 between-learning and 140 terminal** (418 total). Because M4–M6 share the same 61 objectives, the grade-alignment row totals are 362 between-learning and 178 terminal across 540 alignments.

The database stores this classification in `learning_objective_alignments.pathway_classification`, separately from the 2021 priority classification.

## 3. Outstanding 2021 Must-Know / Should-Know classification

The official OBEC 2021 summary reports 418 Social Studies indicators: **194 Must-Know and 224 Should-Know**. Its grade rows include M3 (28 Must-Know / 22 Should-Know) and M4–M6 (31 Must-Know / 30 Should-Know).

The live database currently contains these priority classifications for P1–M2 only:

| Scope | Must-Know | Should-Know | Priority classification missing |
|---|---:|---:|---:|
| P1–M2 (307 unique indicators) | 135 | 172 | 0 |
| M3 (50 unique indicators) | 0 | 0 | 50 |
| M4–M6 shared set (61 unique indicators) | 0 | 0 | 61 |
| **Unique-indicator total** | **135** | **172** | **111** |

Because M4–M6's 61 shared indicators each have three grade alignments, the database has **233 alignment rows** without a 2021 priority label (50 M3 + 183 M4–M6 alignment rows).

Expected missing classification totals from the OBEC summary:
- M3: 28 Must-Know and 22 Should-Know.
- M4–M6 shared set: 31 Must-Know and 30 Should-Know.
- Outstanding unique indicators: 59 Must-Know and 52 Should-Know.
- After reconciliation, expected overall totals: 194 Must-Know and 224 Should-Know.

**Do not infer these labels from the between-learning / terminal pathway.** They are separate OBEC classification systems and must be transcribed from the 2021 source indicator tables. The existing P1–M2 priority labels must remain unchanged. The M4–M6 priority value must be consistently aligned across all three grade rows for each shared objective, while preserving one unique objective record.

## 4. Teacher-resource inventory

The existing source resources contain eight starter packs covering all 418 unique indicators:

| Pack | Lesson sections | Expected formative tasks |
|---|---:|---:|
| P1–P3 | 104 | 312 |
| P4 | 38 | 114 |
| P5 | 36 | 108 |
| P6 | 39 | 117 |
| M1 | 45 | 135 |
| M2 | 45 | 135 |
| M3 | 50 | 150 |
| M4–M6 | 61 | 183 |
| **Total** | **418** | **1,254** |

The subject guide provides a lesson structure, strand-specific teaching guidance, differentiation, formative assessment rubric, feedback guidance and inclusion/classroom-safety principles.

Each lesson section currently includes an objective code, Thai indicator text, teaching sequence, resources, differentiation, practical activity, expected evidence, teacher check and three formative tasks with answer/evidence guidance.

### Academic quality finding — further work required

The existence of 1,254 prompts and answer-guidance entries is not, by itself, proof that 1,254 classroom assessment items are fully authored and academically verified.

A sample review found recurring prompt structures such as:
- identify two facts or terms required by the indicator;
- explain why the indicator matters and provide an example;
- apply the indicator to a generic school/community case.

These are useful formative task frames, but several do not yet provide a concrete source, case, dataset, map, timeline or scenario for the teacher and learner. Some answer guidance describes broad evidence criteria rather than specific expected content or a detailed marking scheme. This is appropriate for open-ended formative responses only when teachers supply a suitable source or case; it is not sufficient for automatic marking or a standardized assessment.

Required next step: audit all 1,254 tasks by indicator and strand. Retain valid open-ended tasks, but make each prompt operational for a real lesson by supplying the needed source/case/data or a precise teacher-provided stimulus, and strengthen the answer guide with indicator-specific expected evidence, acceptable alternatives and common misconceptions. Religious learning must never assess personal faith, identity, worship or participation.

## 5. Live content-import status

Read-only joins from Social Studies objectives to the application content/question tables returned:

| Measure | Current count |
|---|---:|
| Objectives | 418 |
| Objectives linked to teacher content items | 0 |
| Content items linked to Social Studies objectives | 0 |
| Objectives linked to question versions | 0 |
| Question versions linked to Social Studies objectives | 0 |

The Markdown teacher packs are source resources, not imported or published app content. Do not create generic school, class, teacher or student records to host them. Any later import must use the existing authorized teacher content/question workflow and its review lifecycle.

## 6. Branch and source-resource status

The requested independent branch `edna/subject-rollout` was created from `paul/learning-academic-integrity-audit`. The existing Social Studies audit, teacher guide, eight starter packs and subject validator were brought onto the Edna branch as subject-owned resources. Paul’s subject files and the shared integration branch were not modified.

The existing source audit and CI record report a successful Social Studies pack/parser validation in GitHub Actions run 157. This is evidence of structural/parser validation on the source work, not proof that the current Edna branch has independently passed CI or that the prompts are all classroom-ready. Re-run the subject validator and branch CI after the classification and content-quality work is complete.

## 7. Official source register

1. OBEC, *ตัวชี้วัดและสาระการเรียนรู้แกนกลางต้องรู้และควรรู้*, 2021. The official Social Studies summary gives 418 total indicators, 194 Must-Know and 224 Should-Know, with grade-level rows including M3 and M4–M6: https://www.academic.obec.go.th/images/official/1622514876_d_1.pdf
2. OBEC, official curriculum portal listing Social Studies core indicators and the between-learning / terminal indicator documents: https://www.academic.obec.go.th/web/news/view/75
3. OBEC, 2023 clarification/correction letter for between-learning indicators, including Social Studies M4–M6 Geography S5.2 indicators and an English P5 indicator correction: https://smart.obec.go.th/upload/book/upload_files/1690421462x1023659602_1.pdf
4. OBEC, Social Studies core indicators and learning content, B.E. 2551: https://www.academic.obec.go.th/web/document/view/279
5. OBEC, revised 2017 standards and indicators for Mathematics, Science and Geography: https://www.academic.obec.go.th/web/document/view/284

The original source audit also records an arithmetic discrepancy in the printed 2021 summary grand total (408); the individual grade rows and Must-Know / Should-Know totals sum to 418. Preserve the official grade-row totals and document the discrepancy rather than silently changing source figures.

## 8. Remaining acceptance criteria

- [ ] Transcribe and independently verify all 50 M3 2021 priority labels against the official OBEC source.
- [ ] Transcribe and independently verify all 61 shared M4–M6 2021 priority labels against the official OBEC source.
- [ ] Apply those labels to the correct 233 grade-alignment rows without duplicating the 111 unique objectives.
- [ ] Reconcile unique-indicator totals to 194 Must-Know / 224 Should-Know.
- [ ] Confirm the 2023 Social Studies M4–M6 Geography S5.2/2 and S5.2/3 correction is reflected in the source mapping and packs.
- [ ] Review all 418 lesson sequences/resources for indicator and strand specificity.
- [ ] Review all 1,254 formative tasks and answer/evidence guides for classroom usability, accuracy, age appropriateness and marking clarity.
- [ ] Correct pack front-matter statements that still say classification audit is pending where database evidence now confirms pathway and P1–M2 priority classifications.
- [ ] Run the Social Studies validator and GitHub Actions on `edna/subject-rollout`.
- [ ] Run final read-only database verification after any authorized academic-catalogue migration.
- [ ] Only after academic sign-off, arrange authorized teacher import, teacher review and classroom acceptance testing.

**Current conclusion:** Curriculum inventory, grade mappings, pathway classifications and duplicate integrity checks pass. Priority classification for M3–M6 and detailed classroom assessment quality remain open. Social Studies is therefore **in progress, not complete**.
