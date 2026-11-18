# Health and Physical Education — Teacher Pack Import Guide

**Curriculum:** `TH-BASIC-CORE-2008-2017`  
**Subject:** `HEALTH-PE`  
**Branch:** `paul/thai-national-curriculum-foundation`

## Prepared packs

Import the four packs as unpublished teacher-content drafts. The M4–M6 pack contains 29 shared indicators aligned to all three grades.

| File | Grade scope | Unique lessons | Assessment prompts |
|---|---|---:|---:|
| `HEALTH-PE-P1-P3-TEACHER-STARTER-PACK.md` | P1–P3 | 54 | 162 |
| `HEALTH-PE-P4-P6-TEACHER-STARTER-PACK.md` | P4–P6 | 66 | 198 |
| `HEALTH-PE-M1-M3-TEACHER-STARTER-PACK.md` | M1–M3 | 72 | 216 |
| `HEALTH-PE-M4-M6-SHARED-TEACHER-STARTER-PACK.md` | M4–M6 shared | 29 | 87 |
| **Total** | **P1–M6** | **221** | **663** |

## Import rules

1. Select the existing Thai Basic Education curriculum and `HEALTH-PE` subject.
2. Match each lesson using the internal objective code and official Thai indicator code included in the pack.
3. Preserve the OBEC 2021 priority classification as metadata.
4. Keep lesson content and assessment prompts unpublished drafts until a teacher reviews them.
5. For M4–M6 shared indicators, retain all three grade alignments; do not create three duplicate objective records.
6. Review physical activities for facilities, equipment, learner ability and safety before publishing.
7. Use school-approved, age-appropriate materials for puberty, relationships, sexual health and substance-use topics. Do not require personal disclosures.
8. First-aid and CPR demonstrations require trained supervision and appropriate mannequins; never practise CPR on a classmate.

## Current state

The 221 curriculum objectives and 279 grade-level alignments are already present and verified in Supabase. OBEC classifications are complete (139 must-know and 140 should-know alignment rows).

The teacher packs are prepared in Markdown, but no HPE lesson drafts or question-bank drafts have been imported. The live database currently reports zero HPE lesson drafts and zero HPE question drafts. Import remains a teacher-authorised action; this guide does not create school or learner records.
