# E&P Learning — Science Migration Integrity Review

**Branch:** `paul/thai-national-curriculum-foundation`  
**Scope:** 45 Science curriculum migrations, one corrective M2/M3 integrity migration, four OBEC priority-classification migrations, and the existing academic/content/assessment schema  
**Review type:** Static source review plus runtime migration verification against the existing Supabase project.

## Result

The Science academic-catalogue migrations create or upsert global academic records only. They do not create school, class, student, assignment, authored lesson-content or question-bank records. Runtime verification confirmed all 15 expected subject/grade objective counts. OBEC 2021 priority classification is now verified for M1 (29 must / 14 should), M2 (37 / 11), and 44 M3 indicators: biology/materials (14 / 5), energy/light (16 / 5) and astronomy/space (3 / 1). The remaining nine M3 Earth-system indicators still need exact code-level classification.

Runtime migration execution is complete. The application build, lint and end-to-end teacher/student tests remain pending before release.

## Migration order

The 45 curriculum files are timestamped in dependency order. The final corrective migration, `20261117130000_learning_science_m2_m3_skill_topic_integrity.sql`, runs after them and removes out-of-strand M2/M3 duplicate topics, objectives and alignments. Four later migrations add priority metadata only; they do not alter objective counts or curriculum alignments. The original M2/M3 topic migrations have also been corrected in source so fresh resets seed each topic only under its intended skill.

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

| Track | Objectives | Grade allocation |
|---|---:|---|
| M1–M3 core Science | 144 | M1 43; M2 48; M3 53 |
| Biology | 108 | M4 32; M5 39; M6 37 |
| Chemistry | 81 | M4 28; M5 38; M6 15 |
| Physics | 67 | M4 17; M5 26; M6 24 |
| Earth, Astronomy and Space | 44 | M4 12; M5 13; M6 19 |
| **Total** | **444** | **All allocations audited** |

The teacher-pack corpus contains 444 lesson starters and 1,332 answer-keyed practice questions. These are source materials in Markdown, not database rows.

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
- [x] Apply all 45 Science migrations and the corrective M2/M3 strand-integrity migration to the existing Supabase project; verify all 15 subject/grade counts.\n- [x] Apply OBEC 2021 priority classifications to all M1/M2 indicators and the verified M3 biological/materials, energy/light and astronomy/space indicators.\n- [x] Confirm that the nine M3 Earth-system indicators are absent from the OBEC 2021 priority table and leave their priority field null rather than infer a classification.
- [ ] Pull the branch locally and run lint/build once.
- [ ] Resolve any runtime migration or build findings.
- [x] Implement the authorized teacher-content importer, teacher-only guidance separation, and trusted short-answer manual-review workflow. The importer has not yet been run; actual draft import remains an explicit teacher action.
- [x] Apply the additive global curriculum migrations to the existing Supabase project as part of the requested rollout.

## Safety status

The Science catalogue is applied and verified in the existing Supabase project. All indicators represented in the OBEC 2021 priority table are classified. The nine M3 W3.2 indicators absent from that table remain intentionally unclassified. No pilot school, class, student, assignment or learner records were created or changed.
