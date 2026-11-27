# E&P Learning — Foreign Languages Rollout Readiness

**Verification date:** 27 November 2026  
**Working branch:** `edna/subject-rollout`  
**Curriculum:** `TH-BASIC-CORE-2008-2017`  
**Scope:** Foreign Languages (English), P1–M6

## Live database verification

Read-only checks against Supabase project `zcutsqbzvydyosfgrbdi` previously confirmed 193 active distinct objective codes, 235 grade alignments across 12 grades, 160 Must-Know and 33 Should-Know objectives, no duplicate codes, no unclassified alignments and no imported Foreign Languages content. The 21 upper-secondary interval indicators are shared across M4, M5 and M6; they are not three distinct sets.

## OBEC stage reconciliation

| Stage | Printed page | Indicators | Must-Know | Should-Know |
|---|---:|---:|---:|---:|
| P1 | 333 | 16 | 9 | 7 |
| P2 | 335 | 16 | 9 | 7 |
| P3 | 337 | 18 | 13 | 5 |
| P4 | 340 | 20 | 17 | 3 |
| P5 | 344 | 20 | 19 | 1 |
| P6 | 348 | 20 | 19 | 1 |
| M1 | 352 | 20 | 19 | 1 |
| M2 | 357 | 21 | 19 | 2 |
| M3 | 362 | 21 | 19 | 2 |
| M4–M6 interval | 367 | 21 | 17 | 4 |
| **Total distinct indicators** | | **193** | **160** | **33** |

The 2021 priority labels were published for the COVID-period 2021 school year and must not be described as permanent current policy. The database `required` flag is separate from the Must-Know/Should-Know classification.

## Pack preparation and validation

| Stage | Lessons | Questions | Status |
|---|---:|---:|---|
| P1 | 16 | 48 | Prepared; structural check previously passed |
| P2 | 16 | 48 | Prepared; structural check previously passed |
| P3 | 18 | 54 | Prepared; structural check previously passed |
| P4 | 20 | 60 | Prepared; parser-contract structural check passed |
| P5 | 20 | 60 | Prepared; parser-contract structural check passed |
| P6 | 20 | 60 | Prepared; parser-contract structural check passed |
| M1 | 20 | 60 | Prepared; indicator-specific and parser-contract structural checks passed |
| M2 | 21 | 63 | Prepared; indicator-specific and parser-contract structural checks passed |
| M3 | 21 | 63 | Prepared; indicator-specific and parser-contract structural checks passed |
| M4–M6 shared interval | 21 | 63 | Prepared once; covers M4, M5 and M6 without duplicating objective records |
| **P1–M6** | **193** | **579** | **All distinct indicators authored; full ten-pack Node validator execution pending** |

Each lesson preserves its catalogue objective code and original Thai indicator wording, with a learning outcome, practical activity and three answer-keyed practice questions. M1–M3 question sets are aligned to the specific indicator skill and progress from supported everyday communication to connected, evidence-based responses.

## Remaining work

1. Run the committed ten-pack Node validator in the repository environment; structural checks across all ten packs confirm lesson, objective and answer-key counts, but actual Node execution has not yet been run here.
3. Complete line-by-line Thai source and academic-content review; all register review fields remain pending.
4. Import each approved grade pack through the authenticated teacher route `/teacher/content/import`, draft-only.
5. Verify imported objective links, question counts, protected answer keys, draft status and absence of unintended publication.
6. Complete teacher review and student acceptance before any publication decision.

## Safety and scope

No direct SQL content import, class mutation, student creation, assignment creation or publication is authorized by pack preparation. No Foreign Languages content drafts have been imported or published. The source register remains the audit record for each official indicator and its review status.

## Official references

- OBEC Foreign Languages core indicators: https://www.academic.obec.go.th/web/document/view/283
- OBEC 2021 Must-Know / Should-Know compilation: https://academic.obec.go.th/images/official/1622514876_d_1.pdf
- Basic Education Core Curriculum B.E. 2551 (2008): https://www.academic.obec.go.th/images/document/1559878841_d_1.pdf
