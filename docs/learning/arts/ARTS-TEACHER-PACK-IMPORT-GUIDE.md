# Arts Teacher-Pack Import and Acceptance Guide

## Scope

The eight Arts packs contain 279 official source indicators and 837 source assessment tasks across P1–M6. The shared M4–M6 pack contains 39 outcomes; each expands to three grade-specific records. Expected grade-scoped import totals are **357 lesson drafts and 1,071 question drafts**.

## Before import

1. Confirm the eight pack files and run `npm run validate:arts-packs`.
2. Confirm an isolated staging Supabase project, staging organization, test class and authorized staging teacher session. Do not use the Khamkhen Kheo Chanupathum pilot or real learner accounts.
3. Review grade, subject and indicator mapping for all 357 lesson drafts and 1,071 questions.
4. Import through the authenticated teacher content-import workflow as drafts only. Do not insert content directly with SQL.
5. If an import fails part-way through, inspect saved drafts and use the importer's integrity-aware retry checks. Do not overwrite partial or mismatched records.

## Content design and review

Each lesson declares one of three disciplines: visual arts, music, or dance and drama. Activities and evidence are specific to the indicator and use grade-band guidance for P1–P3, P4–P6, M1–M3 and M4–M6.

Each indicator has three linked assessment stages:
- Knowledge/close observation: two distinct subject features supported by evidence.
- Application: a fictional case requiring a sequenced three-step decision.
- Demonstration: an observable artefact, notation/listening record, performance or evidence product, marked against explicit criteria.

Teachers must check that the prompt assesses the official Thai indicator, the example matches the discipline, materials and movement are safe, and accessible equivalent evidence is accepted. Artistic preference, learner identity, body type, expensive materials or performance confidence must not determine marks.

## Post-import acceptance

Run the approved read-only staging verification after import. Reconcile 357 lessons, 1,071 questions, grade/subject/objective links, draft state, versions, protected answer keys and teacher-only content. Investigate every missing, duplicate, orphaned or misaligned record before publication.

A successful parser or content-pack validator is not database-import acceptance. Publication requires staging reconciliation and documented teacher review. No import, publication, migration application or live-school data change is authorized by this guide.
