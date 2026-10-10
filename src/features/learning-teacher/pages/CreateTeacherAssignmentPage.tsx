import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle2, ClipboardCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "../services/learning-teacher.service";

export default function CreateTeacherAssignmentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contentId = searchParams.get("contentId");
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
  const organizationId = selectedClass?.membership.organizationId;
  const contentQuery = useQuery({
    queryKey: ["learning", "assignment-content", organizationId],
    queryFn: () => learningContentService.listContent(organizationId!),
    enabled: Boolean(organizationId && contentId),
  });
  const selectedContent = contentQuery.data?.find((item) => item.id === contentId);
  const contentReady = Boolean(selectedContent && selectedContent.status === "published");

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user || !classGroupId || !title.trim() || !code.trim()) {
        throw new Error("Choose a class and enter an assignment title and code.");
      }
      const selected = classesQuery.data?.find((item) => item.classGroup.id === classGroupId);
      if (!selected) throw new Error("Select a class.");
      if (contentId && !contentReady) {
        throw new Error("The selected learning content must be found in this organization and published before it can be reused.");
      }

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
      if (selectedContent) {
        await learningAssignmentsService.addItem({
          organizationId: selected.membership.organizationId,
          assignmentId: assignment.id,
          itemType: "content",
          contentItemId: selectedContent.id,
          sequenceNo: 1,
          required: true,
        });
      }
      return assignment;
    },
    onSuccess: (assignment) => {
      void queryClient.invalidateQueries({ queryKey: ["learning"] });
      navigate("/teacher/authoring?assignmentId=" + assignment.id);
    },
    onError: (mutationError: Error) => setError(mutationError.message),
  });

  if (!user) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to continue.</div>;
  }
  if (classesQuery.isPending) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  }
  if (classesQuery.isError) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">Your teacher classes could not be loaded. Refresh the page and try again.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/teacher" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft size={16} />
          Back to teacher workspace
        </Link>
      </div>

      <header>
        <p className="text-sm font-semibold text-slate-500">TEACHER WORKSPACE · ASSIGNMENTS</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Create a class assignment</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          First choose the class and enter the assignment details. Next, you’ll review the learning content, add an assessment if needed, and publish it for students.
        </p>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-white">1</div>
          <div className="flex-1">
            <p className="font-semibold">Assignment details</p>
            <p className="text-slate-500">You are here</p>
          </div>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white font-bold text-slate-500">2</div>
          <div className="flex-1">
            <p className="font-semibold text-slate-700">Review & publish</p>
            <p className="text-slate-500">Next in Authoring</p>
          </div>
        </div>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          createMutation.mutate();
        }}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">1. Choose the class</h2>
            <p className="mt-1 text-sm text-slate-600">All students in this class will receive the assignment when you publish it.</p>
          </div>
          <Field label="Class" hint="Required">
            <select
              required
              value={classGroupId}
              onChange={(event) => {
                setClassGroupId(event.target.value);
                setClassSubjectId("");
              }}
              className="input"
            >
              <option value="">Choose a class…</option>
              {classesQuery.data.map((item) => (
                <option key={item.classGroup.id} value={item.classGroup.id}>{item.classGroup.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Subject" hint="Optional">
            <select
              value={classSubjectId}
              onChange={(event) => setClassSubjectId(event.target.value)}
              className="input"
              disabled={!selectedClass}
            >
              <option value="">No subject selected</option>
              {selectedClass?.subjects.map((item) => (
                <option key={item.id} value={item.id}>{item.subject.name}</option>
              ))}
            </select>
          </Field>
        </section>

        <div className="border-t border-slate-200" />

        <section className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">2. Add assignment details</h2>
            <p className="mt-1 text-sm text-slate-600">Use a clear title and code so you and your students can identify this assignment.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Assignment code" hint="Required">
              <input required value={code} onChange={(event) => setCode(event.target.value)} placeholder="E.g. ENG-M1-001" className="input" />
            </Field>
            <Field label="Due date" hint="Optional">
              <input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="input" />
            </Field>
          </div>
          <Field label="Assignment title" hint="Required">
            <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="E.g. Introducing Yourself" className="input" />
          </Field>
          <Field label="Instructions for students" hint="Optional">
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Explain what students should do and how they should complete the work." className="input" />
          </Field>
        </section>

        {contentId && (
          <>
            <div className="border-t border-slate-200" />
            <section className="space-y-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Learning content selected</h2>
                <p className="mt-1 text-sm text-slate-600">This lesson will be attached to the draft automatically. You can review it in the next step.</p>
              </div>
              {!selectedClass && (
                <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                  <BookOpen size={20} className="mt-0.5 shrink-0" />
                  <p>Choose a class above to verify that the selected lesson is available to your organization.</p>
                </div>
              )}
              {selectedClass && contentQuery.isPending && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Checking the selected lesson…</div>
              )}
              {selectedClass && contentQuery.isError && (
                <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <AlertCircle size={20} className="mt-0.5 shrink-0" />
                  <p>The selected lesson could not be checked. Refresh the page before continuing.</p>
                </div>
              )}
              {selectedClass && !contentQuery.isPending && !contentQuery.isError && selectedContent && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <BookOpen size={21} className="mt-0.5 shrink-0 text-emerald-700" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{selectedContent.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{selectedContent.code} · {selectedContent.contentType}</p>
                    <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-800">
                      <CheckCircle2 size={16} />
                      {contentReady ? "Published · will be attached" : `Status: ${selectedContent.status} · must be published first`}
                    </p>
                    <Link to={`/teacher/content/${selectedContent.id}`} className="mt-2 block text-sm font-semibold text-slate-700 underline underline-offset-2">View lesson details</Link>
                  </div>
                </div>
              )}
              {selectedClass && !contentQuery.isPending && !contentQuery.isError && !selectedContent && (
                <div role="alert" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <AlertCircle size={20} className="mt-0.5 shrink-0" />
                  <p>The selected lesson was not found in this organization. Go back to the Content Library and choose a lesson available to this class.</p>
                </div>
              )}
            </section>
          </>
        )}

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <div className="border-t border-slate-200 pt-5">
          <button
            type="submit"
            disabled={createMutation.isPending || Boolean(contentId && !contentReady)}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 sm:w-auto"
          >
            {createMutation.isPending ? "Creating draft…" : <><CheckCircle2 size={18} />Create draft & continue</>}
          </button>
          <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
            <ClipboardCheck size={17} className="mt-0.5 shrink-0" />
            This saves a draft only. On the next page, review attached items and add a published assessment before publishing if your lesson requires one.
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
        {label}
        {hint && <span className="text-xs font-normal text-slate-500">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
