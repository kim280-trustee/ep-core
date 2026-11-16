-- E&P Learning: final M5 Physics outcomes — Group 3 outcomes 1–11 and Group 2 outcome 13.
-- Official IPST curriculum-use manual: M5 Group 3 outcomes 1–11 (printed pp. 31–35)
-- and M5 Group 2 outcome 13 (printed p. 30). Group 3 M6 outcomes restart at 1
-- after the M5 table; keep grade and content-group identities explicit.
begin;
do $$ begin
 if not exists(
  select 1 from public.learning_subjects s
  join public.learning_curricula c on c.code='TH-SCI-M1-M6'
  join public.learning_education_systems es on es.id=c.education_system_id
  join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
  where s.code='PHYSICS' and es.code='TH_BASIC'
    and s.status='active' and c.status='active' and g.status='active'
 ) then raise exception 'Active Physics subject and M5 Science grade are required.'; end if;
end $$;

insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'M5-ELECTROSTATICS-DC','Electrostatics and Direct-Current Electricity',
 'M5 additional Physics Group 3 outcomes covering charging, Coulomb force, electric fields and potential, capacitors, current, resistance, DC circuits, electrical power and renewable electricity.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update
set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_skills(subject_id,code,name,description,status)
select s.id,'LIGHT-OPTICS','Light and Optical Phenomena',
 'Wave optics, reflection, refraction, image formation, colour vision and natural optical phenomena in the M5 Physics additional-learning programme.','active'
from public.learning_subjects s where s.code='PHYSICS'
on conflict(subject_id,code) do update
set name=excluded.name,description=excluded.description,status='active',updated_at=now();

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_skills sk
join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M5-PHY-G3-01','ELECTROSTATIC-CHARGING','Electric Charging by Friction and Induction','M5 Group 3 outcome 1: charge neutral objects by friction and electrostatic induction; explain charge transfer and conservation of charge.',1),
 ('M5-PHY-G3-02','COULOMBS-LAW','Coulomb’s Law','M5 Group 3 outcome 2: explain and calculate the electric force between point charges using Coulomb’s law.',2),
 ('M5-PHY-G3-03','ELECTRIC-FIELDS','Electric Fields and Electric Force','M5 Group 3 outcome 3: explain and calculate electric fields and forces on charges; determine resultant fields by vector addition.',3),
 ('M5-PHY-G3-04','ELECTRIC-POTENTIAL','Electric Potential and Potential Difference','M5 Group 3 outcome 4: explain and calculate electric potential energy, electric potential and potential difference.',4),
 ('M5-PHY-G3-05','CAPACITORS','Capacitance, Stored Energy and Capacitor Networks','M5 Group 3 outcome 5: explain capacitor structure, charge-voltage-capacitance relationships, stored energy and equivalent capacitance.',5),
 ('M5-PHY-G3-06','ELECTROSTATIC-APPLICATIONS','Applications of Electrostatics','M5 Group 3 outcome 6: apply electrostatic principles to devices and everyday phenomena, including electrostatic precipitators, spray painting, photocopiers and lightning safety.',6),
 ('M5-PHY-G3-07','DRIFT-VELOCITY-CURRENT','Electron Drift and Electric Current','M5 Group 3 outcome 7: explain electron drift and calculate current using charge-carrier density, drift speed and conductor cross-sectional area.',7),
 ('M5-PHY-G3-08','OHMS-LAW-RESISTIVITY','Ohm’s Law, Resistivity and Resistor Networks','M5 Group 3 outcome 8: investigate Ohm’s law, resistivity and conductor geometry; calculate series and parallel equivalent resistance.',8),
 ('M5-PHY-G3-09','EMF-ENERGY-POWER','EMF, Electrical Energy and Power','M5 Group 3 outcome 9: investigate and calculate DC-source emf, electrical energy and electrical power.',9),
 ('M5-PHY-G3-10','BATTERY-DC-CIRCUITS','Series and Parallel Batteries in DC Circuits','M5 Group 3 outcome 10: calculate equivalent emf and internal resistance for series/parallel batteries and solve DC circuits with batteries and resistors.',10),
 ('M5-PHY-G3-11','RENEWABLE-ELECTRICITY','Renewable Energy Conversion to Electricity','M5 Group 3 outcome 11: explain renewable-energy conversion to electricity and discuss technologies addressing electricity needs.',11)
) as v(code,name,description,seq)
where s.code='PHYSICS' and sk.code='M5-ELECTROSTATICS-DC'
on conflict(skill_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_topics(skill_id,code,name,description,sequence_no,status)
select sk.id,'M5-PHY-G2-13','COLOUR-VISION-13','M5 Group 2 outcome 13: explain colour vision, object colours, pigment mixing, light mixing and colour-vision deficiency.',13,'active'
from public.learning_skills sk join public.learning_subjects s on s.id=sk.subject_id
where s.code='PHYSICS' and sk.code='LIGHT-OPTICS'
on conflict(skill_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives(topic_id,code,name,description,sequence_no,status)
select tp.id,v.code,v.name,v.description,v.seq,'active'
from public.learning_topics tp
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id
cross join (values
 ('M5-PHY-ELECTROSTATIC-CHARGING-01','Charge Objects by Friction and Induction','Explain how friction transfers electrons and how electrostatic induction redistributes charge; apply conservation of electric charge.',1,'M5-PHY-G3-01'),
 ('M5-PHY-COULOMB-02','Apply Coulomb’s Law','Explain the direction and magnitude of forces between point charges and calculate electric force using Coulomb’s law.',2,'M5-PHY-G3-02'),
 ('M5-PHY-ELECTRIC-FIELDS-03','Explain and Calculate Electric Fields','Explain electric fields and force on a charge; calculate fields from point charges and determine resultant fields using vector addition.',3,'M5-PHY-G3-03'),
 ('M5-PHY-ELECTRIC-POTENTIAL-04','Calculate Electric Potential and Potential Difference','Explain electric potential energy, electric potential and potential difference; calculate values for point charges and uniform fields.',4,'M5-PHY-G3-04'),
 ('M5-PHY-CAPACITORS-05','Explain and Calculate Capacitance','Explain capacitor construction, calculate capacitance and stored energy, and determine equivalent capacitance in series and parallel.',5,'M5-PHY-G3-05'),
 ('M5-PHY-ELECTROSTATIC-APPLICATIONS-06','Apply Electrostatics to Devices and Everyday Phenomena','Explain electrostatic applications such as dust removal, spray painting and photocopying, and explain electrostatic hazards such as lightning.',6,'M5-PHY-G3-06'),
 ('M5-PHY-DRIFT-CURRENT-07','Explain Electron Drift and Calculate Current','Explain electron drift in a conductor and calculate current using I = neAv_d.',7,'M5-PHY-G3-07'),
 ('M5-PHY-OHMS-RESISTIVITY-08','Apply Ohm’s Law and Resistivity','Investigate Ohm’s law; calculate resistance from resistivity, length and area; determine series and parallel equivalent resistance.',8,'M5-PHY-G3-08'),
 ('M5-PHY-EMF-POWER-09','Calculate EMF, Electrical Energy and Power','Explain DC-source emf and calculate terminal voltage, electrical energy and power, including internal resistance where appropriate.',9,'M5-PHY-G3-09'),
 ('M5-PHY-BATTERY-CIRCUITS-10','Analyse Series and Parallel Battery Circuits','Calculate equivalent emf and internal resistance for series and parallel battery combinations and solve DC circuits with resistors.',10,'M5-PHY-G3-10'),
 ('M5-PHY-RENEWABLE-ELECTRICITY-11','Explain Renewable Electricity Technologies','Explain how solar, wind, hydroelectric and other renewable sources can be converted into electricity and compare relevant technologies.',11,'M5-PHY-G3-11'),
 ('M5-PHY-COLOUR-VISION-13','Explain Colour Vision, Colour Mixing and Colour Blindness','Explain how light and pigments determine object colour, compare additive light mixing with subtractive pigment mixing, and explain colour-vision deficiency in terms of cone cells.',13,'M5-PHY-G2-13')
) as v(code,name,description,seq,topic_code)
where s.code='PHYSICS' and tp.code=v.topic_code
and ((v.seq=13 and sk.code='LIGHT-OPTICS') or (v.seq<>13 and sk.code='M5-ELECTROSTATICS-DC'))
on conflict(topic_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments(objective_id,curriculum_id,grade_level_id,sequence_no,required,notes)
select ob.id,c.id,g.id,ob.sequence_no,true,
case ob.code when 'M5-PHY-COLOUR-VISION-13' then 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M5 Group 2 outcome 13; IPST Physics curriculum-use manual, printed p. 30.'
else 'Thai Basic Education Core Curriculum B.E. 2551 (2008), revised B.E. 2560 (2017), Additional Physics, M5 Group 3 outcome '||ob.sequence_no||'; IPST Physics curriculum-use manual, printed pp. 31–35.' end
from public.learning_objectives ob
join public.learning_topics tp on tp.id=ob.topic_id
join public.learning_skills sk on sk.id=tp.skill_id
join public.learning_subjects s on s.id=sk.subject_id and s.code='PHYSICS'
join public.learning_curricula c on c.code='TH-SCI-M1-M6'
join public.learning_grade_levels g on g.curriculum_id=c.id and g.code='M5'
where ob.code in (
 'M5-PHY-ELECTROSTATIC-CHARGING-01','M5-PHY-COULOMB-02','M5-PHY-ELECTRIC-FIELDS-03',
 'M5-PHY-ELECTRIC-POTENTIAL-04','M5-PHY-CAPACITORS-05','M5-PHY-ELECTROSTATIC-APPLICATIONS-06',
 'M5-PHY-DRIFT-CURRENT-07','M5-PHY-OHMS-RESISTIVITY-08','M5-PHY-EMF-POWER-09',
 'M5-PHY-BATTERY-CIRCUITS-10','M5-PHY-RENEWABLE-ELECTRICITY-11','M5-PHY-COLOUR-VISION-13'
)
on conflict(objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,updated_at=now();
commit;
