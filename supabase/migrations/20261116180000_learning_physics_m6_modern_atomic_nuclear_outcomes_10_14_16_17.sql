-- E&P Learning: M6 Physics Group 4 outcomes 10–14, 16–17 (modern, atomic and nuclear physics).
-- Official IPST curriculum-use manual: M6 outcomes 10–14, 16–17; official comparison crosswalk
-- separately allocates Group 4 outcomes 15 and 18 to M5. Printed manual pp. 43–45.
begin;
do $$ begin
 if not exists(
  select 1 from public.learning_subjects s
  join public.learning_curricula c on c.code='TH-SCI-M1-M6'
  join public.learning_education_systems es on es.id=c.education_system_id
  join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
  where s.code='PHYSICS' and es.code='TH_BASIC'
    and s.status='active' and c.status='active' and g.status='active'
 ) then raise exception 'Active Physics subject and M6 Science grade are required.'; end if;
end $$;

insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'MODERN-NUCLEAR-PHYSICS','Modern, Atomic and Nuclear Physics',
 'M6 additional Physics outcomes covering quantum ideas, atomic spectra, photoelectric effect, wave-particle duality, radioactivity, nuclear reactions and radiation safety.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update
set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_skills sk
join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M6-PHY-10','PLANCK-BOHR-ATOMIC-SPECTRA','Planck Hypothesis, Bohr Atom and Hydrogen Spectrum','M6 Group 4 outcome 10: explain Planck quantisation, the Bohr model and hydrogen spectral lines; calculate related quantities.',10),
 ('M6-PHY-11','PHOTOELECTRIC-EFFECT','Photoelectric Effect','M6 Group 4 outcome 11: explain the photoelectric effect and calculate photon energy, maximum photoelectron kinetic energy and metal work function.',11),
 ('M6-PHY-12','WAVE-PARTICLE-DUALITY','Wave-Particle Duality and de Broglie Wavelength','M6 Group 4 outcome 12: explain wave-particle duality and calculate de Broglie wavelength from particle momentum.',12),
 ('M6-PHY-13','RADIOACTIVITY-RADIATION-TYPES','Radioactivity and Alpha, Beta and Gamma Radiation','M6 Group 4 outcome 13: explain radioactivity and distinguish alpha, beta and gamma radiation.',13),
 ('M6-PHY-14','ACTIVITY-DECAY-HALF-LIFE','Activity, Radioactive Decay and Half-Life','M6 Group 4 outcome 14: calculate activity, remaining radioactive nuclei and half-life; interpret radioactive-decay evidence.',14),
 ('M6-PHY-16','NUCLEAR-REACTIONS-FISSION-FUSION','Nuclear Reactions, Fission and Fusion','M6 Group 4 outcome 16: explain nuclear reactions, fission and fusion, and calculate nuclear energy from mass-energy equivalence.',16),
 ('M6-PHY-17','NUCLEAR-APPLICATIONS-RADIATION-SAFETY','Nuclear Energy, Radiation Applications and Protection','M6 Group 4 outcome 17: explain uses of nuclear energy and radiation, associated hazards and appropriate radiation-protection principles.',17)
) as v(code,name,description,seq)
where s.code='PHYSICS' and sk.code='MODERN-NUCLEAR-PHYSICS'
on conflict(skill_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics tp
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M6-PHY-10','Planck Hypothesis, Bohr Atom and Hydrogen Spectrum','Explain Planck quantisation, the Bohr model and hydrogen spectral lines; calculate related quantities.',10,'M6-PHY-10'),
 ('M6-PHY-11','Photoelectric Effect','Explain the photoelectric effect and calculate photon energy, maximum photoelectron kinetic energy and metal work function.',11,'M6-PHY-11'),
 ('M6-PHY-12','Wave-Particle Duality and de Broglie Wavelength','Explain wave-particle duality and calculate de Broglie wavelength from particle momentum.',12,'M6-PHY-12'),
 ('M6-PHY-13','Radioactivity and Alpha, Beta and Gamma Radiation','Explain radioactivity and distinguish alpha, beta and gamma radiation.',13,'M6-PHY-13'),
 ('M6-PHY-14','Activity, Radioactive Decay and Half-Life','Calculate activity, remaining radioactive nuclei and half-life; interpret radioactive-decay evidence.',14,'M6-PHY-14'),
 ('M6-PHY-16','Nuclear Reactions, Fission and Fusion','Explain nuclear reactions, fission and fusion, and calculate nuclear energy from mass-energy equivalence.',16,'M6-PHY-16'),
 ('M6-PHY-17','Nuclear Energy, Radiation Applications and Protection','Explain uses of nuclear energy and radiation, associated hazards and appropriate radiation-protection principles.',17,'M6-PHY-17')
) as v(code,name,description,seq,topic_code)
where s.code='PHYSICS' and tp.code=v.topic_code and sk.code='MODERN-NUCLEAR-PHYSICS'
on conflict(topic_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,ob.sequence_no,true,
 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M6 Group 4 outcome '||ob.sequence_no||'; official IPST curriculum-use manual, printed pp. 43–45. Group 4 outcomes 15 and 18 are M5 and are intentionally excluded.'
from public.learning_objectives ob
join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS'
join public.learning_curricula c on c.code='TH-SCI-M1-M6'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M6'
where ob.code in ('M6-PHY-10','M6-PHY-11','M6-PHY-12','M6-PHY-13','M6-PHY-14','M6-PHY-16','M6-PHY-17')
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
