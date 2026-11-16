# E&P Learning — Science Rollout Readiness

**Branch:** `paul/learning-academic-integrity-audit`  
**Scope:** Thai core Science curriculum catalogue, M1–M3 core knowledge graphs, and staged M4–M6 additional Science subjects  
**Status:** M1–M3 core Science knowledge graphs are complete. Upper-secondary subject tracks are catalogued. M4 Biology strands 1–2 (32 outcomes), M5 Biology plant-structure strand 3 (18 outcomes), M5 Biology animal-physiology strand 4 (21 outcomes), M6 Biology animal-physiology strand 4 (19 outcomes) and M6 Biology ecology strand 5 (13 outcomes) are committed: 103 Biology outcomes total. Remaining M5–M6 Biology, M6 Chemistry, Physics and Earth/Space outcomes are pending; M4 Biology strands 3–5 and M5 Biology strand 5 have no outcomes in the official curriculum. M4 Chemistry strands 1–2 (28 outcomes) and all 32 M5 Chemistry strand 2 outcomes are now committed. No migrations applied to Supabase and no school records created.

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

## M2 and M3 coverage

| Grade | Official core Science indicators | Seeded objectives | Status |\n|---|---:|---:|---|\n| M2 | 48 | 48 | Complete |\n| M3 | 51 | 51 | Complete |\n| **M2–M3 total** | **99** | **99** | **Complete** |\n\nM3 coverage is 11 indicators in ว 1.3, eight in ว 2.1, 21 in ว 2.3, four in ว 3.1 and seven in ว 3.2. The M2–M3 packs together contain 99 lesson starters and 297 practice questions with answer keys.\n\n## Curriculum scope

The lower-secondary core catalogue uses subject code `SCI` and curriculum code `TH-SCI-M1-M6`, aligned to the Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017). The official upper-secondary section is structured as additional learning outcomes in four distinct strands. These are represented by separate subject codes `BIOLOGY`, `CHEMISTRY`, `PHYSICS` and `EARTH_SPACE`, linked to the same Thai curriculum catalogue and M4–M6 grade levels. This avoids incorrectly treating upper-secondary additional learning outcomes as lower-secondary core indicators or combining four specialist subjects into one generic Science subject.

This Science subject covers the core Science standards ว 1.x, ว 2.x and ว 3.x. Technology standards ว 4.1 and ว 4.2 are intentionally reserved for the future Design & Technology / Computer Studies workstream, so the same official indicators are not duplicated across subjects.

The curriculum catalogue contains M1–M6 grade levels. M1 is fully seeded for its 43 core Science indicators. M2 is fully seeded for all 48 core Science indicators across ว 1.2, ว 2.2, ว 2.3 and ว 3.2. M3 is now fully seeded for all 51 core Science indicators: 11 biological-science indicators in ว 1.3, eight materials/chemical-reaction indicators in ว 2.1, 21 energy/light indicators in ว 2.3, four astronomy indicators in ว 3.1 and seven Earth-system indicators in ว 3.2. M4–M6 additional learning outcomes are being implemented separately by specialist subject and grade.

## Migrations

1. `20261116080000_learning_science_curriculum_catalog.sql` — adds the SCI subject, Thai Science curriculum, M1–M6 grade levels and curriculum-subject link.
2. `20261116081500_learning_science_m1_knowledge_graph.sql` — adds five Science skills, 17 topics, 43 M1 objectives and official curriculum-grade alignments.
3. `20261116083000_learning_science_m2_m3_biology_knowledge_graph.sql` — adds 17 M2 and 11 M3 biological-science objectives.
4. `20261116084500_learning_science_m2_physical_science_knowledge_graph.sql` — adds 15 M2 force objectives and six M2 work/energy objectives.
5. `20261116090000_learning_science_m2_earth_space_knowledge_graph.sql` — adds ten M2 Earth and Space Science objectives.\n6. `20261116091500_learning_science_m3_matter_chemistry_knowledge_graph.sql` — adds eight M3 materials and chemical-reaction objectives.\n7. `20261116093000_learning_science_m3_energy_earth_space_knowledge_graph.sql` — adds 21 M3 energy/light, four astronomy and seven Earth-system objectives.\n8. `20261116100000_learning_science_upper_secondary_subject_tracks.sql` — adds upper-secondary Biology, Chemistry, Physics and Earth/Space subject catalogue entries.\n9. `20261116101500_learning_biology_m4_cellular_foundations.sql` — adds 17 M4 Biology additional-study outcomes in strand 1.\n10. `20261116103000_learning_biology_m4_genetics_evolution.sql` — adds 15 M4 Biology additional-study outcomes in strand 2 (Mendelian genetics, DNA, mutation, DNA technology and evolution).\n11. `20261116104500_learning_biology_m5_plant_structure_function.sql` — adds 18 M5 Biology outcomes in strand 3 (plant tissues, transport, photosynthesis, reproduction and responses).\n12. `20261116110000_learning_biology_m5_animal_physiology.sql` — adds 21 M5 Biology outcomes in strand 4 (digestion, gas exchange, circulation, blood, immunity and excretion).\n13. `20261116111500_learning_biology_m6_animal_physiology.sql` — adds 19 M6 Biology outcomes in strand 4 (nervous coordination, sensory systems, movement, reproduction, hormones and behaviour).\n14. `20261116113000_learning_biology_m6_ecology_biodiversity.sql` — adds 13 M6 Biology outcomes in strand 5 (ecosystem energy, nutrient cycles, biomes, succession, population ecology and environmental sustainability).\n15. `20261116114500_learning_chemistry_m4_atomic_structure_bonding.sql` — adds 21 M4 Chemistry outcomes in strand 1 (atomic structure, periodicity, radioactivity and chemical bonding).\n16. `20261116120000_learning_chemistry_m4_reactions_stoichiometry.sql` — adds 7 M4 Chemistry outcomes in strand 2 (chemical equations, stoichiometry, limiting reactants and percentage yield).\n17. `20261116121500_learning_chemistry_m5_kinetics_equilibrium.sql` — adds M5 Chemistry outcomes 1–13 in strand 2 (reaction rates, collision theory, dynamic equilibrium, equilibrium calculations and applications).\n18. `20261116123000_learning_chemistry_m5_acids_bases_redox_electrochemistry.sql` — adds M5 Chemistry outcomes 14–32 in strand 2 (acid–base chemistry, redox reactions and electrochemical cells).

Apply these after the existing pending academic foundation and Maths migrations, in timestamp order. The seeds are idempotent upserts and require the active Thai Basic Education system.

## Teacher workflow

The existing generic Teacher Content Create, Teacher Content Library and Question Bank workflows support the new subject and curriculum dimensions. No Science-only authoring module is needed.

After migrations are applied:
- Select `TH-SCI-M1-M6`, the matching grade and subject `SCI` for M1–M3 core Science. For M4–M6, select the relevant specialist subject (`BIOLOGY`, `CHEMISTRY`, `PHYSICS` or `EARTH_SPACE`) and matching upper-secondary grade.
- M2 has complete core Science coverage. M3 now has all 51 core Science objectives seeded across biological science, physical science, astronomy and Earth science.
- Link each lesson and question to its exact objective code.
- Save as draft and have a teacher review scientific accuracy, safety and suitability before publishing.
- Use the Teacher Content Library grade filter to isolate M1 materials.

## Safety notes

Use teacher supervision for laboratory demonstrations. Do not ask students to taste unknown substances or handle radioactive materials. Use safe sample data or teacher-controlled demonstrations for heat, chemical and microscope activities.

## Explicitly not done

- No Supabase migration has been applied.
- No live school, class, class-subject, teacher, student, content or assessment record has been created.
- All M1–M3 core Science knowledge graphs are seeded. M4 Biology strands 1–2, M5 Biology strands 3–4 and M6 Biology strands 4–5 are seeded: 103 outcomes, with 103 lesson starters and 309 practice questions with answer keys. M4 Biology strands 3–5 and M5 Biology strand 5 have no outcomes in the official curriculum. Remaining M5–M6 Biology, M5 Chemistry strand 1 gas outcomes, M6 Chemistry organic/polymer outcomes, and all Physics/Earth-Space outcomes remain pending.
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