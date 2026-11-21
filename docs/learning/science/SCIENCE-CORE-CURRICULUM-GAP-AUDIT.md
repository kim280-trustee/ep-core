# Science and Technology — National Core Curriculum Gap Audit

**Curriculum:** Thai Basic Education Core Curriculum B.E. 2551 (2008), revised 2017  
**Source:** OBEC / IPST, *Indicators and Core Learning Content: Must-Know and Should-Know*, 2021  
**Official source PDF:** https://www.academic.obec.go.th/images/official/1622514876_d_1.pdf  
**Status:** Open — do not mark Science complete

**Repository/live distinction (verified 21 November 2026):** The branch contains a pending P1–P3 W1–W3 seed migration (42 indicators), but the connected live Supabase catalogue currently shows only the 28 P1–P6 W4.2 rows (P1 5, P2 4, P3 5, P4 5, P5 5, P6 4). Thus the branch-level target after its pending migration is P1–P3 complete, while the live database remains short by those 42 rows. P4–P6 W1–W3 (69), M1–M3 W4 (27) and shared M4–M6 core (102) remain additional branch-level gaps. The live migration ledger must be rechecked after deployment; file presence is not deployment evidence.


## Official grade totals

| Grade | Official indicators | Current catalogue state |
|---|---:|---|
| P1 | 15 | 10 W1–W3 + 5 W4.2 seeded; complete |
| P2 | 16 | 12 W1–W3 + 4 W4.2 seeded; complete |
| P3 | 25 | 20 W1–W3 + 5 W4.2 seeded; complete |
| P4 | 21 | 5 W4.2 seeded; 16 W1–W3 indicators remain |
| P5 | 32 | 5 W4.2 seeded; 27 W1–W3 indicators remain |
| P6 | 30 | 4 W4.2 seeded; 26 W1–W3 indicators remain |
| M1 | 52 | 43 existing W1–W3; 9 W4.1/W4.2 missing |
| M2 | 63 | 48 existing W1–W3; 6 W2.1 plus 9 W4.1/W4.2 missing |
| M3 | 59 | 53 existing records; code-level reconciliation required before accepting the count |
| M4–M6 shared | 102 | Core indicators not yet seeded |

The official total is 415 unique indicators. The M4–M6 row is a shared grade-band set and should be stored once with alignments to M4, M5 and M6.

## Completed in the current batch

The 28 primary W4.2 indicators have been added under the existing `SCI` subject and `TECH` skill, aligned to the national curriculum:

| Grade | W4.2 indicators seeded | Priority labels |
|---|---:|---|
| P1 | 5 | Applied from OBEC 2021 table; code-level recheck pending |
| P2 | 4 | Applied from OBEC 2021 table; code-level recheck pending |
| P3 | 5 | Applied from OBEC 2021 table; code-level recheck pending |
| P4 | 5 | Applied from OBEC 2021 table; code-level recheck pending |
| P5 | 5 | Applied from OBEC 2021 table; code-level recheck pending |
| P6 | 4 | Applied from OBEC 2021 table; code-level recheck pending |
| **Total** | **28** | **28 currently classified; final source-to-code reconciliation remains open** |

The teacher pack `SCIENCE-TECHNOLOGY-W4.2-P1-P6-TEACHER-STARTER-PACK.md` contains 28 lesson starters and 84 formative tasks with expected evidence. This is national Science and Technology standard ว 4.2, not Click Start international Computer Studies. The indicator records have priority labels, but the exact code-level must/should mapping must be reconciled against the full OBEC table before the Science area is accepted.

## Primary W1–W3 seed reconciliation

The existing migration `20261118208000_seed_science_technology_primary_p1_p3_indicators.sql` already seeds the official P1–P3 W1–W3 set: 10 P1, 12 P2 and 20 P3 indicators (42 total). Together with the 28 primary W4.2 indicators, P1–P3 now reconcile to their full official grade totals (15, 16 and 25). This corrects the previous gap estimate, which counted these 42 records as missing.

The remaining primary W1–W3 work is P4–P6 only: 16 P4, 27 P5 and 26 P6 indicators (69 total). Their Thai source wording and must/should classifications must be transcribed from the OBEC 2021 table before migration authoring; do not synthesize or infer official indicator text.



### Primary priority totals and dual-classification exceptions

The OBEC 2021 summary table reports the following classification totals for the remaining primary grades:

| Grade | Unique indicators | Must-Know classifications | Should-Know classifications | Dual-classified indicator |
|---|---:|---:|---:|---|
| P4 | 21 | 16 | 6 | ว 2.1 ป.4/1 |
| P5 | 32 | 24 | 8 | None listed |
| P6 | 30 | 20 | 11 | ว 2.1 ป.6/1 |

Must-Know and Should-Know counts are not mutually exclusive. P4 and P6 each have one indicator included in both classifications. The current alignment schema stores one classification value; any seed must preserve the second classification explicitly in notes/metadata. The SQL verification script checks the expected totals and flags these exceptions for review.

## Remaining national-core implementation

1. **Primary W1–W3:** Seed and align the remaining 69 P4–P6 indicators. P1–P3 are already complete.
2. **M1 W4:** Add five ว 4.1 and four ว 4.2 indicators.
3. **M2 W1–W4:** Add six missing ว 2.1 indicators and nine ว 4.1/ว 4.2 indicators.
4. **M3 correction:** Official standard coverage includes six ว 1.1 indicators, eight ว 1.3 indicators, three ว 2.2 indicators, and no M3 ว 3.2 indicator set. The current M3 catalogue has 11 ว 1.3-coded records and nine ว 3.2-coded records. Reconcile those records against the official indicator text; preserve useful non-core content as enrichment rather than counting it as an official indicator.
5. **M3 W4:** Add five ว 4.1 and four ว 4.2 indicators.
6. **M4–M6 core:** Add the 102 shared Science and Technology indicators. Do not substitute the 300 specialist Biology/Chemistry/Physics/Earth-Space outcomes for this core set.

## Existing specialist outcomes — separate from the core set

| Specialist subject | M4–M6 outcomes |
|---|---:|
| Biology | 108 |
| Chemistry | 81 |
| Physics | 67 |
| Earth, Astronomy and Space | 44 |
| **Total additional outcomes** | **300** |

These 300 outcomes are additional upper-secondary specialist content. They remain separate from the 102 shared M4–M6 core Science and Technology indicators.

## Acceptance criteria before Science can close

- [ ] P4–P6 W1–W3 indicators seeded, aligned and classified (69 remaining; P1–P3 complete).
- [x] P1–P6 W4.2 indicators seeded, aligned and classified (28).
- [ ] M1–M3 W1–W4 indicator codes reconciled exactly to OBEC.
- [ ] M4–M6 102 shared core indicators seeded and aligned to all three grades.
- [ ] Both `TH-BASIC-CORE-2008-2017` and `TH-SCI-M1-M6` have consistent M1–M6 SCI core alignments.
- [ ] The final unique-indicator and grade-alignment totals reconcile to the official 415-indicator table.
- [ ] All Science teacher packs cover the completed official indicator set; specialist packs remain separately identified.
- [ ] Only after every curriculum rollout is complete: run app-wide tests, local lint/build and teacher-import smoke tests.



## Primary P4–P6 source lock — OBEC 2021

Primary source for the remaining primary indicators is the OBEC/Institute for the Promotion of Teaching Science and Technology 2021 document, “ตัวชี้วัดและสาระการเรียนรู้แกนกลางต้องรู้และควรรู้”, Science and Technology section. The verified grade sections are printed pages 71–76 (P4), 77–83 (P5), and 84 onward (P6). The summary table reports P4=21, P5=32, P6=30; W4.2 already contributes 5, 5 and 4 respectively, leaving W1–W3 gaps of 16, 27 and 26.

**Source exceptions that must survive data modelling:** P4 ว 2.1 ป.4/1 is explicitly both Must-Know and Should-Know. Preserve the dual classification in source metadata/notes; do not flatten it into a single exclusive priority. The source summary also identifies P6 ว 2.1 ป.6/1 as dual-classified. Existing alignment schema stores one `indicator_classification` value, so the migration must record the second priority in notes or a dedicated metadata field rather than silently discarding it.

The source gives the national unique total as 415, with 308 Must-Know and 113 Should-Know classifications; the difference is explained by dual-classified indicators. These are classification counts, not mutually exclusive objective counts.

No P4–P6 W1–W3 seed should be committed until all 69 Thai indicator statements and their priority flags have been transcribed from these grade sections and reviewed against the official codes. Source pages are not interchangeable with the 2017 curriculum PDF.
