# Thai Primary Education Curriculum B.E. 2568 (2025) — P1–P3 Source and Catalogue Audit

**Official authority:** Office of the Basic Education Commission (OBEC), Thailand  
**Official source:** [Primary Education Curriculum B.E. 2568 (2025), P1–P3](https://academic.obec.go.th/web/images/document/1760950927_d_1.pdf)  
**Curriculum code:** `TH-PRIMARY-2025-P1-P3`  
**Source status:** Published for schools that are ready and voluntarily adopt the curriculum  
**E&P catalogue status:** Draft — keep separate from the B.E. 2551 (2008), revised B.E. 2560 (2017) subject-indicator framework  
**Audit date:** 21 November 2026

## 1. Correct curriculum model

The 2025 document is a competency-based early-primary framework. It is not a new set of eight subject learning areas and it does not replace the 2008/2017 curriculum catalogue.

The official framework defines:

- **Three foundational learning capabilities:** Reading Literacy, Writing Literacy and Numeracy.
- **Five functional-literacy capabilities:** Science, Environment and Technology; Society and Citizenship; Economy and Finance; Physical and Mental Health; Arts and Culture for Aesthetics.
- **Eight annual capability outcomes per grade:** P1, P2 and P3, for 24 grade-specific annual outcomes.
- **Five desirable characteristics:** love of nation, religion and monarchy; honesty and integrity; discipline; living with sufficiency; and public-mindedness.
- **Foundational knowledge examples:** Section 8 provides illustrative knowledge sets to support capability development and explicitly allows schools to define and adapt the detailed content to their context.

The 2025 curriculum also describes eight end-of-stage outcomes for completion of P3. These are recorded in the relevant capability descriptions, not duplicated as extra grade-level indicators.

## 2. Catalogue implementation

The live draft catalogue now contains:

| Entity | Verified count | Meaning |
|---|---:|---|
| Curriculum | 1 | Separate B.E. 2568 P1–P3 framework |
| Internal navigation subject | 1 | Integrated Competency Outcomes; not an official subject |
| Capability skills | 8 | Three foundational + five functional capabilities |
| Cross-cutting skills | 1 | Desirable Characteristics; not a ninth capability |
| Grade-specific knowledge topics | 24 | Eight capability areas × P1/P2/P3 |
| Cross-cutting knowledge topic | 1 | Five desirable characteristics |
| Annual outcome objectives | 24 | Eight official annual outcomes per grade |
| Required grade alignments | 24 | Exactly eight each for P1, P2 and P3 |
| Must-Know / Should-Know labels | 0 | Not used by this competency-based framework |

The curriculum status remains `draft`. The integrated subject is an internal navigation container required by the current E&P learning catalogue; it must not be presented as an official OBEC subject.

## 3. Grade outcome coverage

| Grade | Foundational capabilities | Functional-literacy capabilities | Total annual outcomes |
|---|---:|---:|---:|
| P1 | 3 | 5 | 8 |
| P2 | 3 | 5 | 8 |
| P3 | 3 | 5 | 8 |
| **Total** | **9** | **15** | **24** |

Each outcome is aligned to one exact grade. No outcome is copied across grades. The objective descriptions preserve the official Thai annual outcome and include a separately labelled E&P working English translation.

## 4. Internal identifiers

OBEC does not assign numeric indicator codes to these annual capability outcomes. E&P has therefore generated internal grade-safe identifiers, for example:

- `P1-TH68-READ-01`
- `P2-TH68-NUM-01`
- `P3-TH68-SCI-01`
- `P3-TH68-ARTS-01`

These are not official OBEC codes. Their P1/P2/P3 prefix allows the teacher-pack importer to enforce exact grade matching without falling back to a selected grade.

## 5. Foundational knowledge handling

The 24 grade-specific knowledge topics reflect the examples in official section 8:

- Reading: everyday texts, symbols, charts and maps; Thai and English vocabulary progression.
- Writing: sentence construction, vocabulary, paragraph organization and short articles.
- Numeracy: number concepts, operations, patterns, fractions, measurement, geometry and data.
- Science, Environment and Technology: natural phenomena, materials, living things, tools, technology and environmental care.
- Society and Citizenship: rights, responsibilities, democratic participation, culture, local wisdom and timelines.
- Economy and Finance: money, income, expenses, saving, sufficiency and honest work.
- Physical and Mental Health: growth, healthy habits, safety, emotional awareness and stress management.
- Arts and Culture: family and local cultural participation, appreciation, expression and presentation.

These topics are labelled illustrative. They are not converted into additional required indicators because OBEC states that schools may define the detailed knowledge scope appropriately.

## 6. Teacher resource pack

`TH-PRIMARY-2025-P1-P3-COMPETENCY-IMPORT.md` contains:

- 24 lesson starters, one for each annual outcome.
- 72 E&P-authored formative questions with expected answers.
- Three questions per outcome.
- Teacher-only guidance describing voluntary adoption, the competency structure, internal code scheme, illustrative knowledge foundations and the distinction from official OBEC assessment material.

The questions are original E&P teaching resources, not official OBEC examination questions. The pack has not been imported into a school organization or published.

## 7. Source references

- Sections 5.1–5.3: foundational capabilities, functional-literacy domains and desirable characteristics, printed pp. 5–6.
- Sections 6.1–6.3: end-of-stage P3 outcomes, printed pp. 6–7.
- Sections 7.1–7.2: annual P1/P2/P3 outcomes, printed pp. 7–9.
- Sections 8.1–8.2: illustrative foundational knowledge, printed pp. 9–14.

## 8. Release boundary and remaining work

- The 2025 curriculum remains draft and is not activated for any school by this seed.
- No crosswalk to the 2008/2017 subject indicators has been asserted. Any future crosswalk must be reviewed as a separate mapping exercise; competency outcomes are not assumed to be one-to-one equivalents of old indicators.
- No school, class, student, assignment, publication or learner-progress records were created or changed.
- Automated parser validation, authenticated teacher preview, controlled draft import, student assessment and teacher-review tests remain part of the single consolidated application-testing phase after all curriculum source work is complete.


## Final automated verification — 21 November 2026

Live Supabase read-only verification passed: 9 skills including the cross-cutting values skill, 25 knowledge topics, 24 annual outcome objectives and 24 required grade alignments, with exactly eight outcomes each in P1, P2 and P3. The curriculum remains draft and has no Must-Know / Should-Know labels.

GitHub Actions run 95 passed the actual TypeScript teacher-pack parser against this pack: 24 lessons, eight outcomes per grade, 24 unique E&P internal codes and 72 answer-keyed formative questions. The same run passed all 39 packs across the eight 2008/2017 learning areas, the consolidated Science parser, production build and ESLint. Authenticated teacher import and student/teacher end-to-end testing remain deferred to the single consolidated test phase.
