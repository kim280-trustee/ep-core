-- Keep the original must_know / should_know priority classification separate
-- from the OBEC between_learning / terminal pathway classification.
alter table public.learning_objective_alignments
add column if not exists pathway_classification text;

alter table public.learning_objective_alignments
add constraint learning_objective_alignments_pathway_classification_check
check (pathway_classification is null or pathway_classification in ('between_learning','terminal'));

-- Preserve pathway values already reconciled for M3 and M4-M6.
update public.learning_objective_alignments
set pathway_classification=indicator_classification,
    indicator_classification=null,
    updated_at=now()
where indicator_classification in ('between_learning','terminal');
