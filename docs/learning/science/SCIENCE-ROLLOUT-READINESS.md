# E&P Learning — Science Rollout Readiness

**Branch:** `paul/thai-national-curriculum-foundation`  
**Scope:** Full Thai national Science and Technology learning area (P1–M6), plus separately catalogued M4–M6 specialist outcomes  
**Status:** **Core national Science rollout is still incomplete.** The existing work covers 144 M1–M3 SCI records and 300 M4–M6 specialist outcomes. A new primary-grade W4.2 batch has added 28 official computational-science indicators, but the full OBEC 2021 Science and Technology set contains 415 indicators across P1–M6. Primary P1–P3 W1–W3 are seeded (42 indicators), and P1–P6 W4.2 is seeded (28 indicators). P4–P6 W1–W3 (69 indicators), missing lower-secondary W1–W4 indicators and the 102 shared upper-secondary core indicators still require implementation and code-level reconciliation. The 300 Biology, Chemistry, Physics and Earth/Space specialist outcomes are additional curriculum content and do not replace the M4–M6 core set.

The existing 13 Science import files contain 444 lesson starters and 1,332 answer-keyed practice questions. The new `SCIENCE-TECHNOLOGY-W4.2-P1-P6-TEACHER-STARTER-PACK.md` adds 28 lessons and 84 formative tasks. These resources are still Markdown source material until an authorized teacher imports them through `/teacher/content/import`. No school, class or student records have been created.



**Database execution status:** This readiness document records repository content and historical rollout notes. It does not prove which migrations are currently present in live Supabase. Treat all staging/application claims in older batch notes as historical until the Supabase migration ledger and representative catalogue counts are checked directly. Do not report a migration as applied based only on its presence in this branch.

**Verified live staging reconciliation — 21 November 2026:** The connected Supabase project `ep-core` is healthy. Its migration ledger currently ends at the curriculum-era migration `learning_gradebook_audit_select_grant` (version `20261118081715`); the newer Science seed/classification migrations in this branch are not yet recorded under their branch filenames. Direct catalogue reads show national-core Science alignment counts of P1 5, P2 4, P3 5, P4 5, P5 5, P6 4, M1 43, M2 48 and M3 53. The 28 primary rows currently visible are W4.2; the 42 P1–P3 W1–W3 records in this branch's `20261118208000_seed_science_technology_primary_p1_p3_indicators.sql` are not yet reflected in the live catalogue. Therefore live primary coverage is 28/139, not 139/139. Do not mark primary Science complete until the pending branch migrations are deployed and the 15/16/25/21/32/30 grade totals pass the read-only verification query. M1–M3 lower-secondary counts are visible in both curricula; M3's nine W3.2 rows remain unclassified as documented.


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
| M4–M6 shared | 102 |
| **Total unique indicators** | **415** |

The M4–M6 total is a shared grade-band set of 102 indicators, not 102 separate indicators per grade.

Primary priority-count checks from the OBEC 2021 summary: P4 has 16 Must-Know and 6 Should-Know classifications; P5 has 24 and 8; P6 has 20 and 11. P4 ว 2.1 ป.4/1 and P6 ว 2.1 ป.6/1 are dual-classified, so classification counts are not mutually exclusive. The read-only reconciliation query is in `SCIENCE-STAGING-VERIFICATION.sql`.


## Current implementation status

- P1–P3: 42 W1–W3 indicators seeded (10 P1, 12 P2, 20 P3); together with W4.2 these grades reconcile to 15, 16 and 25 indicators respectively.
- P4–P6: 28 W4.2 indicators seeded (5, 5 and 4); 69 W1–W3 indicators remain (16 P4, 27 P5, 26 P6).
- M1: 43 existing W1–W3 indicators; the 9 W4.1/W4.2 indicators are not yet seeded.
- M2: 48 existing W1–W3 indicators; six W2.1 indicators and nine W4.1/W4.2 indicators remain to be reconciled/seeded.
- M3: 53 existing records require code-level reconciliation against the official standard table. The official table has six W1.1 indicators, eight W1.3 indicators, three W2.2 indicators and no M3 W3.2 indicator set; the current records include 11 W1.3 and nine W3.2 entries. Do not treat the present 53 as a verified official count.
- M1–M3 W4.1/W4.2: 27 official indicators remain (M1: 9; M2: 9; M3: 9).
- M4–M6 core Science and Technology: 102 shared indicators remain to be seeded.
- M4–M6 additional specialist outcomes: Biology 108, Chemistry 81, Physics 67 and Earth/Space 44 are already catalogued separately (300 total).

The `TECH` skill is part of the `SCI` subject. The 28 new P1–P6 W4.2 objectives are national Science and Technology indicators and must not be merged with the separate Click Start international Computer Studies course.

## Consolidated integrity review

The existing migration history, importer implementation and specialist-subject counts remain documented in `SCIENCE-MIGRATION-INTEGRITY-REVIEW.md`. The current lower-secondary SCI catalogue has been mirrored into both `TH-SCI-M1-M6` and `TH-BASIC-CORE-2008-2017`; that earlier mirror must be reconciled as part of the M3 indicator correction. Read-only checks are in `SCIENCE-STAGING-VERIFICATION.sql`.

Application lint/build, importer smoke tests and app-wide end-to-end tests remain deferred until all curriculum rollouts are complete.

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

These totals are separate tracks; the M1–M3 core Science indicators are not merged with M4–M6 additional specialist outcomes. The repository contains the staged curriculum migration set, but the live Supabase ledger has not yet caught up with this branch. Current live lower-secondary core catalogue counts are 43/48/53 in both curriculum records; primary live counts remain 5/4/5/5/5/4 until the pending primary W1–W3 seed migration is deployed. The nine M3 W3.2 Earth-system indicators remain intentionally unclassified because they are absent from the OBEC 2021 priority table. Consolidated local lint/build and final app testing remain pending and are intentionally deferred until all curriculum rollouts are complete.