# E&P Learning — Science Rollout Readiness

## Current verified status — 23 November 2026

This section supersedes older historical rollout notes lower in this file. Live Supabase now contains all 415 required official P1–M6 Science and Technology core indicators in the national master and all 276 required M1–M6 core indicators in the canonical secondary catalogue. The 102 M4–M6 core indicators are grade-specific (M4 28, M5 49, M6 25). Primary, lower-secondary and upper-secondary priority totals reconcile against OBEC, including the six dual-classified exceptions. Nine legacy M3 W3.2 records remain non-required supplementary outcomes.

The four specialist tracks are separately staged: Biology 108, Chemistry 81, Physics 67 and Earth/Space 44 outcomes (300 total). The 14 secondary core/specialist import files contain 576 lessons and 1,728 answer-keyed questions (276 secondary core lessons plus 300 specialist lessons). Separate primary P1–P6 packs contain 139 lessons and 417 formative tasks. Across the full P1–M6 scope, the 415 official core indicators have 415 lesson starters and 1,245 formative tasks; the 300 additional specialist outcomes add 300 lessons and 900 questions. Total prepared content is 715 lessons and 2,145 questions. The 415 official core objective codes match the core teacher packs exactly.

The current repository has automated checks for all eight national learning-area pack sets and the consolidated Science imports. Draft PR #174's latest validation run (45102254867) passed the national curriculum pack check, all five core Science packs (415 lessons / 1,245 formative tasks), the 300 specialist Science packs, and every other subject-pack validation except Social Studies. Production build and ESLint both passed. The only failing step was the Social Studies teacher-pack parser, which belongs to Edna's subject; it is not a Science failure. GitHub marked this run cancelled after a newer push, after the validation and build/lint steps had completed. A prior completed run (45101863562) showed the same results. Live Science SQL checks independently confirm all grade totals, required-priority classifications, specialist totals and zero duplicate objective/grade alignments. Latest workflow: https://github.com/kim280-trustee/ep-core/actions/runs/45102254867

**Still intentionally deferred:** authenticated teacher preview/import, draft-save verification, student assessment, teacher review, gradebook and progress-reporting tests. These will be performed once after all curriculum source work is complete. No Science pack records have been imported or published; no school, class, student or progress data has been changed.



**Working branch:** `paul/subject-rollout`  
**Baseline:** `paul/thai-national-curriculum-foundation`  
**Scope:** Full Thai national Science and Technology learning area (P1–M6), plus separately catalogued M4–M6 specialist outcomes  
**Status:** **All 415 official P1–M6 Science and Technology core indicators are staged in the national master curriculum; the secondary canonical catalogue contains all 276 M1–M6 indicators.** Primary coverage is 139/139. Lower-secondary coverage is 174/174 (M1 52, M2 63, M3 59) in both catalogues. Primary P1–P6 priority totals match OBEC (99 Must-Know / 45 Should-Know classifications, including five dual-classified indicators). M3 has 59 required official indicators with 41 Must-Know and 18 Should-Know; nine legacy W3.2 outcomes are retained as non-required supplementary records. M4 is complete at 28/28, M5 at 49/49 and M6 at 25/25 upper-secondary core indicators. All 102 are mapped to their actual grade in both curricula. Upper-secondary priority totals now match the official OBEC summary: 85 Must-Know and 18 Should-Know classifications, including the dual-classified M6/4 indicator. The correction was M4 ว 1.2 ม.4/11, which the official page 146 classifies as Should-Know. These are grade-specific records in the OBEC source, not one shared set to be aligned to all three grades. The 300 Biology, Chemistry, Physics and Earth/Space specialist outcomes are additional curriculum content and do not replace the M4–M6 core set.

The 14 consolidated secondary Science import files contain 576 lesson starters and 1,728 answer-keyed practice questions: 174 lower-secondary core lessons, 102 upper-secondary core lessons and 300 specialist Biology/Chemistry/Physics/Earth-Space lessons. Separate primary P1–P6 teacher packs contain 139 lessons and 417 formative tasks. Across the full P1–M6 official core set, all 415 indicator codes are represented by 415 lesson starters and 1,245 formative tasks, with no missing, extra or duplicate codes. Including the 300 specialist outcomes, the complete prepared Science resource set contains 715 lessons and 2,145 questions. The nine legacy M3 W3.2 lessons remain separate supplementary material (9 lessons / 27 questions) and are excluded from the core import. These resources remain Markdown source material until an authorized teacher imports them through `/teacher/content/import`. No school, class or student records have been created.



**Database execution status:** Live Supabase was read directly on 21 November 2026. The national master has 415/415 required official indicators; the canonical secondary catalogue has 276/276 M1–M6 indicators. Both have zero duplicate required alignments and zero unclassified required rows. Primary priority labels now reconcile to 99 Must-Know and 45 Should-Know classifications (five duals). Lower-secondary M1–M3 priorities are fully reconciled; nine legacy W3.2 outcomes remain non-required supplementary records. Upper-secondary priorities reconcile to 85 Must-Know and 18 Should-Know classifications, including the dual M6/4 indicator. National totals are 308 Must-Know / 113 Should-Know classifications across 415 unique indicators, including six dual-classified indicators.

**Verified live staging reconciliation — 21 November 2026:** The national master curriculum contains 415 required official indicators: 139 primary and 276 secondary. The canonical secondary catalogue contains 276/276 M1–M6 indicators. P1 15, P2 16, P3 25, P4 21, P5 32 and P6 30 are all aligned with no unclassified primary rows. Primary priorities now reconcile to 99 Must-Know and 40 stored Should-Know rows plus five dual labels = 99/45 official priority classifications. M1 has 52 indicators (35 Must-Know, 17 Should-Know); M2 has 63 (48, 15); M3 has 59 (41, 18). Nine legacy M3 W3.2 outcomes remain preserved as non-required supplementary records. M4 has 28 indicators (19 Must-Know, 9 Should-Know), M5 has 49 (42, 7), and M6 has 25 (24, 1 plus the dual M6/4 label). Upper-secondary totals now match OBEC: 85 Must-Know / 18 Should-Know classifications. National priority labels now reconcile to 308 Must-Know and 113 Should-Know across 415 unique indicators, with six dual-classified indicators.


## Official national Science and Technology coverage

OBEC's 2021 must-know / should-know table reports these grade totals:

| Grade | Official indicators |
|---|---:|
| P1 | 15 |
| P2 | 16 |
| P3 | 25 |
| P4 | 21 |
| P5 | 32 |
| P6 | 30 |
| M1 | 52 |
| M2 | 63 |
| M3 | 59 |
| M4–M6 aggregate | 102 | Grade-specific M4, M5 and M6 indicators; see M4-M6-SCIENCE-CORE-SOURCE-AUDIT.md |
| **Total unique indicators** | **415** |

The 102 M4–M6 indicators are an aggregate across grade-specific M4, M5 and M6 source tables. Each indicator must be mapped to its actual grade, not copied across the band.

Primary priority-count checks from the OBEC 2021 summary: P4 has 16 Must-Know and 6 Should-Know classifications; P5 has 24 and 8; P6 has 20 and 11. P4 ว 2.1 ป.4/1 and P6 ว 2.1 ป.6/1 are dual-classified, so classification counts are not mutually exclusive. The read-only reconciliation query is in `SCIENCE-STAGING-VERIFICATION.sql`.


## Current implementation status

- **Primary P1–P6:** complete in live staging — 139 official indicators aligned (15, 16, 25, 21, 32, 30). All 139 have a priority classification; the five dual-classified indicators are explicitly noted.
- **Primary W1–W3:** 111 indicators complete — 10 P1, 12 P2, 20 P3, 16 P4, 27 P5, 26 P6. Corrective migrations now sequence topic and objective writes safely.
- **Primary W4.2:** 28 indicators complete — 5, 4, 5, 5, 5, 4 by grade. Corrected P4/P5/P6 priority rows are applied in live staging.
- **M1:** complete — 52/52 official indicators in both curricula; priority totals 35 Must-Know / 17 Should-Know; zero unclassified.
- **M2:** complete — 63/63 official indicators in both curricula; priority totals 48 Must-Know / 15 Should-Know; zero unclassified.
- **M3:** 59/59 official indicators aligned in both curricula, including six ว 1.1 ecosystem indicators and nine official technology indicators. Priorities reconcile to 41 Must-Know / 18 Should-Know. Nine legacy W3.2 rows are preserved separately as non-required supplementary outcomes; zero required core rows are unclassified.
- **M4–M6 core Science and Technology:** All 102 indicators are staged once each to their actual grade (M4 28, M5 49, M6 25) in both curricula. Grade mapping and coverage pass; priority totals now match the official 85 Must-Know / 18 Should-Know summary, including the dual M6/4 label.
- **M4–M6 specialist outcomes:** Biology 108, Chemistry 81, Physics 67 and Earth/Space 44 are already catalogued separately (300 total).
The `TECH` skill is part of the `SCI` subject. The 28 new P1–P6 W4.2 objectives are national Science and Technology indicators and must not be merged with the separate Click Start international Computer Studies course.

Upper-secondary source transcription and grade allocation are complete; priority reconciliation is complete; M4 ว 1.2 ม.4/11 was corrected to Should-Know using official page 146.

## Consolidated integrity review

The existing migration history, importer implementation and specialist-subject counts remain documented in `SCIENCE-MIGRATION-INTEGRITY-REVIEW.md`. The lower-secondary SCI catalogue is now mirrored into both `TH-SCI-M1-M6` and `TH-BASIC-CORE-2008-2017`, including the 30 new M1–M3 indicators. The national master curriculum is still draft; do not change its status as part of this rollout. Read-only checks are in `SCIENCE-STAGING-VERIFICATION.sql`.

**Teacher-pack import preflight — 21 November 2026:** The repository parser rules were exercised against the two consolidated core packs: M1–M3 produced 174 lessons / 522 answer-keyed questions; M4–M6 produced 102 lessons / 306 answer-keyed questions. Both had zero parser failures and zero duplicate objective codes. A read-only live Supabase reconciliation then checked all 276 M1–M6 pack objective codes against both `TH-SCI-M1-M6` and `TH-BASIC-CORE-2008-2017`: 276 unique objective matches and 276 exact grade alignments per curriculum, with zero missing, ambiguous or wrong-grade mappings. This is source/parser and database preflight validation, not an authenticated browser import. The importer now explicitly blocks grade-coded lessons when the selected curriculum does not contain that grade, and its import-ready state waits for grade-level data to finish loading.

**Still open:** An authenticated teacher must exercise the actual `/teacher/content/import` preview and draft-save flow for all primary, secondary-core and specialist packs in the browser. Do not publish the imported drafts. Production build and ESLint have passed in CI; local `npm.cmd run build` and `npm.cmd run lint` have not been run in this Windows checkout. The overall curriculum workflow remains red only because Edna's Social Studies pack validator fails. App-wide end-to-end testing also remains open.

## Content and authoring boundary

The existing app scopes authored content and question records to a real organization and an authenticated teacher account. Global curriculum objectives can be seeded safely by migrations, but `learning_content_items`, `learning_questions` and their version records require a valid `created_by` user and organization membership. The generic bulk importer uses the authenticated client and existing RLS policies, creates unpublished lesson and short-answer question drafts, and leaves them in the normal review lifecycle. It does not invent a system user, borrow a teacher identity, or create pilot school/class/student records.

## Migrations

1. `20261116080000_learning_science_curriculum_catalog.sql` — adds the SCI subject, Thai Science curriculum, M1–M6 grade levels and curriculum-subject link.
2. `20261116081500_learning_science_m1_knowledge_graph.sql` — adds five Science skills, 17 topics, 43 M1 objectives and official curriculum-grade alignments.
3. `20261116083000_learning_science_m2_m3_biology_knowledge_graph.sql` — adds 17 M2 and 11 M3 biological-science objectives.
4. `20261116084500_learning_science_m2_physical_science_knowledge_graph.sql` — adds 15 M2 force objectives and six M2 work/energy objectives.
5. `20261116090000_learning_science_m2_earth_space_knowledge_graph.sql` — adds ten M2 Earth and Space Science objectives.\n6. `20261116091500_learning_science_m3_matter_chemistry_knowledge_graph.sql` — adds eight M3 materials and chemical-reaction objectives.\n7. `20261116093000_learning_science_m3_energy_earth_space_knowledge_graph.sql` — adds 21 M3 energy/light, four astronomy and seven initial Earth-system objectives; the later greenhouse-effect migration adds two more.\n8. `20261116100000_learning_science_upper_secondary_subject_tracks.sql` — adds upper-secondary Biology, Chemistry, Physics and Earth/Space subject catalogue entries.\n9. `20261116101500_learning_biology_m4_cellular_foundations.sql` — adds 17 M4 Biology additional-study outcomes in strand 1.\n10. `20261116103000_learning_biology_m4_genetics_evolution.sql` — adds 15 M4 Biology additional-study outcomes in strand 2 (Mendelian genetics, DNA, mutation, DNA technology and evolution).\n11. `20261116104500_learning_biology_m5_plant_structure_function.sql` — adds 18 M5 Biology outcomes in strand 3 (plant tissues, transport, photosynthesis, reproduction and responses).\n12. `20261116110000_learning_biology_m5_animal_physiology.sql` — adds 21 M5 Biology outcomes in strand 4 (digestion, gas exchange, circulation, blood, immunity and excretion).\n13. `20261116111500_learning_biology_m6_animal_physiology.sql` — adds 19 M6 Biology outcomes in strand 4 (nervous coordination, sensory systems, movement, reproduction, hormones and behaviour).\n14. `20261116113000_learning_biology_m6_ecology_biodiversity.sql` — adds 13 M6 Biology outcomes in strand 5 (ecosystem energy, nutrient cycles, biomes, succession, population ecology and environmental sustainability).\n15. `20261116114500_learning_chemistry_m4_atomic_structure_bonding.sql` — adds 21 M4 Chemistry outcomes in strand 1 (atomic structure, periodicity, radioactivity and chemical bonding).\n16. `20261116120000_learning_chemistry_m4_reactions_stoichiometry.sql` — adds 7 M4 Chemistry outcomes in strand 2 (chemical equations, stoichiometry, limiting reactants and percentage yield).\n17. `20261116121500_learning_chemistry_m5_kinetics_equilibrium.sql` — adds M5 Chemistry outcomes 1–13 in strand 2 (reaction rates, collision theory, dynamic equilibrium, equilibrium calculations and applications).\n18. `20261116123000_learning_chemistry_m5_acids_bases_redox_electrochemistry.sql` — adds M5 Chemistry strand 2 outcomes 14–32 (acid–base chemistry, redox reactions and electrochemical cells).
19. `20261116124500_learning_chemistry_m5_gas_laws.sql` — adds M5 Chemistry strand 1 outcomes 1–6 (gas laws, ideal gases, partial pressures, diffusion and applications).
20. `20261116130000_learning_chemistry_m6_organic_polymers.sql` — adds M6 Chemistry strand 1 outcomes 1–15 (organic structures, functional groups, nomenclature, reactions and polymers).
21. `20261116131500_learning_biology_m6_biodiversity_taxonomy.sql` — adds M6 Biology strand 2 outcomes 1–5 (biodiversity, origin of early cells, organism groups, taxonomy and dichotomous keys).\n22. `20261118200000_classify_science_m1_m2_obec_priority.sql` — applies OBEC 2021 must-know / should-know labels to all 43 M1 and 48 M2 core Science indicators.\n23. `20261118201000_classify_science_m3_biology_matter_obec_priority.sql` — applies OBEC 2021 priority labels to the 11 M3 biological and eight M3 materials indicators.\n24. `20261118202000_classify_science_m3_energy_obec_priority.sql` — applies OBEC 2021 priority labels to all 21 M3 energy, electricity, waves and light indicators.\n25. `20261118203000_add_science_m3_greenhouse_effect_indicators.sql` — adds the two missing M3 greenhouse-effect indicators, ว 3.2 ม.3/8–9, with aligned curriculum objectives.\n26. `20261118204000_classify_science_m3_astronomy_obec_priority.sql` — applies OBEC 2021 priority labels to the four M3 astronomy/space indicators.

Apply these after the existing pending academic foundation and Maths migrations, in timestamp order. The seeds are idempotent upserts and require the active Thai Basic Education system.

## Teacher workflow

The existing generic Teacher Content Create, Teacher Content Library and Question Bank workflows support the new subject and curriculum dimensions. No Science-only authoring module is needed.

After migrations are applied:
- Select `TH-SCI-M1-M6`, the matching grade and subject `SCI` for M1–M3 core Science. For M4–M6, select the relevant specialist subject (`BIOLOGY`, `CHEMISTRY`, `PHYSICS` or `EARTH_SPACE`) and matching upper-secondary grade.
- M2 has 48 currently catalogued W1–W3 objectives; six W2.1 indicators and nine W4 indicators remain. M3 has 53 currently catalogued records, but these require official code reconciliation before they can be counted as complete.
- Link each lesson and question to its exact objective code.
- Save as draft and have a teacher review scientific accuracy, safety and suitability before publishing.
- Use the Teacher Content Library grade filter to isolate M1 materials.

## Safety notes

Use teacher supervision for laboratory demonstrations. Do not ask students to taste unknown substances or handle radioactive materials. Use safe sample data or teacher-controlled demonstrations for heat, chemical and microscope activities.

## Explicitly not done

- No app-wide lint/build or end-to-end tests have been run; those remain deferred until the curriculum rollout is complete.
- No live school, class, class-subject, teacher, student, content or assessment record has been created.
- M1–M3 knowledge graphs contain 144 existing SCI objectives (43 M1, 48 M2, 53 M3); this is not the complete official national-core total because the technology standards and identified strand gaps remain open. Upper-secondary specialist tracks are separately catalogued: Biology 108 outcomes, Chemistry 81, Physics 67, and Earth/Space 44.\n- M1 and M2 W1–W3 OBEC priority classifications are present; M3 priority classification is only partially reconciled. The 2021 must/should table must be checked independently from the 2017 core-standard wording. No live migrations have been applied.
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

The M2–M3 companion pack contains 67 lesson starters and 201 practice questions with answer keys: 48 M2 lessons and 19 M3 lessons covering ว 1.3 and ว 2.1. The M3 energy/Earth-space pack adds 32 lessons and 96 questions. Together, the M2–M3 packs contain 99 lessons and 297 answer-keyed questions. M2 includes human body systems, reproduction, forces, work and energy, fossil fuels, Earth structure, soil, water and hazards. M3 includes genetics, biotechnology and biodiversity. Reproductive-health content requires respectful, age-appropriate delivery and referral of medical questions to qualified professionals.

### M2–M3 migrations and resources

8. `docs/learning/science/M2-M3-science-biological-teacher-starter-pack.md` — includes 48 M2 lessons and 19 M3 lessons across biological science and materials/chemical reactions, with three answer-keyed practice questions per lesson.\n9. `docs/learning/science/M3-science-energy-earth-space-teacher-starter-pack.md` — includes 32 M3 lessons across electricity, light, astronomy, rocks, weather and natural hazards, with three answer-keyed practice questions per lesson.

M2 core Science coverage is complete for its 48 official Science indicators. M3 core Science is complete. The remaining Science rollout is M4–M6; Technology standards ว 4.1 and ว 4.2 remain outside this subject. Technology standards ว 4.1 and ว 4.2 remain outside the Science workstream.


## Upper-secondary staged release — M4 Biology

The official 2017 revised curriculum uses additional learning outcomes for upper-secondary specialist Science, rather than the M1–M3 basic-course indicator model. A catalogue migration adds four distinct subject tracks: Biology, Chemistry, Physics, and Earth, Astronomy and Space Science. The first knowledge-graph batch seeds the 17 M4 Biology outcomes in additional Biology strand 1 (nature of life, scientific method, biomolecules, enzymes, microscopy, cell structure and transport, cell division and cellular respiration).

The M4 Biology starter pack contains 17 lesson starters and 51 practice questions with answer keys. These are teacher planning resources, not published app content. Source: OBEC/IPST 2017 revised curriculum, Additional Biology, pp. 134–139.
\n\n## Upper-secondary staged release — M4 Biology strand 2\n\nThe second M4 Biology batch seeds all 15 outcomes in additional Biology strand 2: Mendelian inheritance, extended inheritance patterns, variation, chromosome-linked genes, DNA replication, protein synthesis, mutation, recombinant-DNA technology, bioethical applications, evolutionary evidence, Lamarck/Darwin, Hardy-Weinberg population genetics and speciation. The companion teacher pack contains 15 lesson starters and 45 practice questions with answer keys. Official alignment: OBEC/IPST 2017 revised curriculum, Additional Biology strand 2, M4 learning outcomes 1–15, pp. 139–140.\n\n\n## Upper-secondary staged release — M5 Biology strand 3\n\nThe third Biology batch seeds 18 official M5 outcomes in additional Biology strand 3. The official curriculum lists no M4 outcomes for this strand; the migration therefore aligns all 18 objectives to grade M5. Coverage includes plant tissues and organs, gas exchange, transpiration, xylem/phloem transport, mineral nutrition, photosynthesis (C3/C4/CAM), flowering-plant reproduction, seeds, plant hormones and responses. The teacher starter pack contains 18 lesson starters and 54 practice questions with answer keys. Official alignment: OBEC/IPST 2017 revised curriculum, Additional Biology strand 3, M5 learning outcomes 1–18, pp. 110–111.\n

## Upper-secondary staged release — M5 Biology strand 4

The fourth Biology batch seeds all 21 official M5 learning outcomes in additional Biology strand 4. The official curriculum lists no M4 outcomes for this strand, so the migration aligns each objective to M5. Coverage includes comparative digestion, feeding in Hydra and Planaria, human digestion, animal gas exchange, mammalian lungs, ventilation, circulation, blood components and compatibility, lymph, immunity, excretion and kidney function. The teacher starter pack contains 21 lesson starters and 63 practice questions with answer keys. Safety controls prohibit student blood collection or typing, animal dissection, pathogen exposure and animal experimentation; use diagrams, prepared observations, simulations and supplied data. Official alignment: OBEC/IPST 2017 revised curriculum, Additional Biology strand 4, M5 learning outcomes 1–21.


## Upper-secondary staged release — M6 Biology strand 4

The fifth Biology batch seeds all 19 official M6 learning outcomes in additional Biology strand 4. These continue the M5 organ-system outcomes and cover comparative nervous systems, neuron structure and nerve impulses, central/peripheral and somatic/autonomic systems, brain and sensory organs, movement in animals and humans, animal and human reproduction, embryonic development, endocrine hormones, behaviour and animal communication. The migration aligns all objectives to M6. The companion teacher pack contains 19 lesson starters and 57 practice questions with answer keys. Sensory activities are designed to be optional and safe; reproductive-health material is factual, respectful and age appropriate. Official alignment: OBEC 2017 revised curriculum, Additional Biology strand 4, M6 learning outcomes 1–19, pp. 113–114.
\n\n## Upper-secondary staged release — M6 Biology strand 5\n\nThe sixth Biology batch seeds all 13 official M6 learning outcomes in additional Biology strand 5 (Ecology). Coverage includes energy transfer, biomagnification, nitrogen/sulfur/phosphorus cycles, biomes, succession, population characteristics and growth, water and air pollution, soil resources, deforestation and wildlife conservation. The companion teacher pack contains 13 lesson starters and 39 practice questions with answer keys. The official curriculum lists no M4 or M5 outcomes for this strand; all 13 are aligned to M6. Official alignment: OBEC 2017 revised curriculum, Additional Biology strand 5, M6 learning outcomes 1–13, pp. 105–106.\n\n\n## Upper-secondary staged release — M4 Chemistry strand 1\n\nThe first Chemistry batch seeds all 21 official M4 learning outcomes in additional Chemistry strand 1. Coverage includes atomic models, nuclear notation and isotopes, electron configurations, periodic trends, transition metals, radioactivity, ionic and covalent bonding, molecular geometry, intermolecular forces, network covalent solids and metallic bonding. The companion teacher pack contains 21 lesson starters and 63 practice questions with answer keys. Official alignment: OBEC 2017 revised curriculum, Additional Chemistry strand 1, M4 learning outcomes 1–21, p. 106.\n\n\n## Upper-secondary staged release — M4 Chemistry strand 2\n\nThe second Chemistry batch seeds all 7 official M4 outcomes in Chemistry strand 2: interpreting and balancing equations, mass/solution/gas stoichiometry, multistep reactions, limiting reactants and percentage yield. The companion teacher pack contains 7 lesson starters and 21 practice questions with answer keys. Official alignment: OBEC revised curriculum B.E. 2560 (2017), Chemistry strand 2, M4 outcomes 1–7, p. 118.\n\n\n## Upper-secondary staged release — M5 Chemistry strand 2 (outcomes 1–13)\n\nThis batch seeds 13 official M5 Chemistry outcomes covering reaction-rate measurement, collision theory, factors affecting rate, reversible reactions, dynamic equilibrium, equilibrium calculations, Le Chatelier principle and applications. The companion teacher pack contains 13 lesson starters and 39 practice questions with answer keys. Official alignment: OBEC revised curriculum B.E. 2560 (2017), Additional Chemistry strand 2, M5 outcomes 1–13, pp. 118–119. M5 Chemistry strand 2 outcomes 1–32 are now seeded.\n\n\n## Upper-secondary staged release — M5 Chemistry strand 2 (outcomes 14–32)\n\nThis batch seeds 19 official M5 outcomes covering Arrhenius/Brønsted–Lowry/Lewis acid–base theories, conjugate pairs, acid/base strength, pH, neutralisation, salt hydrolysis, titration, buffers, redox chemistry and electrochemical cells. The companion teacher pack contains 19 lesson starters and 57 answer-keyed practice questions. Official alignment: OBEC revised curriculum B.E. 2560 (2017), Chemistry strand 2, M5 outcomes 14–32, pp. 118–119. M5 Chemistry strand 2 outcomes 1–32 are now seeded.\n

## Upper-secondary staged release — M5 Chemistry strand 1 gas laws

The next Chemistry batch seeds all six official M5 learning outcomes in additional Chemistry strand 1 for gas properties. Coverage includes Boyle, Charles and Gay-Lussac laws, the combined gas law, Avogadro and ideal gas laws, Dalton partial pressures, kinetic molecular theory, Graham's law of diffusion and applications. The companion teacher starter pack contains six lesson starters and 18 practice questions with answer keys. Safety guidance prioritises simulations, worked datasets and teacher-controlled demonstrations; pressurised equipment and sealed gas-generating setups require approved risk controls. Official alignment: OBEC revised curriculum B.E. 2560 (2017), Additional Chemistry strand 1, M5 learning outcomes 1–6, p. 117.


## Upper-secondary staged release — M6 Chemistry strand 1 organic compounds and polymers

This Chemistry batch seeds all 15 official M6 learning outcomes in additional Chemistry strand 1. Coverage includes organic compounds in everyday life, Lewis/condensed/skeletal representations, functional groups, IUPAC naming, structural isomerism, boiling point and solubility, hydrocarbon reactions, esterification, amide synthesis, hydrolysis, saponification, polymerisation, polymer structure and properties, plastics/rubber identification, polymer modification and environmental impacts. The companion teacher starter pack contains 15 lesson starters and 45 answer-keyed practice questions. Practical work is restricted to teacher-approved, risk-assessed demonstrations or supplied data; students must not taste chemicals or directly smell reaction mixtures. Official alignment: OBEC revised curriculum B.E. 2560 (2017), Additional Chemistry strand 1, M6 learning outcomes 1–15, p. 117.


## Upper-secondary staged release — M6 Biology biodiversity and taxonomy

This batch adds the five M6 learning outcomes in Additional Biology strand 2: the importance and levels of biodiversity; scientific hypotheses and evidence concerning early cells and unicellular life; characteristics of bacteria, protists, plants, fungi and animals; taxonomic hierarchy and binomial nomenclature; and construction of dichotomous identification keys. The companion teacher pack contains five lesson starters and 15 answer-keyed practice questions. The outcomes are aligned to M6 in the Thai Science curriculum. Official source: OBEC/IPST revised curriculum B.E. 2560 (2017), Biology additional-learning outcomes; cross-checked against the official curriculum manual published by IPST.


## Upper-secondary Physics curriculum audit

The official IPST Physics curriculum page confirms 67 additional-study learning outcomes across four connected content groups. A separate audit document, `docs/learning/science/PHYSICS-CURRICULUM-AUDIT.md`, records the official group scopes and implementation controls. The groups are content domains, not grade allocations; selected official crosswalk examples place Group 1 outcomes in M4, Group 2 in M5 and Group 3 in M6. Physics is being seeded in verified stages after grade-level extraction. All 17 M4 outcomes (1–17) are committed; the remaining outcomes still require full official grade-allocation audit.


## Upper-secondary staged release — M4 Physics outcomes 8–9

The first verified Physics batch adds two M4 additional-learning outcomes: (8) mechanical equilibrium, moments, couples, free-body diagrams and three-force equilibrium; and (9) centre of mass, centre of gravity and stability. The migration adds two objectives with official M4 alignments. The teacher starter pack contains two lesson starters and six answer-keyed practice questions. The official national Physics curriculum contains 67 outcomes in total; this batch does not claim full M4 or Physics completion. Remaining outcomes must be checked against the grade-labelled IPST manual before seeding. Official alignment: IPST Physics curriculum-use manual, printed pp. 108–110.


## Upper-secondary staged release — M4 Physics work and energy

The second verified Physics batch seeds M4 additional-learning outcomes 11–12: work and the work-energy relationship; kinetic, gravitational and elastic potential energy; and conservation of mechanical energy. The migration adds two objectives with official M4 alignments. The companion teacher starter pack contains two lesson starters and six answer-keyed practice questions. Combined with the first M4 Physics batch, four verified M4 outcomes (8, 9, 11 and 12), four lesson starters and 12 answer-keyed practice questions are now committed. Official alignment: IPST Physics curriculum-use manual, printed pp. 113 and 115. The remaining 63 national outcomes still require full grade-allocation audit and staged implementation.


## Upper-secondary staged release — M4 Physics momentum and collisions

The third verified Physics batch seeds M4 additional-learning outcomes 14–15: momentum and impulse, including force–time graph area; and one-dimensional elastic/inelastic collisions and separation using conservation of momentum. The migration adds two objectives with official M4 alignments. The companion teacher starter pack contains two lesson starters and six answer-keyed practice questions. Together, the three Physics batches now cover six verified M4 outcomes (8, 9, 11, 12, 14 and 15), six lesson starters and 18 answer-keyed questions. Official alignment: IPST Physics curriculum-use manual, printed pp. 118–120. The national 67-outcome Physics audit remains in progress; no live Supabase migration has been applied.


## Upper-secondary staged release — M4 Physics outcomes 16–17

The fourth verified Physics batch seeds M4 additional-learning outcomes 16–17: projectile motion, including independent horizontal and vertical components; and uniform circular motion, centripetal force, angular/linear speed and satellite-orbit applications. The migration adds two objectives with M4 alignments. The companion teacher starter pack contains two lesson starters and six answer-keyed questions. Physics now has eight verified M4 outcomes (8, 9, 11, 12, 14, 15, 16 and 17), eight lesson starters and 24 answer-keyed questions. The official IPST comparison crosswalk maps Group 1 outcomes 16–17 to M4. The national 67-outcome Physics audit remains in progress; no live Supabase migration has been applied.


## Upper-secondary staged release — M4 Physics outcome 13

The fifth verified Physics batch seeds M4 additional-learning outcome 13: operation, efficiency and mechanical advantage of selected simple machines, including levers, pulleys, inclined planes, wedges, screws and wheel-and-axle systems. The migration adds one objective with an M4 alignment. The companion teacher starter pack contains one lesson starter and three answer-keyed questions. Physics now has nine verified M4 outcomes (8, 9, 11, 12, 13, 14, 15, 16 and 17), nine lesson starters and 27 answer-keyed questions. Outcomes 1–7 and 10 remain subject to official grade verification. The national 67-outcome Physics audit remains in progress; no live Supabase migration has been applied.


## Upper-secondary staged release — M4 Physics outcome 10

This batch adds verified M4 additional-learning outcome 10: work done by a constant force, work calculated from a force–displacement graph and average power. The migration adds one objective with an official M4 alignment. The companion teacher starter pack contains one lesson starter and three answer-keyed questions. Physics now has ten verified M4 outcomes seeded (8–17, excluding 1–7), ten lesson starters and 30 answer-keyed questions. Official alignment: IPST Physics curriculum-use manual, printed p. 112. Outcomes 1–7 and the remaining M5–M6 Physics allocation are still under audit. Historical note: an earlier rollout log recorded the migrations as applied; the current live database state has not been independently verified in this readiness record.


## Upper-secondary staged release — M4 Physics outcomes 1–7

This batch adds all seven remaining M4 additional Physics outcomes: foundations/history of physics; measurement and uncertainty; uniformly accelerated straight-line motion; resultant forces; Newton laws and free-body diagrams; universal gravitation and gravitational fields; and friction. The migration adds seven objectives with official M4 alignments. The companion teacher starter pack contains seven lesson starters and 21 answer-keyed questions. M4 Physics is now complete at 17 of 17 official outcomes, with 17 lesson starters and 51 questions. Official alignment: IPST Physics curriculum-use manual, M4 outcomes 1–7, printed pp. 17–20. The remaining Physics scope is M5–M6; no live Supabase migration has been applied.


## Upper-secondary staged release — M5 Physics outcomes 1–3

The first M5 Physics batch adds three verified additional-learning outcomes: simple harmonic motion of spring-mass systems and simple pendulums; natural frequency and resonance; and wave motion, wave properties, Huygens principle and superposition. Three migrations add three objectives with official M5 alignments. The companion teacher starter packs contain three lesson starters and nine answer-keyed questions. M4 Physics remains complete at 17 of 17 outcomes; M5 now has three verified outcomes. Official alignment: IPST Physics curriculum-use manual, printed pp. 128–130. Remaining M5 and M6 allocations are still under audit. Historical note: an earlier rollout log recorded the migrations as applied; the current live database state has not been independently verified in this readiness record.


## Upper-secondary staged release — M5 Physics sound outcomes 6–7

Two additional M5 Physics outcomes are now seeded: outcome 6 (sound intensity, sound level, hearing, sound quality and noise pollution) and outcome 7 (air-column resonance, beats, standing waves, Doppler effect and shock waves). The migration adds two M5-aligned objectives; the teacher pack contains two lesson starters and six answer-keyed questions. M5 Physics now has five verified seeded outcomes (1, 2, 3, 6 and 7), with M5 outcomes 4–5 and 8–12 and all M6 allocations still to be audited. Official alignment: IPST Physics curriculum-use manual, printed pp. 136 and 138. Historical note: an earlier rollout log recorded the migrations as applied; the current live database state has not been independently verified in this readiness record.


## Upper-secondary staged release — M5 Physics light outcomes 8 and 12

Two additional M5 Physics outcomes are now seeded: outcome 8 (light interference and diffraction using double slits, gratings and single slits) and outcome 12 (rainbows, halos, mirages and sky colours). The migration adds two M5-aligned objectives; the teacher pack contains two lesson starters and six answer-keyed questions. M5 Physics now has seven verified seeded outcomes (1, 2, 3, 6, 7, 8 and 12). Outcomes 4–5 and 9–11 remain under official-source audit; M6 is pending. Official alignment: IPST Physics curriculum-use manual, printed pp. 141 and 147. Historical note: an earlier rollout log recorded the migrations as applied; the current live database state has not been independently verified in this readiness record.


## M5 Physics staged release — geometrical optics outcomes 9–11

Three additional M5 Physics objectives are now staged: outcome 9 (reflection and mirrors), outcome 10 (refraction, apparent depth and total internal reflection), and outcome 11 (thin lenses and image formation). The migration adds three lesson objectives; the companion pack contains three lesson starters and nine answer-keyed questions. Official alignment is confirmed in the IPST Physics curriculum-use manual, printed pp. 142–146. M5 Physics now has 10 verified outcomes seeded (1, 2, 3, 6, 7, 8, 9, 10, 11 and 12), with 10 lesson starters for those objectives and 30 answer-keyed questions across the M5 packs. Outcomes 4–5 remain to be verified. No migration has been applied to Supabase.


## M5 Physics staged release — outcomes 4–5

Two additional M5 Physics objectives are now staged: outcome 4 (surface-water-wave reflection, refraction, interference and diffraction) and outcome 5 (sound production/propagation, pressure and displacement waves, and sound speed versus air temperature). The migration adds two objectives; the teacher pack contains two lesson starters and six answer-keyed questions. Together with the previously committed M5 objectives, outcomes 1–12 are now represented: 12 objectives, 12 lesson starters and 36 answer-keyed questions. The M5 Physics numbered outcome set is complete at this stage. M6 Physics and remaining Biology/Chemistry/Earth-Space coverage remain subject to official grade-by-grade audit. Historical note: an earlier rollout log recorded the migrations as applied; the current live database state has not been independently verified in this readiness record.


## M6 Physics staged release — verified outcomes 2, 3 and 6

Three M6 Physics outcomes have been verified against the official IPST manual's printed grade-labelled pages and staged: outcome 2 (magnetic forces), outcome 3 (galvanometers and DC motors), and outcome 6 (three-phase AC generators and transformers). The migration adds three curriculum objectives and alignments; the companion pack provides three lesson starters and nine answer-keyed questions. Official manual printed pages: 171, 173 and 177. M6 outcomes 1, 4, 5 and 7 onward remain under audit. No migration has been applied to Supabase.


## M6 Physics staged release — electricity outcomes 1, 4 and 5

This batch adds M6 Physics outcome 1 (magnetic fields and magnetic flux), outcome 4 (electromagnetic induction, Faraday's law and Lenz's law), and outcome 5 (alternating-current RMS voltage and current). The official IPST comparison crosswalk confirms the M6 allocation for Group 3 outcome 1; the grade-labelled curriculum-use manual identifies outcomes 4 and 5 on printed pages 174 and 176. The migration adds three objectives and M6 alignments. The companion teacher pack contains three lesson starters and nine answer-keyed questions.

Migration: `20261116171500_learning_physics_m6_magnetic_fields_induction_ac.sql`. Teacher pack: `M6-physics-magnetic-fields-induction-ac-teacher-starter-pack.md`.

M6 Physics now has six verified outcomes staged (1–6), six lesson starters and 18 answer-keyed questions across two packs. Outcomes 7 onward and the remaining Physics content groups still require official grade-by-grade verification. Historical note: an earlier rollout log recorded the migrations as applied; the current live database state has not been independently verified in this readiness record.


## M6 Physics staged release — electromagnetic-wave outcomes 7–8

This batch adds M6 Physics outcome 7 (electromagnetic waves, spectrum, polarisation and polaroid applications) and outcome 8 (communication using electromagnetic waves and analogue/digital signal comparison). Both are explicitly labelled M6 in the official IPST Physics curriculum-use manual, printed pages 178–179. The migration adds two objectives and M6 alignments; the companion teacher pack contains two lesson starters and six answer-keyed questions.

Migration: `20261116173000_learning_physics_m6_electromagnetic_waves_communication.sql`. Teacher pack: `M6-physics-electromagnetic-waves-communication-teacher-starter-pack.md`.

M6 Physics outcomes 1–8 are now staged: eight objectives, eight lesson starters and 24 answer-keyed questions across three teacher packs. Outcomes beyond 8 and the remaining Physics content groups still require official grade-by-grade verification. Historical note: an earlier rollout log recorded the migrations as applied; the current live database state has not been independently verified in this readiness record.


## M6 Physics staged release — Group 4 outcomes 1–9

The official IPST Physics curriculum-use manual explicitly lists M6 Group 4 outcomes 1–9 on printed pages 37–43. The staged batch covers heat and phase change; elasticity; fluid pressure and buoyancy; surface tension and viscosity; ideal-fluid flow and Bernoulli; ideal-gas laws; kinetic theory; and the first law of thermodynamics.

Migration: `20261116174500_learning_physics_m6_thermal_fluids_gases_outcomes_1_9.sql`. Teacher pack: `M6-physics-thermal-fluids-gases-teacher-starter-pack.md`.

This adds nine objectives, nine lesson starters and 27 answer-keyed questions. M6 Physics now has eight Group 3 outcomes and nine Group 4 outcomes staged, with the Group 4 M6 sequence 1–9 verified. Remaining outcome allocations and the rest of the 67-outcome Physics curriculum still require auditing. Historical note: an earlier rollout log recorded the migrations as applied; the current live database state has not been independently verified in this readiness record.



## M6 Physics staged release — Group 4 modern/atomic/nuclear outcomes 10–14, 16–17

The next M6 Physics batch stages seven verified Group 4 outcomes: Planck's hypothesis and the Bohr atom (10), photoelectric effect (11), wave-particle duality and de Broglie wavelength (12), radioactivity and radiation types (13), activity and half-life (14), nuclear reactions/fission/fusion (16), and nuclear-energy/radiation applications and protection (17). The companion teacher pack contains seven lesson starters and 21 answer-keyed questions. Safety controls prohibit student handling or use of radioactive sources; lessons use simulations and teacher-provided datasets.

Migration: `20261116180000_learning_physics_m6_modern_atomic_nuclear_outcomes_10_14_16_17.sql`. Teacher pack: `M6-physics-modern-atomic-nuclear-teacher-starter-pack.md`.

**Important grade allocation:** the official IPST comparison crosswalk allocates Group 4 outcomes 15 (nuclear forces, stability and binding energy) and 18 (particle physics and the Standard Model) to M5, not M6. They have not been incorrectly aligned to M6 and remain to be staged under M5 after source reconciliation. M6 Group 4 now contains 16 verified outcomes (1–14, 16–17), 16 lesson starters and 48 answer-keyed questions. Combined staged Physics totals: M4 17, M5 12, M6 Group 3 8, and M6 Group 4 16 = **53 objectives, 53 lesson starters and 159 answer-keyed questions**. An earlier rollout log recorded these migrations as applied; the current live database state has not been independently verified in this readiness record.


## M5 Physics staged release — Group 4 outcomes 15 and 18

Two Group 4 outcomes are now staged under M5, not M6, in accordance with the official IPST comparison crosswalk: outcome 15 (nuclear forces, nuclear stability and binding energy) and outcome 18 (particle-physics research, the Standard Model and applications). The migration adds two M5 objectives; the teacher pack contains two lesson starters and six answer-keyed questions.

Migration: `20261116181500_learning_physics_m5_group4_outcomes_15_18.sql`. Teacher pack: `M5-physics-nuclear-structure-particle-physics-teacher-starter-pack.md`.

Updated staged Physics totals: M4 17, M5 14 (outcomes 1–12, 15 and 18), M6 Group 3 8, and M6 Group 4 16 = **55 objectives, 55 lesson starters and 165 answer-keyed questions**. Group 4 M5 outcomes 15 and 18 are explicitly excluded from M6. Historical note: an earlier rollout log recorded the migrations as applied; the current live database state has not been independently verified in this readiness record.


## Physics curriculum completion — all 67 official outcomes staged

The final Physics batch adds M5 Group 3 outcomes 1–11 (electrostatics and DC electricity) and M5 Group 2 outcome 13 (colour vision). The official IPST manual labels the Group 3 M5 sequence separately from the M6 Group 3 sequence, which restarts at outcome 1. M5 Group 2 outcome 13 is also explicitly listed in the manual.

Migration: `20261116183000_learning_physics_m5_electricity_and_colour_outcomes.sql`. Teacher pack: `M5-physics-electrostatics-dc-electricity-colour-vision-teacher-starter-pack.md`.

**Physics is now complete at 67/67 national outcomes:** M4 Group 1 (17); M5 Group 2 (13), Group 3 (11), Group 4 (15 and 18); M6 Group 3 (8); M6 Group 4 (1–14, 16–17). Each outcome has one lesson starter and three answer-keyed questions: 67 objectives, 67 lesson starters and 201 questions. All migrations remain pending and unapplied to live Supabase. This completes the Physics track only; the remaining Science subjects and rollout-readiness checks are still separate work.


## Biology curriculum audit — complete (108/108)

The new `BIOLOGY-CURRICULUM-AUDIT.md` reconciles all staged Biology objectives against the official IPST upper-secondary additional Biology curriculum-use manual. The grade/strand register confirms M4 32 (Strands 1 and 2), M5 39 (Strands 3 and 4), and M6 37 (Strands 2, 4 and 5): **108/108 official outcomes**. The seven existing Biology teacher packs contain 108 lesson starters and 324 answer-keyed questions. Outcome numbering is grade- and strand-specific; M4 and M6 Strand 2 and M5 and M6 Strand 4 are separate sequences. The manual does not assign Biology outcomes to M4 Strands 3–5 or M5 Strand 5, so these are not missing outcomes.

No new Biology seed migration was needed: all 108 outcomes were already staged in the existing seven migrations. An earlier rollout log recorded the Science catalogue as applied; the current live database state has not been independently verified in this readiness record. Next subject audit: complete M6 Chemistry and Earth/Space allocation verification before any further seeding.


## Chemistry curriculum audit — complete (81/81)

The new `CHEMISTRY-CURRICULUM-AUDIT.md` reconciles all staged Chemistry objectives against the official IPST upper-secondary additional Chemistry curriculum-use manual. The grade/strand register confirms M4 28 (Strand 1 outcomes 1–21; Strand 2 outcomes 1–7), M5 38 (Strand 1 outcomes 1–6; Strand 2 outcomes 1–32), and M6 15 (Strand 1 outcomes 1–15): **81/81 official outcomes**. The six existing Chemistry teacher packs contain 81 lesson starters and 243 answer-keyed questions. No additional M6 Strand 2 outcome sequence is allocated in the official tables; no outcomes have been moved across grades to fill an empty strand/grade combination.

No new Chemistry seed migration was needed: all 81 outcomes were already staged in the existing six migrations. An earlier rollout log recorded the Science catalogue as applied; the current live database state has not been independently verified in this readiness record. Earth/Space remains the next additional-science subject track to audit and complete.


## Earth, Astronomy and Space — M5 weather and climate batch

M5 standard 2 outcomes 1–13 are now staged in `20261116184500_learning_earth_space_m5_atmosphere_oceans_climate.sql`. The accompanying `M5-earth-space-weather-atmosphere-oceans-climate-teacher-starter-pack.md` provides 13 lesson starters and 39 answer-keyed questions. The grade allocation and sequence are verified against the official IPST curriculum-use manual, printed pp. 21–24. Outcomes 8–11 are atmospheric stability/clouds, weather fronts, climate-change drivers/evidence, and climate-change impacts/mitigation; outcomes 12–13 cover weather-map interpretation and weather analysis/forecasting.

The full Earth/Space audit is in `EARTH-SPACE-CURRICULUM-AUDIT.md`. This does not mark the subject complete: M4 Earth-science and M6 astronomy/space outcomes still require exact grade/outcome verification. An earlier rollout log recorded these catalogue migrations as applied; the current live database state has not been independently verified in this readiness record.


### Earth, Astronomy and Space — M6 astronomy batch

The official IPST manual crosswalk (printed pp. 31–32) explicitly assigns the astronomy sequence to M6. Outcomes 1–19 are staged in `20261116190000_learning_earth_space_m6_astronomy_space.sql`. The companion `M6-earth-space-astronomy-space-teacher-starter-pack.md` contains 19 lesson starters and 57 answer-keyed questions. The complete Earth/Space audit is in `EARTH-SPACE-CURRICULUM-AUDIT.md`.

Historical checkpoint: M5 atmosphere/oceans/weather/climate 13 outcomes and M6 astronomy/space 19 outcomes were staged first (32 outcomes, 32 starters and 96 questions). The subsequent M4 geology batch completed the subject; see the Earth/Space completion section below. An earlier rollout log recorded these catalogue migrations as applied; the current live database state has not been independently verified in this readiness record.


## Upper-secondary Earth, Astronomy and Space completion

The official IPST manual grade crosswalk and grade-specific teaching sections have now been reconciled. M4 standard 1 geology outcomes 1–12 are assigned to M4; this includes outcome 12 on topographic and geological map interpretation, which the M4 teaching-analysis page labels explicitly. M5 standard 2 outcomes 1–13 remain assigned to M5. M6 standard 3 astronomy/space outcomes 1–19 remain assigned to M6.

The completed M4 geology batch is staged in `20261116191500_learning_earth_space_m4_geology.sql`. Its companion `M4-earth-space-geology-teacher-starter-pack.md` contains 12 lesson starters and 36 answer-keyed questions.

Earth/Space totals: **44 objectives, 44 lesson starters and 132 answer-keyed questions** across M4–M6.

## Science curriculum staging totals

| Track | Official outcomes | Lesson starters | Answer-keyed questions | Status |
|---|---:|---:|---:|---|
| M1–M3 core Science | 144 | 144 | 432 | Complete |
| Upper-secondary Biology | 108 | 108 | 324 | Complete |
| Upper-secondary Chemistry | 81 | 81 | 243 | Complete |
| Upper-secondary Physics | 67 | 67 | 201 | Complete |
| Upper-secondary Earth, Astronomy and Space | 44 | 44 | 132 | Complete |

These totals are separate tracks; the M1–M3 core Science indicators are not merged with M4–M6 additional specialist outcomes. Live Supabase contains 139 primary and 174 lower-secondary core indicators in the national master, and 276 secondary core indicators in the canonical secondary catalogue. Primary P2 ว 4.2 ป.2/3 and P3 ว 3.2 ป.3/2 are now Must-Know per OBEC pages 65 and 68. M3 ว 1.1 ม.3/6 is Should-Know; nine legacy W3.2 records remain preserved as non-required supplementary outcomes. The 102 upper-secondary indicators are grade-specifically aligned; priorities reconcile to 85 Must-Know / 18 Should-Know including the dual M6/4 label. Consolidated local lint/build and final app testing remain pending.

## Upper-secondary core Science — first implemented tranche

M4 Science standard ว 1.1 indicators 1–4 are implemented in live staging. Four grade-specific objectives are aligned once each to M4 in both the canonical Science curriculum and the draft national master curriculum (eight alignments total). Priority labels reconcile to two Must-Know and two Should-Know. The companion teacher pack contains four lesson starters and 12 answer-keyed questions.

Historical checkpoint after the first M4 ecology tranche: at that stage, 4 indicators were implemented and 98 of 102 remained. Subsequent M4, M5 and M6 batches completed grade-specific coverage at 102/102. The one-row priority discrepancy was later resolved by correcting M4 ว 1.2 ม.4/11 to Should-Know from OBEC page 146.


## M4 core Science completion — 22/22 indicators

M4 core Science indicators are fully represented in staging: W1.1 (4), W1.2 (12), W1.3 (6), W4.1 (5) and W4.2 (1). All 28 are aligned only to M4 in both curriculum catalogues. Priority reconciliation: 19 Must-Know and 9 Should-Know. M4 teacher resources contain 28 lesson starters and 84 answer-keyed formative questions. M4 is complete at the core-indicator layer.


## M5 core Science — W2.1 tranche staged

The complete 25 M5 W2.1 indicators (M5/1–25) are staged in both curricula, aligned only to M5. Priority labels reconcile to 19 Must-Know and 6 Should-Know, with zero unclassified records. M5/11–13 were recovered from the scanned section of official page 151 and seeded in a corrective migration. Teacher resource: 25 lesson starters and 75 answer-keyed formative questions.

Migration: 20261121052000_seed_science_m5_w2_1_chemistry_core_indicators.sql.


## M5 core Science — 47/47 source-sequenced indicators

M5 standards W2.1, W2.2 and W2.3 are now represented in both curricula: 25 + 10 + 12 = 47 indicators. All are aligned only to M5. Priority reconciliation: 42 Must-Know and 7 Should-Know, zero unclassified. The two M5 Science packs contain 47 lesson starters and 141 answer-keyed formative questions. The complete M5 grade has 49 indicators: W2.1 (25), W2.2 (10), W2.3 (12), W4.1 (1) and W4.2 (1). The technology pack contributes two additional M5 lesson starters and six questions, for 49 lesson starters and 147 questions total. M6 is complete at 25/25; upper-secondary aggregate priorities now match OBEC at 85 Must-Know / 18 Should-Know, including the dual M6/4 label.


## M6 core Science — 25/25 indicators staged

M6 standards W3.1 (10), W3.2 (14) and W4.2 (1) are staged and aligned only to M6 in both curricula. The teacher pack contains 25 lesson starters and 75 answer-keyed formative questions. The full M4–M6 core indicator set is now 102/102: M4 28, M5 49, M6 25. Both curriculum catalogues have the same 102 grade-specific alignments, with no duplicate alignment rows or unclassified priority labels. Priority reconciliation is complete: M4 ว 1.2 ม.4/11 is Should-Know according to OBEC 2021 page 146. The upper-secondary catalogue now records 85 Must-Know and 17 Should-Know rows plus the dual Should-Know label for M6/4, matching the official 85/18 summary.


## M3 ecosystem priority correction — 21 November 2026

Official OBEC 2021 Science and Technology source page 127 confirms ว 1.1 ม.3/6 as Should-Know. Both catalogue alignments have been corrected and verified. Nine legacy W3.2 outcomes are preserved as non-required supplementary records and excluded from the official core count. The nine official M3 W4.1/W4.2 technology indicators are now aligned and classified.

Migration: `20261121103000_classify_science_m3_ecosystem_indicator_6.sql`.


## M3 official technology indicators completed — 21 November 2026

The official OBEC M3 W4.1/W4.2 indicators (five plus four) are now seeded in both curricula. M3 now has 59 required official indicators, with 41 Must-Know and 18 Should-Know, zero unclassified and zero duplicate required alignments. The nine legacy W3.2 records remain preserved as non-required supplementary outcomes pending separate crosswalk validation. The lower-secondary import pack remains 174 lessons / 522 answer-keyed questions because the nine official technology lessons replace the nine legacy W3.2 lessons in the core import.

Migration: `20261121110000_seed_science_m3_official_technology_indicators_and_archive_legacy_w3_2.sql`.


## Primary Should-Know required-flag correction — 21 November 2026

The 42 official primary Should-Know indicators had been incorrectly stored with `required=false`. Since Should-Know is a priority label and does not remove an official indicator from the curriculum, all 42 have now been corrected to `required=true` in both catalogues. Final read-only verification returns 415 required official indicators in `TH-BASIC-CORE-2008-2017` and 276 in `TH-SCI-M1-M6`, with zero duplicate alignments and zero unclassified required indicators.

Migration: `20261121113000_correct_primary_science_should_know_required_flag.sql`.


## Upper-secondary priority reconciliation completed — 21 November 2026

Official OBEC 2021 printed page 146 confirms ว 1.2 ม.4/11 as Should-Know. Its classification has been corrected in both curricula and in the M4 teacher pack. The grade-level tally now reads M4 19/9, M5 42/7 and M6 24/1, with M6/4 dual-classified. Aggregate: 85 Must-Know / 18 Should-Know classifications across 102 unique indicators.

Migration: `20261121114500_correct_science_m4_w1_2_indicator_11_priority.sql`.


## Primary priority corrections completed — 21 November 2026

A row-level source audit found two primary priority errors. OBEC 2021 printed page 65 classifies ว 4.2 ป.2/3 as Must-Know (not Should-Know); printed page 68 classifies ว 3.2 ป.3/2 as Must-Know (not Should-Know). Both rows were corrected in both catalogues and in their teacher starter packs. The primary totals now reconcile: P1 9/6 plus one dual, P2 11/5 plus one dual, P3 19/6 plus one dual, P4 16/5 plus one dual, P5 24/8, P6 20/10 plus one dual. This yields 99 Must-Know and 45 Should-Know classifications across 139 unique primary indicators.

Migration: `20261121122000_correct_primary_science_p2_p3_must_know_priorities.sql`.


## Consolidated core teacher-pack parity — 21 November 2026

- **Primary P1–P6:** 139 objective codes matched exactly against the national master catalogue across the P1–P3, P4–P6 and W4.2 teacher packs; 417 formative tasks.
- **Lower secondary M1–M3:** 174 unique objective codes matched exactly against the catalogue in `SCIENCE-M1-M3-COMPLETE-IMPORT.md`; 522 answer-keyed questions.
- **Upper secondary M4–M6:** 102 unique objective codes matched exactly against the catalogue in `SCIENCE-M4-M6-COMPLETE-IMPORT.md`; 306 answer-keyed questions.
- **Combined official core:** 415/415 unique objective codes, 1,245 formative tasks, zero missing codes, zero extra codes and zero duplicate pack codes.
- Nine legacy M3 W3.2 outcomes remain in `M3-W3.2-LEGACY-SUPPLEMENTARY-PACK.md` (9 lessons / 27 questions), outside the official core import.


## Teacher-pack parser compatibility check — 21 November 2026

The repository parser at `src/features/learning-content/utils/teacher-pack-parser.ts` was inspected and its heading, objective-code and three-answer extraction rules were applied as a source-level smoke check to both consolidated core imports. `SCIENCE-M1-M3-COMPLETE-IMPORT.md` now has 174 numbered lesson headings, 174 unique M1–M3 objective codes and 522 answer-keyed questions. Its 24 M1/M2 W4.1/W4.2 lessons were normalized from code-led headings so the importer no longer groups them into one oversized lesson. `SCIENCE-M4-M6-COMPLETE-IMPORT.md` has 102 numbered headings, 102 unique grade-coded objective codes and 306 answer-keyed questions. Both packs pass the parser-rule smoke check with zero parsing failures, duplicate objective codes or duplicate lesson numbers. The actual authenticated teacher import UI has not yet been exercised; all records remain unimported drafts. A repeatable validator has now been added as `npm.cmd run validate:science-packs`. It transpiles and invokes the actual TypeScript parser and checks expected grade distributions, unique objective codes, lesson counts, sequential question numbers and three non-empty answer keys per lesson. The command has been added but not executed in the local project checkout during this batch. The importer also rejects a Markdown upload above 5,000,000 bytes and blocks grade-coded lessons when their grade is absent from the selected curriculum.


## Primary teacher-pack parser and language support — 23 November 2026

The primary Science packs were previously present as source material but were not covered by the authenticated-import parser validation. Their Markdown uses numbered headings such as `Lesson 1.`, bullet-prefixed official-indicator and suggested-activity fields, and a `Formative assessment` section. The W4.2 pack uses numbered third-level headings and expected-evidence answer keys. The actual teacher-pack parser has been extended to recognise these formats.

The repeatable `npm.cmd run validate:science-packs` check now includes all five core Science packs:

| Primary pack | Lessons | Formative tasks |
|---|---:|---:|
| P1–P3 W1–W3 | 42 | 126 |
| P4–P6 W1–W3 | 69 | 207 |
| P1–P6 W4.2 | 28 | 84 |
| **Primary total** | **139** | **417** |

The latest draft PR workflow passed this Science parser-validation step. Live database code comparison also confirms 139/139 primary pack objective codes match the national master curriculum and 276/276 secondary core codes match the canonical Science curriculum. The two catalogues have zero duplicate objective-grade alignments and zero required core objectives without priority classifications.

The teacher import page now has an explicit content-language selector and stores the selected language on both lesson and question records. Use `TH-BASIC-CORE-2008-2017` with language `th` for primary packs; use `TH-SCI-M1-M6` with language `en` for the secondary core and specialist packs. The language selection records metadata only; it does not translate content.

**Still pending:** authenticated teacher preview and draft-save imports, followed by teacher/student end-to-end acceptance. No Science lesson or question drafts have been created in Supabase.


## Authenticated Science import execution tracker — 23 November 2026

All 17 source packs are prepared and parser-validated. Live Supabase currently reports **0 Science lesson drafts and 0 Science question drafts**. Import each file under an authorized teacher account, verify the preview counts and save as unpublished drafts. Do not publish during the import pass.

| # | Import pack | Curriculum | Subject | Language | Lessons | Questions/tasks | Status |
|---:|---|---|---|---|---:|---:|---|
| 1 | `P1-P3-science-w1-w3-teacher-starter-pack.md` | TH-BASIC-CORE-2008-2017 | SCI | th | 42 | 126 | Pending |
| 2 | `P4-P6-science-w1-w3-teacher-starter-pack.md` | TH-BASIC-CORE-2008-2017 | SCI | th | 69 | 207 | Pending |
| 3 | `SCIENCE-TECHNOLOGY-W4.2-P1-P6-TEACHER-STARTER-PACK.md` | TH-BASIC-CORE-2008-2017 | SCI | th | 28 | 84 | Pending |
| 4 | `SCIENCE-M1-M3-COMPLETE-IMPORT.md` | TH-SCI-M1-M6 | SCI | en | 174 | 522 | Pending |
| 5 | `SCIENCE-M4-M6-COMPLETE-IMPORT.md` | TH-SCI-M1-M6 | SCI | en | 102 | 306 | Pending |
| 6 | `BIOLOGY-M4-IMPORT.md` | TH-SCI-M1-M6 | BIOLOGY | en | 32 | 96 | Pending |
| 7 | `BIOLOGY-M5-IMPORT.md` | TH-SCI-M1-M6 | BIOLOGY | en | 39 | 117 | Pending |
| 8 | `BIOLOGY-M6-IMPORT.md` | TH-SCI-M1-M6 | BIOLOGY | en | 37 | 111 | Pending |
| 9 | `CHEMISTRY-M4-IMPORT.md` | TH-SCI-M1-M6 | CHEMISTRY | en | 28 | 84 | Pending |
| 10 | `CHEMISTRY-M5-IMPORT.md` | TH-SCI-M1-M6 | CHEMISTRY | en | 38 | 114 | Pending |
| 11 | `CHEMISTRY-M6-IMPORT.md` | TH-SCI-M1-M6 | CHEMISTRY | en | 15 | 45 | Pending |
| 12 | `PHYSICS-M4-IMPORT.md` | TH-SCI-M1-M6 | PHYSICS | en | 17 | 51 | Pending |
| 13 | `PHYSICS-M5-IMPORT.md` | TH-SCI-M1-M6 | PHYSICS | en | 26 | 78 | Pending |
| 14 | `PHYSICS-M6-IMPORT.md` | TH-SCI-M1-M6 | PHYSICS | en | 24 | 72 | Pending |
| 15 | `EARTH-SPACE-M4-IMPORT.md` | TH-SCI-M1-M6 | EARTH_SPACE | en | 12 | 36 | Pending |
| 16 | `EARTH-SPACE-M5-IMPORT.md` | TH-SCI-M1-M6 | EARTH_SPACE | en | 13 | 39 | Pending |
| 17 | `EARTH-SPACE-M6-IMPORT.md` | TH-SCI-M1-M6 | EARTH_SPACE | en | 19 | 57 | Pending |
| | **Total** | | | | **715** | **2,145** | **Pending** |

After all 17 imports, verify 715 lesson drafts, 2,145 question drafts, 715 objective links, protected answer-key rows, correct `language_code` values and zero duplicate import codes. Then complete teacher review and student/teacher acceptance testing before any publication.

## Post-import verification hardening — 23 November 2026

The read-only post-import SQL was tightened after reviewing the teacher importer’s actual question-code generation. Question counts now match the imported lesson objective codes and the generated question suffix, rather than counting every question attached to a Science objective. It also checks that every objective/grade pair has exactly three imported questions, verifies uniqueness within each organization, and reports the expected Thai/English draft totals separately.

The updated SQL was executed against live Supabase. All statements ran successfully. Current results remain 0/715 lesson drafts and 0/2,145 question drafts, as expected before the authorized teacher import. Duplicate-code and integrity-error counts are zero; no records were changed. The expected-total checks correctly remain CHECK until import.

## Protected answer-key write-path correction — 23 November 2026

A live RLS audit found that `learning_question_evaluation_keys` intentionally has no authenticated INSERT policy. The teacher-pack repository was incorrectly attempting a direct browser-client table insert, which would cause each import chunk to fail when saving protected answer keys.

The importer now calls the existing `save_learning_question_evaluation_key` SECURITY DEFINER RPC for each key. The live database confirms the RPC is SECURITY DEFINER and executable by `authenticated`; its current implementation requires an active teacher membership or academic-record management permission and rejects published question versions. The evaluation-key table remains protected by its restrictive row-level policies. Key writes in each chunk use `Promise.allSettled`, so all in-flight RPC calls finish before failed-chunk cleanup begins.

This correction changes the import client path only; no RLS policies or answer-key permissions were weakened. Database inspection also confirms the evaluation-key foreign key cascades when the owning question version is deleted, preserving the existing failed-chunk cleanup strategy. A real authenticated import is still required to verify the end-to-end user session and permissions.
