# E&P Learning — Chemistry Curriculum Audit

**Curriculum:** Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Chemistry (IPST 2017)
**Source of truth:** IPST, *Curriculum-use Manual for Additional Science: Chemistry, Upper Secondary Level* (2017), including the grade-specific learning outcomes and outcome-to-indicator comparison tables.
**Status:** All official upper-secondary Chemistry outcome allocations represented in the manual are staged. **81/81 objectives staged.** Each objective has one lesson starter and three answer-keyed practice questions in the companion teacher packs. These are authoring resources, not rows inserted into the app's content or question tables.
**Database/content boundary:** The Chemistry migration files seed the academic knowledge graph and grade alignments only. Lesson starters and answer-keyed questions are in the Markdown teacher packs; they must be authored under an authenticated school teacher account through the existing generic content and question-bank workflows before they become app content.


## Verified grade and content-strand register

| Grade | Content strand | Official outcomes | Staged | Migration |
|---|---|---:|---:|---|
| M4 | Strand 1 — Atomic structure, periodicity, bonding and properties of substances | 1–21 (21) | 21 | `20261116114500_learning_chemistry_m4_atomic_structure_bonding.sql` |
| M4 | Strand 2 — Chemical equations and stoichiometry | 1–7 (7) | 7 | `20261116120000_learning_chemistry_m4_reactions_stoichiometry.sql` |
| M5 | Strand 1 — Gas laws and properties of gases | 1–6 (6) | 6 | `20261116124500_learning_chemistry_m5_gas_laws.sql` |
| M5 | Strand 2 — Reaction rates, equilibrium, acids/bases, redox and electrochemistry | 1–32 (32) | 32 | `20261116121500_learning_chemistry_m5_kinetics_equilibrium.sql`; `20261116123000_learning_chemistry_m5_acids_bases_redox_electrochemistry.sql` |
| M6 | Strand 1 — Organic compounds and polymers | 1–15 (15) | 15 | `20261116130000_learning_chemistry_m6_organic_polymers.sql` |
| **Total** | | **81** | **81** | |

Grade totals:
- **M4:** 28 outcomes (21 + 7)
- **M5:** 38 outcomes (6 + 32)
- **M6:** 15 outcomes

## Grade-allocation audit

The official manual assigns the additional Chemistry outcomes by both content strand and grade. The outcome number restarts within each grade/strand allocation; it is not a single global sequence.

- M4 Strand 1 has outcomes 1–21; M4 Strand 2 has outcomes 1–7.
- M5 Strand 1 gas-law outcomes are 1–6; M5 Strand 2 reaction chemistry outcomes are 1–32.
- M6 Strand 1 organic-compound and polymer outcomes are 1–15.
- The official grade/outcome tables do not assign an additional M6 Strand 2 sequence. Do not manufacture one by moving M5 outcomes forward or by treating a strand as a grade.

The IPST manual's comparison tables also distinguish foundational Science indicators from additional Chemistry learning outcomes. The mapping is not one-to-one: for example, one additional outcome may support multiple foundational indicators, and an indicator may be covered by more than one additional outcome. The staged objective register follows the additional-course outcome allocation, not the basic-course indicator numbering.

## Teacher content and assessment coverage

Six existing teacher starter packs cover the register:
- M4 atomic structure and bonding: 21 starters, 63 questions.
- M4 reactions and stoichiometry: 7 starters, 21 questions.
- M5 kinetics and equilibrium: 13 starters, 39 questions.
- M5 acids, bases, redox and electrochemistry: 19 starters, 57 questions.
- M5 gas laws: 6 starters, 18 questions.
- M6 organic compounds and polymers: 15 starters, 45 questions.

**Chemistry total: 81 lesson starters and 243 answer-keyed questions.** Practical chemistry activities must remain teacher-approved and risk-assessed, using microscale methods or simulations where appropriate. The packs do not authorize improvised mixtures, unsupervised titrations or hazardous demonstrations.

## Official source references

1. IPST, *Curriculum-use Manual for Additional Science: Chemistry, Upper Secondary Level* (2017):
   - Official manual and overview: https://www.scimath.org/ebook-chemistry/item/8417-2-2560-2551
   - Official flipbook: https://www.scimath.org/e-books/8417/flippingbook/
   - Grade/outcome comparison pages: https://www.scimath.org/e-books/8417/flippingbook/43/ through https://www.scimath.org/e-books/8417/flippingbook/47/
2. OBEC official curriculum documents collection: https://www.academic.obec.go.th/web/document/collection/1/3
3. IPST identifies the Chemistry manual as its official upper-secondary curriculum-use resource for M4–M6 teachers and curriculum developers.

## Release boundary

This audit verifies curriculum coverage and staged content only. All SQL migrations remain unapplied to the live Supabase database. No school, class, student or assignment records were created or changed by this audit. The branch still requires the planned final pull, lint, build and database-migration review before release.
