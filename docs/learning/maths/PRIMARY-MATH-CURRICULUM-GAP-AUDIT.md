# Primary Mathematics — Curriculum Coverage Gap Audit

**Status: source reconciliation required; no primary Mathematics records seeded.**

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

## Source discrepancy requiring resolution

The P6 summary row reports 21 indicators split 15 Must-Know / 6 Should-Know. Counting the individual P6 rows in the detailed table appears to produce 14 Must-Know / 7 Should-Know. This one-indicator discrepancy must be reconciled against an authoritative OBEC correction or a second official source before assigning final P6 priority labels.

Do not silently force the detailed rows to match the summary, and do not seed an assumed priority for any P6 indicator.

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

Run `PRIMARY-MATH-GAP-VERIFICATION.sql` to reproduce the current coverage gap. It is read-only and confirms the 41 existing M1–M6 Mathematics objectives and zero P1–P6 Mathematics alignments. No live curriculum records were changed during this audit.
