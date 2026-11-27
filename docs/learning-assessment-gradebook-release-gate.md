# Assessment-to-gradebook release gate

This checklist is the acceptance boundary for the assessment-result → gradebook integrity work. It is not evidence that runtime acceptance has already passed.

## Automated source/CI checks

- [ ] Assessment-result sync contract and idempotent result identity.
- [ ] Linked assessment-result identity retention guard.
- [ ] Exact original assignment/student/class-subject/term validation before re-inclusion.
- [ ] Automatic exclusion and audit snapshots for assignment item, target, and parent mapping changes.
- [ ] Finalized term-grade lock protection.
- [ ] Database catalog smoke test after a complete local migration replay.
- [ ] Full Learning CI: curriculum validators, all assessment/gradebook validators, production build, ESLint.

## Required disposable-database behavior tests

Run only against an isolated local Supabase database after replaying the complete migration chain. Never use the live pilot database or real learner records.

| Scenario | Expected result |
|---|---|
| Assessment result inserted or score/max-score updated | Exactly one linked gradebook entry is created/updated; repeated sync does not duplicate it |
| Linked assessment result deleted | Delete is rejected; gradebook history remains |
| Linked result attempt/student/organization identity changed | Update is rejected |
| Assessment item removed or reassigned | Only matching included gradebook entries are excluded; score and source identity remain |
| Active assignment target deactivated, removed, or retargeted | Only entries for the affected student/class are excluded |
| Assignment class-subject or organization changed | All included assessment-result entries sourced from that assignment are excluded |
| Assignment moved from published/closed to a non-published state | Matching included entries are excluded |
| Assignment merely closed | Historical entries are retained; no automatic exclusion |
| Academic term deleted or moved to another organization while gradebook records exist | Mutation is rejected; historical gradebook/term-grade records are retained |
| Academic term status changed to inactive/closed | Historical records remain attached to the same term identity |
| Exclusion occurs | Before/after snapshots, actor, timestamp, and nonblank reason are recorded |
| Affected term grade is finalized | Mapping mutation is rejected; finalized snapshot remains unchanged |
| Manager reopens with reason, mapping is repaired, then includes entry | Re-inclusion succeeds only when the original source mapping is valid |
| Mapping remains missing, ambiguous, or points to another class subject/student/term | Re-inclusion is rejected |
| Anonymous or direct authenticated call to private reconciliation helper | Execution denied |

## Authenticated product acceptance

Use dedicated test identities and disposable records:

- Teacher: review assessment result and gradebook entry; verify score/provenance display and no unauthorized edit controls.
- Academic manager: exclude with reason, inspect audit history, reopen a finalized term grade with reason, repair mapping, and re-include only after validation.
- Student: submit an assessment and verify the resulting gradebook entry appears once with the expected score.
- Verify access denial for unrelated teacher/student accounts.

Record screenshots or test evidence, test identity, migration revision, and outcome. Do not use the KKC-MEP-PILOT learner as a test account.

## Migration and release sequence

1. Review the complete ordered migration chain from the existing sync migration through the retention, re-inclusion, and automatic-reconciliation migrations.
2. Replay the full chain on a disposable database and run the SQL catalog test plus behavior tests above.
3. Run all Learning CI checks on the exact candidate SHA.
4. Complete authenticated acceptance and obtain owner approval.
5. Only then schedule production migration application and post-deploy verification. No production migration is authorized by this checklist.

## Current known boundaries

- This implementation handles assignment item, assignment target, and assignment parent mapping changes.
- Closing an assignment intentionally does not erase or exclude historical academic records.
- A finalized term grade blocks assignment mapping changes until an authorized, audited reopen.
- A term linked to gradebook history cannot be deleted or moved between organizations; inactive/closed status changes preserve its historical identity.
- Automatic exclusion is not automatic deletion. Historical result/gradebook provenance is retained.
- Static validators and a green application build do not substitute for disposable-database behavior tests or authenticated acceptance.
