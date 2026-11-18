# E&P Learning — Science Migration Integrity Review

**Branch:** `paul/thai-national-curriculum-foundation`  
**Scope:** 45 original Science curriculum migrations, one corrective M2/M3 integrity migration, one additive M3 greenhouse-effect migration, four OBEC priority-classification migrations, one national-core alignment/priority reconciliation migration, and the primary W4.2 indicator migration  
**Review type:** Static source review plus runtime migration verification against the existing Supabase project.

## Result

The academic-catalogue migrations create or upsert global curriculum records only; they do not create school, class, student, assignment or learner-progress records. The original M1–M3 Science records and 300 M4–M6 specialist outcomes are present. A new migration adds 28 primary W4.2 indicators (P1–P6), each aligned to the national core curriculum and classified against the OBEC 2021 priority table.

**The full national Science and Technology curriculum is not complete.** OBEC's 2021 table reports 415 core indicators across P1–M6. The current catalogue still lacks 111 primary W1–W3 indicators, 27 lower-secondary W4.1/W4.2 indicators, the M2/M3 W1–W3 code-level corrections, and the 102 shared M4–M6 core indicators. The 300 Biology/Chemistry/Physics/Earth-Space outcomes are additional specialist content and do not replace the upper-secondary core set. See `SCIENCE-CORE-CURRICULUM-GAP-AUDIT.md`.

The current M3 set also requires reconciliation: the official standard table has six M3 W1.1 indicators, eight W1.3 indicators, three W2.2 indicators and no M3 W3.2 indicator set, while the current database has 11 W1.3-coded and nine W3.2-coded records. Do not treat the current 53 as an accepted official count.

Runtime migration execution for the existing batches is complete. Application build, lint, importer smoke tests and app-wide end-to-end testing remain deferred until all curriculum rollouts are complete.

## Migration order

The 45 curriculum files are timestamped in dependency order. The final corrective migration, `20261117130000_learning_science_m2_m3_skill_topic_integrity.sql`, runs after them and removes out-of-strand M2/M3 duplicate topics, objectives and alignments. The additive M3 greenhouse-effect migration adds two legacy M3 Earth-system records that now require official-standard reconciliation. Four later priority migrations update classification metadata. A reconciliation migration mirrors the existing lower-secondary SCI records into the national-core curriculum. The latest primary W4.2 migration adds 28 official computational-science indicators to P1–P6; it does not close the remaining primary or upper-secondary core gaps. The original M2/M3 topic migrations have also been corrected in source so fresh resets seed each topic only under its intended skill.

The 45 curriculum files are ordered as follows:

1. Thai Science curriculum catalogue and M1–M3 core knowledge graph.
2. Upper-secondary specialist subject tracks (Biology, Chemistry, Physics, Earth/Space).
3. Grade-specific specialist objectives, with the subject-track catalogue created before those objectives.
4. Earth/Space M5 atmosphere/climate, M6 astronomy/space, and final M4 geology batch.

The M4 geology migration is last in the current batch and assigns outcomes 1–12 to M4, including outcome 12 on topographic/geological map interpretation.

## Static structural checks

- Migration files use explicit transaction boundaries (`BEGIN` / `COMMIT`).
- Academic catalogue writes use conflict targets corresponding to the existing unique keys:
  - subjects: `code`
  - curriculum/subject link: `curriculum_id, subject_id`
  - skills: `subject_id, code`
  - topics: `skill_id, code`
  - objectives: `topic_id, code`
  - objective alignments: `objective_id, curriculum_id, grade_level_id`
- Grade alignments join the exact Thai Science curriculum and grade code rather than relying on a free-text grade label.
- The upper-secondary subject-track migration creates the four distinct specialist subjects before their outcome migrations.
- No migration in this 45-file set inserts school, class, student, enrolment, assignment or learner-progress records.
- No migration in this 45-file set inserts into `learning_content_items`, `learning_content_versions`, `learning_questions`, `learning_question_versions`, `learning_question_objectives` or `learning_question_evaluation_keys`.

## Curriculum coverage register

| Track | Current objectives | Grade allocation / status |
|---|---:|---|
| SCI core and W4.2 | 172 | P1–P6 W4.2: 28; M1 43; M2 48; M3 53 (M3 code reconciliation open) |
| Biology | 108 | M4 32; M5 39; M6 37 |
| Chemistry | 81 | M4 28; M5 38; M6 15 |
| Physics | 67 | M4 17; M5 26; M6 24 |
| Earth, Astronomy and Space | 44 | M4 12; M5 13; M6 19 |
| **Current total** | **472** | **Partial national-core coverage; 300 specialist outcomes remain separate** |

Existing Science packs contain 444 lesson starters and 1,332 answer-keyed practice questions. The new primary W4.2 pack adds 28 lesson starters and 84 formative tasks with expected evidence. These are Markdown source materials, not database rows.

## Content and assessment insertion boundary

The existing app schema requires authored content and questions to be associated with a real authenticated user. The existing insert policies also require an organization membership for content and question records. Question versions additionally require a complete curriculum/grade/subject scope and aligned objective mappings.

Therefore:
- Do not invent a system user or attribute all content to an unrelated teacher.
- Do not create a school, class, student or assignment just to host generic curriculum resources.
- Do not bypass the existing generic authoring, review and publication lifecycle.
- Bring the teacher-pack material into the existing Teacher Content Create and Question Bank workflows under an authorized school teacher account. If bulk import is needed, implement it through those existing workflows and their authorization rules rather than a parallel content system.

## Release checklist

- [x] 45 timestamped curriculum migrations staged.
- [x] Official grade allocations audited for all five Science tracks.
- [x] Companion teacher packs prepared: 444 starters and 1,332 answer-keyed questions.
- [x] Consolidate and parser-validate 13 subject/grade import files; retain grade-specific selection for code-less upper-secondary outcomes.
- [x] Readiness and subject audit documents corrected to distinguish database objectives from Markdown teaching resources.
- [x] Add read-only staging verification SQL: `docs/learning/science/SCIENCE-STAGING-VERIFICATION.sql`.
- [x] Apply all 45 Science migrations, the corrective M2/M3 strand-integrity migration and the additive M3 greenhouse-effect migration; verify all 15 subject/grade counts.\n- [x] Mirror all 144 M1–M3 SCI objective alignments and OBEC priority classifications into the national-core curriculum; verify 43/48/53 indicators and zero missing priority labels except the nine documented M3 W3.2 indicators outside the OBEC 2021 table.\n- [x] Confirm all 144 M1–M3 core Science objectives have one correct grade alignment and no duplicate skill assignments.\n- [x] Apply OBEC 2021 priority classifications to all M1/M2 indicators and the verified M3 biological/materials, energy/light and astronomy/space indicators.\n- [x] Confirm that the nine M3 Earth-system indicators are absent from the OBEC 2021 priority table and leave their priority field null rather than infer a classification.
- [ ] Pull the branch locally and run lint/build once.
- [ ] Resolve any runtime migration or build findings.
- [x] Implement the authorized teacher-content importer, teacher-only guidance separation, and trusted short-answer manual-review workflow. The importer has not yet been run; actual draft import remains an explicit teacher action.
- [x] Apply the additive global curriculum migrations to the existing Supabase project as part of the requested rollout.

## Safety status

The Science catalogue is applied and verified in the existing Supabase project. All 144 M1–M3 core indicators are aligned in both curriculum catalogues. All indicators represented in the OBEC 2021 priority table are classified in both catalogues. The nine M3 W3.2 indicators absent from that table remain intentionally unclassified. No pilot school, class, student, assignment or learner records were created or changed.
