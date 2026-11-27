# Social Studies — Edna Independent Subject Re-audit

**Audit date:** 24 November 2026  
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

## 4C. P1–P3 religion task-specificity correction — 23 November 2026

A targeted review of the actual P1–P3 pack found that the earlier 26 SO1 lessons still contained a broad shared source-card and task-1/task-2 frame, despite the prior audit note describing them as indicator-specific. That earlier description overstated the state of the committed pack. This batch corrects the mismatch.

All **26 SO1 lessons** now have an indicator-matched source requirement and revised recall/evidence and explain/compare tasks with corresponding expected answers. Examples include:
- founder biographies and chronological life events;
- named Jataka, disciple or exemplar stories with action/consequence evidence;
- the Three Jewels/Ovada 3 or a verified equivalent teaching;
- sourced steps and purposes for attention/loving-kindness practices, with voluntary alternatives;
- permission-based service plans for religious places;
- fictional, privacy-protecting cases for religious affiliation;
- verified ceremony/observance sequences and inclusive visitor behaviour;
- comparative religion source charts, scripture roles and documented cultural influence.

The revised answer guides require evidence from the named source and reject unsupported details. Sensitive tasks explicitly assess source understanding and respectful conduct, never a learner's personal faith, identity, worship, affiliation or private disclosure. Non-Buddhist alternatives are permitted only where supported by a verified source for the tradition being taught.

**Structural verification on the updated branch:** 26 SO1 lessons inspected; 26 revised stimulus blocks; zero remaining instances of the former generic SO1 stimulus wording; 26 recall tasks and 26 explanation tasks retained; 78 parser-compatible answer labels across the three tasks per lesson. The exact Thai indicator remains included in each task. This is a content-structure check, not a source fact-check or classroom trial.

**Remaining limitation:** teachers must still supply and verify the actual biography, scripture, doctrine, ceremony, local service or comparative-religion source cards. An independent Social Studies/religion reviewer must check factual accuracy, age appropriateness, local school policy and inclusion before classroom use. The TypeScript importer and full validator have not yet been executed in a repository runtime.

## 4D. P1–P3 SO2–SO5 assessment rewrite — 23 November 2026

Reworked the remaining **78 P1–P3 lessons** across civics (SO2), economics (SO3), history/culture (SO4) and geography/environment (SO5). The former prompts repeatedly reused broad cross-indicator questions. They have been replaced with topic-specific stimulus cards and task/answer structures, including democratic decision scenarios, rights cases, cultural evidence, household budgets, production inputs, exchange and trade, calendar/timeline evidence, family/community history, verified heritage/national-history sources, map-reading, weather records, natural resources, pollution causes, settlement patterns and environmental action.

Each lesson now has three ordered tasks (recall/evidence, explain/compare, apply/demonstrate), three parser-compatible `**Answer:**` guides, and an explicit link from each task to that lesson's exact official Thai indicator. The task progression and stimuli are differentiated for P1, P2 and P3 response expectations. The P1–P3 validator now checks the exact indicator link count and rejects the former generic SO2/SO3/SO5 prompt frames.

**Structural verification on the updated branch:** 78 lessons; 234 tasks; 234 answer labels; all 78 lessons contain three task-to-indicator links matching their official Thai indicator. The full P1–P3 pack remains 104 lessons, 312 tasks and 312 answer labels. This check was performed on fetched source text only; it is not execution of the TypeScript importer or the validator.

**Academic-review limitation:** these are subject-specific authoring frameworks with illustrative scenario data. They still require a qualified Social Studies reviewer to verify factual/source accuracy (especially national history, local heritage and civic/legal concepts), confirm every task measures the full scope of its official indicator, check age appropriateness and confirm teacher resources are available. The TypeScript importer and full validator have not yet been executed in a repository runtime.

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
- [x] Confirm the 2023 OBEC correction is reflected in the M4–M6 teacher pack: `SO5.2-M46-02` and `SO5.2-M46-03` are present with Thai indicator wording matching the July 2023 correction letter. [Official OBEC correction letter](https://smart.obec.go.th/upload/book/upload_files/1690421462x1023659602_1.pdf). The source-to-database mapping/import reconciliation remains open; pack text presence alone does not close that check.
- [ ] Review all 418 lesson sequences/resources for indicator and strand specificity.
- [x] Replace generic P1–P3 task frames with strand-specific stimulus/task/answer structures (104 lessons; 312 tasks); structural counts verified.
- [ ] Complete independent subject-matter/source verification and classroom acceptance testing for all 104 P1–P3 lessons (312 tasks). The 32 task-three performance-evidence corrections are authored; teachers must populate verified source cards and reviewers must confirm all tasks for accuracy, age appropriateness and marking clarity.
- [ ] Review the remaining 942 P4–M6 formative tasks and answer/evidence guides for classroom usability, accuracy, age appropriateness and marking clarity.
- [ ] Correct pack front-matter statements that still say classification audit is pending where database evidence now confirms pathway and P1–M2 priority classifications.
- [ ] Run the Social Studies validator and GitHub Actions on `edna/subject-rollout`.
- [ ] Run final read-only database verification after any authorized academic-catalogue migration.
- [ ] Only after academic sign-off, arrange authorized teacher import, teacher review and classroom acceptance testing.

**Current conclusion:** Curriculum inventory, grade mappings, pathway classifications and duplicate integrity checks pass. Priority classification for M3–M6 and detailed classroom assessment quality remain open. Social Studies is therefore **in progress, not complete**.

## 4E. P1–P3 final academic/source gate — 23 November 2026

A final targeted review found 14 SO1 application tasks still using the same generic classroom-display prompt, despite their indicator-specific recall and explanation tasks. Those 14 application tasks have now been rewritten to require evidence and an observable product appropriate to the exact indicator (biography sequence, exemplar lesson, voluntary affiliation/privacy, sourced cultural influence, scripture structure, or respectful visitor guidance). The validator now rejects the former shared prompt. The 14 replacements were checked against each lesson's official Thai indicator text and source-stimulus description.

**Source-verification result: NOT PASSED.** The pack contains teacher-preparation instructions and source requirements, but it does not contain a complete traceable source register for all 26 SO1 lessons. Several cards require teachers to select a tradition-specific biography, story, scripture edition, doctrine or ceremony source. The source title, author/publisher, edition/date, page/section and verified factual extracts are not consistently recorded. A source being described as “verified” in a prompt is not proof that the source has been checked. No source facts have been invented to fill this gap. SO2–SO5 also require traceable local/community records, official history/geography references or validated classroom stimulus data where specified.

**Academic acceptance result: NOT PASSED.** The 104 lessons now have differentiated task frameworks and answer guidance, but a full independent, indicator-by-indicator review of all 312 task/answer pairs has not been signed off by a qualified Social Studies reviewer. The generic SO1 task-three issue is corrected; this does not close the wider review of curriculum scope, factual accuracy, age suitability, local context, marking reliability or classroom feasibility.

**Execution gate:** The branch workflow now invokes the actual Social Studies parser-backed validator after dependency installation. The current source parser contains escaped template-literal delimiters in its error strings (for example, the literal backslash before the opening template delimiter in its error messages), and the latest earlier build failed on parser syntax at line 98, as well as unrelated TSX parse errors in TeacherAssessmentBuilderPage.tsx and TeacherContentCreatePage.tsx. These are shared application/Core files and have not been changed in this subject-only rollout. The new CI run executed the validator step on commit 996c57a1fedb571f6bccb3aa5a0977c00ea23a53 and **failed before parsing any pack**: TypeScript transpilation reported `Invalid character` and `Unterminated template literal` in the shared parser source. The build and lint steps were skipped because the workflow stops at the failed validator. The parser file is also present with the same escaped template delimiters on the base branch, so this is not a Social Studies-only change; it must be corrected by the Core owner in a coordinated Core fix. Do not alter the frozen parser from this subject branch or claim importer/validator success.

**P1–P3 status remains IN PROGRESS.** Completion requires (1) traceable source records and factual review for every source-dependent stimulus, (2) independent academic moderation of all 312 tasks and answer guides, and (3) successful execution of the actual parser-backed validator/importer plus the repository build/lint checks. No live application content has been imported or published.


**Latest execution evidence:** GitHub Actions run [45115755622](https://github.com/kim280-trustee/ep-core/actions/runs/45115755622) failed in the new importer/validator step with the two parser transpilation errors above. `npm ci` completed and reported zero vulnerabilities. No importer result, pack-validation result, production build or lint pass was produced.


## 4F. Current technical and source re-check — 24 November 2026

The earlier execution-gate statements in sections 4B–4E are historical snapshots and are superseded by the current branch workflow evidence below.

**Branch head under verification:** `603efa80ab82b5966b51f185a090e78fd9ee65e1` on `edna/subject-rollout`.

**GitHub Actions run:** [45339677351](https://github.com/kim280-trustee/ep-core/actions/runs/45339677351).

- The actual TypeScript importer-backed Social Studies validator completed successfully. It parsed all eight packs: 418 unique indicators and 1,254 indicator-linked, answer-keyed tasks. M4–M6's 61 shared indicators correctly retain three grade alignments.
- `npm audit` completed successfully with zero vulnerabilities.
- The previous lint failure was traced to one unused `useEffect` import in `TeacherContentDetailPage.tsx` and a missing `initialOutput` dependency in `CodeActivityWorkspace.tsx`. Both source corrections have been committed in this branch as `30d1713` and `603efa8`.
- At the time this audit note was prepared, repository-wide lint and the TypeScript/production build had not yet returned a final result. Do not mark the technical gate complete until the workflow is green.

**2023 Geography correction source check:** the official July 2023 OBEC correction letter explicitly adds M4–M6 Geography indicators S5.2 ม.4–6/2 and S5.2 ม.4–6/3 to the between-learning group. The M4–M6 starter pack contains the corresponding `SO5.2-M46-02` and `SO5.2-M46-03` entries with matching Thai indicator text. This verifies pack text presence only; the imported source mapping and live catalogue reconciliation still require evidence.

**Academic and staging gates remain open.** The P1–P3 pack's successful parser validation is structural, not independent academic approval. The 942 P4–M6 tasks still require detailed academic/source review. No complete traceable source register or signed independent moderation has been supplied for all 1,254 tasks. Historical 2021 Must-Know / Should-Know labels for M3 and M4–M6 are not currently persisted; the official summary gives grade-level totals (M3 28/22; M4–M6 31/30), but no labels have been inferred from pathway classifications. Staging import, read-only reconciliation and teacher acceptance remain outstanding. No live KKC pilot data has been changed.


## 4G. Task-level specificity assessment and final technical verification — 25 November 2026

### Scope and method

A direct read of all eight current teacher starter packs was completed. The assessment counted indicator lesson headings and the three numbered task/answer entries per indicator, then compared task wording after normalising indicator codes and quoted official indicator text. This is a structural specificity screen; it is not represented as a substitute for subject-matter fact-checking or independent moderation.

| Pack | Indicator lessons | Task/answer entries | Distinct normalised task forms |
|---|---:|---:|---:|
| P1–P3 | 104 | 312 | 165 |
| P4 | 38 | 114 | 11 |
| P5 | 36 | 108 | 11 |
| P6 | 39 | 117 | 11 |
| M1 | 45 | 135 | 12 |
| M2 | 45 | 135 | 11 |
| M3 | 50 | 150 | 11 |
| M4–M6 | 61 | 183 | 11 |
| **Total** | **418** | **1,254** | — |

The 942 P4–M6 tasks are the sum of P4, P5, P6, M1, M2, M3 and the shared M4–M6 pack: 114 + 108 + 117 + 135 + 135 + 150 + 183 = 942. The remaining 312 tasks are P1–P3.

### Findings requiring correction before classroom acceptance

- P4–M6 packs use only 11–12 normalised prompt forms per pack across their 108–183 tasks. Many prompts differ mainly by inserting the official indicator wording into a common recall, explain or apply frame.
- Several prompts ask learners to use a “picture, short source, map or classroom example” without actually supplying or identifying the stimulus. Some upper-secondary tasks ask learners to evaluate “two responses” without providing those responses.
- Many answer guides describe the type of response (“identify accurate items directly required by the indicator”, “give an accurate explanation”) rather than supplying indicator-specific factual criteria, model evidence, acceptable alternatives and misconceptions.
- These entries are useful as planning scaffolds, but they are not yet fully specified, independently fact-checked assessment items. A parser's answer-key count must not be described as academic validation.
- P1–P3 has greater task-form diversity after its prior authoring passes, but its 312 entries still require source-card completion and independent review as documented in sections 4A–4E.

### Required remediation

For each of the 942 P4–M6 entries, replace the generic placeholder stimulus with a named, traceable source/case/map/data set or an explicit teacher-created stimulus specification. Write the actual learner task against the indicator's cognitive verb and content. Replace circular answer guidance with observable success criteria, supported factual content, acceptable alternatives and likely misconceptions. Keep religious assessment inclusive: never score personal belief, identity, worship or participation.

Do not mass-generate factual answers or sources where authoritative evidence has not been checked. Mark such entries as awaiting source verification and qualified review rather than presenting them as complete.

### M3–M6 2021 priority labels

The official OBEC 2021 document is the controlling source for Must-Know / Should-Know. Its grade totals are M3 28/22 and M4–M6 31/30. The detailed table contains indicator-level classifications, but those individual rows have not yet been transcribed and independently reconciled against the catalogue. No labels have been inferred from the separate between-learning / terminal pathway classification. No database write is authorised by this audit.

### Technical verification

GitHub Actions run 45339845892 for commit 5629ce6659d9edcc5921bdcc8695d69dcb6f6a38 completed successfully on 24 November 2026. All steps passed: Social Studies teacher-pack importer and validator, dependency security audit, repository-wide lint, and TypeScript/production build. The validator parsed all eight packs, 418 unique indicators and 1,254 indicator-linked answer-keyed tasks. This is structural and technical evidence only.

Run: https://github.com/kim280-trustee/ep-core/actions/runs/45339845892

### Final acceptance decision

**Social Studies is not ready to be marked complete or released for classroom use.** The technical gate is closed. The task-level review has identified concrete quality defects and therefore remains open pending remediation and qualified academic moderation. The M3–M6 individual 2021 labels remain to be transcribed and reconciled. No authorised non-production staging tenant, import permission, teacher acceptance record or independent signed academic approval was available in this repository review. No live KKC pilot data or production content was changed.

The next safe implementation batch must improve the task packs with verified stimuli and indicator-specific marking guidance, add traceable per-task review status, and only then request independent subject-matter sign-off and authorised staging acceptance.

## 4H. Six-workstream closeout tracker and task-level register — 26 November 2026

### Workstream 1 — Technical validation: CLOSED

The latest subject-branch commit before this closeout, `bd11d30ee415edef1f89b6f89619bb6c75d5dcb3`, completed GitHub Actions run [45575248732](https://github.com/kim280-trustee/ep-core/actions/runs/45575248732) successfully. All eight workflow steps passed, including the importer-backed Social Studies validator, dependency security audit, repository-wide lint, and TypeScript/production build. The validator's structural result remains 418 unique indicators and 1,254 answer-keyed tasks. This closes technical execution only; it does not certify academic accuracy.

### Workstream 2 — Task-level moderation register: REGISTER CREATED; MODERATION OPEN

Created `SOCIAL-STUDIES-TASK-LEVEL-MODERATION-REGISTER.csv` with one row per task: **1,254 rows across 418 indicators**, including the exact task prompt and answer guidance, grade scope, standard, priority/pathway values already present in the packs, and separate pending fields for source/content accuracy, age fit, marking clarity and independent moderation.

The register deliberately records P1–P3 source cards as specifications whose traceable source records are not yet verified. P4–M6 rows identify the generic or teacher-supplied stimulus gap. No task is falsely marked academically approved. The CSV is a review-control artifact, not evidence that the tasks have been moderated.

### Workstream 3 — P4–M6 specificity remediation: OPEN

The 942 P4–M6 tasks are now individually indexed in the register. The earlier structural screen found only 11–12 normalised prompt forms per pack, with repeated generic stimulus references and circular answer guidance. The register preserves the current prompts and answers so each can be reviewed and replaced without losing the baseline. Actual remediation still requires named, traceable source/case/map/data or a complete teacher-created stimulus specification, plus indicator-specific answer criteria. No unsupported factual content has been generated to make this appear complete.

### Workstream 4 — M3 and M4–M6 2021 priority classification: SOURCE LOCATED; ROW RECONCILIATION OPEN

The controlling 2021 OBEC PDF is now directly located and opened: https://academic.obec.go.th/images/official/1622514876_d_1.pdf. The official summary reports M3 **28 Must-Know / 22 Should-Know** and M4–M6 **31 Must-Know / 30 Should-Know**, within the 418-indicator total of 194/224. The detailed tables expose the indicator code, Thai indicator text and separate Must-Know / Should-Know columns. **Source arithmetic exception:** the same PDF's printed grand-total cell says 408 indicators, while its ten grade rows sum to 418 and its Must-Know / Should-Know totals sum to 418 (194 + 224). The grade-level totals and category totals are internally consistent with 418; the printed 408 grand total is an OBEC document inconsistency and must not be copied into the catalogue. The source is the 2021 OBEC PDF, subject section pp. 172–249; M3 detailed table concludes with 28/22 at PDF p. 239, and M4–M6 detailed rows begin at p. 240. Source URL: https://academic.obec.go.th/images/official/1622514876_d_1.pdf The exact indicator rows still need transcription and exact-text reconciliation against the 50 M3 and 61 shared M4–M6 catalogue indicators before any labels can be written. The 61 shared values must then be aligned to 183 grade rows, without duplicating the 61 unique objectives. No database change is authorised by this audit.

### Workstream 5 — Independent academic/source moderation: OPEN

All 1,254 tasks are now traceable in the register, but no qualified independent reviewer has signed off the complete set. Source verification is also outstanding, including tradition-specific sources and inclusion checks for SO1, official legal/civic references for SO2, sourced economic data for SO3, historical records for SO4, and verified maps/data for SO5. P1–P3's 312 tasks remain subject to source population and independent review as well. Religious assessment must not score personal belief, identity, worship or participation.

### Workstream 6 — Staging import, read-only reconciliation and teacher acceptance: BLOCKED ON AUTHORISATION

The repository review has not established an authorised non-production staging tenant, an approved import permission, or a named teacher acceptance record. Live Social Studies objectives currently have no linked teacher content items or question versions in the previously recorded read-only check. No content has been imported into the live KKC pilot and no production data has been changed. Staging must remain blocked until the school/project owner supplies the approved non-production target and permission, after which import reconciliation and teacher acceptance can be recorded.

### Current closeout decision

| Workstream | Status |
|---|---|
| 1. Technical validation | CLOSED — latest workflow green |
| 2. Task-level register | CLOSED — 1,254 rows created; reviews remain pending |
| 3. P4–M6 task remediation | OPEN — 942 tasks |
| 4. M3/M4–M6 priority labels | OPEN — official source located; exact rows not yet reconciled |
| 5. Independent moderation/source verification | OPEN — reviewer and source checks outstanding |
| 6. Staging/import/teacher acceptance | BLOCKED — authorisation and acceptance evidence unavailable |

**Overall:** Social Studies remains **IN PROGRESS — NOT APPROVED FOR RELEASE**. The technical validation and moderation-register creation are closed as work products. Academic remediation, official priority-row reconciliation, independent sign-off and authorised staging acceptance remain outstanding. The task register is at `docs/learning/social-studies/SOCIAL-STUDIES-TASK-LEVEL-MODERATION-REGISTER.csv`.



## 4I. Consolidated academic remediation batch — 27 November 2026

### Task-level register materialised and reconciled

The previously tracked CSV path existed as a zero-byte file. This batch populated it directly from the eight current teacher starter packs and verified the output before committing:

- 1,254 task rows, with 1,254 unique task IDs.
- 418 unique indicator IDs represented.
- Grade-pack row counts: P1–P3 312; P4 114; P5 108; P6 117; M1 135; M2 135; M3 150; M4–M6 183.
- Each row retains the pack's indicator code, official Thai indicator text, task wording, answer guidance, task type, and any priority/pathway label actually present in the pack.
- Separate source verification, factual accuracy, age/inclusion, marking-quality and independent-moderation fields are explicitly set to pending/not reviewed. No item is marked approved.

This is now a real, populated review register. It is an indexing and moderation-control artifact, not a completed academic review.

### P4–M6 task specificity remediation

The 942 P4–M6 entries are now represented individually in the register. The earlier assessment remains valid: generic source placeholders, missing stimuli, unspecified comparison responses and circular answer guidance are still present in the source packs. The register does not silently rewrite or bless these prompts.

A responsible correction needs a traceable source or complete teacher-created stimulus, the actual learner-facing question, a criterion-based answer key, acceptable alternatives and likely misconceptions. For source-dependent questions, each factual answer must be checked against the cited source. Those facts cannot be safely manufactured from the indicator wording alone. Therefore the 942-task content remediation is **NOT CLOSED** in this batch.

### OBEC 2021 priority-label reconciliation

The controlling OBEC 2021 PDF was opened at the official Academic Affairs and Educational Standards site:
https://academic.obec.go.th/images/official/1622514876_d_1.pdf

The Social Studies summary table is on printed page 172; the M3 detailed table begins at printed page 230 and the M4–M6 detailed table begins at printed page 240. The summary confirms M3 28 Must-Know / 22 Should-Know and M4–M6 31 Must-Know / 30 Should-Know (418 total indicators, 194/224 overall). The detailed table's two checkmark columns are the controlling per-indicator evidence.

The pack catalogue's M3 and M4–M6 indicator codes and Thai wording still need a complete exact row-by-row transcription against those detailed tables. This batch does not convert the totals into invented individual labels, nor infer 2021 labels from between-learning/terminal pathway classifications. Accordingly, the per-indicator reconciliation is **NOT CLOSED** and no label/database writes are authorised on the basis of the summary totals.

### Independent academic review

The populated register now makes the full 1,254-task review auditable, but all source, factual, age/inclusion, marking and independent-review fields remain explicitly pending. No qualified independent Social Studies reviewer has supplied a signed review. This gate is **NOT CLOSED**.

### Commit evidence and safety

The populated register was committed as `96e0b584d109a81075e904979021d9210bf5d921`. No application source, database, live KKC pilot data or production content was changed in this batch. The register's 1,254 rows and 1,254 unique task IDs were checked before commit. Technical workflow validation for this new commit must be checked separately.

### Honest outcome

This batch closes the missing register artifact and provides an official source location/page map for exact classification work. It does **not** close the three academic workstreams: 942-task substantive remediation, individual M3/M4–M6 priority-row reconciliation, or qualified review of all 1,254 tasks. Those require source-specific evidence and independent human academic judgement; marking them complete without that evidence would be false.


## 4J. Task-screening and OBEC reconciliation controls — 27 November 2026

The 1,254-row moderation register was expanded with reproducible first-pass flags for generic stimulus references, comparison tasks that do not state the compared responses, circular/non-criterion answer guidance, and prompts without a named stimulus. The screening identified 349 generic-stimulus references, 36 unspecified-comparison prompts, 690 circular/non-criterion answer guides, and 560 prompts without a named stimulus. These are overlapping rule-based flags, not a human quality verdict; each flagged item remains subject to source review and subject-matter moderation.

A separate `SOCIAL-STUDIES-M3-M46-OBEC-2021-PRIORITY-CROSSWALK.csv` now contains all 111 M3 and M4–M6 catalogue indicators, their official Thai wording, and the exact OBEC PDF page location for the detailed table. All 111 rows are explicitly marked `UNRECONCILED` until the source's Must-Know/Should-Know checkmark is transcribed and exact-matched. This prevents a grade-level total or pathway label from being misused as an individual priority classification.

The task register contains 1,254 unique task rows; the P4–M6 subset contains 942. This closes the task indexing and first-pass screening artifacts, not the content remediation or academic approval. The crosswalk closes the source-location and indicator-indexing artifact, not the individual classification reconciliation. No individual 2021 labels have been guessed or written.


### OBEC source arithmetic discrepancy

A close reading of the official Social Studies summary table on printed page 172 shows a source-document arithmetic inconsistency: the grade-level totals sum to 418 indicators, and the grade-level Must-Know/Should-Know counts sum to 194/224 (also 418), but the PDF's printed grand-total cell says 408. The detailed catalogue and the grade-level rows both use 418. This discrepancy is recorded for reviewer awareness; the 408 grand-total cell is not silently corrected or treated as authority for individual labels. The official source remains the PDF linked above.


## 4K. M3 OBEC detailed-row reconciliation batch — 27 November 2026

The official OBEC PDF is now accessible as parsed text at https://www.academic.obec.go.th/images/official/1622514876_d_1.pdf (document dated 31 May 2021; Social Studies section, printed pp. 230 onward). The exact row text and the separate Must-Know/Should-Know checkmark columns were inspected, rather than relying on grade totals.

Sixteen M3 rows have now been reconciled in the crosswalk by matching standard, indicator wording and row sequence:
- SO2.1: five rows (4 Must-Know, 1 Should-Know), official printed p.234, rows 18–22.
- SO2.2: four rows (all Must-Know), official printed p.235, rows 23–26.
- SO3.1: three rows (2 Must-Know, 1 Should-Know), official printed pp.235–236, rows 27–29.
- SO3.2: four rows (2 Must-Know, 2 Should-Know), official printed p.236, rows 30–33.

The crosswalk marks only these 16 entries `RECONCILED_EXACT_TEXT_AND_CODE`; the other 95 rows remain blank and `UNRECONCILED`. The source table contains an apparent grade/code inconsistency in the next entries (the printed grade cell is M3 while some listed indicator codes show M4/5 and M4/6); those rows are intentionally not force-matched to M3 pack indicators. This is an evidence-backed partial reconciliation, not a complete 111-row closeout. No production database or live school content was changed.


## 4L. Moderation-register schema repair and validator re-run — 27 November 2026

The first workflow after the M3 crosswalk update exposed a moderation-register integration defect. The importer validator requires exactly 17 columns, task IDs matching the current parsed pack convention (`-Q1`, `-Q2`, `-Q3`), and three rows for each of the 418 parsed indicator codes. The register artifact at the branch head was empty, while the prior populated register snapshot used a 15-column schema and `-T1`/`-T2`/`-T3` task identifiers. The workflow therefore failed before the later security, lint and production-build steps could run.

This repair restored the register from the previously populated 1,254-row snapshot, preserved its task prompts, answer guidance, grade-pack labels, official Thai indicator text, and pre-existing priority/pathway values, aligned the task identifiers to the current parser's Q1/Q2/Q3 convention, and expanded the structure to the validator's 17-column contract. The new review-control fields explicitly remain pending:
- `PENDING — source/content and factual review not completed`
- `PENDING qualified source/content review`
- `PENDING grade/age review`
- `PENDING indicator-specific marking review`
- `NOT MODERATED — reviewer sign-off required`

Pre-commit integrity checks confirmed 1,254 task rows, 1,254 unique task IDs, 418 indicator IDs and exactly three tasks per indicator. This is a structural repair only; it does not complete source verification, factual review, age/inclusion review, marking review or independent moderation. Commit: `eb164924015951fbaf968eb9f24d8905bc5b8361`. The Social Studies workflow triggered by this commit must pass before the technical validation gate can be closed again.


## 4M. M3 religious-studies priority reconciliation — 27 November 2026

Four additional M3 SO1.2 rows were reconciled against the detailed OBEC 2021 table on printed page 233 (official rows 14–17). All four carry the Should-Know checkmark:
- `SO1.2-M3-04` — ปฏิบัติตนในศาสนพิธี พิธีกรรมได้ถูกต้อง.
- `SO1.2-M3-05` — อธิบายประวัติวันสำคัญทางศาสนาตามที่กำหนดและปฏิบัติได้ถูกต้อง.
- `SO1.2-M3-06` — แสดงตนเป็นพุทธมามกะ หรือแสดงตนเป็นศาสนิกชนของศาสนาที่ตนนับถือ. The source has a whitespace variation relative to the catalogue wording; this row is explicitly marked as a code match with whitespace-normalised text, not as a byte-for-byte exact text match.
- `SO1.2-M3-07` — นำเสนอแนวทางในการธำรงรักษาศาสนาที่ตนนับถือ.

The crosswalk now contains 20 reconciled rows out of 111, with 91 still unresolved. The 20 reconciled rows comprise 12 Must-Know and 8 Should-Know. This does not complete the M3 crosswalk: other M3 standards and the shared M4–M6 rows remain under source reconciliation. No label is inferred from a grade-level summary or pathway field.


## 4N. M3 history and geography priority reconciliation — 27 November 2026

Eleven further M3 rows were reconciled against the OBEC 2021 detailed table:
- SO4.3, official rows 40–43, printed p.238: /1 Must-Know; /2 Must-Know; /3 Must-Know; /4 Should-Know.
- SO5.1, official rows 44–45, printed p.239: /1 Should-Know; /2 Should-Know.
- SO5.2, official rows 46–50, printed p.239: /1 Should-Know; /2 Must-Know; /3 Must-Know; /4 Must-Know; /5 Should-Know.

The crosswalk uses explicit whitespace-normalised match statuses where the source and catalogue differ only in spacing around Thai conjunctions. Those are not described as byte-for-byte exact matches. All eleven indicator codes match their source rows.

The crosswalk now has 31 of 111 rows reconciled. For the M3 portion, 31 of 50 rows are reconciled and 19 remain unresolved; the 61 shared M4–M6 rows are still outstanding. The 31 M3 classifications currently total 18 Must-Know and 13 Should-Know. This count is not a completed M3 result: the unresolved 19 include apparent source-code/grade inconsistencies and other standards requiring exact review. No classifications were inferred from totals or neighbouring rows.


## 4O. M3 priority reconciliation completed — 27 November 2026

The remaining 19 M3 priority rows have now been reconciled by matching the indicator code and Thai wording to the detailed 2021 OBEC Social Studies tables. The source pages used are printed pp.230–239. The row-level results are recorded in `SOCIAL-STUDIES-M3-M46-OBEC-2021-PRIORITY-CROSSWALK.csv`.

This final M3 batch covers:
- SO1.1 M3/1–M3/10 (printed pp.230–232).
- SO1.2 M3/1–M3/3 (printed p.232).
- SO3.2 M3/5–M3/6 (printed p.236).
- SO4.1 M3/1–M3/2 and SO4.2 M3/1–M3/2 (printed p.237).

The completed M3 crosswalk now contains 50/50 reconciled indicators: 28 Must-Know and 22 Should-Know, matching the M3 row in the OBEC 2021 summary. No priority was assigned by distributing totals; each label was taken from its corresponding detailed indicator row. The row/code/wording anomalies previously observed in the extracted source remain recorded separately where relevant and do not change the exact matches above.

**Batch 1 — M3 priority reconciliation: COMPLETE.** This closes the M3 classification scope only. It does not close the shared M4–M6 crosswalk (61 indicators), academic task review, staging, teacher acceptance or independent sign-off.

The preceding moderation-register repair was validated by GitHub Actions run [45929074904](https://github.com/kim280-trustee/ep-core/actions/runs/45929074904), which completed successfully. That run confirmed the importer/validator, dependency security audit, repository lint and TypeScript/production build on commit `4bd985710c381bdc1e1115af22d847e1ac8b276d). The current M3 completion commit is newer and must receive its own green workflow before the M3 technical gate is marked passed.


## 4P. M4–M6 OBEC priority reconciliation completed — 27 November 2026

All 61 M4–M6 catalogue indicators have now been matched against the detailed 2021 Social Studies priority table (printed pp.240–261). Matching was performed by the full standard/indicator code and Thai indicator wording, then the Must-Know or Should-Know checkmark was transcribed from that indicator's own row. The source table is reproduced in the 2021 OBEC PDF at `https://www.academic.obec.go.th/images/official/1622514876_d_1.pdf`; the searchable PDF text used to inspect the row-level cells is `https://filesthaischool0.com/files/uppic/84102720/document/84102720_0_20210614-124337.pdf`. The official document's M4–M6 summary (printed p.172) gives 61 indicators, 31 Must-Know and 30 Should-Know.

The crosswalk now reconciles:
- M3: 50/50 indicators — 28 Must-Know, 22 Should-Know.
- M4–M6: 61/61 indicators — 31 Must-Know, 30 Should-Know.
- Combined: 111/111 indicators reconciled, matching the M3 and M4–M6 summary totals.

The CSV row sequence was independently checked after the update: 111 data rows, 8 columns per row, 50 M3 rows and 61 M4–M6 rows. The final M4–M6 row, `SO5.2-M46-04`, is Must-Know (printed p.261, detailed row 61); `SO5.2-M46-03` is Should-Know (printed p.260, detailed row 60). This distinction was checked against the actual two priority columns, not inferred from the summary.

**Batch 1 — complete OBEC priority crosswalk reconciliation: COMPLETE.** This closes the priority classification work for M3 and M4–M6. It does not constitute academic moderation of the 1,254 learning tasks, nor does it complete staging, teacher acceptance or independent academic sign-off.

The moderation-register repair has a successful workflow on commit `4bd985710c381bdc1e1115af22d847e1ac8b276d` (run [45929074904](https://github.com/kim280-trustee/ep-core/actions/runs/45929074904)). The latest crosswalk commits are being revalidated; the importer and security audit have passed on the preceding run, but lint and production build must finish on the current commit before the crosswalk technical gate can be closed.


## 4Q. Primary 4 task-specific stimulus and register restoration — 27 November 2026

The P4 teacher pack has been revised across all 38 indicators and all 114 answer-keyed tasks. Each lesson now includes a named, topic-specific assessment stimulus and a three-step recall/evidence, explanation and application progression. Prompts and answer guidance explicitly cite the exact Thai indicator wording; answer guidance identifies the evidence or criterion required rather than repeating the indicator.

The new stimuli include age-appropriate religious/community cases; child-rights categories; local civics and election cases; illustrative consumer/economic data (explicitly labelled illustrative); historical evidence and Sukhothai source cards; and map/photo/fieldwork specifications for provincial geography. No invented local map facts or local statistics are presented as established facts. Where a teacher must supply an approved source, local map/photo or event card, that dependency is stated in the lesson and the register continues to mark source/factual review as pending.

**Catalogue alignment flag retained:** `SO1.2-P4-04` is preserved exactly as recorded, but its official Thai wording describes democratic citizenship/community membership rather than the SO1.2 religious-sites strand. The task wording follows the supplied Thai indicator; the code/standard assignment must be checked against the controlling OBEC curriculum catalogue before import. No silent code change was made.

The moderation register was empty on the active `edna/subject-rollout` branch and has been reconstructed from the eight current teacher packs: 418 unique indicator codes, exactly three tasks per indicator, 1,254 unique `-Q1/-Q2/-Q3` task IDs and 17 columns per row. All source, factual, age/inclusion, marking and independent moderation controls remain explicitly pending/not moderated; register population is not academic approval.

**P4 prompt/stimulus authoring batch: COMPLETE (114/114).** **P4 source verification, factual review, age/inclusion review, independent moderation and teacher acceptance: OPEN.** No staging import or production/live-school data change was made.


## 4Q. Primary 4 task-specific stimulus and register restoration — 27 November 2026

The P4 teacher pack has been revised across all 38 indicators and all 114 answer-keyed tasks. Each lesson now includes a named, topic-specific assessment stimulus and a three-step recall/evidence, explanation and application progression. Prompts and answer guidance explicitly cite the exact Thai indicator wording; answer guidance identifies the evidence or criterion required rather than repeating the indicator.

The new stimuli include age-appropriate religious/community cases; child-rights categories; local civics and election cases; illustrative consumer/economic data (explicitly labelled illustrative); historical evidence and Sukhothai source cards; and map/photo/fieldwork specifications for provincial geography. No invented local map facts or local statistics are presented as established facts. Where a teacher must supply an approved source, local map/photo or event card, that dependency is stated in the lesson and the register continues to mark source/factual review as pending.

**Catalogue alignment flag retained:** `SO1.2-P4-04` is preserved exactly as recorded, but its official Thai wording describes democratic citizenship/community membership rather than the SO1.2 religious-sites strand. The task wording follows the supplied Thai indicator; the code/standard assignment must be checked against the controlling OBEC curriculum catalogue before import. No silent code change was made.

The moderation register was empty on the active `edna/subject-rollout` branch and has been reconstructed from the eight current teacher packs: 418 unique indicator codes, exactly three tasks per indicator, 1,254 unique `-Q1/-Q2/-Q3` task IDs and 17 columns per row. All source, factual, age/inclusion, marking and independent moderation controls remain explicitly pending/not moderated; register population is not academic approval.

**P4 prompt/stimulus authoring batch: COMPLETE (114/114).** **P4 source verification, factual review, age/inclusion review, independent moderation and teacher acceptance: OPEN.** No staging import or production/live-school data change was made.


## 4R. Primary 5 task-specific stimulus and marking-criteria batch — 27 November 2026

The P5 teacher pack now contains topic-specific stimuli and three aligned tasks for each of its 36 indicators (108 tasks total). The revised progression is recall/identify, explain/analyse and apply/demonstrate. Every task is tied to the exact official Thai indicator wording, and answer guidance states the evidence, reasoning or performance needed for credit.

The authored material includes curriculum-approved-source templates for religious biographies, scripture, ceremonies and exemplary stories; explicit rights-protection scenarios; local-government tasks that require the correct current authority chart and statutory source; clearly labelled illustrative household/cooperative/budget data; historical inquiry source sets and Ayutthaya/Thonburi chronology; and regional map/photo tasks that require verified local data rather than invented geographic facts. Borrowing examples are illustrative and direct pupils to check total repayment, terms and lender legitimacy. Cultural and religious tasks do not assess personal belief or compel worship.

The P5 rows in `SOCIAL-STUDIES-TASK-LEVEL-MODERATION-REGISTER.csv` have been updated in place: 108 task rows, preserving the 1,254-row catalogue, 418 indicator coverage and 17-column schema. Source/content verification, factual accuracy, age/inclusion review, marking-quality review and independent moderation remain pending. This authoring pass is not a substitute for those reviews.

**P5 task-specific authoring: COMPLETE (108/108 across 36/36 indicators).** **P5 source verification, factual/age review, independent moderation and teacher acceptance: OPEN.** No staging import or production/live-school data change was made.


## 4S. Primary 6 task-specific stimulus and marking-criteria batch — 27 November 2026

The P6 teacher pack now contains topic-specific assessment stimuli and three aligned tasks for each of its 39 indicators (117 tasks total). The progression is recall/identify, explain/analyse and apply/demonstrate. Each prompt is tied to the exact Thai indicator wording, and each answer guide identifies the evidence, reasoning or performance needed for credit.

The P6 materials use named classroom source sets: approved biography timelines and religious teaching cards; respectful interfaith visitor and inclusion cases; fictional peer-pressure and safe-help-seeking scenarios; current teacher-verified legal extracts, local-government charts, election guides and news-source comparisons; fictional producer/consumer, market and cooperative cases with clearly illustrative values; dated historical source sets and teacher-approved Rattanakosin profiles; and map/image/hazard/environment evidence packs that require dated, verified Thai sources. Religious practice is never compelled or assessed as personal belief. Current legal, government, ASEAN, country-profile, historical and geographic facts must be checked against the cited current or adopted authoritative sources before classroom use; no unverified local facts, emergency routes or statistics have been invented.

The P6 register rows have been updated in place: 117 task rows across 39 indicators, preserving the complete 1,254-task catalogue, 418 indicators and 17-column schema. All source/content verification, factual accuracy, age/inclusion, marking-quality and independent moderation statuses remain pending/not moderated. Automated structural validation confirms 39 P6 indicators, three unique task IDs per indicator and no change to the other grade-pack rows.

**P6 task-specific authoring: COMPLETE (117/117 across 39/39 indicators).** **P6 source verification, factual/age review, independent moderation and teacher acceptance: OPEN.** No staging import or production/live-school data change was made.
