-- Runtime execution-boundary checks for Learning RPCs.
-- This file runs only in the isolated local Supabase CI database.
-- No rows are written; all calls use disposable UUIDs and must fail closed.

begin;

-- Anonymous API role must not be able to execute protected RPCs or the
-- internal assessment evaluator. Check actual invocation, not only ACL metadata.
set local role anon;

do $anonymous_calls$
begin
  begin
    perform public.submit_learning_attempt(gen_random_uuid());
    raise exception using errcode = 'PZ001', message = 'Anonymous assessment submission unexpectedly executed';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform public.create_learning_parent_invitation(
      gen_random_uuid(), 'runtime@example.invalid', 'Parent', gen_random_uuid(), 'parent'
    );
    raise exception using errcode = 'PZ001', message = 'Anonymous parent invitation creation unexpectedly executed';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform public.accept_learning_parent_invitation(gen_random_uuid());
    raise exception using errcode = 'PZ001', message = 'Anonymous parent invitation acceptance unexpectedly executed';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform public.submit_learning_attempt_internal(gen_random_uuid());
    raise exception using errcode = 'PZ001', message = 'Anonymous caller executed internal assessment evaluator';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform public.get_current_user_permissions();
    raise exception using errcode = 'PZ001', message = 'Anonymous caller executed authenticated permission RPC';
  exception when insufficient_privilege then
    null;
  end;
end;
$anonymous_calls$;

reset role;

-- Authenticated users may call the public wrapper, but not the internal
-- evaluator. The public wrapper must reject a request with no authenticated
-- identity before attempting to load or mutate any assessment attempt.
set local role authenticated;
select set_config('request.jwt.claim.sub', '', true);

do $authenticated_calls$
begin
  begin
    perform public.submit_learning_attempt_internal(gen_random_uuid());
    raise exception using errcode = 'PZ001', message = 'Authenticated caller executed internal assessment evaluator';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform public.submit_learning_attempt(gen_random_uuid());
    raise exception using errcode = 'PZ001', message = 'Assessment submission accepted without an authenticated identity';
  exception when sqlstate 'P0001' then
    if sqlerrm <> 'Authentication is required' then
      raise;
    end if;
  end;

  begin
    perform public.accept_learning_parent_invitation(gen_random_uuid());
    raise exception using errcode = 'PZ001', message = 'Parent invitation accepted without an authenticated identity';
  exception when sqlstate 'P0001' then
    if sqlerrm not ilike '%auth%' then
      raise;
    end if;
  end;
end;
$authenticated_calls$;

reset role;
rollback;
