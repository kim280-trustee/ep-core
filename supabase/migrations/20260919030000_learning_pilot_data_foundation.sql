-- E&P Learning pilot data foundation
-- Deterministic, idempotent pilot bootstrap for the first Thailand MEP English cohort.
-- Uses existing Core users/tenant and existing Learning academic/content/runtime models.

begin;

insert into public.organizations (id,tenant_id,name,code,country,currency,timezone,status)
values ('b2e1058a-058a-57c5-9c17-7b080838bd2c','2671fd05-2ebf-487c-bd5c-5bc71c7d4ac3','Khamkhen Kheo Chanupathum','KKC-MEP-PILOT','Thailand','THB','Asia/Bangkok','active')
on conflict (tenant_id,code) do update set name=excluded.name,country=excluded.country,currency=excluded.currency,timezone=excluded.timezone,status='active',updated_at=now();

insert into public.organization_memberships (tenant_id,organization_id,user_id,role_id,status)
values
('2671fd05-2ebf-487c-bd5c-5bc71c7d4ac3','b2e1058a-058a-57c5-9c17-7b080838bd2c','58d39658-65ec-4918-95e1-994ad5bf4f72','fa27f858-f0c2-4c15-be0b-e0ed4bdd7e93','active'),
('2671fd05-2ebf-487c-bd5c-5bc71c7d4ac3','b2e1058a-058a-57c5-9c17-7b080838bd2c','f368d757-9321-4a69-af31-7bd3cd38b780','20559f5d-5217-4b94-9dc5-f57774e0875e','active')
on conflict (organization_id,user_id) do update set role_id=excluded.role_id,status='active',updated_at=now();

insert into public.learning_countries (id,code,name,native_name,status)
values ('753673c5-a7a0-5d38-9448-c5b22aab136e','TH','Thailand','ประเทศไทย','active')
on conflict (code) do update set name=excluded.name,native_name=excluded.native_name,status='active',updated_at=now();

insert into public.learning_education_systems (id,country_id,code,name,description,status)
values ('58379443-5e0c-5ad3-bd65-826a124a27e9','753673c5-a7a0-5d38-9448-c5b22aab136e','TH_BASIC','Thai Basic Education','Thai basic education context used by the pilot.','active')
on conflict (country_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_curricula (id,education_system_id,code,name,version,description,status)
values ('2a08fbfe-2d05-5e82-b1b9-84b643a75b87','58379443-5e0c-5ad3-bd65-826a124a27e9','TH-MEP-EN','English — MEP Pilot','2026.1','Pilot curriculum context for English learning in a Thai MEP setting.','active')
on conflict (education_system_id,code) do update set name=excluded.name,version=excluded.version,description=excluded.description,status='active',updated_at=now();

insert into public.learning_subjects (id,code,name,description,status)
values ('3165aa81-f5e4-504e-b781-4d8672d9d9ad','EN','English','English language learning.','active')
on conflict (code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_curriculum_subjects (id,curriculum_id,subject_id,code,name,status)
values ('1054454a-ee00-5065-ae25-f83935a7070a','2a08fbfe-2d05-5e82-b1b9-84b643a75b87','3165aa81-f5e4-504e-b781-4d8672d9d9ad','EN-MEP','English','active')
on conflict (curriculum_id,subject_id) do update set code=excluded.code,name=excluded.name,status='active',updated_at=now();

insert into public.learning_grade_levels (id,curriculum_id,code,name,sequence_no,description,status)
values ('45f5bea1-2ff9-5fa0-956a-b5aced08c274','2a08fbfe-2d05-5e82-b1b9-84b643a75b87','M1','Grade 7 / M1',1,'Lower secondary first year.','active')
on conflict (curriculum_id,code) do update set name=excluded.name,sequence_no=excluded.sequence_no,description=excluded.description,status='active',updated_at=now();

insert into public.learning_academic_years (id,organization_id,curriculum_id,name,code,starts_on,ends_on,status)
values ('8358245b-2fb2-594f-bdaa-900eb41bb2a0','b2e1058a-058a-57c5-9c17-7b080838bd2c','2a08fbfe-2d05-5e82-b1b9-84b643a75b87','Academic Year 2026/2027','2026-2027','2026-05-01','2027-03-31','active')
on conflict (organization_id,code) do update set name=excluded.name,curriculum_id=excluded.curriculum_id,starts_on=excluded.starts_on,ends_on=excluded.ends_on,status='active',updated_at=now();

insert into public.learning_terms (id,organization_id,academic_year_id,name,code,sequence_no,starts_on,ends_on,status)
values ('f6d466ed-8917-5f3e-a62f-e6eac28940f5','b2e1058a-058a-57c5-9c17-7b080838bd2c','8358245b-2fb2-594f-bdaa-900eb41bb2a0','Term 1','T1',1,'2026-05-01','2026-09-30','active')
on conflict (academic_year_id,code) do update set name=excluded.name,sequence_no=excluded.sequence_no,starts_on=excluded.starts_on,ends_on=excluded.ends_on,status='active',updated_at=now();

insert into public.learning_class_groups (id,organization_id,academic_year_id,curriculum_id,grade_level_id,code,name,status)
values ('53a79ceb-8e6c-569c-85c2-f0d115304c0b','b2e1058a-058a-57c5-9c17-7b080838bd2c','8358245b-2fb2-594f-bdaa-900eb41bb2a0','2a08fbfe-2d05-5e82-b1b9-84b643a75b87','45f5bea1-2ff9-5fa0-956a-b5aced08c274','M1-MEP-A','M1 MEP English Pilot','active')
on conflict (organization_id,academic_year_id,code) do update set name=excluded.name,status='active',grade_level_id=excluded.grade_level_id,curriculum_id=excluded.curriculum_id;

insert into public.learning_class_subjects (id,organization_id,class_group_id,subject_id,status)
values ('b20d13fc-9172-5e5d-a00e-7f505568cf8d','b2e1058a-058a-57c5-9c17-7b080838bd2c','53a79ceb-8e6c-569c-85c2-f0d115304c0b','3165aa81-f5e4-504e-b781-4d8672d9d9ad','active')
on conflict (class_group_id,subject_id) do update set status='active',organization_id=excluded.organization_id;

insert into public.learning_class_memberships (tenant_id,organization_id,class_group_id,user_id,membership_type,status,joined_at)
values
('2671fd05-2ebf-487c-bd5c-5bc71c7d4ac3','b2e1058a-058a-57c5-9c17-7b080838bd2c','53a79ceb-8e6c-569c-85c2-f0d115304c0b','58d39658-65ec-4918-95e1-994ad5bf4f72','teacher','active',now()),
('2671fd05-2ebf-487c-bd5c-5bc71c7d4ac3','b2e1058a-058a-57c5-9c17-7b080838bd2c','53a79ceb-8e6c-569c-85c2-f0d115304c0b','f368d757-9321-4a69-af31-7bd3cd38b780','student','active',now())
on conflict (class_group_id,user_id,membership_type) do update set status='active',joined_at=coalesce(public.learning_class_memberships.joined_at,excluded.joined_at),updated_at=now();

insert into public.learning_skills (id,subject_id,code,name,description,status)
values
('fce6a604-0b1d-5620-80a3-a16f3a5af06c','3165aa81-f5e4-504e-b781-4d8672d9d9ad','SPEAK','Speaking','Communicating basic personal information clearly.','active'),
('8922ef27-6e62-5244-bb64-9218c8e982ae','3165aa81-f5e4-504e-b781-4d8672d9d9ad','GRAM','Grammar','Using core English grammar in everyday contexts.','active')
on conflict (subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_topics (id,skill_id,code,name,description,sequence_no,status)
values
('86100187-2db3-5e80-b9c2-c1127b6d5b30','fce6a604-0b1d-5620-80a3-a16f3a5af06c','SELF-INTRO','Self Introduction','Introducing yourself with basic personal information.',1,'active'),
('2d258fe4-3884-58e4-b28d-aa36029d1d4f','8922ef27-6e62-5244-bb64-9218c8e982ae','PRESENT-SIMPLE','Present Simple','Describing routines and regular activities.',1,'active')
on conflict (skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives (id,topic_id,code,name,description,sequence_no,status)
values
('86fc4407-1216-5477-a7d9-9865d83fd8d9','86100187-2db3-5e80-b9c2-c1127b6d5b30','EN-M1-SPEAK-01','Introduce yourself using basic personal information','Student can introduce themselves using their name, age, school, class and interests.',1,'active'),
('5be0c9e0-e06c-5f4c-ad51-3282ce1936dc','2d258fe4-3884-58e4-b28d-aa36029d1d4f','EN-M1-GRAM-01','Describe a routine using the present simple','Student can use the present simple to describe common daily routines.',1,'active')
on conflict (topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments (id,objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
values
('e987bb65-c337-5d0e-88de-9c87ce3ea541','86fc4407-1216-5477-a7d9-9865d83fd8d9','2a08fbfe-2d05-5e82-b1b9-84b643a75b87','45f5bea1-2ff9-5fa0-956a-b5aced08c274',1,true,'Pilot speaking objective.'),
('fdd4cd89-3972-53a5-8711-26bcc8a7dc56','5be0c9e0-e06c-5f4c-ad51-3282ce1936dc','2a08fbfe-2d05-5e82-b1b9-84b643a75b87','45f5bea1-2ff9-5fa0-956a-b5aced08c274',2,true,'Pilot grammar objective.')
on conflict (objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes;

insert into public.learning_content_items (id,organization_id,code,title,content_type,language_code,status,created_by,updated_by,reviewed_by,reviewed_at,metadata)
values ('45c4f652-e916-58fc-9244-a214475c45b6','b2e1058a-058a-57c5-9c17-7b080838bd2c','EN-M1-SELF-INTRO','Introducing Yourself','lesson','en','published','58d39658-65ec-4918-95e1-994ad5bf4f72','58d39658-65ec-4918-95e1-994ad5bf4f72','58d39658-65ec-4918-95e1-994ad5bf4f72',now(),'{"pilot":true,"source":"teacher_authoring_bootstrap"}'::jsonb)
on conflict (organization_id,code) do update set title=excluded.title,status='published',updated_by=excluded.updated_by,reviewed_by=excluded.reviewed_by,reviewed_at=excluded.reviewed_at,metadata=excluded.metadata,updated_at=now();

insert into public.learning_content_versions (id,content_item_id,version_no,body,change_summary,status,created_by,reviewed_by,reviewed_at,published_at)
values ('f63af98e-a447-5e26-a249-c9cd22d6dede','45c4f652-e916-58fc-9244-a214475c45b6',1,'{"sections":[{"type":"text","title":"Useful pattern","body":"Hello, my name is ____. I am ____ years old. I am from ____. I study at ____. I like ____."},{"type":"practice","prompt":"Say your introduction aloud using the pattern."}]}'::jsonb,'Initial M1 MEP pilot lesson.','published','58d39658-65ec-4918-95e1-994ad5bf4f72','58d39658-65ec-4918-95e1-994ad5bf4f72',now(),now())
on conflict (content_item_id,version_no) do update set body=excluded.body,status='published',reviewed_by=excluded.reviewed_by,reviewed_at=excluded.reviewed_at,published_at=excluded.published_at,updated_at=now();

insert into public.learning_content_objectives(content_item_id,objective_id,sequence_no)
values ('45c4f652-e916-58fc-9244-a214475c45b6','86fc4407-1216-5477-a7d9-9865d83fd8d9',1)
on conflict do nothing;

insert into public.learning_questions (id,organization_id,code,question_type,language_code,status,created_by,updated_by,reviewed_by,reviewed_at)
values ('5dddf85d-d921-548b-ad29-cf2051124b7b','b2e1058a-058a-57c5-9c17-7b080838bd2c','EN-M1-SELF-INTRO-Q1','single_choice','en','published','58d39658-65ec-4918-95e1-994ad5bf4f72','58d39658-65ec-4918-95e1-994ad5bf4f72','58d39658-65ec-4918-95e1-994ad5bf4f72',now())
on conflict (organization_id,code) do update set status='published',updated_by=excluded.updated_by,reviewed_by=excluded.reviewed_by,reviewed_at=excluded.reviewed_at;

insert into public.learning_question_versions (id,question_id,version_no,prompt,configuration,explanation,created_by,reviewed_by,reviewed_at,published_at)
values ('d3315ba7-f84c-5f22-a6b2-ab050539a565','5dddf85d-d921-548b-ad29-cf2051124b7b',1,'{"text":"Which sentence is a correct self-introduction?"}'::jsonb,'{"options":[{"id":"a","text":"My name Paul."},{"id":"b","text":"My name is Paul."},{"id":"c","text":"I name is Paul."},{"id":"d","text":"Me is Paul."}]}'::jsonb,'{"text":"Use the pattern: My name is + name."}'::jsonb,'58d39658-65ec-4918-95e1-994ad5bf4f72','58d39658-65ec-4918-95e1-994ad5bf4f72',now(),now())
on conflict (question_id,version_no) do update set prompt=excluded.prompt,configuration=excluded.configuration,explanation=excluded.explanation,reviewed_by=excluded.reviewed_by,reviewed_at=excluded.reviewed_at,published_at=excluded.published_at,updated_at=now();

insert into public.learning_question_evaluation_keys(question_version_id,evaluation_key,scoring_rules)
values ('d3315ba7-f84c-5f22-a6b2-ab050539a565','{"correct_option_id":"b"}'::jsonb,'{"points":1,"method":"exact_option"}'::jsonb)
on conflict (question_version_id) do update set evaluation_key=excluded.evaluation_key,scoring_rules=excluded.scoring_rules,updated_at=now();

insert into public.learning_question_objectives(question_version_id,objective_id,weight)
values ('d3315ba7-f84c-5f22-a6b2-ab050539a565','86fc4407-1216-5477-a7d9-9865d83fd8d9',1)
on conflict do nothing;

insert into public.learning_assessments (id,organization_id,code,title,description,assessment_type,language_code,curriculum_id,grade_level_id,status,created_by,updated_by,reviewed_by,reviewed_at,published_at)
values ('ba0bec62-5eab-593d-a635-a3d3e54181c7','b2e1058a-058a-57c5-9c17-7b080838bd2c','EN-M1-SELF-INTRO-A1','Self Introduction Check','Short formative check for the self-introduction objective.','quiz','en','2a08fbfe-2d05-5e82-b1b9-84b643a75b87','45f5bea1-2ff9-5fa0-956a-b5aced08c274','published','58d39658-65ec-4918-95e1-994ad5bf4f72','58d39658-65ec-4918-95e1-994ad5bf4f72','58d39658-65ec-4918-95e1-994ad5bf4f72',now(),now())
on conflict (organization_id,code) do update set title=excluded.title,description=excluded.description,status='published',updated_by=excluded.updated_by,reviewed_by=excluded.reviewed_by,reviewed_at=excluded.reviewed_at,published_at=excluded.published_at,updated_at=now();

insert into public.learning_assessment_questions(assessment_id,question_version_id,sequence_no,points,required)
values ('ba0bec62-5eab-593d-a635-a3d3e54181c7','d3315ba7-f84c-5f22-a6b2-ab050539a565',1,1,true)
on conflict (assessment_id,question_version_id) do update set sequence_no=excluded.sequence_no,points=excluded.points,required=excluded.required;

insert into public.learning_assignments (id,tenant_id,organization_id,class_subject_id,code,title,description,status,available_from,max_attempts,instructions,created_by,updated_by)
values ('d3315ba7-f84c-5f22-a6b2-ab050539a566','2671fd05-2ebf-487c-bd5c-5bc71c7d4ac3','b2e1058a-058a-57c5-9c17-7b080838bd2c','b20d13fc-9172-5e5d-a00e-7f505568cf8d','EN-M1-SELF-INTRO-A1','Self Introduction Practice','Learn the basic self-introduction pattern and complete the short check.','published',now(),2,'{"steps":["Read the lesson.","Practice saying your introduction.","Complete the short check."]}'::jsonb,'58d39658-65ec-4918-95e1-994ad5bf4f72','58d39658-65ec-4918-95e1-994ad5bf4f72')
on conflict (organization_id,code) do update set title=excluded.title,description=excluded.description,status='published',class_subject_id=excluded.class_subject_id,updated_by=excluded.updated_by,updated_at=now();

insert into public.learning_assignment_items(organization_id,assignment_id,item_type,content_item_id,assessment_id,sequence_no,required)
values
('b2e1058a-058a-57c5-9c17-7b080838bd2c','d3315ba7-f84c-5f22-a6b2-ab050539a566','content','45c4f652-e916-58fc-9244-a214475c45b6',null,1,true),
('b2e1058a-058a-57c5-9c17-7b080838bd2c','d3315ba7-f84c-5f22-a6b2-ab050539a566','assessment',null,'ba0bec62-5eab-593d-a635-a3d3e54181c7',2,true)
on conflict (assignment_id,sequence_no) do update set item_type=excluded.item_type,content_item_id=excluded.content_item_id,assessment_id=excluded.assessment_id,required=excluded.required;

insert into public.learning_assignment_targets(tenant_id,organization_id,assignment_id,target_type,class_group_id,due_at,status)
values ('2671fd05-2ebf-487c-bd5c-5bc71c7d4ac3','b2e1058a-058a-57c5-9c17-7b080838bd2c','d3315ba7-f84c-5f22-a6b2-ab050539a566','class','53a79ceb-8e6c-569c-85c2-f0d115304c0b',now()+interval '14 days','active')
on conflict (assignment_id,class_group_id) do update set due_at=excluded.due_at,status='active',updated_at=now();

commit;
