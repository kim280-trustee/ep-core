-- Correct the pilot class challenge target to match the published setup instructions.
-- Existing assignment history and reward ledger entries are intentionally preserved.
begin;

update public.learning_class_challenges c
set target_value = 2,
    updated_at = now()
where c.title = 'M1 English Learning Sprint'
  and c.target_type = 'assignments_completed'
  and c.status = 'active'
  and c.target_value = 1
  and exists (
    select 1
    from public.learning_class_groups cg
    where cg.id = c.class_group_id
      and cg.name = 'M1-MEP-A'
      and cg.organization_id = c.organization_id
  );

commit;
