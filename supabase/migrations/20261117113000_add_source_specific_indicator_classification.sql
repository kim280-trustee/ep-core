-- Preserve source-specific indicator classifications across curriculum frameworks.
-- OBEC 2021 uses must_know / should_know.
-- OBEC 2023 uses between_learning / terminal.
-- Do not infer one classification system from the other.

alter table public.learning_objective_alignments
  add column if not exists indicator_classification text;

alter table public.learning_objective_alignments
  drop constraint if exists learning_objective_alignments_indicator_classification_check;

alter table public.learning_objective_alignments
  add constraint learning_objective_alignments_indicator_classification_check
  check (
    indicator_classification is null
    or indicator_classification in (
      'must_know',
      'should_know',
      'between_learning',
      'terminal'
    )
  );

comment on column public.learning_objective_alignments.indicator_classification is
  'Source-specific curriculum indicator classification. Preserves OBEC must/should and between-learning/terminal systems without conflating them.';
