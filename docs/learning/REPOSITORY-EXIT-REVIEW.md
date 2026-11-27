# E&P Learning — Repository Exit Review

**Review date:** 27 November 2026  
**Repository:** `kim280-trustee/ep-core`  
**Branch:** `paul/subject-rollout`  
**Reviewed commit:** `a46b5ab0918458627682f72cec3c90dd52a5211f`  
**Pull request:** [#174](https://github.com/kim280-trustee/ep-core/pull/174)

## 1. Repository verification

The current branch has passed both required GitHub Actions workflows:

| Verification | Run | Result |
|---|---|---|
| Curriculum, importer and Learning validators, dependency audit, production build and ESLint | [45787357074](https://github.com/kim280-trustee/ep-core/actions/runs/45787357074) | Passed |
| Isolated Learning security migration replay and SQL authorization suites | [45787357251](https://github.com/kim280-trustee/ep-core/actions/runs/45787357251) | Passed |

The security workflow applies migrations only to its isolated CI Supabase instance. It runs the security contract, runtime role matrix and RPC runtime authorization SQL suites. It does not apply migrations to a production or pilot database.

## 2. Targeted implementation review

Reviewed the changed Learning implementation paths and their automated contracts, including:

- Teacher curriculum-pack import preview and authenticated import repository.
- Parser validation, duplicate preflight, retry integrity and protected evaluation-key writes.
- Student content runtime and project-evidence upload/cleanup flow.
- Assessment builder, question-bank loading, answer persistence and teacher review/grading.
- Assessment authoring/publication RPCs and class-scoped manual grading authorization.
- Student-facing content visibility and publishing lifecycle safeguards.

The reviewed implementation files did not expose explicit TODO/FIXME markers, unimplemented stubs or placeholder feature branches. This is a targeted repository review supported by the passing validators, not a substitute for browser-based role acceptance.

## 3. Acceptance boundary

The authenticated teacher/student/parent/school-admin acceptance pass is **not complete**. The existing approved rollout plan explicitly defers staging and forbids using the live pilot school or real learner records as test fixtures.

Still requiring a separately authorized isolated environment and test accounts:

1. Teacher sign-in, curriculum/grade/subject selection and pack preview.
2. Authenticated import of unpublished drafts and retry/duplicate behavior.
3. Protected answer-key visibility and student submission.
4. Teacher marking/review, gradebook and progress reporting.
5. Parent and school-admin access and tenant/class boundary checks.

No such test accounts or isolated environment were provisioned in this review. No curriculum was imported or published, no migration was applied to a live database, and no live school, class, student, assignment or progress record was changed.

## 4. PR #174 decision

PR #174 remains **open and draft**. It contains 256 commits and 79 changed files against `paul/thai-national-curriculum-foundation`; no submitted reviews or inline review threads were present at the time of this review. GitHub reports the branch as mergeable.

**Decision: keep the PR draft and do not merge yet.** The repository CI is green, but authenticated acceptance has intentionally been deferred. Moving the PR to ready-for-review or merging it would imply a release-readiness decision that has not been authorized. The PR should remain unmerged until the owner explicitly approves the release boundary and decides whether to commission isolated acceptance testing.

## 5. Final status

- Repository-side curriculum/importer/assessment implementation: verified by CI.
- Dependency audit, production build and ESLint: passed.
- Isolated security migration replay and SQL authorization tests: passed.
- Targeted code audit: completed; no confirmed code defect identified in the reviewed scope.
- Authenticated role acceptance: deferred, not passed.
- PR #174: reviewed; keep draft and unmerged.
- Frozen Core and E&P Smart POS: untouched.
