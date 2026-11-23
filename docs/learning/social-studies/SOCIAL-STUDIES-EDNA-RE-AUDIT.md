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
- All 12 grade levels are represented.\n- All 540 grade alignments are marked required; zero non-required alignment rows remain.

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

The database stores this classification in `learning_objective_alignments.pathway_classification`, separately from the 2021 priority classification. A direct alignment-level count confirms 362 between-learning, 178 terminal, zero missing pathway labels, and 540/540 required alignments.

## 3. 2021 Must-Know / Should-Know classification — historical metadata scope

The official OBEC 2021 summary reports 418 Social Studies indicators: **194 Must-Know and 224 Should-Know**. Its grade rows include M3 (28 Must-Know / 22 Should-Know) and M4–M6 (31 Must-Know / 30 Should-Know).

The live catalogue currently retains the 2021 priority labels for P1–M2 (135 Must-Know / 172 Should-Know). M3–M6 use the separate OBEC between-learning / terminal pathway classification, which is complete for all 540 grade alignments. The earlier subject audit explicitly treated the 2021 priority labels as retained metadata for P1–M2 and did not persist them for M3–M6.

This is a **classification-scope decision**, not a missing between-learning / terminal classification:
- Current pathway classification: complete, 540/540 grade alignments.
- Current retained 2021 priority metadata: complete for P1–M2.
- The 2021 source also provides historical priority totals for M3 and M4–M6. If the product requires those historical labels for all grades, 111 additional unique indicator labels (50 M3 + 61 shared M4–M6) would need to be transcribed and the 61 shared values aligned across three grades (233 grade rows).

**Do not infer Must-Know / Should-Know from the between-learning / terminal pathway.** Keep the two systems separate. No database priority-label changes are authorized by this audit; first confirm that the historical 2021 priority metadata is intended to be stored for M3–M6 as well as P1–M2.

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

## 4A. P1–P3 assessment-authoring batch — 23 November 2026

The P1–P3 pack has been revised across all **104 lesson sections and 312 answer-keyed tasks**. The previous generic identify/explain/apply prompts were replaced with strand-specific assessment structures for:

- **SO1 Religion, morality and ethics:** a verified-source card, source-based identification, explanation and respectful application. The teacher must select an appropriate curriculum source; personal belief and worship are never assessed.
- **SO2 Civics, culture and community:** a school/community case card, identification of the relevant role/right/duty/custom/decision process, consequence analysis and a justified fair action.
- **SO3 Economics:** age-banded spending, income/expense and limited-resource scenarios, with number/detail evidence and decision consequences.
- **SO4 History:** a three-part local-history evidence set, source attribution, comparison/sequence and a source-labelled timeline or explanation. Teachers must use verified local records and must not invent dates or historical claims.
- **SO5 Geography and environment:** a north-arrow school/community field sketch, location/observation evidence, comparison and a safe, measurable action.

Each of the 104 lessons has three tasks (recall/evidence, explain/compare, apply/demonstrate) and a corresponding answer/marking guide. A focused indicator-specific pass has rewritten 26 SO1 lessons and 22 SO4 lessons (48 lessons; 144 tasks) with distinct strand/indicator-appropriate source requirements and expected evidence. All three prompts in all 104 lessons explicitly repeat the exact Thai official indicator text and retain the importer-compatible `**Answer:**` structure. All 104 P1–P3 lessons now have source/task/answer structures matched to their official indicator; source population and independent teacher verification remain required before classroom sign-off.

**Verification performed:** fetched the updated branch file after commit; confirmed 104 P1–P3 indicator headings, 104 stimulus cards, 312 task entries, 312 answer-key labels and all three ordered task labels in every lesson. The subject validator was extended to check the P1–P3 stimulus-card strand and task progression. The validator and TypeScript importer have **not** been executed in a repository runtime, and GitHub Actions was not triggered from this connector session.

**Academic review status:** the P1–P3 pack is not yet signed off as fully classroom-ready. An indicator-specific authoring pass has replaced the broad SO1 templates in all 26 P1–P3 religion/morality lessons. Each now specifies a suitable source artifact, tasks matched to its indicator content/verb, and corresponding expected evidence. Teachers must still populate source cards from approved materials; this authoring pass does not independently certify every doctrinal, historical or cultural source. The 22 P1–P3 SO4 history lessons have now received an indicator-specific authoring pass, with source requirements for dates, oral histories, archives, photographs, maps or official records as appropriate. Teachers must still populate and verify these source sets before classroom use. SO2, SO3 and SO5 have received the same indicator-specific authoring pass. Teachers must still populate the source cards with verified local/school examples or data, and an independent subject-matter reviewer must check those sources and the final classroom delivery before sign-off. No automatic-marking claim is made.


## 4B. P1–P3 performance-evidence review — 23 November 2026

A second review focused on indicators whose official Thai wording requires learners to **practise, participate, demonstrate, observe, record, use, draw, survey or compare** rather than only describe a correct answer. The task-three assessment and marking guidance were strengthened for **32 indicators** across P1–P3. The revised prompts now require observable or inspectable evidence such as:

- a role-play or observed response linked to a verified religious principle, civic rule or social interaction;
- supervised, permission-based service or environmental action with a recorded result;
- participation in an actual low-stakes classroom decision or a simulated community participation role;
- use of a learner-created classroom plan, a weather observation record, or a labelled community map;
- a source-labelled timeline, calendar-era conversion, or safe geography survey with a stated distance method;
- a completed income/expense ledger using supplied fictional transactions where privacy is preferred;
- a safe model demonstration of the Earth–Sun–Moon relationship.

The corresponding answer guides now identify observable performance, source alignment, safety boundaries and acceptable alternatives. The prompts continue to quote the exact official Thai indicator and retain the parser's required `**Answer:**` label. The edit changed task 3 for 32 indicators; it did not claim that every task in all 104 lessons is now independently source-populated or classroom-tested. A post-edit fetch/static-structure check confirmed 104 lesson headings, 312 task entries, 312 answer labels, 104 stimulus cards, 104 exact-indicator learning intentions and the required three-task order in all 104 lessons. All 32 performance-evidence codes are present in the pack and their task-three prompts meet the validator's observable/inspectable-action keyword check. This is a source-text check only; the actual validator and importer remain unexecuted.

### Sensitive religious indicators and assessment limits

Two indicators explicitly concern a learner's religious affiliation: `SO1.2-P1-02` and `SO1.2-P3-03`. The assessment must not require a child to disclose, adopt, perform or publicly affirm a personal religion. The current task uses a fictional/voluntary case to assess understanding of voluntary affiliation and respect for others. This is a safeguarding alternative, **not evidence that a learner's personal declaration has been assessed**. Any school-level ceremonial activity must remain optional, be handled under school/family policy and never be used to grade belief or identity.

For prayer, meditation and ritual indicators, the revised tasks permit source-based observation or explanation as an alternative to participation. Where a learner voluntarily demonstrates a practice, the teacher must use a verified tradition-specific source and assess only observable understanding/conduct—not faith, sincerity or spiritual attainment.

### Remaining academic risks

1. **Source population:** source cards remain teacher-populated. Biography, scripture/doctrine, ceremony, royal-history, local-history, cultural and geography sources must be verified, dated where relevant, and suitable for the grade before classroom use.
2. **Local evidence:** SO4/SO5 activities depend on real school/community records, maps, photographs, observations or measurements. A teacher must not invent local dates, distances, events or environmental data.
3. **Task coverage:** the 32 performance-task edits strengthen a specific subset of task-three prompts. They do not constitute an independent academic review of every question/answer pair or a formal moderation of the marking guides.
4. **Execution:** the latest pack edit has not yet been run through the actual TypeScript parser/importer or the repository validator in a runtime. Structural checks on the fetched text are not a substitute for those tests.

**Current P1–P3 status:** task authoring and performance-evidence correction are in progress. Do not mark P1–P3 academically signed off until the source cards are populated and independently checked, all 312 tasks are reviewed for accuracy/age fit/marking clarity, and the actual importer and validator pass.

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
- [x] Replace generic P1–P3 task frames with strand-specific stimulus/task/answer structures (104 lessons; 312 tasks); structural counts verified.
- [ ] Complete independent subject-matter/source verification and classroom acceptance testing for all 104 P1–P3 lessons (312 tasks). The 32 task-three performance-evidence corrections are authored; teachers must populate verified source cards and reviewers must confirm all tasks for accuracy, age appropriateness and marking clarity.
- [ ] Review the remaining 942 P4–M6 formative tasks and answer/evidence guides for classroom usability, accuracy, age appropriateness and marking clarity.
- [ ] Correct pack front-matter statements that still say classification audit is pending where database evidence now confirms pathway and P1–M2 priority classifications.
- [ ] Run the Social Studies validator and GitHub Actions on `edna/subject-rollout`.
- [ ] Run final read-only database verification after any authorized academic-catalogue migration.
- [ ] Only after academic sign-off, arrange authorized teacher import, teacher review and classroom acceptance testing.

**Current conclusion:** Curriculum inventory, grade mappings, pathway classifications and duplicate integrity checks pass. Priority classification for M3–M6 and detailed classroom assessment quality remain open. Social Studies is therefore **in progress, not complete**.
