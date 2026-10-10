-- Migration-history compatibility entry.
-- Historical migration source was absent from this branch. The response table was created by 20261005071735_learning_content_response_teacher_grading.sql and final student write policies are re-established by 20261010000000_harden_learning_content_response_integrity.sql.
-- This intentionally has no schema side effects; the consolidated, reviewed
-- reconciliation migration runs after these historical versions.
select 1;
