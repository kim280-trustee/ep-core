# Supabase Migration Reconciliation

**Original name-based snapshot:** 2026-10-21 (historical; see the exact version reconciliation dated 2026-10-26 below)  
**Repository:** `kim280-trustee/ep-core`  
**Branch:** `paul/integrate-edna-content`  
**Connected Supabase project:** `ep-core` (feature schema deployments occurred during the broader work session on 2026-10-26; the audit snapshots below were read-only and did not apply DDL or edit migration history)

## Historical name-based summary (2026-10-21)

- Local SQL migration files: **175**
- Applied migration records reported by Supabase: **143**
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

- The project is healthy and reports **143 applied migration records**. The latest recorded migration remains `20261019070729` (`learning_school_admin_roster_profile_visibility`). The newer announcement, intervention, and gradebook integrity migrations listed above still do not appear in the applied migration history.
- The 175-file / 31 same-name mismatch / 35 local-only name / 3 remote-only name counts are the historical name-based snapshot from the earlier audit; the exact version-based comparison below supersedes these totals for migration planning.
- Security advisors currently report **6 RLS-enabled tables with no policies**, **47 SECURITY DEFINER functions executable by authenticated users**, and **leaked-password protection disabled**. A read-only definition summary found all 47 functions have an explicit function-level `search_path`; 24 reference `auth.uid()` directly, 27 use `learning_current_user_id()`, 24 contain one of the inspected authorization helpers, and none lacked all of those obvious identity/authorization markers. These counts overlap and are only triage signals, not a substitute for reviewing each function's complete control flow and testing role/tenant boundaries. The six tables are the gamification settings/team/competition/preference tables. These findings require review of the actual RPC entry points, function bodies, grants, and intended RPC-only table access; do not blindly add policies or revoke function execution just to silence advisories.
- Performance advisors report **81 unindexed foreign keys**, **6 auth/RLS initialization-plan findings**, **17 tables with multiple permissive policies**, and **4 duplicate-index findings**, plus unused-index notices. Prioritize by actual query paths and security impact; do not drop indexes or consolidate policies without checking dependencies and behavior.
- This was an inspection only. **No SQL, migration history, Auth settings, policies, functions, or indexes were changed.**

### Required next steps

1. Recompute local-vs-remote migration mappings from the exact integration commit and compare SQL definitions for same-name/version-drift cases.
2. Review the six no-policy gamification tables against the RPCs and intended access model; test authenticated and cross-tenant paths before changing grants or policies.
3. Review all externally executable SECURITY DEFINER RPCs for explicit `auth.uid()` checks, tenant/role/class authorization, safe `search_path`, and least-privilege grants. Some may be intentionally exposed authenticated RPCs; advisor presence alone is not proof of exploitability.
4. Enable leaked-password protection through the Supabase Auth configuration after confirming rollout impact.
5. Prioritize unindexed foreign keys and duplicate indexes only after query/schema review, then rerun advisors.


## Exact version reconciliation — 2026-10-26 (supersedes earlier totals)

The earlier section compared migration **names**, which is useful for identifying likely renamed migrations but is not the same as comparing exact migration versions. A fresh read-only comparison was run against integration commit `0f004748ea11e264c9ea4a36f405bad6f39f5751` and the connected Supabase migration history on 2026-10-26. This branch also restores the source SQL for the already-applied roster-visibility migration under its exact recorded version; no database changes were made.

- Repository migration files: **178** (including the restored source file for the remote-applied roster visibility migration and the new local-only vocabulary relations/analytics migration)
- Remote applied records: **143**
- Versions present on both sides: **110** (109 exact version-and-name matches, plus the one same-version name mismatch below)
- Same-version name mismatch: **1** — local `20260928041149_learning_assessment_visibility_runtime_fix.sql`; remote record `20260928041149 (20260928000000_learning_assessment_visibility_runtime_fix)`.
- Local files whose 14-digit version is absent remotely: **68**
- Remote records whose version is absent from local filenames: **33**

The 67/33 lists overlap substantially by migration *purpose* because many migrations were applied remotely under different timestamps. Therefore these numbers must not be interpreted as 67 safe-to-apply migrations or 33 missing source files. The latest applied record remains `20261019070729` (`learning_school_admin_roster_profile_visibility`); its local source filename is now restored with the exact remote version, and a read-only check confirmed the live function definition, authenticated-only execute grant, and roster visibility policy match that source. Several older content-response and gamification migrations still have remote versions different from local filenames. Review each SQL body and resulting schema before applying or repairing anything.

**Do not run `supabase db push`, bulk mark migrations as applied, or apply the 67 local-only files as a batch.** The next safe step is a migration-by-migration mapping table: local filename, matching remote version/name, SQL equivalence/schema evidence, and disposition (already applied under another version / genuinely pending / superseded / obsolete). After that, separately review and test the newer attendance, parent, marketplace, announcements, interventions and gradebook migrations. This update records source reconciliation only; no database or migration-history changes were made.


## Live schema object check — 2026-10-26

A read-only PostgreSQL catalog check was run against the connected `ep-core` project after the migration-history comparison. This confirms that some integration features are present in source but are not ready to use against this database yet.

**Objects confirmed missing in the live schema:**
- School announcements: `learning_school_announcements`, `learning_school_announcement_reads`, and the five announcement RPCs.
- Teacher interventions: `learning_intervention_cases` and its list/create/update RPCs.
- Notifications: `learning_notifications` and `learning_notification_preferences`.
- Gradebook integrity: `learning_gradebook_entries_status_inclusion_check`, `learning_guard_finalized_gradebook_entry_update`, and `learning_term_grades_rpc_only`.
- Additional feature objects checked and absent: `learning_attendance_sessions`, `learning_timetable_slots`, `learning_badge_awards`, `learning_marketplace_bookings`, `learning_teacher_availability`, `learning_student_ai_usage`, and `learning_school_calendar_events` plus its six calendar RPCs.

The corresponding existing core gradebook tables and audit log, parent-link table, and class-membership table were present. The absence of the new guard triggers/constraint means the live database does **not** yet enforce the source branch's latest gradebook integrity changes. The absence of notification tables means the current in-app notification workflows cannot be treated as deployed.

**Release decision:** keep these feature paths behind deployment/acceptance gates. Do not apply the listed migrations yet: their dependency order and the 33 remote-version-only records / 67 local-version-only filenames must first be reconciled against exact SQL definitions and live schema. Once mappings are approved, apply only the reviewed pending migrations in dependency order, then run authenticated manager/teacher/student/parent negative-access tests and gradebook RPC/direct-write tests. This catalog inspection was read-only; no database changes were made.


### New vocabulary extension migration — pending review

The source branch adds `20261026100000_learning_vocabulary_relations_analytics.sql` to add word forms, synonyms, antonyms, and a teacher analytics RPC. It is **local-only and unapplied**. The prerequisite `20261014220000_learning_vocabulary_foundation.sql` is also not applied to the connected project; read-only inspection found no public vocabulary tables or analytics RPC. Do not apply the extension alone or enable the vocabulary authoring/analytics UI in the live project until the foundation migration is reconciled, the full SQL chain is reviewed, and the analytics function's teacher-class/manager scope is tested. No database changes were made during this review.


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

The academic calendar and examinations source from Edna's `edna/academic-calendar-exams-v1` branch was selectively ported. Its original migration timestamp `20261020220000` collided with an existing migration, so the source was renamed to `20261026200000_learning_school_calendar_events.sql`. The live project later recorded `20261026044359` (`learning_school_calendar_events`) and `20261026044430` (`learning_school_calendar_events_reconciled`). This indicates deployment/history activity, but does not prove source SQL and deployed objects are identical. Review grants, manager authorization, class/parent visibility, and dependencies through role-separated acceptance tests.


### Live schema refresh — 2026-10-26, approximately 04:44 UTC

Read-only checks during the integration audit found the live database changing during the same session. The earlier migration-list snapshot returned 160 entries ending at `20261026044158`; subsequent direct reads of `supabase_migrations.schema_migrations` returned **184 entries, latest version `20261026044430`**. Treat the earlier snapshot as superseded. Confirm the migration history again immediately before any further deployment because the sequence appears to be actively advancing.

The newer history includes these non-exhaustive entries after `20261026044300`: vocabulary relations/analytics (`20261026044331`), school attendance analytics (`20261026044350`), badge awards (`20261026044352`), school announcements (`20261026044354`), intervention cases (`20261026044357`), school calendar events (`20261026044359`), gradebook inclusion/finalization/audit guards (`20261026044401`, `20261026044404`, `20261026044407`), and later reconciliation entries through `20261026044430`. This confirms that the live database has progressed beyond the previous 143/160-entry snapshots. Do not infer every source migration is identical merely from its recorded name/version; reconcile exact SQL, object definitions, grants, triggers and policies.

Read-only catalog checks now find public tables for vocabulary, school attendance, gradebook, announcements, intervention cases, marketplace teacher profiles/availability/booking requests, notifications/preferences, and school calendar events. This supersedes the earlier statement that these checked tables were absent. Presence of a table does not prove the UI workflow or authorization has passed acceptance testing.

Security-advisor snapshot observed at approximately `2026-10-26T04:44:41Z`:
- 114 public tables have RLS enabled; **19 currently have no table policies**: `learning_ai_generation_usage`, `learning_class_gamification_settings`, `learning_class_team_members`, `learning_class_teams`, `learning_intervention_cases`, `learning_marketplace_booking_requests`, `learning_marketplace_offerings`, `learning_marketplace_safety_reports`, `learning_marketplace_teacher_availability`, `learning_marketplace_teacher_profiles`, `learning_notification_preferences`, `learning_notifications`, `learning_school_announcement_reads`, `learning_school_announcements`, `learning_school_calendar_events`, `learning_school_competitions`, `learning_student_ai_coach_usage`, `learning_student_gamification_preferences`, and `learning_team_challenges`.
- The latest security advisor reports **105** authenticated-executable public `SECURITY DEFINER` functions; a narrower direct catalog query counted 104, so reconcile the exact function list. Static catalog scans found explicit `search_path` declarations and obvious identity/scope markers in the sampled set, but this is only triage—not proof of correct authorization. Review each function's body, grants, tenant/class/child scope, and cross-tenant negative tests. Do not blanket-revoke RPCs that are required by the application.
- The 19 no-policy findings may be intentional for RPC-only access, but that must be confirmed per table and paired with function authorization review. Do not add broad policies merely to silence the advisor.

**Next release gate:** freeze schema changes long enough to capture one consistent migration snapshot, map every live version to the exact repository SQL (including all `*_reconciled` versions), then test the deployed role-separated journeys and review each no-policy table/definer RPC. No database DDL or migration-history changes were performed by this audit.


### RPC-only access verification — 2026-10-26, approximately 04:45 UTC

Follow-up read-only catalog checks confirmed that all 19 tables listed above deny direct `SELECT`, `INSERT`, `UPDATE`, and `DELETE` privileges to `authenticated`, and deny `SELECT` to `anon`. This is consistent with the current repository pattern for announcements, interventions, calendar, marketplace, and notifications: the repositories call narrowly scoped RPCs rather than querying those tables directly.

For the sampled feature RPCs, live grants/configuration were also checked:
- User-facing announcement, intervention, calendar, marketplace-booking and notification RPCs had `search_path=""`, were executable by `authenticated`, and were not executable by `anon`.
- Internal notification/announcement trigger helpers checked in the same query were not executable by either `anon` or `authenticated`.
- Source migrations for these feature areas explicitly revoke function execution from `public, anon` before granting only the required user-facing functions to `authenticated`.

This narrows the immediate RLS-advisor concern: the 19 no-policy tables are intentionally RPC-only in the sampled code paths, not directly accessible through PostgREST table grants. **It does not close the authorization review**: every exposed RPC still needs a body-level check for actor identity, tenant/organization scope, class/parent-child relationship, allowed state transitions, and negative cross-tenant tests. Do not change table grants or add policies without identifying a real supported access path.


### Advisor snapshot refresh — 2026-10-26, approximately 04:48 UTC

The latest Supabase advisor read still reports 19 RLS-enabled tables without table policies and now reports **105** authenticated-executable `SECURITY DEFINER` functions. The immediately preceding direct catalog query counted 104 with a narrower join against routine privileges. Reconcile this one-function discrepancy using the advisor's exact function list and catalog grants before marking the security review complete.

Current performance-advisor counts:
- 136 unindexed foreign keys;
- 6 auth/RLS initialization-plan findings;
- 17 tables with multiple permissive policies;
- 4 duplicate-index findings;
- 144 indexes marked unused.

The security advisor also reports **leaked-password protection disabled**. This is a Supabase Auth configuration issue, not a migration; it has not been changed by this audit. Enable it through the project's supported Auth settings after confirming the impact on sign-up/password flows.

These advisor findings are triage signals, not instructions to apply blanket changes. Prioritize tenant/role boundary review and production-critical FK indexes; validate index usage before removing anything, review permissive-policy overlap for unintended broad access, and address the leaked-password setting as a deliberate Auth configuration change. No database or Auth settings were changed.

## Post-deployment migration reconciliation — 2026-10-26

Feature migrations were applied to the connected Supabase project during the broader project work session. This supersedes the earlier snapshot's statements that all listed feature chains remained unapplied. The audit work described here used read-only catalog/history queries; it did not itself apply migrations or edit migration history.

### Feature areas with live schema objects observed

Read-only catalog checks now find tables/RPCs for vocabulary foundation and related-word/teacher analytics; school attendance register, authorization/submission, school-wide analytics and parent summary; badge awards; timetable scheduling/access hardening; staff administration; marketplace booking, teacher availability/profiles, confirmed-booking scheduling and safeguarding reports; notification inbox/preferences, school notifications, assignment notifications and parent language preferences; school announcements/announcement notifications; intervention cases; gradebook inclusion/finalization/audit guards; school calendar/examinations; student admissions/invitation RPCs; and AI generation/student AI Coach usage tables.

Object presence does not establish full end-to-end acceptance. The marketplace confirmed-booking migration source was malformed, was repaired in PR #129, and was subsequently represented in the live migration history. Verify exact source/deployed-function parity before production acceptance.

### Version reconciliation snapshot

The post-deployment comparison recorded:
- Repository migration files: **178**
- Live migration records: **184** at the snapshot; the latest direct history read was `20261026044430`
- Exact version matches: **110**
- Exact version-and-name matches: **109**
- Same-version name mismatch: **1** (`20260928041149`)
- Repository versions absent from live history: **68**
- Live versions absent from the repository: **74**

Multiple feature migrations also appear under generated timestamp versions and `*_reconciled` names. The live schema may contain the desired objects while migration history still differs from the source tree. Do not delete migration records, mark versions applied by guesswork, or run a blind `supabase db push`. Capture a stable snapshot, compare each live version and object definition to its exact SQL, and repair source/history only through a reviewed, supported process.

### Deployment and acceptance gates

- AI quota/coach tables and RPCs have been applied; Edge Function JWT configuration was reported enabled, but provider secrets/configuration were not verified through the available project tools.
- Authenticated role-separated acceptance evidence has not yet been recorded for AI generation/student coaching, draft persistence/unpublished behavior, parent visibility, cross-tenant denial, attendance submission, marketplace booking/safeguarding, announcements/read receipts, calendar visibility, or gradebook finalization/reopen.
- The 19 RPC-only tables have no direct table privileges for anon/authenticated. Sampled user-facing RPCs are authenticated-only and use an empty search path; every exposed function still requires body-level authorization review and negative tenant/class/parent-child tests.
- The Supabase Auth advisor reports leaked-password protection disabled. This setting has not been changed.
- Current performance-advisor findings: 136 unindexed foreign keys, 6 auth/RLS initialization-plan findings, 17 tables with multiple permissive policies, 4 duplicate-index findings and 144 unused-index findings. Review before changing indexes/policies; do not apply blanket fixes.

**Release decision: not yet production-ready.** The code and database schema have advanced, but exact migration-history reconciliation, the SECURITY DEFINER function-count discrepancy, Auth leaked-password protection, and authenticated end-to-end acceptance remain open.
## Latest post-deployment snapshot — 2026-10-26, approximately 04:49 UTC

This section supersedes the earlier 04:44 migration-count snapshot. Additional live schema deployments occurred during the same work session.

### Current migration-history comparison

A fresh comparison against the integration tree and live Supabase history reported:
- Repository SQL migration files: **178**
- Live migration records: **193**, latest version `20261026044704`
- Matching version numbers: **110**
- Matching version and migration name: **109**
- Same-version name mismatch: **1** (`20260928041149`)
- Repository versions absent from live history: **68**
- Live versions absent from the repository: **83**

Recent live-only records include generated-version applications for content-response integrity hardening, parent vocabulary summary, timetable access hardening, assignment notifications, parent attendance summary, attendance identity hardening, teacher/student RLS recursion repair, assignment-target recursion repair, and school-administration authorization hardening. Multiple feature migrations have generated history entries under different names. Schema presence is materially improved, but migration history remains inconsistent. Do not run a blind `supabase db push`, delete history rows, or bulk-mark migrations applied. Freeze further schema changes and map each generated record to exact source SQL before formal history repair.

### Latest feature deployment and acceptance status

Catalog checks find the principal database dependencies for vocabulary/teacher analytics, attendance/parent summaries, badges, timetable, staff administration, admissions, marketplace booking/availability/profiles/safeguarding, notification inbox/preferences, announcements, intervention cases, gradebook inclusion/finalization guards, school calendar, AI generation usage and student AI Coach. Edge Functions were reported active with JWT verification enabled, but AI provider secrets/configuration could not be verified through available tools. The confirmed-booking migration source was repaired in merged PR #129 before its live application; exact deployed/source parity still needs review.

### Current security and release decision

- The security advisor reports 19 RLS-enabled tables without table policies; direct privilege checks found no direct anon/authenticated table access for those 19 tables. The sampled features use RPC-only access, but each exposed function still needs body-level tenant, role, class, parent-child and state-transition checks.
- The latest security advisor reports 105 authenticated-executable `SECURITY DEFINER` functions; the narrower catalog query returned 104. Reconcile the function list and grants. Leaked-password protection remains disabled.
- Performance advisor reports 136 unindexed foreign keys, 6 auth/RLS initialization-plan findings, 17 tables with multiple permissive policies, 4 duplicate indexes and 144 unused indexes. Review individually; do not apply blanket changes.
- Authenticated acceptance has not yet been recorded for teacher AI draft/save/review/publish, student AI Coach, student invitation acceptance, parent visibility, attendance submission, marketplace booking/safeguarding, announcement/calendar visibility, cross-tenant denial, or gradebook finalize/reopen/inclusion audit.

**Release decision: not production-ready yet.** The project has advanced on both code and live schema, but migration-history reconciliation, the SECURITY DEFINER count discrepancy, Auth leaked-password protection and role-separated end-to-end acceptance remain open.

## Fresh read-only audit — 2026-10-29

The live project was rechecked on 2026-10-29 at approximately 03:06 UTC. Migration history remains **193 records** through `20261026044704`; the current integration tree contains **178 migration files**. Version comparison remains **110 matching version numbers**, **109 matching version-and-name pairs**, **1 same-version name mismatch** (`20260928041149`), **68 repository-only versions**, and **83 live-only versions**. The schema is not obviously missing the major feature objects, but source migration versions and the remote ledger still do not align; do not apply or mark migrations by inference.

Current advisor results: 19 RLS-enabled tables without table policies, 105 authenticated-executable `SECURITY DEFINER` functions, and leaked-password protection disabled. A direct catalog query counted 105 such functions and confirmed all 105 have an explicit function-level `search_path`; the previous narrower query's count of 104 was a query-scope discrepancy, not a remaining catalog-count discrepancy. Performance findings are 136 unindexed foreign keys, 6 auth/RLS initialization-plan findings, 17 multiple-permissive-policy findings, 4 duplicate indexes and 142 unused-index findings. These are review queues, not instructions for blanket changes.

No live database objects, Auth settings, grants, RLS policies or migration-history rows were changed in this audit. The production gate remains open: map every live-only/reconciled migration to exact source SQL, review security-definer function bodies and authorization paths, deliberately configure leaked-password protection, and complete role-separated end-to-end acceptance before production use.
