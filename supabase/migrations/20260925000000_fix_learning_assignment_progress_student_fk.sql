-- Fix the incorrect organization/student composite foreign key.
--
-- learning_assignment_progress.organization_id is an organization UUID.
-- users.tenant_id is a tenant UUID, so the previous composite FK incorrectly
-- compared organization_id to users.tenant_id.
--
-- Organization-scoped student access is already represented by
-- learning_class_memberships and enforced by RLS.

alter table public.learning_assignment_progress
  drop constraint if exists learning_assignment_progress_org_student_fk;
