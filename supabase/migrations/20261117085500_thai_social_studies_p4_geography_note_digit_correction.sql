-- Correct the remaining non-Thai digit in the P4 geography alignment source note.
update public.learning_objective_alignments a
set notes=replace(a.notes,'ส ๕.๒ ป.૫/૧','ส ๕.๒ ป.๕/๑'),updated_at=now()
from public.learning_objectives o
where o.id=a.objective_id and o.code='SO5.2-P4-01';