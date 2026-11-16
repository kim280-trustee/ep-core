# E&P Learning — Science Rollout Readiness

**Branch:** `paul/learning-academic-integrity-audit`  
**Scope:** Thai core Science curriculum catalogue, M1–M3 core knowledge graphs, and staged M4–M6 additional Science subjects  
**Status:** M1–M3 core Science knowledge graphs are complete. Upper-secondary subject tracks are catalogued. M4 Biology strands 1–2 (32 outcomes), M5 Biology plant-structure strand 3 (18 outcomes), M5 Biology animal-physiology strand 4 (21 outcomes), M6 Biology animal-physiology strand 4 (19 outcomes) and M6 Biology ecology strand 5 (13 outcomes) and M6 Biology biodiversity/taxonomy strand 2 (5 outcomes) are committed: 108 Biology outcomes total. Biology is now fully audited and staged: 108/108 official upper-secondary outcomes (M4 32, M5 39, M6 37), with 108 lesson starters and 324 answer-keyed questions; M6 Chemistry and Earth/Space outcomes remain pending; Physics now has all 67 official outcomes staged: M4 Group 1 (17), M5 Group 2 (13), M5 Group 3 (11), M5 Group 4 (15 and 18), M6 Group 3 (8) and M6 Group 4 (16); M4 Biology strands 3–5 and M5 Biology strand 5 have no outcomes in the official curriculum. M4 Chemistry strands 1–2 (28 outcomes), M5 Chemistry strand 1 gas outcomes 1–6 (6 outcomes), all 32 M5 Chemistry strand 2 outcomes and M6 Chemistry strand 1 organic/polymer outcomes 1–15 (15 outcomes) are now committed: 81 Chemistry outcomes total. No migrations applied to Supabase and no school records created.

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
5. `20261116090000_learning_science_m2_earth_space_knowledge_graph.sql` — adds ten M2 Earth and Space Science objectives.\n6. `20261116091500_learning_science_m3_matter_chemistry_knowledge_graph.sql` — adds eight M3 materials and chemical-reaction objectives.\n7. `20261116093000_learning_science_m3_energy_earth_space_knowledge_graph.sql` — adds 21 M3 energy/light, four astronomy and seven Earth-system objectives.\n8. `20261116100000_learning_science_upper_secondary_subject_tracks.sql` — adds upper-secondary Biology, Chemistry, Physics and Earth/Space subject catalogue entries.\n9. `20261116101500_learning_biology_m4_cellular_foundations.sql` — adds 17 M4 Biology additional-study outcomes in strand 1.\n10. `20261116103000_learning_biology_m4_genetics_evolution.sql` — adds 15 M4 Biology additional-study outcomes in strand 2 (Mendelian genetics, DNA, mutation, DNA technology and evolution).\n11. `20261116104500_learning_biology_m5_plant_structure_function.sql` — adds 18 M5 Biology outcomes in strand 3 (plant tissues, transport, photosynthesis, reproduction and responses).\n12. `20261116110000_learning_biology_m5_animal_physiology.sql` — adds 21 M5 Biology outcomes in strand 4 (digestion, gas exchange, circulation, blood, immunity and excretion).\n13. `20261116111500_learning_biology_m6_animal_physiology.sql` — adds 19 M6 Biology outcomes in strand 4 (nervous coordination, sensory systems, movement, reproduction, hormones and behaviour).\n14. `20261116113000_learning_biology_m6_ecology_biodiversity.sql` — adds 13 M6 Biology outcomes in strand 5 (ecosystem energy, nutrient cycles, biomes, succession, population ecology and environmental sustainability).\n15. `20261116114500_learning_chemistry_m4_atomic_structure_bonding.sql` — adds 21 M4 Chemistry outcomes in strand 1 (atomic structure, periodicity, radioactivity and chemical bonding).\n16. `20261116120000_learning_chemistry_m4_reactions_stoichiometry.sql` — adds 7 M4 Chemistry outcomes in strand 2 (chemical equations, stoichiometry, limiting reactants and percentage yield).\n17. `20261116121500_learning_chemistry_m5_kinetics_equilibrium.sql` — adds M5 Chemistry outcomes 1–13 in strand 2 (reaction rates, collision theory, dynamic equilibrium, equilibrium calculations and applications).\n18. `20261116123000_learning_chemistry_m5_acids_bases_redox_electrochemistry.sql` — adds M5 Chemistry strand 2 outcomes 14–32 (acid–base chemistry, redox reactions and electrochemical cells).
19. `20261116124500_learning_chemistry_m5_gas_laws.sql` — adds M5 Chemistry strand 1 outcomes 1–6 (gas laws, ideal gases, partial pressures, diffusion and applications).
20. `20261116130000_learning_chemistry_m6_organic_polymers.sql` — adds M6 Chemistry strand 1 outcomes 1–15 (organic structures, functional groups, nomenclature, reactions and polymers).
21. `20261116131500_learning_biology_m6_biodiversity_taxonomy.sql` — adds M6 Biology strand 2 outcomes 1–5 (biodiversity, origin of early cells, organism groups, taxonomy and dichotomous keys).

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
- All M1–M3 core Science knowledge graphs are seeded. M4 Biology strands 1–2, M5 Biology strands 3–4 and M6 Biology strands 2, 4 and 5 are seeded: 108 outcomes, with 108 lesson starters and 324 practice questions with answer keys. M4 Biology strands 3–5 and M5 Biology strand 5 have no outcomes in the official curriculum. Remaining M5–M6 Biology, M6 Physics outcomes beyond Group 3 outcome 8 and Group 4 outcome 9, plus remaining M4–M6 Physics content-group outcomes, and all Earth/Space outcomes remain pending. M6 Biology strand 2 outcomes 1–5 are now seeded. Chemistry now has 81 seeded outcomes across M4, M5 and M6. Physics has 17 M4 outcomes, 12 M5 outcomes, eight M6 Group 3 outcomes and nine M6 Group 4 outcomes seeded; the full 67-outcome grade allocation is still being audited.
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

This batch adds verified M4 additional-learning outcome 10: work done by a constant force, work calculated from a force–displacement graph and average power. The migration adds one objective with an official M4 alignment. The companion teacher starter pack contains one lesson starter and three answer-keyed questions. Physics now has ten verified M4 outcomes seeded (8–17, excluding 1–7), ten lesson starters and 30 answer-keyed questions. Official alignment: IPST Physics curriculum-use manual, printed p. 112. Outcomes 1–7 and the remaining M5–M6 Physics allocation are still under audit. No live Supabase migration has been applied.


## Upper-secondary staged release — M4 Physics outcomes 1–7

This batch adds all seven remaining M4 additional Physics outcomes: foundations/history of physics; measurement and uncertainty; uniformly accelerated straight-line motion; resultant forces; Newton laws and free-body diagrams; universal gravitation and gravitational fields; and friction. The migration adds seven objectives with official M4 alignments. The companion teacher starter pack contains seven lesson starters and 21 answer-keyed questions. M4 Physics is now complete at 17 of 17 official outcomes, with 17 lesson starters and 51 questions. Official alignment: IPST Physics curriculum-use manual, M4 outcomes 1–7, printed pp. 17–20. The remaining Physics scope is M5–M6; no live Supabase migration has been applied.


## Upper-secondary staged release — M5 Physics outcomes 1–3

The first M5 Physics batch adds three verified additional-learning outcomes: simple harmonic motion of spring-mass systems and simple pendulums; natural frequency and resonance; and wave motion, wave properties, Huygens principle and superposition. Three migrations add three objectives with official M5 alignments. The companion teacher starter packs contain three lesson starters and nine answer-keyed questions. M4 Physics remains complete at 17 of 17 outcomes; M5 now has three verified outcomes. Official alignment: IPST Physics curriculum-use manual, printed pp. 128–130. Remaining M5 and M6 allocations are still under audit. No live Supabase migrations have been applied.


## Upper-secondary staged release — M5 Physics sound outcomes 6–7

Two additional M5 Physics outcomes are now seeded: outcome 6 (sound intensity, sound level, hearing, sound quality and noise pollution) and outcome 7 (air-column resonance, beats, standing waves, Doppler effect and shock waves). The migration adds two M5-aligned objectives; the teacher pack contains two lesson starters and six answer-keyed questions. M5 Physics now has five verified seeded outcomes (1, 2, 3, 6 and 7), with M5 outcomes 4–5 and 8–12 and all M6 allocations still to be audited. Official alignment: IPST Physics curriculum-use manual, printed pp. 136 and 138. No live Supabase migration has been applied.


## Upper-secondary staged release — M5 Physics light outcomes 8 and 12

Two additional M5 Physics outcomes are now seeded: outcome 8 (light interference and diffraction using double slits, gratings and single slits) and outcome 12 (rainbows, halos, mirages and sky colours). The migration adds two M5-aligned objectives; the teacher pack contains two lesson starters and six answer-keyed questions. M5 Physics now has seven verified seeded outcomes (1, 2, 3, 6, 7, 8 and 12). Outcomes 4–5 and 9–11 remain under official-source audit; M6 is pending. Official alignment: IPST Physics curriculum-use manual, printed pp. 141 and 147. No live Supabase migration has been applied.


## M5 Physics staged release — geometrical optics outcomes 9–11

Three additional M5 Physics objectives are now staged: outcome 9 (reflection and mirrors), outcome 10 (refraction, apparent depth and total internal reflection), and outcome 11 (thin lenses and image formation). The migration adds three lesson objectives; the companion pack contains three lesson starters and nine answer-keyed questions. Official alignment is confirmed in the IPST Physics curriculum-use manual, printed pp. 142–146. M5 Physics now has 10 verified outcomes seeded (1, 2, 3, 6, 7, 8, 9, 10, 11 and 12), with 10 lesson starters for those objectives and 30 answer-keyed questions across the M5 packs. Outcomes 4–5 remain to be verified. No migration has been applied to Supabase.


## M5 Physics staged release — outcomes 4–5

Two additional M5 Physics objectives are now staged: outcome 4 (surface-water-wave reflection, refraction, interference and diffraction) and outcome 5 (sound production/propagation, pressure and displacement waves, and sound speed versus air temperature). The migration adds two objectives; the teacher pack contains two lesson starters and six answer-keyed questions. Together with the previously committed M5 objectives, outcomes 1–12 are now represented: 12 objectives, 12 lesson starters and 36 answer-keyed questions. The M5 Physics numbered outcome set is complete at this stage. M6 Physics and remaining Biology/Chemistry/Earth-Space coverage remain subject to official grade-by-grade audit. No migrations have been applied to Supabase.


## M6 Physics staged release — verified outcomes 2, 3 and 6

Three M6 Physics outcomes have been verified against the official IPST manual's printed grade-labelled pages and staged: outcome 2 (magnetic forces), outcome 3 (galvanometers and DC motors), and outcome 6 (three-phase AC generators and transformers). The migration adds three curriculum objectives and alignments; the companion pack provides three lesson starters and nine answer-keyed questions. Official manual printed pages: 171, 173 and 177. M6 outcomes 1, 4, 5 and 7 onward remain under audit. No migration has been applied to Supabase.


## M6 Physics staged release — electricity outcomes 1, 4 and 5

This batch adds M6 Physics outcome 1 (magnetic fields and magnetic flux), outcome 4 (electromagnetic induction, Faraday's law and Lenz's law), and outcome 5 (alternating-current RMS voltage and current). The official IPST comparison crosswalk confirms the M6 allocation for Group 3 outcome 1; the grade-labelled curriculum-use manual identifies outcomes 4 and 5 on printed pages 174 and 176. The migration adds three objectives and M6 alignments. The companion teacher pack contains three lesson starters and nine answer-keyed questions.

Migration: `20261116171500_learning_physics_m6_magnetic_fields_induction_ac.sql`. Teacher pack: `M6-physics-magnetic-fields-induction-ac-teacher-starter-pack.md`.

M6 Physics now has six verified outcomes staged (1–6), six lesson starters and 18 answer-keyed questions across two packs. Outcomes 7 onward and the remaining Physics content groups still require official grade-by-grade verification. No Supabase migrations have been applied.


## M6 Physics staged release — electromagnetic-wave outcomes 7–8

This batch adds M6 Physics outcome 7 (electromagnetic waves, spectrum, polarisation and polaroid applications) and outcome 8 (communication using electromagnetic waves and analogue/digital signal comparison). Both are explicitly labelled M6 in the official IPST Physics curriculum-use manual, printed pages 178–179. The migration adds two objectives and M6 alignments; the companion teacher pack contains two lesson starters and six answer-keyed questions.

Migration: `20261116173000_learning_physics_m6_electromagnetic_waves_communication.sql`. Teacher pack: `M6-physics-electromagnetic-waves-communication-teacher-starter-pack.md`.

M6 Physics outcomes 1–8 are now staged: eight objectives, eight lesson starters and 24 answer-keyed questions across three teacher packs. Outcomes beyond 8 and the remaining Physics content groups still require official grade-by-grade verification. No Supabase migrations have been applied.


## M6 Physics staged release — Group 4 outcomes 1–9

The official IPST Physics curriculum-use manual explicitly lists M6 Group 4 outcomes 1–9 on printed pages 37–43. The staged batch covers heat and phase change; elasticity; fluid pressure and buoyancy; surface tension and viscosity; ideal-fluid flow and Bernoulli; ideal-gas laws; kinetic theory; and the first law of thermodynamics.

Migration: `20261116174500_learning_physics_m6_thermal_fluids_gases_outcomes_1_9.sql`. Teacher pack: `M6-physics-thermal-fluids-gases-teacher-starter-pack.md`.

This adds nine objectives, nine lesson starters and 27 answer-keyed questions. M6 Physics now has eight Group 3 outcomes and nine Group 4 outcomes staged, with the Group 4 M6 sequence 1–9 verified. Remaining outcome allocations and the rest of the 67-outcome Physics curriculum still require auditing. No Supabase migrations have been applied.



## M6 Physics staged release — Group 4 modern/atomic/nuclear outcomes 10–14, 16–17

The next M6 Physics batch stages seven verified Group 4 outcomes: Planck's hypothesis and the Bohr atom (10), photoelectric effect (11), wave-particle duality and de Broglie wavelength (12), radioactivity and radiation types (13), activity and half-life (14), nuclear reactions/fission/fusion (16), and nuclear-energy/radiation applications and protection (17). The companion teacher pack contains seven lesson starters and 21 answer-keyed questions. Safety controls prohibit student handling or use of radioactive sources; lessons use simulations and teacher-provided datasets.

Migration: `20261116180000_learning_physics_m6_modern_atomic_nuclear_outcomes_10_14_16_17.sql`. Teacher pack: `M6-physics-modern-atomic-nuclear-teacher-starter-pack.md`.

**Important grade allocation:** the official IPST comparison crosswalk allocates Group 4 outcomes 15 (nuclear forces, stability and binding energy) and 18 (particle physics and the Standard Model) to M5, not M6. They have not been incorrectly aligned to M6 and remain to be staged under M5 after source reconciliation. M6 Group 4 now contains 16 verified outcomes (1–14, 16–17), 16 lesson starters and 48 answer-keyed questions. Combined staged Physics totals: M4 17, M5 12, M6 Group 3 8, and M6 Group 4 16 = **53 objectives, 53 lesson starters and 159 answer-keyed questions**. All migrations remain unapplied to live Supabase.


## M5 Physics staged release — Group 4 outcomes 15 and 18

Two Group 4 outcomes are now staged under M5, not M6, in accordance with the official IPST comparison crosswalk: outcome 15 (nuclear forces, nuclear stability and binding energy) and outcome 18 (particle-physics research, the Standard Model and applications). The migration adds two M5 objectives; the teacher pack contains two lesson starters and six answer-keyed questions.

Migration: `20261116181500_learning_physics_m5_group4_outcomes_15_18.sql`. Teacher pack: `M5-physics-nuclear-structure-particle-physics-teacher-starter-pack.md`.

Updated staged Physics totals: M4 17, M5 14 (outcomes 1–12, 15 and 18), M6 Group 3 8, and M6 Group 4 16 = **55 objectives, 55 lesson starters and 165 answer-keyed questions**. Group 4 M5 outcomes 15 and 18 are explicitly excluded from M6. No live Supabase migrations have been applied.


## Physics curriculum completion — all 67 official outcomes staged

The final Physics batch adds M5 Group 3 outcomes 1–11 (electrostatics and DC electricity) and M5 Group 2 outcome 13 (colour vision). The official IPST manual labels the Group 3 M5 sequence separately from the M6 Group 3 sequence, which restarts at outcome 1. M5 Group 2 outcome 13 is also explicitly listed in the manual.

Migration: `20261116183000_learning_physics_m5_electricity_and_colour_outcomes.sql`. Teacher pack: `M5-physics-electrostatics-dc-electricity-colour-vision-teacher-starter-pack.md`.

**Physics is now complete at 67/67 national outcomes:** M4 Group 1 (17); M5 Group 2 (13), Group 3 (11), Group 4 (15 and 18); M6 Group 3 (8); M6 Group 4 (1–14, 16–17). Each outcome has one lesson starter and three answer-keyed questions: 67 objectives, 67 lesson starters and 201 questions. All migrations remain pending and unapplied to live Supabase. This completes the Physics track only; the remaining Science subjects and rollout-readiness checks are still separate work.


## Biology curriculum audit — complete (108/108)

The new `BIOLOGY-CURRICULUM-AUDIT.md` reconciles all staged Biology objectives against the official IPST upper-secondary additional Biology curriculum-use manual. The grade/strand register confirms M4 32 (Strands 1 and 2), M5 39 (Strands 3 and 4), and M6 37 (Strands 2, 4 and 5): **108/108 official outcomes**. The seven existing Biology teacher packs contain 108 lesson starters and 324 answer-keyed questions. Outcome numbering is grade- and strand-specific; M4 and M6 Strand 2 and M5 and M6 Strand 4 are separate sequences. The manual does not assign Biology outcomes to M4 Strands 3–5 or M5 Strand 5, so these are not missing outcomes.

No new Biology seed migration was needed: all 108 outcomes were already staged in the existing seven migrations. No live database changes were made. Next subject audit: complete M6 Chemistry and Earth/Space allocation verification before any further seeding.
