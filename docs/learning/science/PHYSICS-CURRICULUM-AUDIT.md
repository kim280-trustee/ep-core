# E&P Learning — Upper-secondary Physics Curriculum Audit

**Status:** Official curriculum scope and grade allocation are being reconciled outcome-by-outcome. M4 is complete; M5 outcomes 1–12 and M6 Group 3 outcomes 1–8 plus Group 4 outcomes 1–14 and 16–17 are staged. The full 67-outcome national register is not yet complete.

## Official curriculum structure

The Institute for the Promotion of Teaching Science and Technology (IPST) identifies **67 additional-study Physics learning outcomes** under the 2017 revised Science curriculum, grouped into four connected content domains. The IPST page describes the groups as follows:

| IPST content group | Official scope |
|---|---|
| 1 | Nature of Physics, physical quantities and measurement; linear and curved motion; forces, Newton's laws, universal gravitation, friction, mechanical equilibrium, work, conservation of mechanical energy, momentum and conservation of momentum |
| 2 | Simple harmonic motion; wave nature; sound and hearing; sound phenomena; light, vision and light phenomena |
| 3 | Electric force and Coulomb's law; electric field and potential; capacitance; current, Ohm's law and DC circuits; electrical energy and power; renewable electricity; magnetic fields and forces; electromagnetic induction and Faraday's law; AC; electromagnetic waves and communication |
| 4 | Heat and changes of state; elasticity and Young's modulus; fluid pressure, buoyancy and Archimedes' principle; surface tension and viscosity; ideal fluids and Bernoulli's equation; gas laws and kinetic theory; ideal-gas internal energy; Bohr atom; photoelectric effect; wave-particle duality; radioactivity, nuclear forces/reactions/energy and particle physics |

## Grade-allocation controls

- The four content groups are **not** themselves grade levels. Do not map an entire group to M4, M5 or M6.
- The official IPST comparison document maps selected Physics outcomes to the core Physical Science indicators. For example, it explicitly maps Group 1 outcomes 3, 5, 6, 16 and 17 to M4, Group 2 outcome 1 to M5, and Group 3 outcomes 1–3 to M6. This confirms that group numbering and grade allocation must be handled separately.
- Extract every outcome's exact wording and assigned grade from the official IPST outcome documents and the corresponding grade-level curriculum guides before creating objective codes or grade alignments.
- Do not invent a total per grade, strand sequence, or outcome numbering from textbook volume titles or third-party lesson plans.
- Keep Physics separate from the existing lower-secondary `SCI` core subject and from the `EARTH_SPACE`, `CHEMISTRY` and `BIOLOGY` upper-secondary tracks.

## Sources

1. IPST, Physics curriculum page — states the national total of 67 outcomes and describes the four content groups: https://www.ipst.ac.th/physics
2. IPST, *Comparison of Indicators in Physical Science Strand 2 with Learning Outcomes in Physics*, revised 2017: https://www.ipst.ac.th/wp-content/uploads/2022/05/Comparison_PhysicalSciLI_and_PhysicsLO_02-1.pdf
3. IPST, upper-secondary Physics curriculum-use manual: https://www.scimath.org/ebook-physics/item/8437-2-2560-2551

## Implementation decision

The existing `PHYSICS` subject track and M4–M6 grade catalogue are already present. This audit adds no database records. The M4 register is now reconciled and seeded. The remaining implementation work is to extract and reconcile M5–M6 outcomes against the official IPST documents before authoring further idempotent knowledge-graph migrations and teacher starter packs.


## First verified knowledge-graph batch — M4 outcomes 8–9

Two outcomes have now been extracted directly from the official IPST curriculum-use manual and seeded:

| Grade | Outcome | Verified scope | Database objective |
|---|---:|---|---|
| M4 | 8 | Mechanical equilibrium, moments, couples, free-body diagrams and equilibrium of three forces | `M4-PHY-MECH-08` |
| M4 | 9 | Centre of mass, centre of gravity and object stability | `M4-PHY-MECH-09` |

Migration: `20261116133000_learning_physics_m4_mechanical_equilibrium.sql`. The companion pack contains two lesson starters and six answer-keyed practice questions: `M4-physics-mechanical-equilibrium-teacher-starter-pack.md`.

This is a verified partial release only. The national total remains 67 outcomes; grade-by-grade extraction and implementation of the remaining outcomes are still in progress. The official comparison crosswalk confirms that content-group numbering cannot be treated as grade allocation. The migration is additive and idempotent; it has not been applied to Supabase.


## Second verified knowledge-graph batch — M4 outcomes 11–12

Two further outcomes have been extracted from the official IPST Physics curriculum-use manual and seeded:

| Grade | Outcome | Verified scope | Database objective |
|---|---:|---|---|
| M4 | 11 | Work; kinetic, gravitational potential and elastic potential energy; work-energy theorem | `M4-PHY-WORK-11` |
| M4 | 12 | Conservation of mechanical energy and calculations in motion when only conservative forces do work | `M4-PHY-ENERGY-12` |

Migration: `20261116134500_learning_physics_m4_work_energy.sql`. The companion pack contains two lesson starters and six answer-keyed practice questions: `M4-physics-work-energy-teacher-starter-pack.md`.

M4 now has four verified seeded outcomes (8, 9, 11 and 12), four lesson starters and 12 practice questions. This remains a partial release; the national total is 67 outcomes and grade-by-grade extraction is not complete. The migration is additive and idempotent and has not been applied to Supabase.


## Third verified knowledge-graph batch — M4 outcomes 14–15

Two further outcomes are confirmed in the official IPST Physics curriculum-use manual:

| Grade | Outcome | Verified scope | Database objective |
|---|---:|---|---|
| M4 | 14 | Momentum; impulse; impulse force; impulse from equations and force–time graph area | `M4-PHY-MOMENTUM-14` |
| M4 | 15 | One-dimensional elastic/inelastic collisions and separation; conservation of momentum | `M4-PHY-COLLISION-15` |

Migration: `20261116140000_learning_physics_m4_momentum_collisions.sql`. Companion pack: `M4-physics-momentum-collisions-teacher-starter-pack.md`, with two lesson starters and six answer-keyed questions.

M4 now has six verified seeded outcomes (8, 9, 11, 12, 14 and 15), six lesson starters and 18 answer-keyed questions. This is still a partial Physics release; the national total is 67. Grade-level extraction of all remaining outcomes is not complete. Migration remains unapplied to the live database.


## Fourth verified knowledge-graph batch — M4 outcomes 16–17

Two further M4 outcomes have been checked against the IPST Physics curriculum-use manual and the official IPST outcome-to-indicator crosswalk:

| Grade | Outcome | Verified scope | Database objective |
|---|---:|---|---|
| M4 | 16 | Parabolic projectile motion under gravity; independent horizontal and vertical components; investigation and calculation | `M4-PHY-PROJECTILE-16` |
| M4 | 17 | Uniform circular motion; centripetal force, radius, linear/angular speed and mass; satellite-orbit application | `M4-PHY-CIRCULAR-17` |

Migration: `20261116141500_learning_physics_m4_projectile_circular_motion.sql`. Companion pack: `M4-physics-projectile-circular-motion-teacher-starter-pack.md`, with two lesson starters and six answer-keyed questions.

M4 now has eight verified seeded outcomes (8, 9, 11, 12, 14, 15, 16 and 17), eight lesson starters and 24 answer-keyed questions. This remains a partial Physics release: the national curriculum contains 67 additional-study outcomes, and full grade-by-grade extraction is not complete. The migration is additive and idempotent; it has not been applied to Supabase.


## Fifth verified knowledge-graph batch — M4 outcome 13

The official IPST Physics curriculum-use manual identifies M4 outcome 13 as explaining the operation, efficiency and mechanical advantage of selected simple machines using work and mechanical equilibrium, and calculating efficiency and mechanical advantage.

| Grade | Outcome | Verified scope | Database objective |
|---|---:|---|---|
| M4 | 13 | Levers, pulleys, inclined planes, wedges, screws and wheel-and-axle; work, efficiency and mechanical advantage | `M4-PHY-SIMPLE-MACHINES-13` |

Migration: `20261116143000_learning_physics_m4_simple_machines.sql`. Companion pack: `M4-physics-simple-machines-teacher-starter-pack.md`, with one lesson starter and three answer-keyed questions.

M4 now has nine verified seeded outcomes (8, 9, 11, 12, 13, 14, 15, 16 and 17), nine lesson starters and 27 answer-keyed questions. At the time of this fifth batch, outcomes 1–7 and 10 had not yet been verified; the subsequent batches below verify and seed them as M4 outcomes. The migration is additive and idempotent; it has not been applied to Supabase.


## Sixth verified knowledge-graph batch — M4 outcome 10

The official IPST Physics curriculum-use manual confirms M4 outcome 10: analyse and calculate work done by a constant force using the equation and the area under a force–displacement graph, and explain and calculate average power. The outcome is explicitly labelled M4 in the manual (printed page 112).

| Grade | Outcome | Verified scope | Database objective |
|---|---:|---|---|
| M4 | 10 | Work by a constant force, force–displacement graph area and average power | `M4-PHY-WORK-10` |

Migration: `20261116144500_learning_physics_m4_work_power.sql`. Companion pack: `M4-physics-work-power-teacher-starter-pack.md`, with one lesson starter and three answer-keyed questions.

M4 now has ten verified seeded outcomes (8, 9, 10, 11, 12, 13, 14, 15, 16 and 17), ten lesson starters and 30 answer-keyed questions. Outcomes 1–7 remain to be checked against the grade-labelled official source. The migration is additive and idempotent; it has not been applied to Supabase.


## Seventh verified knowledge-graph batch — M4 outcomes 1–7

The official IPST Physics curriculum-use manual places outcomes 1–7 under the M4 grade heading (printed pp. 17–20). The outcomes cover the nature and development of physics; measurement, uncertainty and graph interpretation; uniformly accelerated straight-line motion; resultant forces; Newton laws and free-body diagrams; universal gravitation and gravitational fields; and friction.

| Grade | Outcomes | Database objectives |
|---|---|---|
| M4 | 1–2 | `M4-PHY-FOUNDATIONS-01`, `M4-PHY-MEASUREMENT-02` |
| M4 | 3–7 | `M4-PHY-MOTION-03`, `M4-PHY-FORCES-04`, `M4-PHY-NEWTON-05`, `M4-PHY-GRAVITATION-06`, `M4-PHY-FRICTION-07` |

Migration: `20261116150000_learning_physics_m4_foundations_motion_forces.sql`. Companion pack: `M4-physics-foundations-motion-forces-teacher-starter-pack.md`, with seven lesson starters and 21 answer-keyed questions.

M4 outcomes 1–17 are now all seeded: 17 objectives, 17 lesson starters and 51 answer-keyed questions. This completes the verified M4 outcome set. The national Physics curriculum contains 67 additional-study outcomes; M5 and M6 grade-level extraction and implementation remain outstanding. The migration is additive and idempotent; it has not been applied to Supabase.


## M5 verified staged release — outcomes 1–3

The official IPST curriculum-use manual explicitly labels the following additional Physics outcomes as M5:

| Grade | Outcome | Verified scope | Database objective | Manual page |
|---|---:|---|---|---:|
| M5 | 1 | Simple harmonic motion of a spring-mass system and simple pendulum; related calculations | `M5-PHY-SHM-01` | 128 |
| M5 | 2 | Natural frequency and resonance | `M5-PHY-RESONANCE-02` | 129 |
| M5 | 3 | Wave motion and energy transfer; mechanical/electromagnetic and transverse/longitudinal waves; wave properties; Huygens principle; superposition; wave calculations | `M5-PHY-WAVES-03` | 130 |

Migrations:
- `20261116151500_learning_physics_m5_simple_harmonic_motion.sql`
- `20261116153000_learning_physics_m5_natural_frequency_resonance.sql`
- `20261116154500_learning_physics_m5_wave_properties.sql`

Teacher packs:
- `M5-physics-simple-harmonic-motion-teacher-starter-pack.md`
- `M5-physics-natural-frequency-resonance-teacher-starter-pack.md`
- `M5-physics-wave-properties-teacher-starter-pack.md`

This staged release currently contains three verified M5 outcomes, three objectives, three lesson starters and nine answer-keyed questions. The remaining M5 outcomes and all M6 allocations still require source-by-source verification. These migrations are additive and idempotent and have not been applied to Supabase.


## M5 verified staged release — outcomes 6–7 (sound)

The official IPST manual explicitly labels outcome 6 on printed p. 136 and outcome 7 on printed p. 138 as M5 Physics. Outcome 6 covers sound intensity, sound level, hearing, sound quality and noise pollution, including calculations. Outcome 7 covers resonance of air in a pipe open at one end, beats, standing sound waves, Doppler effect, shock waves, calculations and applications.

Migration: `20261116160000_learning_physics_m5_sound_outcomes_6_7.sql`. Teacher pack: `M5-physics-sound-hearing-teacher-starter-pack.md`. This batch adds two objectives and two lesson starters with six answer-keyed questions. M5 outcomes 4–5 and 8–12 remain to be reconciled and seeded. Official source pages: https://www.scimath.org/e-books/8437/flippingbook/145/ and https://www.scimath.org/e-books/8437/flippingbook/147/.


## M5 verified staged release — outcomes 8 and 12 (light)

The official IPST Physics curriculum-use manual explicitly labels M5 outcome 8 on printed p. 141 and M5 outcome 12 on printed p. 147. Outcome 8 covers interference and diffraction of light using double slits, diffraction gratings and single slits. Outcome 12 covers natural optical phenomena including rainbows, halos, mirages and sky colours.

Migration: `20261116161500_learning_physics_m5_light_outcomes_8_12.sql`. Teacher pack: `M5-physics-light-optics-teacher-starter-pack.md`. This batch adds two objectives, two lesson starters and six answer-keyed questions. M5 outcomes 4–5 and 9–11 remain to be reconciled against the official manual; the outcome register is intentionally non-contiguous until verification is complete. Official sources: https://www.scimath.org/e-books/8437/flippingbook/150/ and https://www.scimath.org/e-books/8437/flippingbook/156/.


## M5 verified staged release — outcomes 9–11 (geometrical optics)

The official IPST Physics curriculum-use manual and its outcome register confirm that M5 outcomes 9, 10 and 11 concern reflection by plane/spherical mirrors, refraction including apparent depth and total internal reflection, and image formation by thin lenses. The manual's M5 grade label appears on the corresponding pages.

| Grade | Outcome | Verified scope | Database objective |
|---|---:|---|---|
| M5 | 9 | Law of reflection; ray diagrams and images from plane and spherical mirrors | `M5-PHY-LIGHT-REFLECTION-09` |
| M5 | 10 | Refractive index, Snell's law, apparent depth, critical angle and total internal reflection | `M5-PHY-LIGHT-REFRACTION-10` |
| M5 | 11 | Thin-lens ray diagrams, image position/size/type, lens equation and applications | `M5-PHY-LIGHT-LENSES-11` |

Migration: `20261116163000_learning_physics_m5_geometrical_optics_outcomes_9_11.sql`. Teacher pack: `M5-physics-geometrical-optics-teacher-starter-pack.md`. This batch adds three objectives, three lesson starters and nine answer-keyed questions. Official source pages: https://www.scimath.org/e-books/8437/flippingbook/151/ through /155/; the outcome register explicitly lists outcomes 9–11 and the grade allocation.

M5 outcome numbers 4–5 remain under audit; the M5 register is deliberately non-contiguous until those outcomes are independently verified.


## M5 verified staged release — outcomes 4–5 (water waves and sound production)

The official IPST Physics manual outcome register identifies M5 outcome 4 as observing and explaining reflection, refraction, interference and diffraction of surface water waves, and outcome 5 as explaining sound production, propagation, particle-displacement/pressure relationships and the dependence of sound speed in air on temperature. These are distinct from outcome 3 (general wave motion), outcome 6 (sound intensity/hearing) and outcome 7 (sound phenomena).

| Grade | Outcome | Verified scope | Database objective |
|---|---:|---|---|
| M5 | 4 | Surface water-wave reflection, refraction, interference and diffraction | `M5-PHY-WATER-WAVES-04` |
| M5 | 5 | Sound production and propagation, longitudinal pressure/displacement waves and speed-temperature relationship | `M5-PHY-SOUND-PROPAGATION-05` |

Migration: `20261116164500_learning_physics_m5_water_waves_sound_propagation.sql`. Teacher pack: `M5-physics-water-waves-sound-propagation-teacher-starter-pack.md`. This batch adds two objectives, two lesson starters and six answer-keyed questions. The IPST outcome register source is https://www.scimath.org/e-books/8437/flippingbook/35/; the manual's M5 wave and sound content supports the detailed scope.

M5 outcomes 1–12 are now all represented in the staged objective register. This completes the M5 numbered outcome set; M6 grade allocations and all remaining Physics domains still require verification.


## M6 Physics — official scope review and grade-allocation checkpoint

The official IPST/OBEC revised-2017 Science curriculum PDF confirms the four Physics content domains and their intended scope. Domain 3 covers electrostatics, electric fields and potential, capacitance, DC circuits, electrical energy and power, renewable electricity, magnetism, electromagnetic induction, AC, electromagnetic waves and communication. Domain 4 covers heat and changes of state, elasticity/Young's modulus, fluid statics and dynamics, gas laws and kinetic theory, Bohr's atom, photoelectric effect, wave-particle duality, radioactivity, nuclear forces/reactions/energy and particle physics. The national Physics programme contains 67 additional learning outcomes in total.

**Important allocation control:** the national curriculum overview is a content-domain description, not a complete grade-level allocation table. The official IPST Physics teacher-guide catalogue confirms M6 Volume 5 covers magnetism/electricity, heat and gases, solids and fluids; M6 Volume 6 covers electromagnetic waves, atomic physics, nuclear physics and particle physics. Those textbook/guide volumes are evidence for M6 topic scope, but they do not by themselves establish the exact numbered learning-outcome allocation. The grade-specific official learning-outcome table and manual pages must be matched before creating any M6 objective.

| M6 evidence source | What it verifies | What it does not establish alone |
|---|---|---|
| IPST official revised-2017 curriculum, Physics section, printed pp. 190 onward | The official outcome wording and the full Physics domain scope | Exact grade allocation for every numbered outcome in the extracted PDF table |
| IPST M6 Physics teacher guide, Volume 5 | M6 instructional scope: magnetism/electricity, heat/gases, solids/fluids | Exact outcome number and alignment for each topic |
| IPST M6 Physics teacher guide, Volume 6 | M6 instructional scope: electromagnetic waves, atomic/nuclear/particle physics | Exact outcome number and alignment for each topic |

Sources:
- IPST/OBEC, *ตัวชี้วัดและสาระการเรียนรู้แกนกลาง กลุ่มสาระการเรียนรู้วิทยาศาสตร์ (ฉบับปรับปรุง พ.ศ. 2560)*, Physics outcomes and domain descriptions: https://www.ipst.ac.th/wp-content/uploads/2022/05/SciCurriculum_2560.pdf
- IPST, M6 Physics teacher guide Volume 5: https://myipst.ipst.ac.th/medias/m6b5_Physics_Teacher_Guide
- IPST, M6 Physics teacher guide Volume 6: https://uatscimath.ipst.ac.th/?catid=204&id=11559%3A6-6&view=article

No M6 Physics outcomes are seeded in this checkpoint. Do not assign all Group 3 or Group 4 outcomes to M6 solely from their textbook volume; reconcile each official outcome number against the grade-labelled IPST manual and crosswalk first.


## M6 verified staged release — Physics outcomes 2, 3 and 6

The official IPST Physics curriculum-use manual explicitly labels these outcomes as M6 on the cited pages:

| Grade | Outcome | Verified scope | Database objective | Printed page |
|---|---:|---|---|---:|
| M6 | 2 | Magnetic forces on moving charged particles and current-carrying conductors; circular motion in a magnetic field; parallel-wire forces | `M6-PHY-MAGNETIC-FORCES-02` | 171 |
| M6 | 3 | Torque on current-carrying coils; galvanometer and DC motor operation | `M6-PHY-MOTORS-GALVANOMETERS-03` | 173 |
| M6 | 6 | Three-phase AC generators and transformer operation/calculations | `M6-PHY-AC-GENERATORS-TRANSFORMERS-06` | 177 |

Migration: `20261116170000_learning_physics_m6_magnetic_forces_motors_generators.sql`. Teacher pack: `M6-physics-magnetic-forces-motors-generators-teacher-starter-pack.md`. This batch adds three objectives, three lesson starters and nine answer-keyed questions. Source pages: https://www.scimath.org/e-books/8437/flippingbook/180/ (printed p. 171), /182/ (printed p. 173), and /186/ (printed p. 177).

M6 outcomes 1, 4, 5 and 7 onward remain to be extracted and verified; no unverified outcome numbers are inferred from textbook chapter order.


## M6 verified staged release — electricity outcomes 1, 4 and 5

The official IPST comparison crosswalk explicitly maps Group 3 outcome 1 to M6 and maps the Group 3 magnetic/electrical outcomes to the M6 programme. The grade-labelled IPST curriculum-use manual identifies outcome 4 (electromagnetic induction and Faraday's law) on printed p. 174 and outcome 5 (RMS voltage and current in AC circuits) on printed p. 176. Outcome 1 covers magnetic field lines, magnetic flux, and fields produced by straight current-carrying conductors and solenoids.

| Grade | Outcome | Verified scope | Database objective | Evidence |
|---|---:|---|---|---|
| M6 | 1 | Magnetic field lines and flux; fields from straight conductors and solenoids | `M6-PHY-MAGNETIC-FIELDS-01` | IPST official comparison crosswalk; M6 Group 3 |
| M6 | 4 | Induced emf, Faraday's law, Lenz's law and electrical-device applications | `M6-PHY-ELECTROMAGNETIC-INDUCTION-04` | Manual, printed p. 174 |
| M6 | 5 | Sinusoidal AC voltage/current and RMS values | `M6-PHY-AC-RMS-05` | Manual, printed p. 176 |

Migration: `20261116171500_learning_physics_m6_magnetic_fields_induction_ac.sql`. Teacher pack: `M6-physics-magnetic-fields-induction-ac-teacher-starter-pack.md`. This batch adds three M6 objectives, three lesson starters and nine answer-keyed questions.

M6 Physics outcomes 1–6 are now represented (outcomes 1–6, except no gaps in this range): six objectives, six lesson starters and 18 answer-keyed questions across the two M6 packs. Outcomes 7 onward and the remaining Physics content groups still require grade-by-grade official verification. No migrations have been applied to Supabase.

Official sources:
- IPST Physics outcome-to-indicator comparison crosswalk: https://www.ipst.ac.th/wp-content/uploads/2022/05/Comparison_PhysicalSciLI_and_PhysicsLO_02-1.pdf
- IPST curriculum-use manual, outcome 4, printed p. 174: https://www.scimath.org/e-books/8437/flippingbook/183/
- IPST curriculum-use manual, outcome 5, printed p. 176: https://www.scimath.org/e-books/8437/flippingbook/185/


## M6 verified staged release — electromagnetic-wave outcomes 7–8

The official IPST curriculum-use manual explicitly labels outcome 7 on printed p. 178 and outcome 8 on printed p. 179 as M6.

| Grade | Outcome | Verified scope | Database objective | Printed page |
|---|---:|---|---|---:|
| M6 | 7 | Electromagnetic-wave generation and properties; spectrum; unpolarised and linearly polarised light; polaroid sheets and applications | `M6-PHY-ELECTROMAGNETIC-WAVES-07` | 178 |
| M6 | 8 | Information transmission using electromagnetic waves; analogue and digital signal comparison | `M6-PHY-ELECTROMAGNETIC-COMMUNICATION-08` | 179 |

Migration: `20261116173000_learning_physics_m6_electromagnetic_waves_communication.sql`. Teacher pack: `M6-physics-electromagnetic-waves-communication-teacher-starter-pack.md`. This batch adds two M6 objectives, two lesson starters and six answer-keyed questions.

The M6 Group 3 electricity/magnetism/electromagnetic-wave sequence is now staged for outcomes 1–8: eight objectives, eight lesson starters and 24 answer-keyed questions across three M6 teacher packs. This is not a claim that all M6 Physics or all 67 national Physics outcomes are complete; the remaining Group 3 outcomes and Group 4 allocations still require grade-by-grade official verification.

Official manual pages: https://www.scimath.org/e-books/8437/flippingbook/187/ and https://www.scimath.org/e-books/8437/flippingbook/188/


## M6 verified staged release — Group 4 outcomes 1–9

The official IPST Physics curriculum-use manual explicitly lists Group 4 outcomes 1–9 under M6 in the table beginning on printed p. 37 and continuing through printed pp. 38–43. These outcomes cover heat and phase change; elasticity and Young's modulus; gauge, absolute and atmospheric pressure; buoyancy; surface tension and viscosity; ideal-fluid continuity and Bernoulli; ideal-gas laws; kinetic theory and RMS molecular speed; and gas work and the first law of thermodynamics.

| M6 outcome | Scope | Database objective |
|---:|---|---|
| 1 | Heat, temperature change and phase change | `M6-PHY-THERMAL-ENERGY` |
| 2 | Elasticity, stress, strain and Young's modulus | `M6-PHY-ELASTICITY-YOUNGS-MODULUS` |
| 3 | Gauge, absolute and atmospheric pressure | `M6-PHY-FLUID-PRESSURE` |
| 4 | Buoyancy and Archimedes' principle | `M6-PHY-BUOYANCY-ARCHIMEDES` |
| 5 | Surface tension and viscosity | `M6-PHY-SURFACE-TENSION-VISCOSITY` |
| 6 | Ideal fluids, continuity and Bernoulli | `M6-PHY-IDEAL-FLUID-BERNOULLI` |
| 7 | Ideal gas law | `M6-PHY-IDEAL-GAS-LAWS` |
| 8 | Kinetic theory and RMS molecular speed | `M6-PHY-KINETIC-THEORY-GAS` |
| 9 | Gas work and first law of thermodynamics | `M6-PHY-THERMODYNAMICS-FIRST-LAW` |

Migration: `20261116174500_learning_physics_m6_thermal_fluids_gases_outcomes_1_9.sql`. Teacher pack: `M6-physics-thermal-fluids-gases-teacher-starter-pack.md`. This batch adds nine M6 objectives, nine lesson starters and 27 answer-keyed questions.

This confirms the Group 4 M6 outcome sequence 1–9. Group 4 outcomes 10 onward are treated separately and still require exact grade extraction. It does not imply that all M6 Physics outcomes or all 67 national Physics outcomes are complete.

Official source: IPST, *Curriculum-use manual for Additional Physics*, M6 Group 4 outcomes table, printed pp. 37–43; official PDF: https://www.academic.obec.go.th/web/images/document/1760950054_d_1.pdf



## M6 verified staged release — Group 4 modern/atomic/nuclear outcomes 10–14, 16–17

The official IPST curriculum-use manual identifies Group 4 outcomes 10–14 and 16–17 in the M6 sequence. The official comparison crosswalk explicitly allocates Group 4 outcomes **15 and 18 to M5**, while outcomes 16 and 17 are M6. Those two M5 outcomes are therefore excluded from this M6 migration; grade allocation is not inferred from the group number or adjacent sequence.

| Grade | Group 4 outcome | Verified scope | Database objective |
|---|---:|---|---|
| M6 | 10 | Planck hypothesis, Bohr atomic model and hydrogen spectral lines | `M6-PHY-10` |
| M6 | 11 | Photoelectric effect; photon energy, photoelectron kinetic energy and work function | `M6-PHY-11` |
| M6 | 12 | Wave-particle duality and de Broglie wavelength | `M6-PHY-12` |
| M6 | 13 | Radioactivity; alpha, beta and gamma radiation | `M6-PHY-13` |
| M6 | 14 | Activity, radioactive decay and half-life | `M6-PHY-14` |
| M6 | 16 | Nuclear reactions, fission, fusion and nuclear energy | `M6-PHY-16` |
| M6 | 17 | Uses and hazards of nuclear energy/radiation; radiation protection | `M6-PHY-17` |

Migration: `20261116180000_learning_physics_m6_modern_atomic_nuclear_outcomes_10_14_16_17.sql`. Teacher pack: `M6-physics-modern-atomic-nuclear-teacher-starter-pack.md`. This batch adds seven M6 objectives, seven lesson starters and 21 answer-keyed questions.

**Grade-allocation correction to preserve:** Group 4 outcomes 15 (nuclear forces, nuclear stability and binding energy) and 18 (particle-physics research and the Standard Model) are M5, not M6. They remain to be staged under M5 after the M5 Group 4 register is reconciled. Official sources: IPST curriculum-use manual, printed pp. 43–45; IPST official outcome-to-indicator comparison crosswalk; https://www.academic.obec.go.th/web/images/document/1760950054_d_1.pdf and https://www.ipst.ac.th/wp-content/uploads/2022/05/Comparison_PhysicalSciLI_and_PhysicsLO_02-1.pdf.

M6 Group 4 now has 16 verified outcomes staged (1–14, 16–17), with 16 lesson starters and 48 answer-keyed questions across the two Group 4 teacher packs. M6 Group 3 has eight staged outcomes. Physics remains a staged curriculum release; no migration has been applied to the live Supabase database.
