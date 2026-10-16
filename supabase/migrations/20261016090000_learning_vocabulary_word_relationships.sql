-- Extend the multilingual vocabulary bank with explicit lexical relationships.
-- Arrays keep related forms attached to their entry without creating duplicate word records.
alter table public.learning_vocabulary_entries
  add column word_forms text[] not null default '{}'::text[],
  add column synonyms text[] not null default '{}'::text[],
  add column antonyms text[] not null default '{}'::text[];

alter table public.learning_vocabulary_entries
  add constraint learning_vocabulary_entries_word_forms_check
    check (cardinality(word_forms) <= 30 and array_position(word_forms, '') is null),
  add constraint learning_vocabulary_entries_synonyms_check
    check (cardinality(synonyms) <= 30 and array_position(synonyms, '') is null),
  add constraint learning_vocabulary_entries_antonyms_check
    check (cardinality(antonyms) <= 30 and array_position(antonyms, '') is null);

comment on column public.learning_vocabulary_entries.word_forms is
  'Inflected or derived forms of the vocabulary headword, such as plural or verb forms.';
comment on column public.learning_vocabulary_entries.synonyms is
  'Comma-separated in the UI; stored as a normalized list of same-language synonyms.';
comment on column public.learning_vocabulary_entries.antonyms is
  'Comma-separated in the UI; stored as a normalized list of same-language antonyms.';
