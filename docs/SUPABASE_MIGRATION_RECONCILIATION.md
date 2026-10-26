# Supabase Migration Reconciliation

**Original name-based snapshot:** 2026-10-21 (historical; see the exact version reconciliation dated 2026-10-26 below)  
**Repository:** `kim280-trustee/ep-core`  
**Branch:** `paul/integrate-edna-content`  
**Connected Supabase project:** `ep-core` (read-only inspection; no schema or data was changed)

## Historical name-based summary (2026-10-21)

- Local SQL migration files: **175**
- Latest live migration history read (2026-10-26): **193** records; latest version `20261026044704` (`school_admin_authorization_final_hardening`).
- Same-name migration version mismatches: **31**
- Local migration files with no matching applied name: **35**
- Applied migration records with no matching local filename: **3**

**Release blocker:** Do not run a blind `supabase db push` while this drift exists. A migration can be applied already under one remote version while the repository has the same migration name under another version; the CLI may then treat the repository file as pending and attempt to apply it again.

## Same-name version mismatches

| Local file | Local version | Remote applied version(s) |
|---|---:|---|
| `supabase/migrations/20261002024000_fix_learning_teacher_student_user_rls_recursion.sql` | `20261002024000` | `20261002023642 (fix_learning_teacher_student_user_rls_recursion)` |
| `supabase/migrations/20261002031100_learning_gradebook_bulk_import_recalculate.sql` | `20261002031100` | `20261002031209 (learning_gradebook_bulk_import_recalculate)` |
| `supabase/migrations/20261002031200_learning_gradebook_grade_scale_index.sql` | `20261002031200` | `20261002031244 (learning_gradebook_grade_scale_index)` |
| `supabase/migrations/20261005133000_learning_student_content_responses.sql` | `20261005133000` | `20261012102441 (learning_student_content_responses)` |
| `supabase/migrations/20261005150000_learning_teacher_content_response_grading.sql` | `20261005150000` | `20261005073735 (learning_teacher_content_response_grading)`; `20261012102444 (learning_teacher_content_response_grading)` |
| `supabase/migrations/20261005153000_learning_teacher_content_response_access.sql` | `20261005153000` | `20261005073738 (learning_teacher_content_response_access)`; `20261012102447 (learning_teacher_content_response_access)` |
| `supabase/migrations/20261010000000_harden_learning_content_response_integrity.sql` | `20261010000000` | `20261012102451 (harden_learning_content_response_integrity)` |
| `supabase/migrations/20261010000100_learning_attempt_limits_and_release_time.sql` | `20261010000100` | `20261012102455 (learning_attempt_limits_and_release_time)` |
| `supabase/migrations/20261010000200_secure_learning_content_completion.sql` | `20261010000200` | `20261012102459 (secure_learning_content_completion)` |
| `supabase/migrations/20261010000300_fix_learning_assessment_optional_scoring.sql` | `20261010000300` | `20261012102502 (fix_learning_assessment_optional_scoring)` |
| `supabase/migrations/20261010000400_harden_parent_invitation_acceptance.sql` | `20261010000400` | `20261012102505 (harden_parent_invitation_acceptance)` |
| `supabase/migrations/20261010000500_guard_learning_assessment_publication.sql` | `20261010000500` | `20261012102508 (guard_learning_assessment_publication)` |
| `supabase/migrations/20261010000600_immutable_published_content_versions.sql` | `20261010000600` | `20261012102512 (immutable_published_content_versions)` |
| `supabase/migrations/20261010000700_guard_learning_assignment_publication.sql` | `20261010000700` | `20261012102549 (guard_learning_assignment_publication)` |
| `supabase/migrations/20261010000800_harden_learning_lifecycle_integrity.sql` | `20261010000800` | `20261012102552 (harden_learning_lifecycle_integrity)` |
| `supabase/migrations/20261010000900_harden_learning_content_version_transitions.sql` | `20261010000900` | `20261012102557 (harden_learning_content_version_transitions)` |
| `supabase/migrations/20261012000000_learning_reward_ledger.sql` | `20261012000000` | `20261012102600 (learning_reward_ledger)` |
| `supabase/migrations/20261012000100_learning_class_reward_leaderboard.sql` | `20261012000100` | `20261012102602 (learning_class_reward_leaderboard)` |
| `supabase/migrations/20261013000000_learning_mastery_reward_ledger.sql` | `20261013000000` | `20261013045416 (learning_mastery_reward_ledger)` |
| `supabase/migrations/20261013000100_learning_weekly_quest_rewards.sql` | `20261013000100` | `20261013045744 (learning_weekly_quest_rewards)` |
| `supabase/migrations/20261013000200_learning_streak_milestone_rewards.sql` | `20261013000200` | `20261013050354 (learning_streak_milestone_rewards)` |
| `supabase/migrations/20261014120000_learning_reward_achievement_notifications.sql` | `20261014120000` | `20261014114932 (learning_reward_achievement_notifications)` |
| `supabase/migrations/20261014130000_learning_school_admin_permissions.sql` | `20261014130000` | `20261014123624 (learning_school_admin_permissions)` |
| `supabase/migrations/20261014140000_learning_extended_streak_milestones.sql` | `20261014140000` | `20261014125626 (learning_extended_streak_milestones)` |
| `supabase/migrations/20261014150000_learning_class_leaderboard_visibility.sql` | `20261014150000` | `20261014130705 (learning_class_leaderboard_visibility)` |
| `supabase/migrations/20261014160000_learning_school_wide_competitions.sql` | `20261014160000` | `20261014131549 (learning_school_wide_competitions)` |
| `supabase/migrations/20261014170000_learning_team_challenges.sql` | `20261014170000` | `20261014132419 (learning_team_challenges)` |
| `supabase/migrations/20261014180000_learning_student_daily_xp_goal.sql` | `20261014180000` | `20261014132759 (learning_student_daily_xp_goal)` |
| `supabase/migrations/20261014190000_learning_gamification_fk_indexes.sql` | `20261014190000` | `20261014133213 (learning_gamification_fk_indexes)` |
| `supabase/migrations/20261014210000_harden_learning_gamification_verified_activity.sql` | `20261014210000` | `20261014142729 (harden_learning_gamification_verified_activity)` |
| `supabase/migrations/20261015050000_correct_m1_english_learning_sprint_target.sql` | `20261015050000` | `20261015045055 (correct_m1_english_learning_sprint_target)` |

## Local migration files with no matching applied name

These may be pending, renamed, or missing from the remote migration history. Confirm the SQL definition and actual schema before deciding whether to apply them.

- `supabase/migrations/20261002090000_prepare_learning_pilot_student_flow.sql` (`20261002090000`)
- `supabase/migrations/20261004100000_fix_learning_assignment_targets_select_rls_recursion.sql` (`20261004100000`)
- `supabase/migrations/20261013062000_grant_learning_assignment_target_helper.sql` (`20261013062000`)
- `supabase/migrations/20261014220000_learning_vocabulary_foundation.sql` (`20261014220000`)
- `supabase/migrations/20261016100000_learning_attendance_register.sql` (`20261016100000`)
- `supabase/migrations/20261016120000_learning_timetable_scheduling.sql` (`20261016120000`)
- `supabase/migrations/20261016160000_learning_attendance_authorization_hardening.sql` (`20261016160000`)
- `supabase/migrations/20261016180000_harden_parent_link_access.sql` (`20261016180000`)
- `supabase/migrations/20261016200000_learning_student_admissions.sql` (`20261016200000`)
- `supabase/migrations/20261016210000_learning_staff_administration.sql` (`20261016210000`)
- `supabase/migrations/20261016220000_learning_parent_vocabulary_summary.sql` (`20261016220000`)
- `supabase/migrations/20261016230000_harden_learning_timetable_access.sql` (`20261016230000`)
- `supabase/migrations/20261016240000_learning_school_attendance_analytics.sql` (`20261016240000`)
- `supabase/migrations/20261017000000_learning_badge_awards.sql` (`20261017000000`)
- `supabase/migrations/20261018000000_learning_parent_language_preferences.sql` (`20261018000000`)
- `supabase/migrations/20261018010000_learning_marketplace_booking_requests.sql` (`20261018010000`)
- `supabase/migrations/20261018020000_learning_ai_usage_limits.sql` (`20261018020000`)
- `supabase/migrations/20261018030000_learning_student_ai_coach.sql` (`20261018030000`)
- `supabase/migrations/20261018130000_learning_marketplace_teacher_availability.sql` (`20261018130000`)
- `supabase/migrations/20261018140000_learning_marketplace_teacher_profiles.sql` (`20261018140000`)
- `supabase/migrations/20261018150000_learning_marketplace_confirmed_booking_schedule.sql` (`20261018150000`)
- `supabase/migrations/20261018160000_learning_notification_inbox.sql` (`20261018160000`)
- `supabase/migrations/20261018170000_learning_marketplace_safeguarding_reports.sql` (`20261018170000`)
- `supabase/migrations/20261018180000_learning_assignment_notifications.sql` (`20261018180000`)
- `supabase/migrations/20261018190000_learning_notification_preferences.sql` (`20261018190000`)
- `supabase/migrations/20261018200000_learning_school_notifications.sql` (`20261018200000`)
- `supabase/migrations/20261018210000_learning_parent_attendance_summary.sql` (`20261018210000`)
- `supabase/migrations/20261019100000_school_admin_authorization_final_hardening.sql` (`20261019100000`)
- `supabase/migrations/20261019110000_learning_attendance_submission_and_identity_hardening.sql` (`20261019110000`)
- `supabase/migrations/20261020200000_learning_school_announcements.sql` (`20261020200000`)
- `supabase/migrations/20261020210000_learning_intervention_cases.sql` (`20261020210000`)
- `supabase/migrations/20261020220000_learning_school_announcement_notifications.sql` (`20261020220000`)
- `supabase/migrations/20261021000000_learning_gradebook_status_inclusion_integrity.sql` (`20261021000000`)
- `supabase/migrations/20261021100000_learning_gradebook_finalized_entry_guard.sql` (`20261021100000`)
- `supabase/migrations/20261021110000_learning_gradebook_entry_inclusion_audit.sql` (`20261021110000`)

## Applied remote records with no matching local filename

These may be legacy versions, renamed files, or migrations removed from the current branch. Recover or document the authoritative source before repairing migration history.

- `20261002023648` — `learning_teacher_student_user_rls_safe`
- `20261013064537` — `fix_class_assignment_grading_target`
- `20261019070729` — `learning_school_admin_roster_profile_visibility`

## Safe reconciliation procedure

1. Compare each same-name pair's SQL definition and resulting schema; do not assume equal names imply identical SQL.
2. Classify each local-only migration as genuinely pending, already applied under a different version, superseded, or obsolete.
3. Recover the authoritative SQL for remote-only records or document why it is intentionally absent.
4. Choose one canonical migration-version scheme and update local filenames/history only after the mapping is reviewed. Do not mark migrations applied merely to silence the CLI.
5. After reconciliation, apply genuinely pending migrations in dependency order and verify with `supabase migration list`, read-only schema queries, and `supabase db advisors`.
6. The announcement migrations (`20261020200000`, `20261020220000`) and gradebook integrity migrations (`20261021000000`, `20261021100000`, `20261021110000`) are part of the current integration batch and are not applied.

No migration was applied, repaired, or marked as applied during this inspection.

## Live project recheck — 2026-10-26

Read-only check of the connected Supabase project `ep-core` (`zcutsqbzvydyosfgrbdi`, region `ap-southeast-1`):

- The live project now reports **193 applied migration records**, latest `20261026044704` (`school_admin_authorization_final_hardening`). This supersedes the earlier 143-record snapshot; newer features have been recorded under alternate timestamps, so repository filenames and remote history still require exact reconciliation.
- The 175-file / 31 same-name mismatch / 35 local-only name / 3 remote-only name counts are the historical name-based snapshot from the earlier audit; the exact version-based comparison below supersedes these totals for migration planning.
- Current security advisors report **19 RLS-enabled tables with no policies**, **105 SECURITY DEFINER functions executable by authenticated users**, and **leaked-password protection disabled**. A read-only privilege check confirmed all 19 no-policy tables deny direct `SELECT/INSERT/UPDATE/DELETE` to `authenticated` and `SELECT` to `anon`, consistent with intended RPC-only access; verify each RPC still enforces caller/tenant/role scope. All 105 authenticated-executable SECURITY DEFINER functions have an explicit function-level `search_path`; 79 reference `auth.uid()` directly, 27 use `learning_current_user_id()`, 29 contain an inspected authorization helper, and 52 contain a tenant-scope marker. These counts overlap and are triage signals, not proof that every control flow is correct. Do not add permissive policies or blanket-revoke functions just to silence advisories.
- Current performance advisors report **136 unindexed foreign keys**, **6 auth/RLS initialization-plan findings**, **17 tables with multiple permissive policies**, **4 duplicate-index findings**, and **144 unused-index notices**. Prioritize Learning V1 query paths and production risk; do not bulk-add/drop indexes or consolidate policies without checking dependencies and behavior.
- This was an inspection only. **No SQL, migration history, Auth settings, policies, functions, or indexes were changed.**

### Required next steps

1. Recompute local-vs-remote migration mappings from the exact integration commit and compare SQL definitions for same-name/version-drift cases.
2. Review the six no-policy gamification tables against the RPCs and intended access model; test authenticated and cross-tenant paths before changing grants or policies.
3. Review all externally executable SECURITY DEFINER RPCs for explicit `auth.uid()` checks, tenant/role/class authorization, safe `search_path`, and least-privilege grants. Some may be intentionally exposed authenticated RPCs; advisor presence alone is not proof of exploitability.
4. Enable leaked-password protection through the Supabase Auth configuration after confirming rollout impact.
5. Prioritize unindexed foreign keys and duplicate indexes only after query/schema review, then rerun advisors.


## Exact version reconciliation — refreshed 2026-10-26 (current snapshot)

A read-only comparison was run against the current integration tree (178 migration files) and the connected Supabase history (193 records through `20261026044704`).

- Repository migration files: **178**
- Remote applied records: **193**
- Versions present on both sides: **110** (109 exact version/name matches plus one same-version name mismatch)
- Same-version name mismatch: **1** — local `20260928041149_learning_assessment_visibility_runtime_fix.sql`; remote record `20260928041149 (20260928000000_learning_assessment_visibility_runtime_fix)`.
- Local filenames whose 14-digit version is absent remotely: **68**
- Remote records whose version is absent from local filenames: **83**

The 68/83 lists overlap by migration purpose: multiple features were applied/recorded under alternate timestamps, and the remote history contains `*_reconciled` entries plus later non-reconciled records for some of the same features. These are not 68 safe-to-apply migrations or 83 missing source files. Live catalog checks now find the vocabulary, attendance, timetable, student invitations, marketplace, notifications, announcements, interventions, calendar, AI usage, and gradebook-integrity objects. Exact SQL/source equivalence still needs to be mapped before filenames or history are normalized.

**Do not run `supabase db push`, bulk mark migrations as applied, or apply the 68 local-only files as a batch.** Reconcile each source file against the live schema, function definitions, grants, triggers, constraints and policies; record whether it is already applied under another version, genuinely pending, superseded, or obsolete. No migration was applied by this read-only audit.

## Live schema object check — refreshed 2026-10-26

A read-only PostgreSQL catalog check was repeated after the remote migration history advanced to 193 records (latest `20261026044704`). The following Learning objects are now present in the connected project:

- Vocabulary: `learning_vocabulary_entries`, `learning_vocabulary_progress`, translations/examples/objectives, `word_forms`/`synonyms`/`antonyms`, and `get_learning_vocabulary_analytics`.
- Attendance and parent summaries: `learning_attendance_sessions`, `learning_attendance_records`, attendance submission/identity guards, school attendance report RPC, parent attendance summary RPC, and parent language preference storage/RPCs.
- School operations: `learning_student_invitations`, `learning_timetable_entries`, `learning_badge_awards`, `learning_school_announcements`, `learning_school_announcement_reads`, `learning_intervention_cases`, and `learning_school_calendar_events`, with their expected RPC entry points.
- Marketplace/notifications: booking requests (including confirmed schedule columns), offerings, teacher availability/profiles, safety reports, `learning_notifications`, and `learning_notification_preferences`.
- AI/gradebook: AI generation and student-coach usage tables/RPCs; `learning_gradebook_entries_status_inclusion_check`, `learning_guard_finalized_gradebook_entry_update`, and `learning_term_grades_rpc_only` are present.

This is **schema-presence evidence, not authenticated end-to-end verification**. The local migration filenames still do not match many remote versions, and the remote history contains multiple `*_reconciled` records plus later records for some of the same features. Keep the migration mapping gate open until each source SQL file is compared with live table definitions, function bodies, grants, constraints, triggers and policies. Do not apply or mark migrations solely based on name similarity.

**Security observation:** 19 RLS-enabled tables have no policies, but read-only privilege checks confirmed these tables deny direct table access to `authenticated` and `anon`; intended access is through SECURITY DEFINER RPCs. All 105 authenticated-executable SECURITY DEFINER functions have explicit `search_path` settings. Review authorization logic and cross-tenant/role boundaries before deciding whether any advisor finding requires a change.

**Release decision:** do not run a bulk migration push or modify migration history as a shortcut. First reconcile the 68 local-only versions and 83 remote-only versions against the actual live schema. Then run role-separated manager/teacher/student/parent acceptance tests, including gradebook direct-write denial, announcement targeting/read state, intervention scope, calendar visibility, marketplace safeguarding and AI quota enforcement.

### Vocabulary migration source — version drift, live objects present

The local vocabulary foundation (`20261014220000`) and relations/analytics (`20261026100000`) filenames remain local-only by version, but the live tables and analytics RPC are present under remote records `20261026044112`/`20261026044331` (along with a `*_reconciled` record). Verify the live function body and grants against source, then align repository migration filenames/history without reapplying the schema. Teacher class scoping, manager authorization and cross-tenant denial still require authenticated acceptance tests.

## Candidate alternate-version mappings — read-only triage (2026-10-26)

The following local filenames and remote applied records have matching migration names but different version timestamps. These are **candidates for source/history reconciliation only**; the name match does not prove SQL equivalence or prove that every effect is present. Compare the full local SQL with the live catalog (tables, constraints, indexes, policies, grants, and function definitions) before any history repair. Do not mark a local version applied or execute it based on this table alone.

| Local migration file | Same-name remote applied version | Current disposition |
|---|---:|---|
| `20261002024000_fix_learning_teacher_student_user_rls_recursion.sql` | `20261002023642` | Compare SQL and live policies/functions |
| `20261002031100_learning_gradebook_bulk_import_recalculate.sql` | `20261002031209` | Compare SQL and live gradebook behavior |
| `20261002031200_learning_gradebook_grade_scale_index.sql` | `20261002031244` | Compare index definition and validity |
| `20261005133000_learning_student_content_responses.sql` | `20261012102441` | Compare table, policies, and grants |
| `20261005150000_learning_teacher_content_response_grading.sql` | `20261012102444` | Compare RPC body, authorization, and grants |
| `20261005153000_learning_teacher_content_response_access.sql` | `20261012102447` | Compare RPC body, authorization, and grants |
| `20261010000000_harden_learning_content_response_integrity.sql` | `20261012102451` | Compare constraints, triggers, and policies |
| `20261010000100_learning_attempt_limits_and_release_time.sql` | `20261012102455` | Compare assessment runtime guards |
| `20261010000200_secure_learning_content_completion.sql` | `20261012102459` | Compare completion RPC and grants |
| `20261010000300_fix_learning_assessment_optional_scoring.sql` | `20261012102502` | Compare scoring behavior and tests |
| `20261010000400_harden_parent_invitation_acceptance.sql` | `20261012102505` | Compare invitation acceptance authorization |
| `20261010000500_guard_learning_assessment_publication.sql` | `20261012102508` | Compare publication guard triggers/RPCs |
| `20261010000600_immutable_published_content_versions.sql` | `20261012102512` | Compare published-version immutability |
| `20261010000700_guard_learning_assignment_publication.sql` | `20261012102549` | Compare assignment publication guards |
| `20261010000800_harden_learning_lifecycle_integrity.sql` | `20261012102552` | Compare lifecycle triggers and policies |
| `20261010000900_harden_learning_content_version_transitions.sql` | `20261012102557` | Compare content-version transition guards |
| `20261012000000_learning_reward_ledger.sql` | `20261012102600` | Compare ledger schema, RPCs, and grants |
| `20261012000100_learning_class_reward_leaderboard.sql` | `20261012102602` | Compare class scope and leaderboard policies |
| `20261013000000_learning_mastery_reward_ledger.sql` | `20261013045416` | Compare mastery-ledger behavior |
| `20261013000100_learning_weekly_quest_rewards.sql` | `20261013045744` | Compare reward eligibility and idempotency |
| `20261013000200_learning_streak_milestone_rewards.sql` | `20261013050354` | Compare streak eligibility and idempotency |
| `20261014120000_learning_reward_achievement_notifications.sql` | `20261014114932` | Compare event recipients and duplicate suppression |
| `20261014130000_learning_school_admin_permissions.sql` | `20261014123624` | Compare permission codes and role scoping |
| `20261014140000_learning_extended_streak_milestones.sql` | `20261014125626` | Compare milestone definitions |
| `20261014150000_learning_class_leaderboard_visibility.sql` | `20261014130705` | Compare visibility policy and RPC scope |
| `20261014160000_learning_school_wide_competitions.sql` | `20261014131549` | Compare competition schema and policies |
| `20261014170000_learning_team_challenges.sql` | `20261014132419` | Compare team challenge schema and policies |
| `20261014180000_learning_student_daily_xp_goal.sql` | `20261014132759` | Compare daily-goal persistence and timezone logic |
| `20261014190000_learning_gamification_fk_indexes.sql` | `20261014133213` | Compare indexes and validity |
| `20261014210000_harden_learning_gamification_verified_activity.sql` | `20261014142729` | Compare server-validated evidence and reward guards |
| `20261015050000_correct_m1_english_learning_sprint_target.sql` | `20261015045055` | Compare pilot seed state and audit trail |

### Still treated as genuinely pending until separately verified

No same-name mapping is asserted for the vocabulary foundation/extension, school attendance register and analytics, timetable, admissions, staff administration, parent vocabulary/attendance summaries, marketplace, notification preferences/inbox, announcements, intervention cases, or gradebook integrity migrations. Read-only catalog checks found several corresponding tables/RPCs absent, including vocabulary and school-wide attendance reporting. Review each dependency chain and its authorization tests before deployment. **No database migration was applied or marked as applied during this triage.**


### School calendar migration — pending review

The academic calendar and examinations source from Edna's `edna/academic-calendar-exams-v1` branch has been selectively ported. Its original migration timestamp `20261020220000` collided with the already-existing announcement-notification migration at that same version, so the calendar migration is renamed to `20261026200000_learning_school_calendar_events.sql`. This avoids duplicate migration versions but does not make the migration safe to apply automatically. It remains local-only and unapplied; verify its table references, RPC grants, manager authorization, class-scoped visibility, linked-parent visibility, and dependencies before deployment. No live database changes were made.


### Latest remote migration-history additions — read-only snapshot

The latest read returned 193 remote records through `20261026044704`. Recent records include `20261026044331` vocabulary relations/analytics, `20261026044348` attendance authorization hardening, `20261026044350` school attendance analytics, `20261026044352` badge awards, `20261026044354` school announcements, `20261026044357` interventions, `20261026044359` school calendar, `20261026044401/44404/44407` gradebook integrity/finalization/audit, `20261026044618` content-response integrity, `20261026044621` parent vocabulary summary, `20261026044623` timetable access hardening, `20261026044625` assignment notifications, `20261026044627` parent attendance summary, `20261026044629` attendance submission/identity hardening, `20261026044659` teacher/student RLS recursion fix, `20261026044701` assignment-target RLS recursion fix, and `20261026044704` school-admin authorization hardening. Several have additional `*_reconciled` history records. This list records observed state only; verify source equivalence before normalizing files or repairing history.
