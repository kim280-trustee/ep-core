-- Add teacher-only class standings based on verified class-assignment XP.
begin;

alter table public.learning_reward_ledger
  add column class_group_id uuid;

alter table public.learning_reward_ledger
  add constraint learning_reward_ledger_organization_class_group_fkey
  foreign key (organization_id, class_group_id)
  references public.learning_class_groups(organization_id, id)
  on delete cascade;

create index learning_reward_ledger_class_student_idx
  on public.learning_reward_ledger(class_group_id, student_user_id, occurred_at desc)
  where class_group_id is not null;

-- Backfill class scope only when a completed assignment has exactly one active class target
-- for that student. Ambiguous multi-class assignments are not attributed to a single class.
with unique_class_targets as (
  select
    p.student_user_id,
    p.assignment_id,
    min(t.class_group_id::text)::uuid as class_group_id
  from public.learning_assignment_progress p
  join public.learning_assignment_targets t
    on t.id = p.assignment_target_id
   and t.assignment_id = p.assignment_id
   and t.organization_id = p.organization_id
  where p.status = 'completed'
    and t.target_type = 'class'
    and t.status = 'active'
    and t.class_group_id is not null
  group by p.student_user_id, p.assignment_id
  having count(distinct t.class_group_id) = 1
)
update public.learning_reward_ledger l
set class_group_id = uct.class_group_id
from unique_class_targets uct
where l.event_type = 'assignment_completed'
  and l.source_type = 'assignment'
  and l.source_id = uct.assignment_id
  and l.student_user_id = uct.student_user_id
  and l.class_group_id is null;

-- Teachers can read class-scoped XP only for classes where they have an active teacher membership.
-- Students retain the separate policy that lets them read only their own ledger entries.
create policy learning_reward_ledger_teacher_class_read
  on public.learning_reward_ledger
  for select to authenticated
  using (
    class_group_id is not null
    and exists (
      select 1
      from public.learning_class_memberships cm
      where cm.class_group_id = learning_reward_ledger.class_group_id
        and cm.user_id = public.learning_current_user_id()
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  );

create or replace function private.award_learning_assignment_reward()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_tenant_id uuid;
  v_class_group_id uuid;
begin
  select
    a.tenant_id,
    case
      when t.target_type = 'class' and t.status = 'active' then t.class_group_id
      else null
    end
  into v_tenant_id, v_class_group_id
  from public.learning_assignments a
  left join public.learning_assignment_targets t
    on t.id = new.assignment_target_id
   and t.assignment_id = new.assignment_id
   and t.organization_id = new.organization_id
  where a.id = new.assignment_id
    and a.organization_id = new.organization_id;

  if v_tenant_id is null then
    return new;
  end if;

  insert into public.learning_reward_ledger (
    tenant_id, organization_id, class_group_id, student_user_id,
    event_type, source_type, source_id, xp_delta, metadata, occurred_at
  ) values (
    v_tenant_id, new.organization_id, v_class_group_id, new.student_user_id,
    'assignment_completed', 'assignment', new.assignment_id, 20,
    jsonb_build_object('source', 'learning_assignment_progress'), coalesce(new.completed_at, now())
  )
  on conflict (student_user_id, event_type, source_type, source_id) do nothing;

  return new;
end;
$function$;

commit;
