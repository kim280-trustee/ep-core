-- Disposable authenticated-role runtime checks for the Learning pilot.
-- Runs only after the isolated local migration replay; never against production.
begin;

do $seed$
declare
  v_tenant uuid := '2671fd05-2ebf-487c-bd5c-5bc71c7d4ac3';
  v_org uuid := 'b2e1058a-058a-57c5-9c17-7b080838bd2c';
  v_owner uuid := '8d0c1a10-4a91-4a1c-9d30-000000000001';
  v_manager uuid := '8d0c1a10-4a91-4a1c-9d30-000000000002';
  v_staff uuid := '8d0c1a10-4a91-4a1c-9d30-000000000003';
  v_substitute uuid := '8d0c1a10-4a91-4a1c-9d30-000000000005';
  v_teacher uuid := '58d39658-65ec-4918-95e1-994ad5bf4f72';
  v_class uuid := '53a79ceb-8e6c-569c-85c2-f0d115304c0b';
  v_subject uuid;
  v_parent uuid := '8d0c1a10-4a91-4a1c-9d30-000000000004';
  v_owner_auth uuid := '8d0c1a10-4a91-4a1c-9d30-100000000001';
  v_manager_auth uuid := '8d0c1a10-4a91-4a1c-9d30-100000000002';
  v_staff_auth uuid := '8d0c1a10-4a91-4a1c-9d30-100000000003';
  v_substitute_auth uuid := '8d0c1a10-4a91-4a1c-9d30-100000000007';
  v_parent_auth uuid := '8d0c1a10-4a91-4a1c-9d30-100000000004';
  v_owner_role uuid := '8d0c1a10-4a91-4a1c-9d30-200000000001';
  v_manager_role uuid := '8d0c1a10-4a91-4a1c-9d30-200000000002';
  v_staff_role uuid := '8d0c1a10-4a91-4a1c-9d30-200000000003';
begin
  insert into public.users(id,tenant_id,name,email,auth_user_id) values
    (v_owner,v_tenant,'Runtime Owner','runtime-owner@example.invalid',v_owner_auth),
    (v_manager,v_tenant,'Runtime Manager','runtime-manager@example.invalid',v_manager_auth),
    (v_staff,v_tenant,'Runtime Staff','runtime-staff@example.invalid',v_staff_auth),
    (v_substitute,v_tenant,'Runtime Substitute','runtime-substitute@example.invalid',v_substitute_auth),
    (v_parent,v_tenant,'Runtime Parent','runtime-parent@example.invalid',v_parent_auth),
    ('00000000-0000-0000-0000-000000000099',v_tenant,'Unlinked Runtime Student','unlinked-runtime-student@example.invalid','8d0c1a10-4a91-4a1c-9d30-100000000099')
  on conflict (id) do update set auth_user_id=excluded.auth_user_id,email=excluded.email,name=excluded.name;

  update public.users set auth_user_id='8d0c1a10-4a91-4a1c-9d30-100000000005'
    where id='58d39658-65ec-4918-95e1-994ad5bf4f72';
  update public.users set auth_user_id='8d0c1a10-4a91-4a1c-9d30-100000000006'
    where id='f368d757-9321-4a69-af31-7bd3cd38b780';

  insert into public.roles(id,tenant_id,name,is_system_role) values
    (v_owner_role,v_tenant,'OWNER',false),
    (v_manager_role,v_tenant,'MANAGER',false),
    (v_staff_role,v_tenant,'STAFF',false)
  on conflict (id) do update set name=excluded.name;

  insert into public.permissions(code,description)
  values ('learning.academic.manage','Runtime test permission')
  on conflict (code) do nothing;

  insert into public.role_permissions(role_id,permission_id)
  select r.id,p.id from public.roles r cross join public.permissions p
  where r.id in (v_owner_role,v_manager_role) and p.code='learning.academic.manage'
  on conflict (role_id,permission_id) do nothing;

  insert into public.organization_memberships(tenant_id,organization_id,user_id,role_id,status) values
    (v_tenant,v_org,v_owner,v_owner_role,'active'),
    (v_tenant,v_org,v_manager,v_manager_role,'active'),
    (v_tenant,v_org,v_staff,v_staff_role,'active')
  on conflict (organization_id,user_id) do update set role_id=excluded.role_id,status='active';

  insert into public.learning_class_memberships(
    tenant_id,organization_id,class_group_id,user_id,membership_type,status
  ) values (
    v_tenant,v_org,v_class,v_substitute,'teacher','active'
  )
  on conflict (class_group_id,user_id,membership_type)
  do update set status='active';

  insert into public.learning_parent_student_links(
    organization_id,parent_user_id,student_user_id,relationship,status,created_by
  ) values (
    v_org,v_parent,'f368d757-9321-4a69-af31-7bd3cd38b780','parent','active',v_parent
  )
  on conflict (organization_id,parent_user_id,student_user_id)
  do update set status='active';

  -- Seed one timetable entry assigned to the teacher fixture. The authenticated
  -- teacher must see this row through the self-scoped RPC despite lacking
  -- school-wide timetable management permission.
  perform set_config('request.jwt.claim.sub',v_manager_auth::text,true);
  select subject_id into v_subject
  from public.learning_class_subjects
  where organization_id=v_org and class_group_id=v_class
  order by created_at
  limit 1;
  if v_subject is null then raise exception 'Teacher timetable fixture needs an active class subject'; end if;
  delete from public.learning_timetable_entries
  where class_group_id=v_class and day_of_week=1 and starts_at='09:00'::time;
  insert into public.learning_timetable_entries(
    tenant_id,organization_id,class_group_id,subject_id,teacher_user_id,
    day_of_week,starts_at,ends_at,room,created_by
  ) values (
    v_tenant,v_org,v_class,v_subject,v_teacher,
    1,'09:00'::time,'09:50'::time,'Runtime test room',v_manager
  );

  if not exists (
    select 1 from public.learning_class_memberships
    where organization_id=v_org and class_group_id='53a79ceb-8e6c-569c-85c2-f0d115304c0b'
      and user_id='58d39658-65ec-4918-95e1-994ad5bf4f72'
      and membership_type='teacher' and status='active'
  ) then raise exception 'Teacher fixture is not assigned to the pilot class'; end if;
end;
$seed$;

set local role authenticated;

do $matrix$
declare
  v_org uuid := 'b2e1058a-058a-57c5-9c17-7b080838bd2c';
  v_student uuid := 'f368d757-9321-4a69-af31-7bd3cd38b780';
  v_other_student uuid := '00000000-0000-0000-0000-000000000099';
  v_teacher_auth uuid := '8d0c1a10-4a91-4a1c-9d30-100000000005';
  v_substitute_auth uuid := '8d0c1a10-4a91-4a1c-9d30-100000000007';
  v_request_id uuid;
  v_coverage_id uuid;
  v_timetable_entry_id uuid;
  v_coverage_date date;
begin
  perform set_config('request.jwt.claim.sub','8d0c1a10-4a91-4a1c-9d30-100000000001',true);
  if not public.learning_can_manage_academic_records(v_org) then raise exception 'OWNER must manage academic records'; end if;

  perform set_config('request.jwt.claim.sub','8d0c1a10-4a91-4a1c-9d30-100000000002',true);
  if not public.learning_can_manage_academic_records(v_org) then raise exception 'MANAGER must manage academic records'; end if;

  perform set_config('request.jwt.claim.sub','8d0c1a10-4a91-4a1c-9d30-100000000003',true);
  if public.learning_can_manage_academic_records(v_org) then raise exception 'STAFF must not manage academic records'; end if;

  perform set_config('request.jwt.claim.sub',v_teacher_auth::text,true);
  if not public.learning_teacher_can_view_student(v_org,v_student) then raise exception 'Assigned teacher must view the enrolled student'; end if;
  if public.learning_teacher_can_view_student(v_org,v_other_student) then raise exception 'Teacher must not view an unrelated student'; end if;
  if public.learning_can_manage_academic_records(v_org) then raise exception 'Teacher without manager permission must not manage academic records'; end if;
  if not exists (
    select 1 from public.list_learning_teacher_timetable()
    where class_group_id='53a79ceb-8e6c-569c-85c2-f0d115304c0b'
      and teacher_user_id='58d39658-65ec-4918-95e1-994ad5bf4f72'
  ) then raise exception 'Assigned STAFF teacher must read their own timetable entry'; end if;

  perform set_config('request.jwt.claim.sub','8d0c1a10-4a91-4a1c-9d30-100000000003',true);
  if exists (select 1 from public.list_learning_teacher_timetable()) then
    raise exception 'Unassigned STAFF member must not read another teacher timetable';
  end if;

  perform set_config('request.jwt.claim.sub','8d0c1a10-4a91-4a1c-9d30-100000000006',true);
  if public.learning_can_manage_academic_records(v_org) then raise exception 'STUDENT must not manage academic records'; end if;

  perform set_config('request.jwt.claim.sub','8d0c1a10-4a91-4a1c-9d30-100000000004',true);
  if not private.learning_parent_can_view_student(v_org,v_student) then raise exception 'Parent must view the actively linked student'; end if;
  if private.learning_parent_can_view_student(v_org,v_other_student) then raise exception 'Parent must not view an unlinked student'; end if;
  if private.learning_parent_can_view_student('00000000-0000-0000-0000-000000000099',v_student) then raise exception 'Parent link must not cross organization boundaries'; end if;

  -- Exercise the complete leave-review-substitute flow with separate teacher,
  -- manager, substitute, and parent identities.
  v_coverage_date := current_date + ((8 - extract(isodow from current_date)::integer) % 7);
  select id into v_timetable_entry_id
  from public.learning_timetable_entries
  where organization_id=v_org
    and class_group_id='53a79ceb-8e6c-569c-85c2-f0d115304c0b'
    and teacher_user_id='58d39658-65ec-4918-95e1-994ad5bf4f72'
    and day_of_week=1
    and starts_at='09:00'::time
    and status='active'
  limit 1;
  if v_timetable_entry_id is null then raise exception 'Teacher leave test needs the seeded timetable entry'; end if;

  perform set_config('request.jwt.claim.sub',v_teacher_auth::text,true);
  v_request_id := public.create_learning_teacher_leave_request(
    v_org,v_coverage_date,v_coverage_date,'sick','Runtime test teacher leave'
  );
  if not exists (
    select 1 from public.learning_teacher_leave_requests
    where id=v_request_id and teacher_user_id='58d39658-65ec-4918-95e1-994ad5bf4f72'
  ) then raise exception 'Teacher must be able to read their own leave request'; end if;

  perform set_config('request.jwt.claim.sub','8d0c1a10-4a91-4a1c-9d30-100000000002',true);
  perform public.review_learning_teacher_leave_request(v_request_id,'approved','Runtime test approval');
  v_coverage_id := public.assign_learning_teacher_substitute(
    v_request_id,v_timetable_entry_id,v_coverage_date,
    '8d0c1a10-4a91-4a1c-9d30-000000000005','Runtime test substitute'
  );
  if not exists (
    select 1 from public.learning_teacher_substitute_coverages
    where id=v_coverage_id
      and substitute_teacher_user_id='8d0c1a10-4a91-4a1c-9d30-000000000005'
      and status='assigned'
  ) then raise exception 'Manager must assign an active class teacher as substitute'; end if;

  perform set_config('request.jwt.claim.sub',v_teacher_auth::text,true);
  if not exists (select 1 from public.learning_teacher_leave_requests where id=v_request_id) then
    raise exception 'Absent teacher must read their own leave request';
  end if;
  if not exists (select 1 from public.learning_teacher_substitute_coverages where id=v_coverage_id) then
    raise exception 'Absent teacher must read their own substitute coverage';
  end if;

  perform set_config('request.jwt.claim.sub',v_substitute_auth::text,true);
  if not exists (select 1 from public.learning_teacher_substitute_coverages where id=v_coverage_id) then
    raise exception 'Substitute teacher must read assigned coverage';
  end if;

  perform set_config('request.jwt.claim.sub','8d0c1a10-4a91-4a1c-9d30-100000000004',true);
  if exists (select 1 from public.learning_teacher_leave_requests where id=v_request_id) then
    raise exception 'Parent must not read a teacher leave request';
  end if;
  if exists (select 1 from public.learning_teacher_substitute_coverages where id=v_coverage_id) then
    raise exception 'Parent must not read teacher substitute coverage';
  end if;
end;
$matrix$;


-- Exercise actual table RLS, not only authorization helper return values.
-- The parent must see the linked student's profile and class membership,
-- while an existing but unlinked student's profile remains invisible.
do $table_rls$
declare
  v_org uuid := 'b2e1058a-058a-57c5-9c17-7b080838bd2c';
  v_student uuid := 'f368d757-9321-4a69-af31-7bd3cd38b780';
  v_other_student uuid := '00000000-0000-0000-0000-000000000099';
begin
  perform set_config('request.jwt.claim.sub','8d0c1a10-4a91-4a1c-9d30-100000000004',true);

  if not exists (
    select 1 from public.users where id=v_student
  ) then
    raise exception 'Parent table RLS must expose the linked student profile';
  end if;

  if exists (
    select 1 from public.users where id=v_other_student
  ) then
    raise exception 'Parent table RLS exposed an unlinked student profile';
  end if;

  if not exists (
    select 1 from public.learning_class_memberships
    where organization_id=v_org
      and user_id=v_student
      and membership_type='student'
      and status='active'
  ) then
    raise exception 'Parent table RLS must expose the linked student class membership';
  end if;

  if exists (
    select 1 from public.learning_class_memberships
    where organization_id=v_org
      and user_id=v_other_student
  ) then
    raise exception 'Parent table RLS exposed an unlinked student class membership';
  end if;
end;
$table_rls$;

reset role;
rollback;
