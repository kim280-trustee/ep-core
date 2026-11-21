# Primary Mathematics — Curriculum Coverage Gap Audit

**Status: complete. Official P1–P6 source and priorities reconciled; 116 objectives and 348 teacher tasks seeded/authored and verified.**

## Historical gap identified before the primary Mathematics seed — 21 November 2026

At the time this gap was first identified, the national-master catalogue contained only 41 secondary Mathematics objectives and had no P1–P6 Mathematics objectives. This was the pre-migration baseline, not the final database state. The primary Mathematics seed described below has since closed this gap.

## Official OBEC primary Mathematics summary

Source: OBEC, *Summary of Learning Indicators and Core Learning Content: Must-Know and Should-Know*, Mathematics, primary-grade summary and grade tables, pp. 35–49.

Official source PDF: https://academic.obec.go.th/web/images/official/1622514876_d_1.pdf

| Grade | Indicators | Must-Know in summary | Should-Know in summary |
|---|---:|---:|---:|
| P1 | 10 | 6 | 4 |
| P2 | 16 | 13 | 3 |
| P3 | 28 | 22 | 6 |
| P4 | 22 | 15 | 7 |
| P5 | 19 | 11 | 8 |
| P6 | 21 | 15 | 6 |
| **Total** | **116** | **82** | **34** |

The six grade totals establish 116 primary Mathematics indicators. At the pre-seed baseline described in this historical gap audit, the database had none of them.

## P6 priority reconciliation — resolved

The apparent 14/7 count in the initial manual review was a counting error. Recounting the detailed P6 table row by row gives **15 Must-Know and 6 Should-Know**, exactly matching the P6 summary row. The detailed table also ends with an explicit P6 subtotal of 21 indicators, 15 Must-Know and 6 Should-Know (OBEC 2021 PDF, printed page 48). No priority correction or assumed label is needed.

The official primary totals therefore reconcile exactly: 116 indicators, 82 Must-Know and 34 Should-Know. P6 remains 21 / 15 / 6.

## Official code crosswalk corrections

The 2021 OBEC priority PDF contains several code-column transcription errors. The 2017 revised Mathematics standards document (OBEC PDF, printed pages 20–28) is the controlling source for standard/grade indicator numbering; the 2021 PDF is used for Must-Know / Should-Know classification. Use the corrected 2017 codes below while retaining each matching 2021 row's priority label:

| Grade | 2021 priority-table row | Correct 2017 indicator code | Subject of indicator | Priority |
|---|---:|---|---|---|
| P2 | 9 | ค 2.1 ป.2/1 | Time problems | Must |
| P2 | 15 | ค 2.2 ป.2/1 | Classify polygons and circles | Must |
| P3 | 13 | ค 2.1 ป.3/1 | Money problems | Must |
| P4 | 17 | ค 2.1 ป.4/1 | Time problems | Must |
| P5 | 14 | ค 2.2 ป.5/1 | Construct parallel lines | Should |
| P5 | 18 | ค 3.1 ป.5/1 | Interpret line graphs | Must |
| P6 | 21 | ค 3.1 ป.6/1 | Interpret pie charts | Must |

The 2021 PDF's original values for those rows are respectively P2/9, P2/9, P3/3, P4/9, P5/5, P5/4 and P6/9. Do not seed these erroneous suffixes. The 2017 standards matrix confirms that these are the first indicators under their respective standards. The P3 money row is particularly important: the 2021 table repeats P3/3, while the 2017 sequence clearly assigns money to P3/1 and length to P3/3.

The apparent P6 priority count discrepancy in the initial manual review was also a counting error. Recounting the detailed P6 table gives 15 Must-Know and 6 Should-Know, matching its explicit subtotal and summary row. No priority correction is needed.

The final primary totals reconcile exactly: 116 indicators, 82 Must-Know and 34 Should-Know. Per-grade totals are P1 10 (6/4), P2 16 (13/3), P3 28 (22/6), P4 22 (15/7), P5 19 (11/8), and P6 21 (15/6).

## Implementation delivered — 21 November 2026

1. Verified the P1–P6 indicator counts against the OBEC 2021 priority tables and the 2017 revised Mathematics standards.
2. Corrected seven code-column transcription errors by using the official 2017 standard/grade numbering while retaining the corresponding 2021 Must-Know / Should-Know row labels.
3. Reconciled P6 detailed priority rows: 15 Must-Know and 6 Should-Know; the earlier 14/7 count was a manual counting error.
4. Seeded migration `20261121160000_seed_primary_mathematics_p1_p6.sql`.
5. Created the separate draft catalogue `TH-MATH-P1-P6`; retained the existing `TH-MATH-M1-M6` secondary catalogue unchanged.
6. Added 116 unique primary objectives to the Mathematics knowledge graph and required alignments in both the national master and primary Mathematics catalogue.
7. Verified 82 Must-Know and 34 Should-Know classifications, with zero unclassified rows and zero duplicate official indicator codes.
8. Authored two teacher packs: 54 P1–P3 lessons and 62 P4–P6 lessons, each with three original answer-keyed formative tasks (348 total).
9. Added `npm run validate:maths-primary-packs`, which executes the actual TypeScript importer parser and verifies grade extraction, official-code crosswalks, lesson counts, answer keys and priority totals.
10. Updated the national curriculum validator and read-only staging verification. The national master now contains 2,056 unique required indicators and 2,450 grade alignments.
11. GitHub Actions run 326 passed the full curriculum validators, production build and ESLint.

**Still intentionally deferred:** authenticated teacher import, preview, draft-save, student submission and teacher review. Those will be tested once after all curriculum source work is complete. The new catalogue remains draft; no school, class, student or learner-progress data was changed.

## Verification artifact

Run `PRIMARY-MATH-STAGING-VERIFICATION.sql` to verify the completed state. It is read-only and confirms 116 primary objectives and 116 required alignments in both the national master and `TH-MATH-P1-P6`, correct 82/34 priorities, zero unclassified or duplicate official codes, and the corrected P3 money indicator code. The national staging verification passes with 2,056 required indicators and 2,450 alignments.


## Final live catalogue state — 21 November 2026

The primary Mathematics gap is closed. The national master now contains 157 required Mathematics objectives and 157 grade alignments: 116 primary (P1–P6) and 41 secondary (M1–M6). The separate catalogue views contain the same 116 primary objectives in TH-MATH-P1-P6 and the same 41 secondary objectives in TH-MATH-M1-M6. The primary priority split is 82 Must-Know and 34 Should-Know; all 41 secondary indicators are Must-Know. The full eight-area national master now verifies at 2,056 unique required indicators and 2,450 required grade alignments.
