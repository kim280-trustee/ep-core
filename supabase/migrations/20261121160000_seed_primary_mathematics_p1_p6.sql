-- E&P Learning: Thai primary Mathematics P1–P6 knowledge graph.
-- Official indicator numbering follows OBEC's 2017 revised Mathematics standards.
-- Must-Know / Should-Know labels follow the 2021 OBEC detailed tables, with code typos cross-walked.
-- Catalogue-only seed. No school, class, teacher, student, progress or published-content rows are touched.

begin;

do $$
begin
  if not exists (
    select 1
    from public.learning_subjects s
    join public.learning_skills sk on sk.subject_id = s.id
    join public.learning_curricula national on national.code = 'TH-BASIC-CORE-2008-2017'
    join public.learning_grade_levels g on g.curriculum_id = national.id
    where s.code = 'MATH'
      and g.code in ('P1','P2','P3','P4','P5','P6')
      and sk.code in ('NUMALG','MEASGEO','STATPROB')
    group by s.id
    having count(distinct sk.code)=3 and count(distinct g.code)=6
  ) then
    raise exception 'Existing Mathematics subject, three strands and national-master P1–P6 grade levels are required.';
  end if;
end;
$$;

update public.learning_subjects
set description = 'Mathematics learning across Thai primary and secondary education.',
    updated_at = now()
where code = 'MATH';

insert into public.learning_curricula (
  education_system_id, code, name, version, description, status
)
select es.id, 'TH-MATH-P1-P6', 'Thai Basic Education — Mathematics P1–P6',
       'B.E. 2551 (2008), revised 2017',
       'Separate primary Mathematics catalogue for P1–P6. Official indicator codes follow the 2017 revised standards; Must-Know / Should-Know classifications follow the OBEC 2021 detailed tables.',
       'draft'
from public.learning_education_systems es
join public.learning_countries country on country.id=es.country_id
where es.code='TH_BASIC' and country.code='TH'
on conflict (education_system_id,code) do update
set name=excluded.name,version=excluded.version,description=excluded.description,status='draft',updated_at=now();

insert into public.learning_grade_levels (
  curriculum_id,code,name,sequence_no,description,status
)
select curriculum.id, grades.code, grades.name, grades.sequence_no, grades.description, 'active'
from public.learning_curricula curriculum
cross join (values
 ('P1','Prathom 1',1,'Primary year 1.'),
 ('P2','Prathom 2',2,'Primary year 2.'),
 ('P3','Prathom 3',3,'Primary year 3.'),
 ('P4','Prathom 4',4,'Primary year 4.'),
 ('P5','Prathom 5',5,'Primary year 5.'),
 ('P6','Prathom 6',6,'Primary year 6.')
) as grades(code,name,sequence_no,description)
where curriculum.code='TH-MATH-P1-P6'
on conflict (curriculum_id,code) do update
set name=excluded.name,sequence_no=excluded.sequence_no,description=excluded.description,status='active',updated_at=now();

insert into public.learning_curriculum_subjects (curriculum_id,subject_id,code,name,status)
select curriculum.id,subject.id,'MATH','Mathematics','active'
from public.learning_curricula curriculum
join public.learning_subjects subject on subject.code='MATH'
where curriculum.code='TH-MATH-P1-P6'
on conflict (curriculum_id,subject_id) do update
set code=excluded.code,name=excluded.name,status='active',updated_at=now();

insert into public.learning_topics (skill_id,code,name,description,sequence_no,status)
select skill.id,topic.code,topic.name,topic.description,topic.sequence_no,'active'
from public.learning_subjects subject
join public.learning_skills skill on skill.subject_id=subject.id
join (values
 ('NUMALG','PRIMARY-NUMBER-OPERATIONS','Primary Number and Operations','Whole-number representation, place value, arithmetic operations, fractions, decimals, ratios and percentages across P1–P6.',1),
 ('NUMALG','PRIMARY-PATTERNS','Primary Patterns and Relationships','Number patterns, repeating patterns and relationships across primary grades.',2),
 ('MEASGEO','PRIMARY-MEASUREMENT','Primary Measurement','Length, weight, time, money, capacity, volume, perimeter, area and angle measurement across P1–P6.',1),
 ('MEASGEO','PRIMARY-GEOMETRY','Primary Geometry','Two-dimensional shapes, symmetry, angles, constructions, quadrilaterals, triangles and three-dimensional solids.',2),
 ('STATPROB','PRIMARY-STATISTICS','Primary Statistics and Data','Read, represent, organise and interpret pictographs, tables, bar graphs, line graphs and pie charts.',1)
) as topic(skill_code,code,name,description,sequence_no) on topic.skill_code=skill.code
where subject.code='MATH'
on conflict (skill_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objectives (topic_id,code,name,description,sequence_no,status)
select topic.id,objective.code,objective.name,objective.description,objective.sequence_no,'active'
from public.learning_subjects subject
join public.learning_skills skill on skill.subject_id=subject.id
join (values
('PRIMARY-NUMBER-OPERATIONS','P1-K1_1-01','Represent numbers and quantities up to 100','Grade P1 objective: Represent numbers and quantities up to 100. Official indicator ค 1.1 ป.1/1.',101),
('PRIMARY-NUMBER-OPERATIONS','P1-K1_1-02','Compare numbers up to 100','Grade P1 objective: Compare numbers up to 100. Official indicator ค 1.1 ป.1/2.',102),
('PRIMARY-NUMBER-OPERATIONS','P1-K1_1-03','Order numbers up to 100','Grade P1 objective: Order numbers up to 100. Official indicator ค 1.1 ป.1/3.',103),
('PRIMARY-NUMBER-OPERATIONS','P1-K1_1-04','Find unknown values in addition and subtraction sentences','Grade P1 objective: Find unknown values in addition and subtraction sentences. Official indicator ค 1.1 ป.1/4.',104),
('PRIMARY-NUMBER-OPERATIONS','P1-K1_1-05','Solve addition and subtraction word problems up to 100','Grade P1 objective: Solve addition and subtraction word problems up to 100. Official indicator ค 1.1 ป.1/5.',105),
('PRIMARY-PATTERNS','P1-K1_2-01','Complete growing, decreasing and repeating patterns','Grade P1 objective: Complete growing, decreasing and repeating patterns. Official indicator ค 1.2 ป.1/1.',101),
('PRIMARY-MEASUREMENT','P1-K2_1-01','Measure and compare length in centimetres and metres','Grade P1 objective: Measure and compare length in centimetres and metres. Official indicator ค 2.1 ป.1/1.',101),
('PRIMARY-MEASUREMENT','P1-K2_1-02','Measure and compare weight in kilograms and 100-gram units','Grade P1 objective: Measure and compare weight in kilograms and 100-gram units. Official indicator ค 2.1 ป.1/2.',102),
('PRIMARY-GEOMETRY','P1-K2_2-01','Classify familiar two-dimensional shapes and three-dimensional solids','Grade P1 objective: Classify familiar two-dimensional shapes and three-dimensional solids. Official indicator ค 2.2 ป.1/1.',101),
('PRIMARY-STATISTICS','P1-K3_1-01','Read picture graphs with one picture representing one unit','Grade P1 objective: Read picture graphs with one picture representing one unit. Official indicator ค 3.1 ป.1/1.',101),
('PRIMARY-NUMBER-OPERATIONS','P2-K1_1-01','Read, write and represent numbers up to 1,000','Grade P2 objective: Read, write and represent numbers up to 1,000. Official indicator ค 1.1 ป.2/1.',201),
('PRIMARY-NUMBER-OPERATIONS','P2-K1_1-02','Compare numbers up to 1,000','Grade P2 objective: Compare numbers up to 1,000. Official indicator ค 1.1 ป.2/2.',202),
('PRIMARY-NUMBER-OPERATIONS','P2-K1_1-03','Order numbers up to 1,000','Grade P2 objective: Order numbers up to 1,000. Official indicator ค 1.1 ป.2/3.',203),
('PRIMARY-NUMBER-OPERATIONS','P2-K1_1-04','Find unknown values in addition and subtraction sentences','Grade P2 objective: Find unknown values in addition and subtraction sentences. Official indicator ค 1.1 ป.2/4.',204),
('PRIMARY-NUMBER-OPERATIONS','P2-K1_1-05','Find unknown factors in multiplication sentences','Grade P2 objective: Find unknown factors in multiplication sentences. Official indicator ค 1.1 ป.2/5.',205),
('PRIMARY-NUMBER-OPERATIONS','P2-K1_1-06','Find unknown values in division sentences','Grade P2 objective: Find unknown values in division sentences. Official indicator ค 1.1 ป.2/6.',206),
('PRIMARY-NUMBER-OPERATIONS','P2-K1_1-07','Evaluate mixed-operation expressions with whole numbers','Grade P2 objective: Evaluate mixed-operation expressions with whole numbers. Official indicator ค 1.1 ป.2/7.',207),
('PRIMARY-NUMBER-OPERATIONS','P2-K1_1-08','Solve two-step whole-number word problems','Grade P2 objective: Solve two-step whole-number word problems. Official indicator ค 1.1 ป.2/8.',208),
('PRIMARY-MEASUREMENT','P2-K2_1-01','Solve problems involving clock time, duration and calendars','Grade P2 objective: Solve problems involving clock time, duration and calendars. Official indicator ค 2.1 ป.2/1.',201),
('PRIMARY-MEASUREMENT','P2-K2_1-02','Measure and compare length in metres and centimetres','Grade P2 objective: Measure and compare length in metres and centimetres. Official indicator ค 2.1 ป.2/2.',202),
('PRIMARY-MEASUREMENT','P2-K2_1-03','Solve addition and subtraction problems involving length','Grade P2 objective: Solve addition and subtraction problems involving length. Official indicator ค 2.1 ป.2/3.',203),
('PRIMARY-MEASUREMENT','P2-K2_1-04','Measure and compare weight in kilograms and grams','Grade P2 objective: Measure and compare weight in kilograms and grams. Official indicator ค 2.1 ป.2/4.',204),
('PRIMARY-MEASUREMENT','P2-K2_1-05','Solve addition and subtraction problems involving weight','Grade P2 objective: Solve addition and subtraction problems involving weight. Official indicator ค 2.1 ป.2/5.',205),
('PRIMARY-MEASUREMENT','P2-K2_1-06','Measure and compare capacity in litres','Grade P2 objective: Measure and compare capacity in litres. Official indicator ค 2.1 ป.2/6.',206),
('PRIMARY-GEOMETRY','P2-K2_2-01','Classify polygons and circles by their properties','Grade P2 objective: Classify polygons and circles by their properties. Official indicator ค 2.2 ป.2/1.',201),
('PRIMARY-STATISTICS','P2-K3_1-01','Read picture graphs using symbols that represent multiple units','Grade P2 objective: Read picture graphs using symbols that represent multiple units. Official indicator ค 3.1 ป.2/1.',201),
('PRIMARY-NUMBER-OPERATIONS','P3-K1_1-01','Read, write and represent numbers up to 100,000','Grade P3 objective: Read, write and represent numbers up to 100,000. Official indicator ค 1.1 ป.3/1.',301),
('PRIMARY-NUMBER-OPERATIONS','P3-K1_1-02','Compare and order whole numbers','Grade P3 objective: Compare and order whole numbers. Official indicator ค 1.1 ป.3/2.',302),
('PRIMARY-NUMBER-OPERATIONS','P3-K1_1-03','Represent fractions as equal parts of a whole','Grade P3 objective: Represent fractions as equal parts of a whole. Official indicator ค 1.1 ป.3/3.',303),
('PRIMARY-NUMBER-OPERATIONS','P3-K1_1-04','Compare simple fractions','Grade P3 objective: Compare simple fractions. Official indicator ค 1.1 ป.3/4.',304),
('PRIMARY-NUMBER-OPERATIONS','P3-K1_1-05','Find unknown values in addition and subtraction sentences','Grade P3 objective: Find unknown values in addition and subtraction sentences. Official indicator ค 1.1 ป.3/5.',305),
('PRIMARY-NUMBER-OPERATIONS','P3-K1_1-06','Find unknown factors in multiplication sentences','Grade P3 objective: Find unknown factors in multiplication sentences. Official indicator ค 1.1 ป.3/6.',306),
('PRIMARY-NUMBER-OPERATIONS','P3-K1_1-07','Find unknown values in division sentences','Grade P3 objective: Find unknown values in division sentences. Official indicator ค 1.1 ป.3/7.',307),
('PRIMARY-NUMBER-OPERATIONS','P3-K1_1-08','Evaluate mixed-operation whole-number expressions','Grade P3 objective: Evaluate mixed-operation whole-number expressions. Official indicator ค 1.1 ป.3/8.',308),
('PRIMARY-NUMBER-OPERATIONS','P3-K1_1-09','Solve two-step whole-number word problems','Grade P3 objective: Solve two-step whole-number word problems. Official indicator ค 1.1 ป.3/9.',309),
('PRIMARY-NUMBER-OPERATIONS','P3-K1_1-10','Add and subtract fractions with related denominators','Grade P3 objective: Add and subtract fractions with related denominators. Official indicator ค 1.1 ป.3/10.',310),
('PRIMARY-NUMBER-OPERATIONS','P3-K1_1-11','Solve word problems involving addition and subtraction of fractions','Grade P3 objective: Solve word problems involving addition and subtraction of fractions. Official indicator ค 1.1 ป.3/11.',311),
('PRIMARY-PATTERNS','P3-K1_2-01','Identify and extend number patterns','Grade P3 objective: Identify and extend number patterns. Official indicator ค 1.2 ป.3/1.',301),
('PRIMARY-MEASUREMENT','P3-K2_1-01','Solve money problems using baht and satang','Grade P3 objective: Solve money problems using baht and satang. Official indicator ค 2.1 ป.3/1.',301),
('PRIMARY-MEASUREMENT','P3-K2_1-02','Solve problems involving time and duration','Grade P3 objective: Solve problems involving time and duration. Official indicator ค 2.1 ป.3/2.',302),
('PRIMARY-MEASUREMENT','P3-K2_1-03','Measure length in centimetres and metres','Grade P3 objective: Measure length in centimetres and metres. Official indicator ค 2.1 ป.3/3.',303),
('PRIMARY-MEASUREMENT','P3-K2_1-04','Estimate length using suitable units','Grade P3 objective: Estimate length using suitable units. Official indicator ค 2.1 ป.3/4.',304),
('PRIMARY-MEASUREMENT','P3-K2_1-05','Compare lengths using common units','Grade P3 objective: Compare lengths using common units. Official indicator ค 2.1 ป.3/5.',305),
('PRIMARY-MEASUREMENT','P3-K2_1-06','Solve addition and subtraction problems involving length','Grade P3 objective: Solve addition and subtraction problems involving length. Official indicator ค 2.1 ป.3/6.',306),
('PRIMARY-MEASUREMENT','P3-K2_1-07','Measure weight using kilograms and grams','Grade P3 objective: Measure weight using kilograms and grams. Official indicator ค 2.1 ป.3/7.',307),
('PRIMARY-MEASUREMENT','P3-K2_1-08','Estimate weight using suitable units','Grade P3 objective: Estimate weight using suitable units. Official indicator ค 2.1 ป.3/8.',308),
('PRIMARY-MEASUREMENT','P3-K2_1-09','Compare weights using common units','Grade P3 objective: Compare weights using common units. Official indicator ค 2.1 ป.3/9.',309),
('PRIMARY-MEASUREMENT','P3-K2_1-10','Solve addition and subtraction problems involving weight','Grade P3 objective: Solve addition and subtraction problems involving weight. Official indicator ค 2.1 ป.3/10.',310),
('PRIMARY-MEASUREMENT','P3-K2_1-11','Measure volume and capacity in litres and millilitres','Grade P3 objective: Measure volume and capacity in litres and millilitres. Official indicator ค 2.1 ป.3/11.',311),
('PRIMARY-MEASUREMENT','P3-K2_1-12','Estimate volume and capacity','Grade P3 objective: Estimate volume and capacity. Official indicator ค 2.1 ป.3/12.',312),
('PRIMARY-MEASUREMENT','P3-K2_1-13','Solve problems involving volume and capacity','Grade P3 objective: Solve problems involving volume and capacity. Official indicator ค 2.1 ป.3/13.',313),
('PRIMARY-GEOMETRY','P3-K2_2-01','Identify lines of symmetry in two-dimensional shapes','Grade P3 objective: Identify lines of symmetry in two-dimensional shapes. Official indicator ค 2.2 ป.3/1.',301),
('PRIMARY-STATISTICS','P3-K3_1-01','Read pictographs to answer questions','Grade P3 objective: Read pictographs to answer questions. Official indicator ค 3.1 ป.3/1.',301),
('PRIMARY-STATISTICS','P3-K3_1-02','Create and interpret one-way tables','Grade P3 objective: Create and interpret one-way tables. Official indicator ค 3.1 ป.3/2.',302),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-01','Read and write whole numbers greater than 100,000','Grade P4 objective: Read and write whole numbers greater than 100,000. Official indicator ค 1.1 ป.4/1.',401),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-02','Compare and order large whole numbers','Grade P4 objective: Compare and order large whole numbers. Official indicator ค 1.1 ป.4/2.',402),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-03','Represent fractions and mixed numbers','Grade P4 objective: Represent fractions and mixed numbers. Official indicator ค 1.1 ป.4/3.',403),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-04','Compare and order fractions and mixed numbers','Grade P4 objective: Compare and order fractions and mixed numbers. Official indicator ค 1.1 ป.4/4.',404),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-05','Read and write decimals to three decimal places','Grade P4 objective: Read and write decimals to three decimal places. Official indicator ค 1.1 ป.4/5.',405),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-06','Compare and order decimals','Grade P4 objective: Compare and order decimals. Official indicator ค 1.1 ป.4/6.',406),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-07','Estimate results of the four basic operations','Grade P4 objective: Estimate results of the four basic operations. Official indicator ค 1.1 ป.4/7.',407),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-08','Find unknown values in addition and subtraction equations','Grade P4 objective: Find unknown values in addition and subtraction equations. Official indicator ค 1.1 ป.4/8.',408),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-09','Find unknown values in multiplication and division equations','Grade P4 objective: Find unknown values in multiplication and division equations. Official indicator ค 1.1 ป.4/9.',409),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-10','Evaluate mixed-operation expressions','Grade P4 objective: Evaluate mixed-operation expressions. Official indicator ค 1.1 ป.4/10.',410),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-11','Solve two-step whole-number word problems','Grade P4 objective: Solve two-step whole-number word problems. Official indicator ค 1.1 ป.4/11.',411),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-12','Create and solve two-step word problems','Grade P4 objective: Create and solve two-step word problems. Official indicator ค 1.1 ป.4/12.',412),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-13','Add and subtract fractions and mixed numbers','Grade P4 objective: Add and subtract fractions and mixed numbers. Official indicator ค 1.1 ป.4/13.',413),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-14','Solve word problems involving fractions and mixed numbers','Grade P4 objective: Solve word problems involving fractions and mixed numbers. Official indicator ค 1.1 ป.4/14.',414),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-15','Add and subtract decimals','Grade P4 objective: Add and subtract decimals. Official indicator ค 1.1 ป.4/15.',415),
('PRIMARY-NUMBER-OPERATIONS','P4-K1_1-16','Solve word problems involving decimal operations','Grade P4 objective: Solve word problems involving decimal operations. Official indicator ค 1.1 ป.4/16.',416),
('PRIMARY-MEASUREMENT','P4-K2_1-01','Solve problems involving time and duration','Grade P4 objective: Solve problems involving time and duration. Official indicator ค 2.1 ป.4/1.',401),
('PRIMARY-MEASUREMENT','P4-K2_1-02','Measure and construct angles using a protractor','Grade P4 objective: Measure and construct angles using a protractor. Official indicator ค 2.1 ป.4/2.',402),
('PRIMARY-MEASUREMENT','P4-K2_1-03','Find perimeter and area of rectangles','Grade P4 objective: Find perimeter and area of rectangles. Official indicator ค 2.1 ป.4/3.',403),
('PRIMARY-GEOMETRY','P4-K2_2-01','Classify angles by their measures','Grade P4 objective: Classify angles by their measures. Official indicator ค 2.2 ป.4/1.',401),
('PRIMARY-GEOMETRY','P4-K2_2-02','Construct rectangles from given side lengths','Grade P4 objective: Construct rectangles from given side lengths. Official indicator ค 2.2 ป.4/2.',402),
('PRIMARY-STATISTICS','P4-K3_1-01','Read and interpret bar charts and two-way tables','Grade P4 objective: Read and interpret bar charts and two-way tables. Official indicator ค 3.1 ป.4/1.',401),
('PRIMARY-NUMBER-OPERATIONS','P5-K1_1-01','Convert between common fractions and decimals','Grade P5 objective: Convert between common fractions and decimals. Official indicator ค 1.1 ป.5/1.',501),
('PRIMARY-NUMBER-OPERATIONS','P5-K1_1-02','Use proportions to solve problems','Grade P5 objective: Use proportions to solve problems. Official indicator ค 1.1 ป.5/2.',502),
('PRIMARY-NUMBER-OPERATIONS','P5-K1_1-03','Add and subtract fractions and mixed numbers','Grade P5 objective: Add and subtract fractions and mixed numbers. Official indicator ค 1.1 ป.5/3.',503),
('PRIMARY-NUMBER-OPERATIONS','P5-K1_1-04','Multiply and divide fractions','Grade P5 objective: Multiply and divide fractions. Official indicator ค 1.1 ป.5/4.',504),
('PRIMARY-NUMBER-OPERATIONS','P5-K1_1-05','Solve two-step fraction word problems','Grade P5 objective: Solve two-step fraction word problems. Official indicator ค 1.1 ป.5/5.',505),
('PRIMARY-NUMBER-OPERATIONS','P5-K1_1-06','Multiply decimals','Grade P5 objective: Multiply decimals. Official indicator ค 1.1 ป.5/6.',506),
('PRIMARY-NUMBER-OPERATIONS','P5-K1_1-07','Divide decimals','Grade P5 objective: Divide decimals. Official indicator ค 1.1 ป.5/7.',507),
('PRIMARY-NUMBER-OPERATIONS','P5-K1_1-08','Solve two-step decimal word problems','Grade P5 objective: Solve two-step decimal word problems. Official indicator ค 1.1 ป.5/8.',508),
('PRIMARY-NUMBER-OPERATIONS','P5-K1_1-09','Solve percentage word problems','Grade P5 objective: Solve percentage word problems. Official indicator ค 1.1 ป.5/9.',509),
('PRIMARY-MEASUREMENT','P5-K2_1-01','Convert length measurements between metric units','Grade P5 objective: Convert length measurements between metric units. Official indicator ค 2.1 ป.5/1.',501),
('PRIMARY-MEASUREMENT','P5-K2_1-02','Convert weight measurements between metric units','Grade P5 objective: Convert weight measurements between metric units. Official indicator ค 2.1 ป.5/2.',502),
('PRIMARY-MEASUREMENT','P5-K2_1-03','Find volume of rectangular prisms and solve capacity problems','Grade P5 objective: Find volume of rectangular prisms and solve capacity problems. Official indicator ค 2.1 ป.5/3.',503),
('PRIMARY-MEASUREMENT','P5-K2_1-04','Find perimeter and area of parallelograms and rhombi','Grade P5 objective: Find perimeter and area of parallelograms and rhombi. Official indicator ค 2.1 ป.5/4.',504),
('PRIMARY-GEOMETRY','P5-K2_2-01','Construct parallel lines','Grade P5 objective: Construct parallel lines. Official indicator ค 2.2 ป.5/1.',501),
('PRIMARY-GEOMETRY','P5-K2_2-02','Classify quadrilaterals by their properties','Grade P5 objective: Classify quadrilaterals by their properties. Official indicator ค 2.2 ป.5/2.',502),
('PRIMARY-GEOMETRY','P5-K2_2-03','Construct quadrilaterals from given measurements','Grade P5 objective: Construct quadrilaterals from given measurements. Official indicator ค 2.2 ป.5/3.',503),
('PRIMARY-GEOMETRY','P5-K2_2-04','Identify prisms and describe their properties','Grade P5 objective: Identify prisms and describe their properties. Official indicator ค 2.2 ป.5/4.',504),
('PRIMARY-STATISTICS','P5-K3_1-01','Read and interpret line graphs','Grade P5 objective: Read and interpret line graphs. Official indicator ค 3.1 ป.5/1.',501),
('PRIMARY-STATISTICS','P5-K3_1-02','Create and interpret bar graphs','Grade P5 objective: Create and interpret bar graphs. Official indicator ค 3.1 ป.5/2.',502),
('PRIMARY-NUMBER-OPERATIONS','P6-K1_1-01','Compare and order fractions and mixed numbers','Grade P6 objective: Compare and order fractions and mixed numbers. Official indicator ค 1.1 ป.6/1.',601),
('PRIMARY-NUMBER-OPERATIONS','P6-K1_1-02','Represent comparisons of two quantities using ratios','Grade P6 objective: Represent comparisons of two quantities using ratios. Official indicator ค 1.1 ป.6/2.',602),
('PRIMARY-NUMBER-OPERATIONS','P6-K1_1-03','Find equivalent ratios','Grade P6 objective: Find equivalent ratios. Official indicator ค 1.1 ป.6/3.',603),
('PRIMARY-NUMBER-OPERATIONS','P6-K1_1-04','Find the greatest common divisor of whole numbers','Grade P6 objective: Find the greatest common divisor of whole numbers. Official indicator ค 1.1 ป.6/4.',604),
('PRIMARY-NUMBER-OPERATIONS','P6-K1_1-05','Find the least common multiple of whole numbers','Grade P6 objective: Find the least common multiple of whole numbers. Official indicator ค 1.1 ป.6/5.',605),
('PRIMARY-NUMBER-OPERATIONS','P6-K1_1-06','Solve problems using greatest common divisors and least common multiples','Grade P6 objective: Solve problems using greatest common divisors and least common multiples. Official indicator ค 1.1 ป.6/6.',606),
('PRIMARY-NUMBER-OPERATIONS','P6-K1_1-07','Evaluate mixed operations with fractions and mixed numbers','Grade P6 objective: Evaluate mixed operations with fractions and mixed numbers. Official indicator ค 1.1 ป.6/7.',607),
('PRIMARY-NUMBER-OPERATIONS','P6-K1_1-08','Solve multi-step fraction and mixed-number word problems','Grade P6 objective: Solve multi-step fraction and mixed-number word problems. Official indicator ค 1.1 ป.6/8.',608),
('PRIMARY-NUMBER-OPERATIONS','P6-K1_1-09','Divide decimals to three decimal places','Grade P6 objective: Divide decimals to three decimal places. Official indicator ค 1.1 ป.6/9.',609),
('PRIMARY-NUMBER-OPERATIONS','P6-K1_1-10','Solve multi-step decimal word problems','Grade P6 objective: Solve multi-step decimal word problems. Official indicator ค 1.1 ป.6/10.',610),
('PRIMARY-NUMBER-OPERATIONS','P6-K1_1-11','Solve ratio and scale problems','Grade P6 objective: Solve ratio and scale problems. Official indicator ค 1.1 ป.6/11.',611),
('PRIMARY-NUMBER-OPERATIONS','P6-K1_1-12','Solve percentage word problems in real-life contexts','Grade P6 objective: Solve percentage word problems in real-life contexts. Official indicator ค 1.1 ป.6/12.',612),
('PRIMARY-PATTERNS','P6-K1_2-01','Extend and solve problems involving number patterns','Grade P6 objective: Extend and solve problems involving number patterns. Official indicator ค 1.2 ป.6/1.',601),
('PRIMARY-MEASUREMENT','P6-K2_1-01','Solve volume problems involving composite rectangular prisms','Grade P6 objective: Solve volume problems involving composite rectangular prisms. Official indicator ค 2.1 ป.6/1.',601),
('PRIMARY-MEASUREMENT','P6-K2_1-02','Find perimeter and area of polygons','Grade P6 objective: Find perimeter and area of polygons. Official indicator ค 2.1 ป.6/2.',602),
('PRIMARY-MEASUREMENT','P6-K2_1-03','Solve problems involving circumference and area of circles','Grade P6 objective: Solve problems involving circumference and area of circles. Official indicator ค 2.1 ป.6/3.',603),
('PRIMARY-GEOMETRY','P6-K2_2-01','Classify triangles using their properties','Grade P6 objective: Classify triangles using their properties. Official indicator ค 2.2 ป.6/1.',601),
('PRIMARY-GEOMETRY','P6-K2_2-02','Construct triangles from given side lengths and angles','Grade P6 objective: Construct triangles from given side lengths and angles. Official indicator ค 2.2 ป.6/2.',602),
('PRIMARY-GEOMETRY','P6-K2_2-03','Identify and describe three-dimensional solids','Grade P6 objective: Identify and describe three-dimensional solids. Official indicator ค 2.2 ป.6/3.',603),
('PRIMARY-GEOMETRY','P6-K2_2-04','Match nets to three-dimensional solids','Grade P6 objective: Match nets to three-dimensional solids. Official indicator ค 2.2 ป.6/4.',604),
('PRIMARY-STATISTICS','P6-K3_1-01','Read and interpret pie charts to solve problems','Grade P6 objective: Read and interpret pie charts to solve problems. Official indicator ค 3.1 ป.6/1.',601)
) as objective(topic_code,code,name,description,sequence_no) on true
join public.learning_topics topic on topic.skill_id=skill.id and topic.code=objective.topic_code
where subject.code='MATH'
on conflict (topic_id,code) do update
set name=excluded.name,description=excluded.description,sequence_no=excluded.sequence_no,status='active',updated_at=now();

insert into public.learning_objective_alignments (
 objective_id,curriculum_id,grade_level_id,sequence_no,required,notes,indicator_classification
)
select objective.id,curriculum.id,grade.id,alignment.sequence_no,true,
 'Official indicator '||alignment.indicator_code||'; OBEC 2017 revised Mathematics code crosswalk; OBEC 2021 Must-Know / Should-Know priority.',
 alignment.classification
from public.learning_objectives objective
join public.learning_topics topic on topic.id=objective.topic_id
join public.learning_skills skill on skill.id=topic.skill_id
join public.learning_subjects subject on subject.id=skill.subject_id and subject.code='MATH'
join (values
('P1','P1-K1_1-01',101,'ค 1.1 ป.1/1','must_know'),
('P1','P1-K1_1-02',102,'ค 1.1 ป.1/2','must_know'),
('P1','P1-K1_1-03',103,'ค 1.1 ป.1/3','should_know'),
('P1','P1-K1_1-04',104,'ค 1.1 ป.1/4','must_know'),
('P1','P1-K1_1-05',105,'ค 1.1 ป.1/5','must_know'),
('P1','P1-K1_2-01',101,'ค 1.2 ป.1/1','should_know'),
('P1','P1-K2_1-01',101,'ค 2.1 ป.1/1','must_know'),
('P1','P1-K2_1-02',102,'ค 2.1 ป.1/2','must_know'),
('P1','P1-K2_2-01',101,'ค 2.2 ป.1/1','should_know'),
('P1','P1-K3_1-01',101,'ค 3.1 ป.1/1','should_know'),
('P2','P2-K1_1-01',201,'ค 1.1 ป.2/1','must_know'),
('P2','P2-K1_1-02',202,'ค 1.1 ป.2/2','must_know'),
('P2','P2-K1_1-03',203,'ค 1.1 ป.2/3','should_know'),
('P2','P2-K1_1-04',204,'ค 1.1 ป.2/4','must_know'),
('P2','P2-K1_1-05',205,'ค 1.1 ป.2/5','must_know'),
('P2','P2-K1_1-06',206,'ค 1.1 ป.2/6','must_know'),
('P2','P2-K1_1-07',207,'ค 1.1 ป.2/7','should_know'),
('P2','P2-K1_1-08',208,'ค 1.1 ป.2/8','should_know'),
('P2','P2-K2_1-01',201,'ค 2.1 ป.2/1','must_know'),
('P2','P2-K2_1-02',202,'ค 2.1 ป.2/2','must_know'),
('P2','P2-K2_1-03',203,'ค 2.1 ป.2/3','must_know'),
('P2','P2-K2_1-04',204,'ค 2.1 ป.2/4','must_know'),
('P2','P2-K2_1-05',205,'ค 2.1 ป.2/5','must_know'),
('P2','P2-K2_1-06',206,'ค 2.1 ป.2/6','must_know'),
('P2','P2-K2_2-01',201,'ค 2.2 ป.2/1','must_know'),
('P2','P2-K3_1-01',201,'ค 3.1 ป.2/1','must_know'),
('P3','P3-K1_1-01',301,'ค 1.1 ป.3/1','must_know'),
('P3','P3-K1_1-02',302,'ค 1.1 ป.3/2','must_know'),
('P3','P3-K1_1-03',303,'ค 1.1 ป.3/3','must_know'),
('P3','P3-K1_1-04',304,'ค 1.1 ป.3/4','must_know'),
('P3','P3-K1_1-05',305,'ค 1.1 ป.3/5','must_know'),
('P3','P3-K1_1-06',306,'ค 1.1 ป.3/6','must_know'),
('P3','P3-K1_1-07',307,'ค 1.1 ป.3/7','must_know'),
('P3','P3-K1_1-08',308,'ค 1.1 ป.3/8','must_know'),
('P3','P3-K1_1-09',309,'ค 1.1 ป.3/9','must_know'),
('P3','P3-K1_1-10',310,'ค 1.1 ป.3/10','must_know'),
('P3','P3-K1_1-11',311,'ค 1.1 ป.3/11','must_know'),
('P3','P3-K1_2-01',301,'ค 1.2 ป.3/1','should_know'),
('P3','P3-K2_1-01',301,'ค 2.1 ป.3/1','must_know'),
('P3','P3-K2_1-02',302,'ค 2.1 ป.3/2','must_know'),
('P3','P3-K2_1-03',303,'ค 2.1 ป.3/3','must_know'),
('P3','P3-K2_1-04',304,'ค 2.1 ป.3/4','should_know'),
('P3','P3-K2_1-05',305,'ค 2.1 ป.3/5','must_know'),
('P3','P3-K2_1-06',306,'ค 2.1 ป.3/6','must_know'),
('P3','P3-K2_1-07',307,'ค 2.1 ป.3/7','must_know'),
('P3','P3-K2_1-08',308,'ค 2.1 ป.3/8','should_know'),
('P3','P3-K2_1-09',309,'ค 2.1 ป.3/9','must_know'),
('P3','P3-K2_1-10',310,'ค 2.1 ป.3/10','must_know'),
('P3','P3-K2_1-11',311,'ค 2.1 ป.3/11','must_know'),
('P3','P3-K2_1-12',312,'ค 2.1 ป.3/12','should_know'),
('P3','P3-K2_1-13',313,'ค 2.1 ป.3/13','must_know'),
('P3','P3-K2_2-01',301,'ค 2.2 ป.3/1','should_know'),
('P3','P3-K3_1-01',301,'ค 3.1 ป.3/1','must_know'),
('P3','P3-K3_1-02',302,'ค 3.1 ป.3/2','should_know'),
('P4','P4-K1_1-01',401,'ค 1.1 ป.4/1','must_know'),
('P4','P4-K1_1-02',402,'ค 1.1 ป.4/2','must_know'),
('P4','P4-K1_1-03',403,'ค 1.1 ป.4/3','must_know'),
('P4','P4-K1_1-04',404,'ค 1.1 ป.4/4','must_know'),
('P4','P4-K1_1-05',405,'ค 1.1 ป.4/5','must_know'),
('P4','P4-K1_1-06',406,'ค 1.1 ป.4/6','must_know'),
('P4','P4-K1_1-07',407,'ค 1.1 ป.4/7','should_know'),
('P4','P4-K1_1-08',408,'ค 1.1 ป.4/8','should_know'),
('P4','P4-K1_1-09',409,'ค 1.1 ป.4/9','should_know'),
('P4','P4-K1_1-10',410,'ค 1.1 ป.4/10','must_know'),
('P4','P4-K1_1-11',411,'ค 1.1 ป.4/11','should_know'),
('P4','P4-K1_1-12',412,'ค 1.1 ป.4/12','should_know'),
('P4','P4-K1_1-13',413,'ค 1.1 ป.4/13','must_know'),
('P4','P4-K1_1-14',414,'ค 1.1 ป.4/14','must_know'),
('P4','P4-K1_1-15',415,'ค 1.1 ป.4/15','must_know'),
('P4','P4-K1_1-16',416,'ค 1.1 ป.4/16','must_know'),
('P4','P4-K2_1-01',401,'ค 2.1 ป.4/1','must_know'),
('P4','P4-K2_1-02',402,'ค 2.1 ป.4/2','should_know'),
('P4','P4-K2_1-03',403,'ค 2.1 ป.4/3','must_know'),
('P4','P4-K2_2-01',401,'ค 2.2 ป.4/1','must_know'),
('P4','P4-K2_2-02',402,'ค 2.2 ป.4/2','should_know'),
('P4','P4-K3_1-01',401,'ค 3.1 ป.4/1','must_know'),
('P5','P5-K1_1-01',501,'ค 1.1 ป.5/1','must_know'),
('P5','P5-K1_1-02',502,'ค 1.1 ป.5/2','must_know'),
('P5','P5-K1_1-03',503,'ค 1.1 ป.5/3','must_know'),
('P5','P5-K1_1-04',504,'ค 1.1 ป.5/4','must_know'),
('P5','P5-K1_1-05',505,'ค 1.1 ป.5/5','should_know'),
('P5','P5-K1_1-06',506,'ค 1.1 ป.5/6','must_know'),
('P5','P5-K1_1-07',507,'ค 1.1 ป.5/7','must_know'),
('P5','P5-K1_1-08',508,'ค 1.1 ป.5/8','should_know'),
('P5','P5-K1_1-09',509,'ค 1.1 ป.5/9','must_know'),
('P5','P5-K2_1-01',501,'ค 2.1 ป.5/1','should_know'),
('P5','P5-K2_1-02',502,'ค 2.1 ป.5/2','should_know'),
('P5','P5-K2_1-03',503,'ค 2.1 ป.5/3','must_know'),
('P5','P5-K2_1-04',504,'ค 2.1 ป.5/4','must_know'),
('P5','P5-K2_2-01',501,'ค 2.2 ป.5/1','should_know'),
('P5','P5-K2_2-02',502,'ค 2.2 ป.5/2','must_know'),
('P5','P5-K2_2-03',503,'ค 2.2 ป.5/3','should_know'),
('P5','P5-K2_2-04',504,'ค 2.2 ป.5/4','should_know'),
('P5','P5-K3_1-01',501,'ค 3.1 ป.5/1','must_know'),
('P5','P5-K3_1-02',502,'ค 3.1 ป.5/2','should_know'),
('P6','P6-K1_1-01',601,'ค 1.1 ป.6/1','must_know'),
('P6','P6-K1_1-02',602,'ค 1.1 ป.6/2','must_know'),
('P6','P6-K1_1-03',603,'ค 1.1 ป.6/3','must_know'),
('P6','P6-K1_1-04',604,'ค 1.1 ป.6/4','must_know'),
('P6','P6-K1_1-05',605,'ค 1.1 ป.6/5','must_know'),
('P6','P6-K1_1-06',606,'ค 1.1 ป.6/6','should_know'),
('P6','P6-K1_1-07',607,'ค 1.1 ป.6/7','should_know'),
('P6','P6-K1_1-08',608,'ค 1.1 ป.6/8','should_know'),
('P6','P6-K1_1-09',609,'ค 1.1 ป.6/9','must_know'),
('P6','P6-K1_1-10',610,'ค 1.1 ป.6/10','should_know'),
('P6','P6-K1_1-11',611,'ค 1.1 ป.6/11','must_know'),
('P6','P6-K1_1-12',612,'ค 1.1 ป.6/12','must_know'),
('P6','P6-K1_2-01',601,'ค 1.2 ป.6/1','must_know'),
('P6','P6-K2_1-01',601,'ค 2.1 ป.6/1','must_know'),
('P6','P6-K2_1-02',602,'ค 2.1 ป.6/2','must_know'),
('P6','P6-K2_1-03',603,'ค 2.1 ป.6/3','must_know'),
('P6','P6-K2_2-01',601,'ค 2.2 ป.6/1','must_know'),
('P6','P6-K2_2-02',602,'ค 2.2 ป.6/2','should_know'),
('P6','P6-K2_2-03',603,'ค 2.2 ป.6/3','must_know'),
('P6','P6-K2_2-04',604,'ค 2.2 ป.6/4','should_know'),
('P6','P6-K3_1-01',601,'ค 3.1 ป.6/1','must_know')
) as alignment(grade_code,objective_code,sequence_no,indicator_code,classification)
 on alignment.objective_code=objective.code
join public.learning_curricula curriculum on curriculum.code in ('TH-BASIC-CORE-2008-2017','TH-MATH-P1-P6')
join public.learning_grade_levels grade on grade.curriculum_id=curriculum.id and grade.code=alignment.grade_code
on conflict (objective_id,curriculum_id,grade_level_id) do update
set sequence_no=excluded.sequence_no,required=excluded.required,notes=excluded.notes,
 indicator_classification=excluded.indicator_classification,pathway_classification=null,updated_at=now();

commit;
