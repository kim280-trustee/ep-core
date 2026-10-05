-- Production V1 parent invitation/onboarding
create table if not exists public.learning_parent_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  parent_email text not null,
  parent_name text,
  student_user_id uuid not null references public.users(id) on delete cascade,
  relationship text not null default 'parent',
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  invited_by uuid not null references public.users(id),
  accepted_by uuid references public.users(id),
  invited_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists learning_parent_invitations_email_idx on public.learning_parent_invitations(lower(parent_email),status);
create index if not exists learning_parent_invitations_student_idx on public.learning_parent_invitations(student_user_id,status);
alter table public.learning_parent_invitations enable row level security;
grant select,insert,update on public.learning_parent_invitations to authenticated;
drop policy if exists learning_parent_invitations_manager_select on public.learning_parent_invitations;
create policy learning_parent_invitations_manager_select on public.learning_parent_invitations for select to authenticated using (public.learning_can_manage_academic_records(organization_id));
drop policy if exists learning_parent_invitations_manager_insert on public.learning_parent_invitations;
create policy learning_parent_invitations_manager_insert on public.learning_parent_invitations for insert to authenticated with check (public.learning_can_manage_academic_records(organization_id));
drop policy if exists learning_parent_invitations_manager_update on public.learning_parent_invitations;
create policy learning_parent_invitations_manager_update on public.learning_parent_invitations for update to authenticated using (public.learning_can_manage_academic_records(organization_id)) with check (public.learning_can_manage_academic_records(organization_id));

create or replace function public.create_learning_parent_invitation(p_organization_id uuid,p_parent_email text,p_parent_name text,p_student_user_id uuid,p_relationship text default 'parent')
returns uuid language plpgsql security definer set search_path=public,private as $$
declare v_actor uuid; v_tenant_id uuid; v_invitation_id uuid; v_email text;
begin
 select id into v_actor from public.users where auth_user_id=(select auth.uid()) limit 1;
 if v_actor is null then raise exception 'Authenticated E&P user profile not found'; end if;
 if not public.learning_can_manage_academic_records(p_organization_id) then raise exception 'You do not have permission to invite parents for this organization'; end if;
 v_email:=lower(trim(p_parent_email));
 if v_email='' or position('@' in v_email)<2 then raise exception 'A valid parent email is required'; end if;
 select o.tenant_id into v_tenant_id from public.organizations o where o.id=p_organization_id;
 if v_tenant_id is null then raise exception 'Organization not found'; end if;
 if not exists(select 1 from public.users u where u.id=p_student_user_id and u.tenant_id=v_tenant_id) then raise exception 'Student does not belong to this organization'; end if;
 if exists(select 1 from public.learning_parent_student_links l join public.users p on p.id=l.parent_user_id where l.organization_id=p_organization_id and l.student_user_id=p_student_user_id and l.status='active' and lower(p.email)=v_email) then raise exception 'This parent is already linked to the student'; end if;
 update public.learning_parent_invitations set status='expired',updated_at=now() where organization_id=p_organization_id and lower(parent_email)=v_email and student_user_id=p_student_user_id and status='pending' and expires_at<now();
 insert into public.learning_parent_invitations(organization_id,parent_email,parent_name,student_user_id,relationship,status,invited_by,expires_at,updated_at)
 values(p_organization_id,v_email,nullif(trim(p_parent_name),''),p_student_user_id,coalesce(nullif(trim(p_relationship),''),'parent'),'pending',v_actor,now()+interval '7 days',now())
 returning id into v_invitation_id;
 return v_invitation_id;
end; $$;

create or replace function public.accept_learning_parent_invitation(p_invitation_id uuid)
returns uuid language plpgsql security definer set search_path=public,private as $$
declare v_auth_user_id uuid; v_parent_user_id uuid; v_invite public.learning_parent_invitations%rowtype; v_tenant_id uuid; v_name text; v_email text;
begin
 v_auth_user_id:=(select auth.uid()); if v_auth_user_id is null then raise exception 'Authentication is required'; end if;
 select * into v_invite from public.learning_parent_invitations where id=p_invitation_id for update;
 if not found then raise exception 'Parent invitation not found'; end if;
 if v_invite.status<>'pending' then raise exception 'This parent invitation is no longer active'; end if;
 if v_invite.expires_at<now() then update public.learning_parent_invitations set status='expired',updated_at=now() where id=p_invitation_id; raise exception 'This parent invitation has expired'; end if;
 select lower(email) into v_email from auth.users where id=v_auth_user_id;
 if v_email<>lower(v_invite.parent_email) then raise exception 'The signed-in email does not match this invitation'; end if;
 select id,tenant_id into v_parent_user_id,v_tenant_id from public.users where auth_user_id=v_auth_user_id limit 1;
 if v_parent_user_id is null then
   select coalesce(nullif((select raw_user_meta_data->>'name' from auth.users where id=v_auth_user_id),''),split_part(v_invite.parent_email,'@',1)) into v_name;
   insert into public.users(tenant_id,name,email,auth_user_id)
   select o.tenant_id,v_name,v_invite.parent_email,v_auth_user_id from public.organizations o where o.id=v_invite.organization_id
   returning id,tenant_id into v_parent_user_id,v_tenant_id;
 else
   if lower((select email from public.users where id=v_parent_user_id))<>lower(v_invite.parent_email) then raise exception 'The existing E&P profile email does not match this invitation'; end if;
 end if;
 insert into public.learning_parent_student_links(organization_id,parent_user_id,student_user_id,relationship,status,created_by,updated_at)
 values(v_invite.organization_id,v_parent_user_id,v_invite.student_user_id,v_invite.relationship,'active',v_parent_user_id,now())
 on conflict(organization_id,parent_user_id,student_user_id) do update set relationship=excluded.relationship,status='active',updated_at=now();
 update public.learning_parent_invitations set status='accepted',accepted_by=v_parent_user_id,accepted_at=now(),updated_at=now() where id=p_invitation_id;
 return v_parent_user_id;
end; $$;
revoke all on function public.create_learning_parent_invitation(uuid,text,text,uuid,text) from public,anon;
grant execute on function public.create_learning_parent_invitation(uuid,text,text,uuid,text) to authenticated;
revoke all on function public.accept_learning_parent_invitation(uuid) from public,anon;
grant execute on function public.accept_learning_parent_invitation(uuid) to authenticated;