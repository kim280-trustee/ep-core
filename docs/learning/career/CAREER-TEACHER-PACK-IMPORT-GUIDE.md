# Career Teacher-Pack Import and Acceptance Guide

**Subject:** Occupations and Career (การงานอาชีพ)  
**Curriculum:** Thai Basic Education Core Curriculum B.E. 2551 (2008), with applicable B.E. 2560 (2017) revisions  
**Coverage:** P1–M6  
**Source packs:** 3 Markdown teacher starter packs  
**Current state:** Authored and parser-validated; not imported or published

## 1. Source files

Import the three Career source packs as one subject batch:

1. `CAREER-P1-P3-TEACHER-STARTER-PACK.md`
2. `CAREER-P4-P5-TEACHER-STARTER-PACK.md`
3. `CAREER-P6-M6-TEACHER-STARTER-PACK.md`

Each source lesson has one Career objective code and three answer-keyed formative questions. The lesson activities and assessment material are original teacher-created resources; they do not replace the official curriculum or a school-approved local curriculum.

## 2. Expected parser and import totals

| Scope | Source lessons | Expanded lesson drafts | Expanded question drafts |
|---|---:|---:|---:|
| P1–P3 | 9 | 9 | 27 |
| P4–P5 | 11 | 11 | 33 |
| P6 | 5 | 5 | 15 |
| M1 | 6 | 6 | 18 |
| M2 | 6 | 6 | 18 |
| M3 | 6 | 6 | 18 |
| M4–M6 shared | 11 | 33 | 99 |
| **Total** | **54** | **76** | **228** |

The 11 `CAREER-M46` outcomes are interval indicators shared by M4, M5 and M6. Each must produce three grade alignments and three grade-scoped lesson/question groups. Do not import them as M4-only, M5-only, M6-only, or as one unexpanded record.

The 54 unique source indicators therefore produce 76 grade/interval alignments. The 162 source questions expand to 228 grade-scoped question drafts.

## 3. Pre-import checks

Before opening the teacher import flow:

- Confirm all three files are from the same reviewed branch revision.
- Run `npm run validate:thai-career-packs`.
- Confirm the Career result reports 54 unique objectives and 162 source questions.
- Confirm the shared M4–M6 codes expand to M4, M5 and M6.
- Resolve any parser, duplicate-code, missing-answer or grade-resolution error before importing.
- Confirm the target organization and class are explicitly approved isolated staging resources and the signed-in teacher is authorized for that class.

## 4. Draft import procedure

1. Open the teacher content import page in the approved staging environment.
2. Select the intended Career subject and the approved target class/curriculum context.
3. Preview the parsed source packs before any write.
4. Check that the preview resolves all 54 unique Career objectives and expands to 76 grade-scoped lesson groups with 228 question groups.
5. Check the Thai indicator text, grade alignment, lesson title, learning outcome, activity and all three question/answer pairs.
6. Import as drafts only. Do not publish.
7. If any chunk fails, preserve the importer’s reported failed chunk and recovery instructions. Do not manually delete or rewrite records to force a retry; use the repository’s integrity-aware retry flow.

## 5. Post-import reconciliation

The staging acceptance record must establish all of the following:

- Exactly 76 Career lesson drafts exist for the intended staging organization/class scope.
- Exactly 228 Career question drafts exist, with three questions for every expected grade-scoped lesson.
- Every lesson and question maps to the correct Career subject, curriculum and grade.
- Each of the 11 shared M4–M6 indicators has exactly one expected lesson/question group for each of M4, M5 and M6.
- No duplicate normalized lesson or question codes exist in the target scope.
- Every question has its expected version, protected answer key and objective mapping.
- All imported content remains unpublished/draft.
- Teacher preview displays the intended lesson and assessment content without exposing teacher-only material to students.
- A staging teacher can review the content and complete the approved assessment acceptance checks.

A total count alone is insufficient: reconcile each expected objective-grade pair and its three dependent questions. Record missing, duplicate, misaligned or incomplete groups as blockers.

## 6. Safety and publication boundary

- Do not use the live Khamkhen Kheo Chanupathum pilot, its class, or real learner records for import testing.
- Do not create a staging organization, class or teacher account without explicit approval.
- Do not apply a migration or execute direct content writes as part of this guide.
- Do not publish until all post-import checks and teacher acceptance are complete.
- Career content must not duplicate Design and Technology or ICT standards ว 4.1 and ว 4.2, which belong to Science and Technology under the applicable OBEC scope order.
- Career exploration activities must not require learners to disclose family income, private household circumstances, personal contact details or other sensitive information. Interviews must be voluntary and permission-based; practical tasks must be age-appropriate and supervised.

## 7. Current completion status

| Workstream | Status |
|---|---|
| Official indicator catalogue mapping | Complete in source |
| 54 teacher starter lessons | Authored |
| 162 source formative questions | Authored |
| Actual importer parser validation | Passed |
| Production build | Passed |
| ESLint | Passed |
| Staging draft import | Not performed |
| Post-import reconciliation | Pending import |
| Teacher/student application acceptance | Pending |
| Publication | Not authorized/performed |
