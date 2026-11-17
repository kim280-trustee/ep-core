# E&P Learning — Science Migration Integrity Review

**Branch:** `paul/learning-academic-integrity-audit`  
**Scope:** 45 Science curriculum migrations and the existing academic/content/assessment schema  
**Review type:** Static source review. No migrations were executed against Supabase.

## Result

The Science academic-catalogue migration set is structurally consistent with the existing knowledge-graph schema and is staged in timestamp order. The migrations create or upsert global academic records only. They do not create school, class, student, assignment, authored lesson-content or question-bank records.

This review does **not** certify runtime SQL execution. A staging-database migration run and the planned local application build are still required before release.

## Migration order

The 45 files are timestamped in dependency order:

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
| M1–M3 core Science | 142 | M1 43; M2 48; M3 51 |
| Biology | 108 | M4 32; M5 39; M6 37 |
| Chemistry | 81 | M4 28; M5 38; M6 15 |
| Physics | 67 | M4 17; M5 26; M6 24 |
| Earth, Astronomy and Space | 44 | M4 12; M5 13; M6 19 |
| **Total** | **442** | **All allocations audited** |

The teacher-pack corpus contains 442 lesson starters and 1,326 answer-keyed practice questions. These are source materials in Markdown, not database rows.

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
- [x] Companion teacher packs prepared: 442 starters and 1,326 answer-keyed questions.
- [x] Readiness and subject audit documents corrected to distinguish database objectives from Markdown teaching resources.
- [x] Add read-only staging verification SQL: `docs/learning/science/SCIENCE-STAGING-VERIFICATION.sql`.
- [ ] Run all migrations against a disposable/staging Supabase database and verify expected objective/alignment counts.
- [ ] Pull the branch locally and run lint/build once.
- [ ] Resolve any runtime migration or build findings.
- [x] Implement the authorized teacher-content importer, teacher-only guidance separation, and trusted short-answer manual-review workflow. The importer has not yet been run; actual draft import remains an explicit teacher action.
- [ ] Obtain explicit approval before applying migrations to live Supabase.

## Safety status

No live Supabase migrations have been applied. No pilot school, class, student, assignment or learner records have been created or changed by this Science rollout.
