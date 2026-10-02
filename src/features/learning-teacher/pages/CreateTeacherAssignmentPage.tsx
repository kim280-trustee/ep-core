import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningTeacherService } from "../services/learning-teacher.service";

export default function CreateTeacherAssignmentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [classGroupId, setClassGroupId] = useState("");
  const [classSubjectId, setClassSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const classesQuery = useQuery({
    queryKey: ["learning", "teacher-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });

  const selectedClass = classesQuery.data?.find((item) => item.classGroup.id === classGroupId);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user || !classGroupId || !title.trim() || !code.trim()) throw new Error("Class, title, and code are required.");
      const selected = classesQuery.data?.find((item) => item.classGroup.id === classGroupId);
      if (!selected) throw new Error("Select a class.");
      const assignment = await learningAssignmentsService.createAssignment({
        tenantId: selected.membership.tenantId,
        organizationId: selected.membership.organizationId,
        classSubjectId: classSubjectId || null,
        code: code.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim() || null,
        status: "draft",
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        createdBy: user.id,
      });
      await learningAssignmentsService.addTarget({
        tenantId: selected.membership.tenantId,
        organizationId: selected.membership.organizationId,
        assignmentId: assignment.id,
        targetType: "class",
        classGroupId: selected.classGroup.id,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      });
      return assignment;
    },
    onSuccess: (assignment) => {
      void queryClient.invalidateQueries({ queryKey: ["learning"] });
      navigate("/teacher/authoring?assignmentId=" + assignment.id);
      return assignment;
    },
    onError: (mutationError: Error) => setError(mutationError.message),
  });

  if (!user) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to continue.</div>;
  if (classesQuery.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classesQuery.isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">Your teacher classes could not be loaded.</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div><Link to="/teacher" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={16} />Back to teacher workspace</Link></div>
      <section><p className="text-sm font-medium text-slate-500">Teacher Workspace</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Create assignment</h1><p className="mt-2 text-sm text-slate-500">Create a draft assignment for an entire class. You can attach learning content and assessments in Authoring before publishing it.</p></section>
      <form onSubmit={(event) => { event.preventDefault(); setError(null); createMutation.mutate(); }} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <Field label="Class"><select required value={classGroupId} onChange={(event) => { setClassGroupId(event.target.value); setClassSubjectId(""); }} className="input"><option value="">Select a class</option>{classesQuery.data.map((item) => <option key={item.classGroup.id} value={item.classGroup.id}>{item.classGroup.name}</option>)}</select></Field>
        <Field label="Subject"><select value={classSubjectId} onChange={(event) => setClassSubjectId(event.target.value)} className="input" disabled={!selectedClass}><option value="">Optional</option>{selectedClass?.subjects.map((item) => <option key={item.id} value={item.id}>{item.subject.name}</option>)}</select></Field>
        <div className="grid gap-5 sm:grid-cols-2"><Field label="Assignment code"><input required value={code} onChange={(event) => setCode(event.target.value)} placeholder="ENG-M1-001" className="input" /></Field><Field label="Due date"><input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="input" /></Field></div>
        <Field label="Title"><input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Present Simple Practice" className="input" /></Field>
        <Field label="Description"><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Instructions or a short description for students." className="input" /></Field>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <button disabled={createMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{createMutation.isPending ? "Creating draft..." : <><CheckCircle2 size={17} />Create draft</>}</button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}
