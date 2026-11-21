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

## P3 code crosswalk correction

The 2021 OBEC priority PDF contains a transcription error on the P3 Mathematics measurement row: the money indicator is printed as `ค ๒.๑ ป.๓/๓`, duplicating the following length indicator's code. The controlling 2017 revised Mathematics standards document (OBEC PDF, printed pages 20–22) confirms the sequence: `ค ๒.๑ ป.๓/๑` is the money problem outcome, `ป.๓/๒` is time, and `ป.๓/๓` is length. The catalogue must therefore use the 2017 official code `ค ๒.๑ ป.๓/๑` for money and retain the 2021 row's Must-Know priority. Do not seed the duplicated `ป.๓/๓` code twice.


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
