# E&P Learning — Upper-secondary Physics Curriculum Audit

**Status:** Official scope verified; grade-level outcome extraction is the next gate. No Physics objectives or alignments have been seeded by this audit.

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

The existing `PHYSICS` subject track and M4–M6 grade catalogue are already present. This audit adds no database records. The next implementation batch must first produce a grade-by-grade, outcome-numbered register reconciled against the official IPST documents; only then should idempotent knowledge-graph migrations and teacher starter packs be authored.
