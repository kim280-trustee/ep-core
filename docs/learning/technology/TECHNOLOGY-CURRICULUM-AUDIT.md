# Computer Studies M1–M3 — Curriculum Audit

**Subject code:** `COMPUTER-STUDIES` — Computer Studies  
**Curriculum code:** `CLICK-START-M1-M3`  
**Textbook:** Cambridge Click Start International Edition  
**Implementation branch:** `paul/learning-academic-integrity-audit`

## Confirmed school textbook mapping

| School grade | Textbook | Teaching chapters | Sample paper |
|---|---|---:|---|
| M1 | Learner's Book 4 | 8 | Chapter 9 |
| M2 | Learner's Book 5 | 9 | Chapter 10 |
| M3 | Learner's Book 6 | 12 | Chapter 13 |
| **Total** | | **29** | **3** |

The chapter titles are based on the published contents of the three Cambridge books. The teacher packs provide original lesson starters and practice questions mapped to those chapter titles. They do not reproduce the full textbook, and they do not claim that independently created activities are verbatim book exercises. Teachers should check the physical/digital learner's book for the exact subtopic sequence, worked examples, screenshots and exercise wording.

## M1 — Learner's Book 4
1. Know Your Computer
2. Using Windows
3. MS Word 2010 — Formatting Text
4. Fun with Tux Paint
5. MSWLogo — Drawing Polygons and Circles
6. MSWLogo — Using PenColors and PenSizes
7. MSWLogo — Text Commands and Arithmetic Operations
8. Introduction to MS PowerPoint 2010
9. Sample Paper (assessment resource)

## M2 — Learner's Book 5
1. Know Your Computer
2. Using Windows
3. MS Office at a Glance
4. MS Word 2010 — Inserting Objects and Drawing
5. MS PowerPoint 2010 — Editing and Formatting Slides
6. Introduction to MS Excel 2010
7. The Internet
8. Learning Algorithms
9. Introduction to Scratch
10. Sample Paper (assessment resource)

## M3 — Learner's Book 6
1. Know Your Computer
2. Operating System
3. MS Word 2010 — Advanced Features
4. MS Word 2010 — Mail Merge
5. MS PowerPoint 2010 — Advanced Features
6. More About MS Excel 2010
7. More About Scratch
8. Introduction to QB64
9. QB64 — Statements
10. QB64 — Programming Statements
11. Introduction to Macromedia Flash
12. Introduction to Email
13. Sample Paper (assessment resource)

## Knowledge graph and teacher resources

- Subject: `COMPUTER-STUDIES` — Computer Studies.
- Curriculum: `CLICK-START-M1-M3`.
- Skill: `COMPUTER-STUDIES`.
- One grade topic per book, with one objective for each teaching chapter.
- 29 objectives aligned to the matching school grade.
- Three teacher packs: 29 lesson starters and 87 original answer-keyed practice questions.
- Sample papers are identified as assessment resources, not additional teaching chapters.

## Scope separation: international Computer Studies vs Thai national Science and Technology

The `COMPUTER-STUDIES` subject and `CLICK-START-M1-M3` curriculum are the user's international textbook sequence. The Cambridge Click Start M1–M3 packs are not Thai national curriculum content. Do not import the retired standalone M4–M6 Technology packs into this international textbook course.

The Thai national curriculum's standards ว 4.1 Design & Technology and ว 4.2 Computing Science belong inside the national `SCI` Science and Technology learning area. They must not be recreated as a separate `TECHNOLOGY` or `COMPUTER-STUDIES` curriculum, and must not be replaced by Click Start. A separate Science rollout now adds the 28 primary W4.2 indicators under `SCI`; the remaining W4.1/W4.2 secondary indicators and the other Science core gaps are tracked in `docs/learning/science/SCIENCE-CORE-CURRICULUM-GAP-AUDIT.md`.

The coding workspace, practical project submissions, teacher review, marking and gradebook synchronization are application features. They support practical activities in either course but do not make the international textbook equivalent to the Thai national indicators.

## Source register

1. Cambridge Click Start International Edition Learner's Book 4, ISBN 9781108951869. Published contents and description: https://www.kriso.lv/click-start-international-edition-learners-book-db-9781108951869.html
2. Cambridge Click Start International Edition Learner's Book 5, ISBN 9781108951883. Published contents and description: https://www.emobooks.com/9781108951883-Click-Start-International-Edition-Learners-Book-5-with-Digital-Access-1-Year
3. Cambridge Click Start International Edition Learner's Book 6, ISBN 9781108951906. Published contents and description: https://kitaabnow.com/product/click-start-international-edition-learners-book-6-with-digital-access-1-year/

## Implementation status

- [x] Replace the staged national Technology curriculum catalogue with the Cambridge Click Start M1–M3 catalogue.
- [x] Replace the staged national Technology knowledge graph with 29 book-chapter objectives and grade alignments.
- [x] Replace M1, M2 and M3 teacher packs with book-aligned lesson starters.
- [x] Keep sample papers separate as assessment resources.
- [x] Keep the retired standalone M4–M6 Technology packs out of the Click Start international Computer Studies course.\n- [x] Route national W4.1/W4.2 standards to the SCI Science and Technology learning area, not to Click Start.
- [x] Apply the Computer Studies curriculum catalogue migration to the existing E&P Supabase project.
- [x] Apply the M1–M3 Computer Studies knowledge-graph migration.
- [x] Verify database counts: M1=8, M2=9, M3=12 objectives and 29 matching grade alignments.
- [x] Prepare one combined teacher import file containing 29 lessons and 87 answer-keyed questions.
- [x] Validate the combined file against the existing importer parsing rules: 29 lessons, 87 questions, 29 unique objective codes, no parsing errors.
- [ ] Import the combined pack into the target school's organization through an authorized teacher session; drafts remain unpublished.
- [ ] Review the imported lessons and question drafts in the teacher interface.
- [ ] Run full tests, lint and build after the content import and remaining implementation are complete.

The two additive curriculum migrations have been applied to the existing Supabase project. They created only the Computer Studies subject/curriculum/grade/topic/objective catalogue; they did not modify English MEP, school classes, memberships, student records or published learning content. The 29 lesson drafts and 87 question drafts have not yet been imported because that step must run in an authorized teacher session for the target organization. Tests, lint and build have not been run.
