# Primary Mathematics — Curriculum Coverage Gap Audit

**Status: official P1–P6 source and priorities reconciled; no primary Mathematics records seeded yet.**

## Verified database state — 21 November 2026

The live national-master catalogue `TH-BASIC-CORE-2008-2017` currently contains 41 Mathematics objectives, all aligned to M1–M6. The separate `TH-MATH-M1-M6` catalogue contains the same 41 secondary objectives. There are zero Mathematics objectives or required Mathematics alignments for P1–P6 in the national master. The primary grade levels themselves already exist in the national master for other learning areas.

This means the current 41-objective Maths catalogue is a secondary-only catalogue, not complete P1–M6 Mathematics coverage.

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

The six grade totals establish 116 primary Mathematics indicators. The current database has none of them.

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

## Implementation scope after source reconciliation

1. Verify the complete official P1–P6 indicator-code list and each grade-level priority against the 2017 curriculum and OBEC 2021 detailed tables.
2. Resolve the P6 15/6 versus 14/7 discrepancy.
3. Create a separate `TH-MATH-P1-P6` catalogue; keep `TH-MATH-M1-M6` secondary-only.
4. Reuse the existing Mathematics subject and the national-master P1–P6 grade levels. Add primary standard/topic mappings only where absent.
5. Seed 116 unique primary objectives and their required grade alignments in both the national master and the primary Maths catalogue. Preserve the verified Must-Know / Should-Know classification per indicator.
6. Author P1–P3 and P4–P6 teacher packs with three original answer-keyed formative tasks per indicator (348 tasks total).
7. Add parser validation for 116 codes, 348 tasks, grade alignment and priority totals.
8. Keep all content as catalogue and teacher-pack drafts. Do not import or publish to a school until the single consolidated application-testing phase.

## Verification artifact

Run `PRIMARY-MATH-GAP-VERIFICATION.sql` to reproduce the current coverage gap. It is read-only and confirms the 41 existing M1–M6 Mathematics objectives and zero P1–P6 Mathematics alignments. All 18 grade/catalogue checks passed against live Supabase. No live curriculum records were changed during this audit.
