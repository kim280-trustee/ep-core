# E&P Learning — Biology Curriculum Audit

**Curriculum:** Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Biology (IPST 2017)
**Source of truth:** IPST, *Curriculum-use Manual for Additional Science: Biology, Upper Secondary Level* (2017), including the outcome-to-indicator alignment tables and grade-specific learning-outcome tables.
**Status:** All official upper-secondary Biology outcome allocations in the manual are represented in the staged curriculum catalogue. **108/108 outcomes staged.** Each outcome has one teacher lesson starter and three answer-keyed questions.

## Verified grade and content-strand register

| Grade | Content strand | Official outcomes | Staged | Migration |
|---|---|---:|---:|---|
| M4 | Strand 1 — Foundations of life, cell biology and cellular processes | 1–17 (17) | 17 | `20261116101500_learning_biology_m4_cellular_foundations.sql` |
| M4 | Strand 2 — Genetics, genetic technology and evolution | 1–15 (15) | 15 | `20261116103000_learning_biology_m4_genetics_evolution.sql` |
| M5 | Strand 3 — Plant structure, function, reproduction and responses | 1–18 (18) | 18 | `20261116104500_learning_biology_m5_plant_structure_function.sql` |
| M5 | Strand 4 — Animal and human organ systems | 1–21 (21) | 21 | `20261116110000_learning_biology_m5_animal_physiology.sql` |
| M6 | Strand 2 — Biodiversity, origin of life and classification | 1–5 (5) | 5 | `20261116131500_learning_biology_m6_biodiversity_taxonomy.sql` |
| M6 | Strand 4 — Nervous coordination, movement, reproduction, hormones and behaviour | 1–19 (19) | 19 | `20261116111500_learning_biology_m6_animal_physiology.sql` |
| M6 | Strand 5 — Ecosystems, populations and environmental sustainability | 1–13 (13) | 13 | `20261116113000_learning_biology_m6_ecology_biodiversity.sql` |
| **Total** | | **108** | **108** | |

Grade totals:
- **M4:** 32 outcomes (17 + 15)
- **M5:** 39 outcomes (18 + 21)
- **M6:** 37 outcomes (5 + 19 + 13)

## Grade-allocation audit and exclusions

The manual assigns outcomes by both content strand and grade. The outcome number restarts within each strand/grade allocation and is not a global Biology sequence.

- Strand 2 has an M4 sequence of outcomes 1–15 and a separate M6 sequence of outcomes 1–5. The M6 sequence is seeded separately under M6; it is not an extension of the M4 sequence.
- Strand 3 plant Biology outcomes 1–18 are assigned to M5.
- Strand 4 animal physiology is split into an M5 sequence (1–21) and a separate M6 sequence (1–19).
- Strand 5 ecology/environment outcomes 1–13 are assigned to M6.
- The manual does not allocate additional Biology outcomes to M4 strands 3–5 or M5 strand 5. These are not unseeded curriculum gaps. Do not manufacture grade allocations to fill every strand/grade cell.

## Teacher content and assessment coverage

Seven existing teacher starter packs cover the register:
- M4 cellular foundations: 17 starters, 51 questions.
- M4 genetics and evolution: 15 starters, 45 questions.
- M5 plant structure and function: 18 starters, 54 questions.
- M5 animal physiology: 21 starters, 63 questions.
- M6 animal physiology: 19 starters, 57 questions.
- M6 ecology and environment: 13 starters, 39 questions.
- M6 biodiversity and taxonomy: 5 starters, 15 questions.

**Biology total: 108 lesson starters and 324 answer-keyed questions.** The packs are teaching starters, not substitutes for teacher review, local lesson planning, laboratory risk assessment or school assessment policy.

## Official source references

1. IPST, *Curriculum-use Manual for Additional Science: Biology, Upper Secondary Level* (2017), official flipbook:
   - Overview and alignment: https://www.scimath.org/ebook-biology/item/8416-2-2560-2551
   - Strand 1 and strand 2 grade/outcome tables: https://www.scimath.org/e-books/8416/flippingbook/27/ through https://www.scimath.org/e-books/8416/flippingbook/35/
   - Strand 3 plant outcomes: https://www.scimath.org/e-books/8416/flippingbook/36/ through https://www.scimath.org/e-books/8416/flippingbook/40/
   - Strand 4 animal physiology: https://www.scimath.org/e-books/8416/flippingbook/41/ through https://www.scimath.org/e-books/8416/flippingbook/51/
   - Strand 5 ecology and environment: https://www.scimath.org/e-books/8416/flippingbook/51/ onward.
2. OBEC official document listing for the upper-secondary additional Biology curriculum-use manual: https://www.academic.obec.go.th/web/document/view/299
3. IPST identifies the manual as its official Biology curriculum-use resource for M4–M6 teachers and curriculum developers.

## Release boundary

This audit verifies curriculum coverage and staged content only. All SQL migrations remain unapplied to the live Supabase database. No school, class, student or assignment records were created or changed by this audit. The branch still requires the planned final pull, lint, build and database-migration review before release.
