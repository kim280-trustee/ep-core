-- Correct the M2/M3 Science topic seeding scope.
-- Earlier migrations joined topic values to every SCI skill instead of the
-- declared skill_code, creating duplicate topic/objective rows across strands.
-- Remove only those mis-scoped catalogue rows. No authored content or learner
-- records reference these objectives (verified before applying this migration).
begin;

create temporary table _science_bad_topic_ids on commit drop as
with intended(topic_code, skill_code) as (
  values
    ('M2-RESP','BIO'),('M2-EXCRET','BIO'),('M2-CIRC','BIO'),('M2-NERVE','BIO'),('M2-REPRO','BIO'),
    ('M2-FORCES','FORCE'),('M2-WORK-ENERGY','ENERGY'),
    ('M2-ENERGY-SOURCES','EARTH'),('M2-EARTH-STRUCTURE','EARTH'),('M2-SURFACE-PROCESSES','EARTH'),('M2-WATER-RESOURCES','EARTH'),('M2-HAZARDS','EARTH'),
    ('M3-GENE','BIO'),('M3-BIOTECH','BIO'),('M3-BIODIV','BIO'),
    ('M3-MATERIALS','MATTER'),('M3-CHEMICAL-REACTIONS','MATTER'),
    ('M3-ELECTRICITY','ENERGY'),('M3-LIGHT-AND-EM','ENERGY'),
    ('M3-SOLAR-SYSTEM','EARTH'),('M3-ROCKS-AND-HAZARDS','EARTH')
)
select t.id as topic_id
from public.learning_topics t
join public.learning_skills sk on sk.id = t.skill_id
join public.learning_subjects s on s.id = sk.subject_id
join intended i on i.topic_code = t.code
where s.code = 'SCI'
  and sk.code <> i.skill_code;

create temporary table _science_bad_objective_ids on commit drop as
select o.id as objective_id
from public.learning_objectives o
join _science_bad_topic_ids b on b.topic_id = o.topic_id;

delete from public.learning_objective_alignments a
using _science_bad_objective_ids b
where a.objective_id = b.objective_id;

delete from public.learning_objectives o
using _science_bad_topic_ids b
where o.topic_id = b.topic_id;

delete from public.learning_topics t
using _science_bad_topic_ids b
where t.id = b.topic_id;

commit;
