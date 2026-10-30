-- Remove exact duplicate indexes on learning content responses.
-- Keep the newer canonical indexes with identical column order.
-- Neither removed index backs a constraint.
begin;

drop index if exists public.idx_learning_content_responses_content;
drop index if exists public.idx_learning_content_responses_student;

commit;
