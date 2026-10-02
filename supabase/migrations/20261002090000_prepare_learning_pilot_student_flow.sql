-- Prepare the existing Learning pilot records for one clean end-to-end student verification.
-- Historical assessment attempts remain preserved.

begin;

update public.learning_assignments
set status = 'draft'
where id = '15e0d412-129e-44b9-9de3-9620319fadab'
  and code = 'ENG-M1-002';

update public.learning_assignments
set max_attempts = 3
where id = 'd3315ba7-f84c-5f22-a6b2-ab050539a566'
  and code = 'EN-M1-SELF-INTRO-A1';

commit;
