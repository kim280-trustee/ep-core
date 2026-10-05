-- E&P Learning runtime FK index completion.

create index if not exists learning_assignments_tenant_org_idx on public.learning_assignments(tenant_id,organization_id);
create index if not exists learning_assignments_org_class_subject_idx on public.learning_assignments(organization_id,class_subject_id);
create index if not exists learning_assignments_tenant_created_by_idx on public.learning_assignments(tenant_id,created_by);
create index if not exists learning_assignments_tenant_updated_by_idx on public.learning_assignments(tenant_id,updated_by);
create index if not exists learning_assignment_targets_org_assignment_idx on public.learning_assignment_targets(organization_id,assignment_id);
create index if not exists learning_assignment_targets_class_group_idx on public.learning_assignment_targets(class_group_id);
create index if not exists learning_assignment_targets_tenant_student_idx on public.learning_assignment_targets(tenant_id,student_user_id);
create index if not exists learning_assignment_progress_org_assignment_idx on public.learning_assignment_progress(organization_id,assignment_id);
create index if not exists learning_assignment_progress_student_idx2 on public.learning_assignment_progress(student_user_id);
create index if not exists learning_sessions_tenant_student_idx on public.learning_sessions(tenant_id,student_user_id);