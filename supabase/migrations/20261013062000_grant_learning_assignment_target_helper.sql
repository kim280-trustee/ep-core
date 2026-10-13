-- The student assignment-target helper is called by RLS policies for
-- student content responses and assignment progress. Authenticated needs
-- EXECUTE for those policy expressions to evaluate. Keep anonymous/public
-- execution denied; the helper remains in the non-exposed private schema.
revoke all on function private.learning_student_has_assignment_target(uuid, uuid)
  from public, anon;

grant execute on function private.learning_student_has_assignment_target(uuid, uuid)
  to authenticated;
