# E&P Learning — Science Rollout Readiness

**Branch:** `paul/learning-academic-integrity-audit`  
**Scope:** Thai core Science curriculum catalogue and staged M1–M3 knowledge graphs  
**Status:** M1 knowledge graph and M2–M3 biological-science staged batch committed; remaining M2–M6 indicators are pending. No migrations applied to Supabase and no school records created.

## M1 coverage delivered

| Strand / standard | Official indicators | Seeded objectives |
|---|---:|---:|
| Life Science — ว 1.2 | 18 | 18 |
| Matter and Materials — ว 2.1 | 10 | 10 |
| Forces and Pressure — ว 2.2 | 1 | 1 |
| Energy and Heat — ว 2.3 | 7 | 7 |
| Earth and Atmosphere — ว 3.2 | 7 | 7 |
| **Total M1 Science** | **43** | **43** |

The M1 teacher pack contains 43 lesson starters and 129 practice questions with answer keys. Each lesson identifies the corresponding official Thai indicator code.

## Curriculum scope

The new catalogue uses subject code `SCI` and curriculum code `TH-SCI-M1-M6`, aligned to the Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017).

This Science subject covers the core Science standards ว 1.x, ว 2.x and ว 3.x. Technology standards ว 4.1 and ว 4.2 are intentionally reserved for the future Design & Technology / Computer Studies workstream, so the same official indicators are not duplicated across subjects.

The curriculum catalogue contains M1–M6 grade levels. M1 is fully seeded for its 43 core Science indicators. M2 is fully seeded for all 48 core Science indicators across ว 1.2, ว 2.2, ว 2.3 and ว 3.2. M3 currently has 19 objectives seeded: 11 biological-science indicators in ว 1.3 and eight materials/chemical-reaction indicators in ว 2.1. M3 standards ว 2.3, ว 3.1 and ว 3.2, plus all M4–M6 indicators, remain future implementation work.

## Migrations

1. `20261116080000_learning_science_curriculum_catalog.sql` — adds the SCI subject, Thai Science curriculum, M1–M6 grade levels and curriculum-subject link.
2. `20261116081500_learning_science_m1_knowledge_graph.sql` — adds five Science skills, 17 topics, 43 M1 objectives and official curriculum-grade alignments.
3. `20261116083000_learning_science_m2_m3_biology_knowledge_graph.sql` — adds 17 M2 and 11 M3 biological-science objectives.
4. `20261116084500_learning_science_m2_physical_science_knowledge_graph.sql` — adds 15 M2 force objectives and six M2 work/energy objectives.
5. `20261116090000_learning_science_m2_earth_space_knowledge_graph.sql` — adds ten M2 Earth and Space Science objectives.\n6. `20261116091500_learning_science_m3_matter_chemistry_knowledge_graph.sql` — adds eight M3 materials and chemical-reaction objectives.

Apply these after the existing pending academic foundation and Maths migrations, in timestamp order. The seeds are idempotent upserts and require the active Thai Basic Education system.

## Teacher workflow

The existing generic Teacher Content Create, Teacher Content Library and Question Bank workflows support the new subject and curriculum dimensions. No Science-only authoring module is needed.

After migrations are applied:
- Select `TH-SCI-M1-M6`, the matching grade (`M1`, `M2` or `M3`) and subject `SCI` when creating Science content.
- M2 has complete core Science coverage. M3 currently has 19 objectives seeded across biological science and materials/chemical reactions; use only available objectives until the remaining standards are implemented.
- Link each lesson and question to its exact objective code.
- Save as draft and have a teacher review scientific accuracy, safety and suitability before publishing.
- Use the Teacher Content Library grade filter to isolate M1 materials.

## Safety notes

Use teacher supervision for laboratory demonstrations. Do not ask students to taste unknown substances or handle radioactive materials. Use safe sample data or teacher-controlled demonstrations for heat, chemical and microscope activities.

## Explicitly not done

- No Supabase migration has been applied.
- No live school, class, class-subject, teacher, student, content or assessment record has been created.
- M3 physical-science indicators in ว 2.3 and Earth-and-space indicators in ว 3.1/ว 3.2, and all M4–M6 objectives and packs, have not yet been implemented. M3 ว 2.1 is now seeded; its teacher lessons are included in the companion starter pack.
- Technology standards ว 4.1 and ว 4.2 are outside this Science batch.
- No local lint/build result is claimed; consolidated verification remains pending.

## Official source

Office of the Basic Education Commission, Ministry of Education, *Learning Standards and Indicators (Revised B.E. 2560)*, Science, pp. 21–94:  
https://www.academic.obec.go.th/images/document/1580786506_d_1.pdf


## M2–M3 biological-science staged release

A second staged batch has been committed. It seeds only the verified biological-science indicators in these grades:

| Grade | Standard | Indicators | Objectives |
|---|---|---:|---:|
| M2 | ว 1.2, ว 2.2, ว 2.3, ว 3.2 | 48 | 48 |
| M3 | ว 1.3 | 11 | 11 |
| **Total** | | **59** | **59** |

The companion teacher pack now contains 67 lesson starters and 201 practice questions with answer keys: 48 complete M2 core Science lessons, 11 M3 biological-science lessons and eight M3 materials/chemical-reaction lessons. M2 includes human body systems, reproduction, forces, work and energy, fossil fuels, Earth structure, soil, water and hazards. M3 includes genetics, biotechnology and biodiversity. Reproductive-health content requires respectful, age-appropriate delivery and referral of medical questions to qualified professionals.

### M2–M3 migrations and resources

7. `docs/learning/science/M2-M3-science-biological-teacher-starter-pack.md` — includes 48 M2 lessons and 19 M3 lessons across biological science and materials/chemical reactions, with three answer-keyed practice questions per lesson.

M2 core Science coverage is complete for its 48 official Science indicators. M3 remains partial: its ว 2.3 energy/light/electricity and ว 3.1/ว 3.2 astronomy/Earth-system indicators are still to be researched and implemented. Technology standards ว 4.1 and ว 4.2 remain outside the Science workstream.
