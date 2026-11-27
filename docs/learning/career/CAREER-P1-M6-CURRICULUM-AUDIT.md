# Occupations and Career — P1–M6 Curriculum Audit

**Curriculum:** Thai Basic Education Core Curriculum B.E. 2551 (2008), applied with the relevant B.E. 2560 (2017) revisions and subsequent OBEC scope orders  
**Subject code:** `CAREER`  
**Coverage:** P1–M6  
**Status:** Curriculum mapping and teacher source packs authored and parser-validated. Draft import and authenticated application acceptance remain pending.

## Official scope

Use the official Occupations and Career learning-area indicators from the OBEC Basic Education Core Curriculum source register. Apply OBEC Order 921/2561 when interpreting the historical Career and Technology documents: Design and Technology and ICT standards ว 4.1 and ว 4.2 were removed from the former Occupations and Technology learning area and relocated to Science and Technology. They must not be duplicated under Career.

The 2025 B.E. 2568 early-primary competency curriculum is separate. Its integrated Economy and Finance capability is not a replacement for the Career subject indicators in the 2008/2017 curriculum.

## Catalogue reconciliation

| Measure | Verified result |
|---|---:|
| Unique Career indicators | 54 |
| Grade/interval alignments | 76 |
| Priority classification | Verified for all required alignments |
| Teacher starter-pack source lessons | 54 |
| Source formative questions | 162 |
| Teacher starter-pack files | 3 |

The alignment count exceeds the unique indicator count because 11 M4–M6 interval indicators each align to three grades. Do not interpret 76 alignments as 76 unique indicators.

## Teacher resource packs

| Pack | Source lessons | Source questions |
|---|---:|---:|
| `CAREER-P1-P3-TEACHER-STARTER-PACK.md` | 9 | 27 |
| `CAREER-P4-P5-TEACHER-STARTER-PACK.md` | 11 | 33 |
| `CAREER-P6-M6-TEACHER-STARTER-PACK.md` | 34 | 102 |
| **Total** | **54** | **162** |

Each source lesson maps to one registered Career indicator and contains three answer-keyed formative questions. The lessons, activities, examples, rubrics and questions are original teacher-created support material, not verbatim OBEC assessment items.

## Import expansion

The 11 shared `CAREER-M46` indicators must expand to M4, M5 and M6 during parsing/import. They must not collapse to a single grade.

| Import measure | Expected draft records |
|---|---:|
| Grade-specific source lessons (54 minus 11 shared) | 43 |
| Shared M4–M6 lessons (11 × 3 grades) | 33 |
| **Total grade-scoped lesson drafts** | **76** |
| **Total grade-scoped question drafts** | **228** |

The 162 source questions expand in the same way: 129 questions from the 43 grade-specific lessons plus 99 questions from the 33 expanded shared-grade lessons. These are expected import counts, not claims that records have already been created.

## Verification and release boundary

- The combined Thai Language/Career validator parses all three Career packs through the actual TypeScript teacher-pack parser.
- It checks the 54 expected unique Career objective codes, pack lesson counts, three answer-keyed questions per lesson, non-empty prompts/answer guides, code uniqueness and exact grade extraction.
- It verifies that every shared `M46` objective expands to exactly M4, M5 and M6.
- The latest checked workflow, [45137257201](https://github.com/kim280-trustee/ep-core/actions/runs/45137257201), passed the Thai Language/Career parser validation, production build and ESLint. The overall workflow is red only at the separate Social Studies validator; that subject is Edna-owned and was not changed in this work.
- No Career pack has been imported or published. No school, class, student, assignment or progress data has been changed.
- Authenticated preview/import, post-import reconciliation, student access, assessment submission and teacher review remain part of the consolidated application acceptance phase.

## Release gate

Use the instructions in [CAREER-TEACHER-PACK-IMPORT-GUIDE.md](CAREER-TEACHER-PACK-IMPORT-GUIDE.md). Import only as drafts in an explicitly approved isolated staging organization/class with an authorized staging teacher. Do not use the live Khamkhen Kheo Chanupathum pilot or real learner records. Do not publish until all 76 lesson drafts and 228 question drafts, their objective/grade links, protected answer keys and draft state have been reconciled and teacher acceptance is complete.
