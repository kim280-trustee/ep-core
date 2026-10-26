# Supabase Migration Reconciliation

**Checked:** 2026-10-21  
**Repository:** `kim280-trustee/ep-core`  
**Branch:** `paul/integrate-edna-content`  
**Connected Supabase project:** `ep-core` (read-only inspection; no schema or data was changed)

## Summary

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
- The existing reconciliation totals (175 local migration files, 31 same-name version mismatches, 35 local-only names, 3 remote-only records) remain the documented baseline; they must be recomputed against the current branch before any migration application.
- Security advisors currently report **6 RLS-enabled tables with no policies**, **47 SECURITY DEFINER functions executable by authenticated users**, and **leaked-password protection disabled**. The six tables are the gamification settings/team/competition/preference tables. These findings require review of the actual RPC entry points, function bodies, grants, and intended RPC-only table access; do not blindly add policies or revoke function execution just to silence advisories.
- Performance advisors report **81 unindexed foreign keys**, **6 auth/RLS initialization-plan findings**, **17 tables with multiple permissive policies**, and **4 duplicate-index findings**, plus unused-index notices. Prioritize by actual query paths and security impact; do not drop indexes or consolidate policies without checking dependencies and behavior.
- This was an inspection only. **No SQL, migration history, Auth settings, policies, functions, or indexes were changed.**

### Required next steps

1. Recompute local-vs-remote migration mappings from the exact integration commit and compare SQL definitions for same-name/version-drift cases.
2. Review the six no-policy gamification tables against the RPCs and intended access model; test authenticated and cross-tenant paths before changing grants or policies.
3. Review all externally executable SECURITY DEFINER RPCs for explicit `auth.uid()` checks, tenant/role/class authorization, safe `search_path`, and least-privilege grants. Some may be intentionally exposed authenticated RPCs; advisor presence alone is not proof of exploitability.
4. Enable leaked-password protection through the Supabase Auth configuration after confirming rollout impact.
5. Prioritize unindexed foreign keys and duplicate indexes only after query/schema review, then rerun advisors.
