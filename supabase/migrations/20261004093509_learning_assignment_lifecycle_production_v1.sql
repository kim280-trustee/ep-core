-- Production assignment lifecycle: atomic reopen/close/reassign with auditable history.
create table if not exists public.learning_assignment_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assignment_id uuid not null references public.learning_assignments(id) on delete cascade,
  parent_assignment_id uuid references public.learning_assignments(id) on delete set null,
  action text not null check (action in ('reopened','closed','reassigned')),
  actor_user_id uuid not null references public.users(id) on delete restrict,
  target_student_user_id uuid references public.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists learning_assignment_lifecycle_assignment_idx on public.learning_assignment_lifecycle_events(organization_id,assignment_id,created_at desc);
create index if not exists learning_assignment_lifecycle_parent_idx on public.learning_assignment_lifecycle_events(organization_id,parent_assignment_id,created_at desc);
alter table public.learning_assignment_lifecycle_events enable row level security;
grant select,insert on public.learning_assignment_lifecycle_events to authenticated;
drop policy if exists learning_assignment_lifecycle_select on public.learning_assignment_lifecycle_events;
create policy learning_assignment_lifecycle_select on public.learning_assignment_lifecycle_events for select to authenticated using (public.is_organization_member(organization_id));
drop policy if exists learning_assignment_lifecycle_insert on public.learning_assignment_lifecycle_events;
create policy learning_assignment_lifecycle_insert on public.learning_assignment_lifecycle_events for insert to authenticated with check (public.is_organization_member(organization_id));

create or replace function public.reopen_learning_assignment(p_assignment_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=public.learning_current_user_id(); v_org uuid; v_status text;
begin
 select organization_id,status into v_org,v_status from public.learning_assignments where id=p_assignment_id for update;
 if v_org is null then raise exception 'Assignment was not found'; end if;
 if not public.learning_can_manage_academic_records(v_org) then raise exception 'You do not have permission to manage academic records'; end if;
 if v_status<>'closed' then raise exception 'Only closed assignments can be reopened'; end if;
 update public.learning_assignments set status='published',updated_by=v_actor,updated_at=now() where id=p_assignment_id;
 insert into public.learning_assignment_lifecycle_events(organization_id,assignment_id,action,actor_user_id,metadata) values(v_org,p_assignment_id,'reopened',v_actor,jsonb_build_object('previous_status',v_status));
 return p_assignment_id;
end $$;

create or replace function public.close_learning_assignment(p_assignment_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=public.learning_current_user_id(); v_org uuid; v_status text;
begin
 select organization_id,status into v_org,v_status from public.learning_assignments where id=p_assignment_id for update;
 if v_org is null then raise exception 'Assignment was not found'; end if;
 if not public.learning_can_manage_academic_records(v_org) then raise exception 'You do not have permission to manage academic records'; end if;
 if v_status<>'published' then raise exception 'Only published assignments can be closed'; end if;
 update public.learning_assignments set status='closed',updated_by=v_actor,updated_at=now() where id=p_assignment_id;
 insert into public.learning_assignment_lifecycle_events(organization_id,assignment_id,action,actor_user_id,metadata) values(v_org,p_assignment_id,'closed',v_actor,jsonb_build_object('previous_status',v_status));
 return p_assignment_id;
end $$;

create or replace function public.reassign_learning_assignment(p_assignment_id uuid,p_student_user_id uuid,p_due_at timestamptz default null) returns uuid language plpgsql security definer set search_path='' as $$
declare
 v_actor uuid:=public.learning_current_user_id(); v_assignment public.learning_assignments%rowtype; v_new_assignment_id uuid; v_new_assessment_id uuid; v_item record; v_assessment record; v_class_group_id uuid; v_student_tenant uuid; v_due_at timestamptz; v_assessment_code text; v_assignment_code text;
begin
 select * into v_assignment from public.learning_assignments where id=p_assignment_id for update;
 if not found then raise exception 'Assignment was not found'; end if;
 if v_assignment.status not in ('published','closed','archived') then raise exception 'Only published, closed, or archived assignments can be given again'; end if;
 if not public.learning_can_manage_academic_records(v_assignment.organization_id) then raise exception 'You do not have permission to manage academic records'; end if;
 select tenant_id into v_student_tenant from public.users where id=p_student_user_id and tenant_id=v_assignment.tenant_id;
 if v_student_tenant is null then raise exception 'Student does not belong to this organization'; end if;
 if v_assignment.class_subject_id is not null then
   select class_group_id into v_class_group_id from public.learning_class_subjects where id=v_assignment.class_subject_id and organization_id=v_assignment.organization_id;
   if v_class_group_id is null then raise exception 'Assignment class subject was not found'; end if;
   if not exists(select 1 from public.learning_class_memberships cm where cm.class_group_id=v_class_group_id and cm.user_id=p_student_user_id and cm.membership_type='student' and cm.status='active') then raise exception 'Student is not an active member of the assignment class'; end if;
 else
   if not exists(select 1 from public.learning_class_memberships cm where cm.user_id=p_student_user_id and cm.organization_id=v_assignment.organization_id and cm.membership_type='student' and cm.status='active') then raise exception 'Student is not an active student in this organization'; end if;
 end if;
 v_due_at:=coalesce(p_due_at,v_assignment.due_at);
 v_assignment_code:=v_assignment.code||'-R-'||substr(replace(gen_random_uuid()::text,'-',''),1,8);
 insert into public.learning_assignments(tenant_id,organization_id,class_subject_id,code,title,description,status,available_from,due_at,max_attempts,instructions,created_by,updated_by,parent_assignment_id,lifecycle_type)
 values(v_assignment.tenant_id,v_assignment.organization_id,v_assignment.class_subject_id,v_assignment_code,v_assignment.title,v_assignment.description,'published',now(),v_due_at,v_assignment.max_attempts,v_assignment.instructions,v_actor,v_actor,v_assignment.id,'reassigned')
 returning id into v_new_assignment_id;
 for v_item in select * from public.learning_assignment_items where assignment_id=p_assignment_id order by sequence_no loop
   if v_item.item_type='assessment' then
     select a.* into v_assessment from public.learning_assessments a where a.id=v_item.assessment_id and a.organization_id=v_assignment.organization_id;
     if v_assessment.id is null then raise exception 'Assessment source was not found'; end if;
     if v_assessment.status<>'published' then raise exception 'All assessment items must be published before reassignment'; end if;
     v_assessment_code:=v_assessment.code||'-R-'||substr(replace(gen_random_uuid()::text,'-',''),1,8);
     insert into public.learning_assessments(organization_id,code,title,description,assessment_type,language_code,curriculum_id,grade_level_id,status,created_by,updated_by,reviewed_by,reviewed_at,published_at)
     values(v_assessment.organization_id,v_assessment_code,v_assessment.title,v_assessment.description,v_assessment.assessment_type,v_assessment.language_code,v_assessment.curriculum_id,v_assessment.grade_level_id,'published',v_actor,v_actor,v_assessment.reviewed_by,v_assessment.reviewed_at,now())
     returning id into v_new_assessment_id;
     insert into public.learning_assessment_questions(assessment_id,question_version_id,sequence_no,points,required)
     select v_new_assessment_id,aq.question_version_id,aq.sequence_no,aq.points,aq.required from public.learning_assessment_questions aq where aq.assessment_id=v_item.assessment_id;
   else
     v_new_assessment_id:=null;
   end if;
   insert into public.learning_assignment_items(organization_id,assignment_id,item_type,content_item_id,assessment_id,sequence_no,required)
   values(v_assignment.organization_id,v_new_assignment_id,v_item.item_type,v_item.content_item_id,v_new_assessment_id,v_item.sequence_no,v_item.required);
 end loop;
 insert into public.learning_assignment_targets(tenant_id,organization_id,assignment_id,target_type,student_user_id,due_at,status)
 values(v_assignment.tenant_id,v_assignment.organization_id,v_new_assignment_id,'student',p_student_user_id,v_due_at,'active');
 insert into public.learning_assignment_lifecycle_events(organization_id,assignment_id,parent_assignment_id,action,actor_user_id,target_student_user_id,metadata)
 values(v_assignment.organization_id,v_new_assignment_id,v_assignment.id,'reassigned',v_actor,p_student_user_id,jsonb_build_object('source_assignment_id',v_assignment.id,'source_code',v_assignment.code));
 return v_new_assignment_id;
end $$;

revoke all on function public.reopen_learning_assignment(uuid) from public;
revoke all on function public.reopen_learning_assignment(uuid) from anon;
grant execute on function public.reopen_learning_assignment(uuid) to authenticated;
revoke all on function public.close_learning_assignment(uuid) from public;
revoke all on function public.close_learning_assignment(uuid) from anon;
grant execute on function public.close_learning_assignment(uuid) to authenticated;
revoke all on function public.reassign_learning_assignment(uuid,uuid,timestamptz) from public;
revoke all on function public.reassign_learning_assignment(uuid,uuid,timestamptz) from anon;
grant execute on function public.reassign_learning_assignment(uuid,uuid,timestamptz) to authenticated;
revoke execute on function public.get_current_user_permissions() from anon;
revoke execute on function public.get_current_user_tenant_id() from anon;
revoke execute on function public.has_permission(text) from anon;
revoke execute on function public.is_organization_member(uuid) from anon;
revoke execute on function public.learning_can_manage_academic_records(uuid) from anon;
revoke execute on function public.learning_current_user_id() from anon;
revoke execute on function public.learning_teacher_can_view_student(uuid) from anon;
revoke execute on function public.calculate_learning_term_grade(uuid,uuid,uuid) from anon;
revoke execute on function public.create_learning_gradebook_bulk_entries(uuid,uuid,jsonb) from anon;
revoke execute on function public.create_learning_manual_gradebook_entry(uuid,uuid,uuid,text,numeric,numeric,uuid,text) from anon;
revoke execute on function public.delete_learning_manual_gradebook_entry(uuid,text) from anon;
revoke execute on function public.finalize_learning_term_grade(uuid,uuid,uuid) from anon;
revoke execute on function public.override_learning_term_grade(uuid,uuid,uuid,numeric,text,text) from anon;
revoke execute on function public.reopen_learning_term_grade(uuid,uuid,uuid,text) from anon;
revoke execute on function public.save_learning_question_evaluation_key(uuid,jsonb,jsonb) from anon;
revoke execute on function public.submit_learning_attempt(uuid) from anon;
revoke execute on function public.update_learning_manual_gradebook_entry(uuid,text,numeric,numeric,uuid,text,text,boolean,text) from anon;