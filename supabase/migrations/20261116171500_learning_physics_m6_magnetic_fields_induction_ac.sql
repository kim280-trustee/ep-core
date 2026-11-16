-- E&P Learning: M6 Physics verified electricity outcomes 1, 4 and 5.
-- Official IPST grade allocation crosswalk and curriculum-use manual, printed pp. 170, 174 and 176.
begin;
do $$ begin
 if not exists(select 1 from public.learning_subjects s join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_education_systems es on es.id=c.education_system_id join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6' where s.code='PHYSICS' and es.code='TH_BASIC' and s.status='active' and c.status='active' and g.status='active')
 then raise exception 'Active Physics subject and M6 Science grade are required.'; end if;
end $$;
insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'ELECTRICITY-MAGNETISM','Electricity and Magnetism','Electric fields, magnetic fields, induction, AC, motors, generators and transformers in M6 additional Physics.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M6-PHY-MAGNETIC-FIELDS-01','Magnetic Fields and Magnetic Flux','M6 additional Physics outcome 1: magnetic field lines, magnetic flux, and fields produced by straight current-carrying conductors and solenoids.',1),
 ('M6-PHY-ELECTROMAGNETIC-INDUCTION-04','Electromagnetic Induction and Faraday Law','M6 additional Physics outcome 4: induced emf from changing magnetic flux, Faraday law, Lenz law and applications in electrical devices.',4),
 ('M6-PHY-AC-RMS-05','Alternating Current and RMS Values','M6 additional Physics outcome 5: time-varying AC voltage and current, sinusoidal variation and root-mean-square values.',5)
) as v(code,name,description,seq)
where s.code='PHYSICS' and sk.code='ELECTRICITY-MAGNETISM'
on conflict(skill_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics tp join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M6-PHY-MAGNETIC-FIELDS-01','Describe magnetic fields and calculate magnetic flux','Observe and explain magnetic field lines; explain and calculate magnetic flux through a defined surface; describe magnetic fields produced by a straight current-carrying conductor and a solenoid.',1,'M6-PHY-MAGNETIC-FIELDS-01'),
 ('M6-PHY-ELECTROMAGNETIC-INDUCTION-04','Explain electromagnetic induction and Faraday law','Observe and explain induced electromotive force when magnetic flux through a coil changes; apply Faraday law to calculate induced emf; determine induced-current direction using Lenz law; explain applications including ballasts, induction cookers and motors.',4,'M6-PHY-ELECTROMAGNETIC-INDUCTION-04'),
 ('M6-PHY-AC-RMS-05','Calculate RMS voltage and current in AC circuits','Explain sinusoidal variation of alternating voltage and current; define and calculate root-mean-square voltage and current and relate RMS values to equivalent DC heating effect.',5,'M6-PHY-AC-RMS-05')
) as v(code,name,description,seq,topic_code)
where s.code='PHYSICS' and tp.code=v.topic_code
on conflict(topic_id,code) do update set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,ob.sequence_no,true,
case ob.code
 when 'M6-PHY-MAGNETIC-FIELDS-01' then 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M6 learning outcome 1; IPST Physics comparison crosswalk and curriculum-use manual.'
 when 'M6-PHY-ELECTROMAGNETIC-INDUCTION-04' then 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M6 learning outcome 4; IPST Physics curriculum-use manual, printed p. 174.'
 else 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M6 learning outcome 5; IPST Physics curriculum-use manual, printed p. 176.' end
from public.learning_objectives ob join public.learning_topics tp on tp.id=ob.topic_id join public.learning_skills sk on sk.id=tp.skill_id join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS' join public.learning_curricula c on c.code='TH-SCI-M1-M6' join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
where ob.code in ('M6-PHY-MAGNETIC-FIELDS-01','M6-PHY-ELECTROMAGNETIC-INDUCTION-04','M6-PHY-AC-RMS-05')
on conflict(objective_id,curriculum_id,grade_level_id) do update set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
