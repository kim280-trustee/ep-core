-- Correct three source-code transcription typos in P4 alignment notes.
update public.learning_objective_alignments a
set notes=replace(replace(replace(a.notes,
 'ส ๕.૧ ป.૫/૨','ส ๕.๑ ป.๕/๒'),
 'ส ૫.૧ ป.૫/૩','ส ๕.๑ ป.๕/๓'),
 'ส ૫.૨ ป.૫/૧','ส ๕.๒ ป.๕/๑'),
 updated_at=now()
from public.learning_objectives o
where o.id=a.objective_id
  and o.code in ('SO5.1-P4-02','SO5.1-P4-03','SO5.2-P4-01');