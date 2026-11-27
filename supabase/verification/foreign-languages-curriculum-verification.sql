-- Foreign Languages curriculum verification (read-only)
-- Project: zcutsqbzvydyosfgrbdi
-- Curriculum: TH-BASIC-CORE-2008-2017
-- This script does not mutate curriculum, content, school, or student data.

-- 1) Subject-wide coverage, source-note alignment, classifications, and duplicates.
WITH fl_subject AS (
  SELECT id
  FROM public.learning_subjects
  WHERE code = 'FOREIGN-LANGUAGES'
),
fl_objectives AS (
  SELECT o.id, o.code, o.status, t.code AS standard_code
  FROM public.learning_objectives o
  JOIN public.learning_topics t ON t.id = o.topic_id
  JOIN public.learning_skills s ON s.id = t.skill_id
  JOIN fl_subject fs ON fs.id = s.subject_id
),
fl_alignments AS (
  SELECT
    a.objective_id,
    a.grade_level_id,
    a.required,
    a.indicator_classification,
    a.notes,
    t.code AS standard_code
  FROM public.learning_objective_alignments a
  JOIN fl_objectives o ON o.id = a.objective_id
  JOIN public.learning_topics t ON t.code = o.standard_code
  JOIN public.learning_skills s ON s.id = t.skill_id
  JOIN fl_subject fs ON fs.id = s.subject_id
  JOIN public.learning_curricula c ON c.id = a.curriculum_id
  WHERE c.code = 'TH-BASIC-CORE-2008-2017'
),
duplicate_codes AS (
  SELECT code
  FROM fl_objectives
  GROUP BY code
  HAVING COUNT(*) > 1
),
duplicate_grade_objectives AS (
  SELECT objective_id, grade_level_id
  FROM fl_alignments
  GROUP BY objective_id, grade_level_id
  HAVING COUNT(*) > 1
),
objective_classifications AS (
  SELECT
    objective_id,
    COUNT(DISTINCT indicator_classification) AS classification_count,
    MIN(indicator_classification) AS classification
  FROM fl_alignments
  GROUP BY objective_id
)
SELECT
  (SELECT COUNT(*) FROM objective_classifications) AS distinct_aligned_objectives,
  (SELECT COUNT(*) FROM objective_classifications WHERE classification = 'must_know') AS distinct_must_know_objectives,
  (SELECT COUNT(*) FROM objective_classifications WHERE classification = 'should_know') AS distinct_should_know_objectives,
  (SELECT COUNT(*) FROM objective_classifications WHERE classification_count <> 1) AS objectives_with_conflicting_classifications,
  (SELECT COUNT(*) FROM fl_objectives WHERE status = 'active') AS active_objectives,
  (SELECT COUNT(DISTINCT code) FROM fl_objectives WHERE status = 'active') AS distinct_active_objective_codes,
  (SELECT COUNT(*) FROM duplicate_codes) AS duplicate_objective_code_groups,
  (SELECT COUNT(*) FROM fl_alignments) AS grade_alignments,
  (SELECT COUNT(*) FROM fl_alignments WHERE required) AS required_alignments,
  (SELECT COUNT(*) FROM fl_alignments WHERE indicator_classification = 'must_know') AS must_know_alignments,
  (SELECT COUNT(*) FROM fl_alignments WHERE indicator_classification = 'should_know') AS should_know_alignments,
  (SELECT COUNT(*) FROM fl_alignments WHERE indicator_classification IS NULL OR indicator_classification NOT IN ('must_know','should_know')) AS unclassified_alignments,
  (SELECT COUNT(*) FROM fl_alignments WHERE notes LIKE 'Official indicator: ' || standard_code || ' %') AS source_note_matches,
  (SELECT COUNT(*) FROM fl_alignments WHERE notes IS NULL OR notes NOT LIKE 'Official indicator: ' || standard_code || ' %') AS source_note_mismatches,
  (SELECT COUNT(*) FROM duplicate_grade_objectives) AS duplicate_grade_objective_groups;

-- 2) Grade-by-grade completeness, including grades with no alignments.
WITH expected_grades(grade_code) AS (
  VALUES ('P1'),('P2'),('P3'),('P4'),('P5'),('P6'),
         ('M1'),('M2'),('M3'),('M4'),('M5'),('M6')
),
fl_subject AS (
  SELECT id FROM public.learning_subjects WHERE code = 'FOREIGN-LANGUAGES'
),
fl_alignments AS (
  SELECT a.objective_id, a.required, a.indicator_classification, g.code AS grade_code
  FROM public.learning_objective_alignments a
  JOIN public.learning_objectives o ON o.id = a.objective_id
  JOIN public.learning_topics t ON t.id = o.topic_id
  JOIN public.learning_skills s ON s.id = t.skill_id
  JOIN fl_subject fs ON fs.id = s.subject_id
  JOIN public.learning_curricula c ON c.id = a.curriculum_id
  JOIN public.learning_grade_levels g ON g.id = a.grade_level_id
  WHERE c.code = 'TH-BASIC-CORE-2008-2017'
)
SELECT
  eg.grade_code,
  COUNT(fa.objective_id) AS grade_alignments,
  COUNT(DISTINCT fa.objective_id) AS distinct_objectives,
  COUNT(*) FILTER (WHERE fa.required) AS required_alignments,
  COUNT(*) FILTER (WHERE fa.indicator_classification = 'must_know') AS must_know,
  COUNT(*) FILTER (WHERE fa.indicator_classification = 'should_know') AS should_know,
  COUNT(*) FILTER (WHERE fa.indicator_classification IS NULL OR fa.indicator_classification NOT IN ('must_know','should_know')) AS unclassified
FROM expected_grades eg
LEFT JOIN fl_alignments fa ON fa.grade_code = eg.grade_code
GROUP BY eg.grade_code
ORDER BY CASE eg.grade_code
  WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 WHEN 'P3' THEN 3
  WHEN 'P4' THEN 4 WHEN 'P5' THEN 5 WHEN 'P6' THEN 6
  WHEN 'M1' THEN 7 WHEN 'M2' THEN 8 WHEN 'M3' THEN 9
  WHEN 'M4' THEN 10 WHEN 'M5' THEN 11 WHEN 'M6' THEN 12
END;

-- 3) Official standard coverage and classification by standard.
WITH fl_subject AS (
  SELECT id FROM public.learning_subjects WHERE code = 'FOREIGN-LANGUAGES'
)
SELECT
  t.code AS standard_code,
  t.name AS standard_name,
  COUNT(DISTINCT o.id) AS objective_count,
  COUNT(a.objective_id) AS grade_alignment_count,
  COUNT(*) FILTER (WHERE a.indicator_classification = 'must_know') AS must_know_alignments,
  COUNT(*) FILTER (WHERE a.indicator_classification = 'should_know') AS should_know_alignments,
  COUNT(*) FILTER (WHERE a.indicator_classification IS NULL OR a.indicator_classification NOT IN ('must_know','should_know')) AS unclassified_alignments,
  COUNT(*) FILTER (WHERE a.notes IS NULL OR a.notes NOT LIKE 'Official indicator: ' || t.code || ' %') AS source_note_mismatches
FROM public.learning_topics t
JOIN public.learning_skills s ON s.id = t.skill_id
JOIN fl_subject fs ON fs.id = s.subject_id
JOIN public.learning_objectives o ON o.topic_id = t.id
LEFT JOIN public.learning_objective_alignments a
  ON a.objective_id = o.id
 AND a.curriculum_id = (SELECT id FROM public.learning_curricula WHERE code = 'TH-BASIC-CORE-2008-2017')
GROUP BY t.code, t.name
ORDER BY t.code;

-- 4) Confirm whether any Foreign Languages teacher content has been imported.
WITH fl_subject AS (
  SELECT id FROM public.learning_subjects WHERE code = 'FOREIGN-LANGUAGES'
),
fl_objectives AS (
  SELECT o.id
  FROM public.learning_objectives o
  JOIN public.learning_topics t ON t.id = o.topic_id
  JOIN public.learning_skills s ON s.id = t.skill_id
  JOIN fl_subject fs ON fs.id = s.subject_id
),
linked_content AS (
  SELECT DISTINCT ci.id, ci.status, ci.language_code
  FROM public.learning_content_items ci
  JOIN public.learning_content_objectives co ON co.content_item_id = ci.id
  JOIN fl_objectives fo ON fo.id = co.objective_id
)
SELECT
  COUNT(*) AS linked_content_items,
  COUNT(*) FILTER (WHERE status = 'draft') AS draft_items,
  COUNT(*) FILTER (WHERE status = 'published') AS published_items
FROM linked_content;


-- 5) Confirm the upper-secondary M4-M6 interval indicators are the same set,
-- rather than three separate sets of 21 indicators.
WITH fl_subject AS (
  SELECT id FROM public.learning_subjects WHERE code = 'FOREIGN-LANGUAGES'
),
fl_alignments AS (
  SELECT DISTINCT a.objective_id, g.code AS grade_code
  FROM public.learning_objective_alignments a
  JOIN public.learning_objectives o ON o.id = a.objective_id
  JOIN public.learning_topics t ON t.id = o.topic_id
  JOIN public.learning_skills s ON s.id = t.skill_id
  JOIN fl_subject fs ON fs.id = s.subject_id
  JOIN public.learning_curricula c ON c.id = a.curriculum_id
  JOIN public.learning_grade_levels g ON g.id = a.grade_level_id
  WHERE c.code = 'TH-BASIC-CORE-2008-2017'
),
m4 AS (SELECT objective_id FROM fl_alignments WHERE grade_code = 'M4'),
m5 AS (SELECT objective_id FROM fl_alignments WHERE grade_code = 'M5'),
m6 AS (SELECT objective_id FROM fl_alignments WHERE grade_code = 'M6')
SELECT
  (SELECT COUNT(*) FROM m4) AS m4_indicator_count,
  (SELECT COUNT(*) FROM m5) AS m5_indicator_count,
  (SELECT COUNT(*) FROM m6) AS m6_indicator_count,
  (SELECT COUNT(*) FROM m4 JOIN m5 USING (objective_id) JOIN m6 USING (objective_id)) AS shared_across_m4_m5_m6;
