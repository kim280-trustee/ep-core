-- Allow authenticated profile reads to reach the existing row-level policies.
-- RLS remains enabled and the parent/teacher/school-admin policies still decide
-- which user profiles each authenticated account may see.
begin;

grant select on table public.users to authenticated;

commit;
