# Thai Technology M1–M6 — Curriculum Audit

**Subject code:** `TECH` — Technology  
**Curriculum code:** `TH-TECH-M1-M6`  
**Curriculum version:** Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017)  
**Scope:** Design & Technology (ว 4.1) and Computing Science (ว 4.2)  
**Implementation branch:** `paul/learning-academic-integrity-audit`

## Official scope and grade allocation

The Ministry's revised 2017 standards place Design & Technology and Computing Science under Technology, strand 4. They remain separate standards and are represented as separate skills under the E&P Technology subject.

| Grade | Design & Technology ว 4.1 | Computing Science ว 4.2 | Total indicators |
|---|---:|---:|---:|
| M1 | 5 | 4 | 9 |
| M2 | 5 | 4 | 9 |
| M3 | 5 | 4 | 9 |
| M4 | 5 | 1 | 6 |
| M5 | 1 | 1 | 2 |
| M6 | 0 | 1 | 1 |
| **Total** | **21** | **15** | **36** |

The empty M6 Design & Technology allocation is intentional: the official W 4.1 indicator table has no M6 indicator. It has not been copied forward from M5 or invented.

Computing Science follows the IPST M1–M6 course descriptions: four grade-specific indicators in each of M1, M2 and M3, followed by one indicator in each of M4, M5 and M6. The upper-secondary course description specifies 40 hours per grade and notes that schools may flexibly sequence the three upper-secondary indicators within the M4–M6 period; the published M4, M5 and M6 course descriptions are retained as the grade mapping for this seed.

## Knowledge graph structure

- Subject: `TECH` — Technology
- Curriculum: `TH-TECH-M1-M6`
- Skills:
  - `DESIGN` — Design & Technology (ว 4.1)
  - `COMPUTING` — Computing Science (ว 4.2)
- Topics: one grade-specific topic per standard/grade with official indicators.
- Objectives: 36, each identified by a stable grade/standard/objective code such as `M1-W4_1-01` or `M6-W4_2-01`.
- Alignments: each objective is linked to its exact M1–M6 grade and official Thai indicator code.

## Teacher resources

Six grade-specific starter packs are staged:

| Pack | Lessons | Answer-keyed questions |
|---|---:|---:|
| M1 | 9 | 27 |
| M2 | 9 | 27 |
| M3 | 9 | 27 |
| M4 | 6 | 18 |
| M5 | 2 | 6 |
| M6 | 1 | 3 |
| **Total** | **36** | **108** |

Each lesson includes the exact objective code, official indicator code, a teaching activity and three answer-keyed practice questions. Packs are Markdown source resources; they are not published app content and have not been imported by an authorized teacher.

## Source register

1. Office of the Basic Education Commission, *Learning Standards and Indicators for Mathematics, Science and Geography (Revised B.E. 2560)*, Technology strand, pp. 82–87. This is the authoritative source for W 4.1 and W 4.2 grade allocations and indicator wording.  
   https://www.academic.obec.go.th/web/images/document/1580786277_d_1.pdf
2. Institute for the Promotion of Teaching Science and Technology (IPST), *Curriculum Guide: Technology (Computing Science)*, including the M1–M3 indicators and M4–M6 teaching guidance.  
   https://oho.ipst.ac.th/download/mediaBook/tg-curr-cs.pdf
3. IPST, *Sample Course Descriptions: Technology (Computing Science), M1–M6*. This provides the grade-level course descriptions and upper-secondary sequencing note.  
   https://oho.ipst.ac.th/download/mediaBook/CS-course-description-M1-M6.pdf
4. IPST, *Curriculum Guide: Technology (Design & Technology)*, lower- and upper-secondary levels.  
   https://uatscimath.ipst.ac.th/ebook-technology/item/8377-2560-2551-8377

## Implementation status

- [x] Separate Technology curriculum catalogue and M1–M6 grade levels staged.
- [x] 36 objectives staged with official grade and indicator alignments.
- [x] Six teacher starter packs staged: 36 lesson starters and 108 questions.
- [ ] Apply the two Technology migrations to a disposable/staging Supabase database.
- [ ] Verify objective, topic, skill and alignment counts after migration.
- [ ] Import teacher packs through an authorized teacher account.
- [ ] Review and publish lessons/questions through the existing teacher workflow.
- [ ] Run the full feature test round after the subject implementation work is complete.

No live Supabase changes or school records have been created by this batch. No tests, lint or builds have been run.
