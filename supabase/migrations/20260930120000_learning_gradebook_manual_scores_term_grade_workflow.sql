-- Manual gradebook score entry and explicit term-grade calculation/finalization.
-- Manual scores are auditable gradebook entries.
-- Term grades are weighted snapshots over included gradebook entries.

create or replace function public.create_learning_manual_gradebook_entry(p_term_id uuid,p_class_subject_id uuid,p_student_user_id uuid,p_title text,p_score numeric,p_max_score numeric,p_category_id uuid default null,p_description text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_current_user_id uuid; v_tenant_id uuid; v_organization_id uuid; v_class_group_id uuid; v_weight numeric := 1; v_entry_id uuid;
begin
 if (select auth.uid()) is null then raise exception 'Authentication is required'; end if;
 select u.id,u.tenant_id into v_current_user_id,v_tenant_id from public.users u where u.auth_user_id=(select auth.uid()) limit 1;
 if v_current_user_id is null then raise exception 'Application user record was not found'; end if;
 select cs.organization_id,cs.class_group_id into v_organization_id,v_class_group_id from public.learning_class_subjects cs where cs.id=p_class_subject_id and cs.status='active' limit 1;
 if v_organization_id is null then raise exception 'Class subject was not found or is inactive'; end if;
 if not public.learning_can_manage_academic_records(v_organization_id) then raise exception 'You are not allowed to manage academic records for this organization'; end if;
 if not exists(select 1 from public.learning_terms t where t.id=p_term_id and t.organization_id=v_organization_id) then raise exception 'Term does not belong to the selected organization'; end if;
 if not exists(select 1 from public.learning_class_memberships cm where cm.organization_id=v_organization_id and cm.class_group_id=v_class_group_id and cm.user_id=p_student_user_id and cm.membership_type='student' and cm.status='active') then raise exception 'Student is not an active member of the selected class'; end if;
 if p_title is null or btrim(p_title)='' then raise exception 'Score title is required'; end if;
 if p_max_score is null or p_max_score<=0 then raise exception 'Maximum score must be greater than zero'; end if;
 if p_score is null or p_score<0 or p_score>p_max_score then raise exception 'Score must be between zero and the maximum score'; end if;
 if p_category_id is not null then
   select gc.default_weight into v_weight from public.learning_gradebook_categories gc where gc.id=p_category_id and gc.organization_id=v_organization_id and gc.status='active';
   if v_weight is null then raise exception 'Gradebook category was not found or is inactive'; end if;
 end if;
 insert into public.learning_gradebook_entries(tenant_id,organization_id,term_id,class_group_id,class_subject_id,student_user_id,category_id,title,description,record_type,source_type,score,max_score,weight,included_in_grade,recorded_at,created_by)
 values(v_tenant_id,v_organization_id,p_term_id,v_class_group_id,p_class_subject_id,p_student_user_id,p_category_id,btrim(p_title),nullif(btrim(coalesce(p_description,'')),''),'manual','manual',p_score,p_max_score,v_weight,true,now(),v_current_user_id)
 returning id into v_entry_id;
 return v_entry_id;
end; $$;

create or replace function public.calculate_learning_term_grade(p_term_id uuid,p_class_subject_id uuid,p_student_user_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_current_user_id uuid; v_tenant_id uuid; v_organization_id uuid; v_class_group_id uuid; v_grade_id uuid; v_existing_status text; v_entry_count integer; v_total_weight numeric; v_score numeric; v_calculation jsonb;
begin
 if (select auth.uid()) is null then raise exception 'Authentication is required'; end if;
 select u.id,u.tenant_id into v_current_user_id,v_tenant_id from public.users u where u.auth_user_id=(select auth.uid()) limit 1;
 if v_current_user_id is null then raise exception 'Application user record was not found'; end if;
 select cs.organization_id,cs.class_group_id into v_organization_id,v_class_group_id from public.learning_class_subjects cs where cs.id=p_class_subject_id and cs.status='active' limit 1;
 if v_organization_id is null then raise exception 'Class subject was not found or is inactive'; end if;
 if not public.learning_can_manage_academic_records(v_organization_id) then raise exception 'You are not allowed to manage academic records for this organization'; end if;
 if not exists(select 1 from public.learning_terms t where t.id=p_term_id and t.organization_id=v_organization_id) then raise exception 'Term does not belong to the selected organization'; end if;
 if not exists(select 1 from public.learning_class_memberships cm where cm.organization_id=v_organization_id and cm.class_group_id=v_class_group_id and cm.user_id=p_student_user_id and cm.membership_type='student' and cm.status='active') then raise exception 'Student is not an active member of the selected class'; end if;
 select tg.id,tg.status into v_grade_id,v_existing_status from public.learning_term_grades tg where tg.term_id=p_term_id and tg.class_subject_id=p_class_subject_id and tg.student_user_id=p_student_user_id limit 1;
 if v_existing_status='finalized' then raise exception 'The term grade is already finalized'; end if;
 select count(*)::integer,coalesce(sum(e.weight),0) into v_entry_count,v_total_weight from public.learning_gradebook_entries e where e.term_id=p_term_id and e.class_subject_id=p_class_subject_id and e.student_user_id=p_student_user_id and e.included_in_grade=true;
 if v_entry_count=0 or v_total_weight<=0 then raise exception 'No included gradebook scores exist for this student'; end if;
 select round(sum(e.percentage*e.weight)/nullif(sum(e.weight),0),4) into v_score from public.learning_gradebook_entries e where e.term_id=p_term_id and e.class_subject_id=p_class_subject_id and e.student_user_id=p_student_user_id and e.included_in_grade=true;
 select jsonb_build_object('method','weighted_percentage','entryCount',v_entry_count,'totalWeight',v_total_weight,'calculatedScore',v_score,'calculatedAt',now(),'entries',coalesce((select jsonb_agg(jsonb_build_object('entryId',e.id,'title',e.title,'recordType',e.record_type,'percentage',e.percentage,'weight',e.weight) order by e.recorded_at,e.id) from public.learning_gradebook_entries e where e.term_id=p_term_id and e.class_subject_id=p_class_subject_id and e.student_user_id=p_student_user_id and e.included_in_grade=true),'[]'::jsonb)) into v_calculation;
 insert into public.learning_term_grades(tenant_id,organization_id,term_id,class_group_id,class_subject_id,student_user_id,score,letter_grade,status,calculation)
 values(v_tenant_id,v_organization_id,p_term_id,v_class_group_id,p_class_subject_id,p_student_user_id,v_score,null,'draft',v_calculation)
 on conflict(term_id,class_subject_id,student_user_id) do update set score=excluded.score,calculation=excluded.calculation,updated_at=now();
 select tg.id into v_grade_id from public.learning_term_grades tg where tg.term_id=p_term_id and tg.class_subject_id=p_class_subject_id and tg.student_user_id=p_student_user_id limit 1;
 return v_grade_id;
end; $$;

create or replace function public.finalize_learning_term_grade(p_term_id uuid,p_class_subject_id uuid,p_student_user_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_current_user_id uuid; v_organization_id uuid; v_grade_id uuid; v_status text;
begin
 if (select auth.uid()) is null then raise exception 'Authentication is required'; end if;
 select u.id into v_current_user_id from public.users u where u.auth_user_id=(select auth.uid()) limit 1;
 if v_current_user_id is null then raise exception 'Application user record was not found'; end if;
 select cs.organization_id into v_organization_id from public.learning_class_subjects cs where cs.id=p_class_subject_id and cs.status='active' limit 1;
 if v_organization_id is null then raise exception 'Class subject was not found or is inactive'; end if;
 if not public.learning_can_manage_academic_records(v_organization_id) then raise exception 'You are not allowed to manage academic records for this organization'; end if;
 select tg.id,tg.status into v_grade_id,v_status from public.learning_term_grades tg where tg.term_id=p_term_id and tg.class_subject_id=p_class_subject_id and tg.student_user_id=p_student_user_id limit 1;
 if v_grade_id is null then raise exception 'Calculate the term grade before finalizing it'; end if;
 if v_status='finalized' then return v_grade_id; end if;
 update public.learning_term_grades set status='finalized',finalized_at=now(),finalized_by=v_current_user_id,updated_at=now() where id=v_grade_id and status='draft';
 return v_grade_id;
end; $$;

revoke all on function public.create_learning_manual_gradebook_entry(uuid,uuid,uuid,text,numeric,numeric,uuid,text) from public;
revoke all on function public.calculate_learning_term_grade(uuid,uuid,uuid) from public;
revoke all on function public.finalize_learning_term_grade(uuid,uuid,uuid) from public;
grant execute on function public.create_learning_manual_gradebook_entry(uuid,uuid,uuid,text,numeric,numeric,uuid,text) to authenticated;
grant execute on function public.calculate_learning_term_grade(uuid,uuid,uuid) to authenticated;
grant execute on function public.finalize_learning_term_grade(uuid,uuid,uuid) to authenticated;