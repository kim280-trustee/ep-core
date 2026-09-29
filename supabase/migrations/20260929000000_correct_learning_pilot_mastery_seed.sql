-- Correct the pilot mastery row that was seeded with synthetic attempt weight.
-- The student has two real evaluated attempts for this objective, both 100%.
-- Preserve existing mastery events as historical audit records.

update public.learning_student_mastery
set
  mastery_score = 100.000,
  confidence_score = 40.000,
  state = 'mastered',
  attempts_count = 2,
  correct_count = 2,
  last_assessed_at = '2026-09-29 05:21:12.567014+00'::timestamptz,
  next_review_at = '2026-10-29 05:21:12.567014+00'::timestamptz,
  updated_at = now()
where id = 'd941d3e1-5b3c-450b-a6f4-1f463f652cf7'
  and student_user_id = 'f368d757-9321-4a69-af31-7bd3cd38b780'
  and objective_id = '86fc4407-1216-5477-a7d9-9865d83fd8d9'
  and attempts_count = 6
  and correct_count = 2
  and mastery_score = 33.333;
