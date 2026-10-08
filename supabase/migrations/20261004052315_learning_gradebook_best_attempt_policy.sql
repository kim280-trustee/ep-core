-- Learning Gradebook: best-attempt policy
--
-- Assessment attempts remain historically preserved, but only the best
-- attempt for a student/assessment contributes to the gradebook.
--
-- Best attempt:
--   1. Highest percentage
--   2. Latest evaluated_at
--   3. Highest result id as deterministic final tie-breaker

CREATE OR REPLACE FUNCTION private.sync_learning_assessment_result_to_gradebook(
  p_assessment_result_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_result record;
  v_assignment record;
  v_assessment record;
  v_category_id uuid;
  v_gradebook_entry_id uuid;
  v_best_result_id uuid;
BEGIN
  SELECT
    ar.id,
    ar.attempt_id,
    ar.assessment_id,
    ar.score,
    ar.max_score,
    ar.percentage,
    ar.evaluated_at
  INTO v_result
  FROM public.learning_assessment_results ar
  WHERE ar.id = p_assessment_result_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT
    a.id,
    a.title,
    a.learning_item_id
  INTO v_assessment
  FROM public.learning_assessments a
  WHERE a.id = v_result.assessment_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT
    at.id,
    at.student_user_id,
    at.assignment_id
  INTO v_result
  FROM public.learning_attempts at
  WHERE at.id = v_result.attempt_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT
    la.id,
    la.class_subject_id,
    la.category_id
  INTO v_assignment
  FROM public.learning_assignments la
  WHERE la.id = v_result.assignment_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_category_id := v_assignment.category_id;

  IF v_category_id IS NULL THEN
    SELECT c.id
    INTO v_category_id
    FROM public.learning_gradebook_categories c
    WHERE c.class_subject_id = v_assignment.class_subject_id
      AND lower(c.name) = 'unit'
      AND c.is_active = true
    ORDER BY c.created_at
    LIMIT 1;
  END IF;

  IF v_category_id IS NULL THEN
    RAISE EXCEPTION
      'No gradebook category available for assignment %',
      v_result.assignment_id;
  END IF;

  INSERT INTO public.learning_gradebook_entries (
    class_subject_id,
    student_user_id,
    category_id,
    assessment_id,
    assessment_result_id,
    assignment_id,
    title,
    score,
    max_score,
    percentage,
    record_type,
    included_in_grade,
    notes
  )
  VALUES (
    v_assignment.class_subject_id,
    v_result.student_user_id,
    v_category_id,
    v_result.assessment_id,
    p_assessment_result_id,
    v_result.assignment_id,
    v_assessment.title,
    v_result.score,
    v_result.max_score,
    v_result.percentage,
    'assessment',
    true,
    jsonb_build_object(
      'source',
      'assessment_result',
      'attempt_id',
      v_result.attempt_id,
      'attempt_policy',
      'best_attempt'
    )
  )
  ON CONFLICT (assessment_result_id)
  DO UPDATE SET
    score = EXCLUDED.score,
    max_score = EXCLUDED.max_score,
    percentage = EXCLUDED.percentage,
    title = EXCLUDED.title,
    category_id = EXCLUDED.category_id,
    class_subject_id = EXCLUDED.class_subject_id,
    student_user_id = EXCLUDED.student_user_id,
    assignment_id = EXCLUDED.assignment_id,
    included_in_grade = EXCLUDED.included_in_grade,
    notes = EXCLUDED.notes,
    updated_at = now()
  RETURNING id INTO v_gradebook_entry_id;

  SELECT ar.id
  INTO v_best_result_id
  FROM public.learning_assessment_results ar
  JOIN public.learning_attempts at
    ON at.id = ar.attempt_id
  WHERE ar.assessment_id = v_result.assessment_id
    AND at.student_user_id = v_result.student_user_id
  ORDER BY
    ar.percentage DESC NULLS LAST,
    ar.evaluated_at DESC NULLS LAST,
    ar.id DESC
  LIMIT 1;

  UPDATE public.learning_gradebook_entries
  SET
    included_in_grade = (assessment_result_id = v_best_result_id),
    notes = COALESCE(notes, '{}'::jsonb) ||
      jsonb_build_object('attempt_policy', 'best_attempt'),
    updated_at = now()
  WHERE assessment_id = v_result.assessment_id
    AND student_user_id = v_result.student_user_id
    AND record_type = 'assessment';
END;
$function$;

WITH ranked AS (
  SELECT
    gbe.id,
    ROW_NUMBER() OVER (
      PARTITION BY gbe.assessment_id, gbe.student_user_id
      ORDER BY
        ar.percentage DESC NULLS LAST,
        ar.evaluated_at DESC NULLS LAST,
        ar.id DESC
    ) AS rn
  FROM public.learning_gradebook_entries gbe
  JOIN public.learning_assessment_results ar
    ON ar.id = gbe.assessment_result_id
  WHERE gbe.record_type = 'assessment'
    AND gbe.assessment_id IS NOT NULL
    AND gbe.student_user_id IS NOT NULL
)
UPDATE public.learning_gradebook_entries gbe
SET
  included_in_grade = (ranked.rn = 1),
  notes = COALESCE(gbe.notes, '{}'::jsonb) ||
    jsonb_build_object('attempt_policy', 'best_attempt'),
  updated_at = now()
FROM ranked
WHERE gbe.id = ranked.id;
