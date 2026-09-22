import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, CheckCircle2, Circle, Clock3, Play } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningActivityService } from "@/features/learning-activity";

function dateLabel(value: string | null) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function LearningAssignmentDetailPage() {
  const { user } = useAuth();
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const id = assignmentId ?? "";
  const query = useQuery({
    queryKey: ["learning", "assignment", id, user?.id],
    queryFn: () => learningAssignmentsService.getStudentAssignment(id, user!.id),
    enabled: Boolean(id && user?.id),
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("You must be signed in.");
      const result = await learningAssignmentsService.startForStudent(id, user.id);
      const session = await learningActivityService.startForStudent(user.id, "assignment", id);
      await learningActivityService.logEvent({
        tenantId: session.tenantId,
        organizationId: session.organizationId,
        studentUserId: user.id,
        sessionId: session.id,
        activityType: "assignment_started",
        assignmentId: id,
      });
      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learning", "assignment", id, user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "student-overview", user?.id] });
      navigate(`/learning/assignments/${id}`);
    },
  });

  if (!user) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to view this assignment.</div>;
  if (query.isPending) return <div className="space-y-4"><div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" /><div className="h-72 animate-pulse rounded-2xl bg-slate-200" /></div>;
  if (query.isError) return <div className="space-y-4"><Link to="/learning/assignments" className="inline-flex items-center gap-2 text-sm text-slate-600"><ArrowLeft size={16} /> Back to assignments</Link><div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><AlertCircle size={20} /><div><p className="font-semibold">This assignment could not be loaded.</p><p className="mt-1 text-sm">It may not be available to your account.</p></div></div></div>;

  const { assignment, items, progress } = query.data;
  const completed = progress?.status === "completed";
  return (
    <div className="space-y-6">
      <Link to="/learning/assignments" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft size={16} /> Back to assignments</Link>
      <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-sm text-slate-300">Assignment</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{assignment.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">{assignment.description || "Complete the learning activities in this assignment."}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">
          <span className="inline-flex items-center gap-2"><Clock3 size={16} />{assignment.dueAt ? `Due ${dateLabel(assignment.dueAt)}` : "No due date"}</span>
          <span>{items.length} {items.length === 1 ? "item" : "items"}</span>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Your progress</h2>
        <div className="mt-4 flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${completed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{completed ? "Completed" : progress?.status === "in_progress" ? "In progress" : "Not started"}</span>
          {progress?.lastActivityAt && <span className="text-sm text-slate-500">Last activity {dateLabel(progress.lastActivityAt)}</span>}
        </div>
        <button type="button" disabled={startMutation.isPending || completed} onClick={() => startMutation.mutate()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {completed ? <CheckCircle2 size={17} /> : <Play size={17} />} {completed ? "Completed" : startMutation.isPending ? "Starting..." : progress?.status === "in_progress" ? "Continue assignment" : "Start assignment"}
        </button>
        {startMutation.isError && <p className="mt-3 text-sm text-red-600">{startMutation.error instanceof Error ? startMutation.error.message : "Could not start assignment."}</p>}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Learning items</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {items.length ? items.map((item, index) => <div key={item.id} className="flex items-center gap-3 py-4 first:pt-0"><Circle size={15} className="shrink-0 text-slate-400" /><div className="min-w-0 flex-1"><p className="font-medium text-slate-800">Item {index + 1}: {item.itemType === "assessment" ? "Assessment" : "Learning content"}</p><p className="mt-1 text-xs text-slate-500">{item.required ? "Required" : "Optional"} activity</p></div>{item.itemType === "assessment" && item.assessmentId && <Link to={`/learning/assessments/${item.assessmentId}?assignmentId=${id}`} className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Open</Link>}</div>) : <p className="text-sm text-slate-500">This assignment has no learning items yet.</p>}
        </div>
      </section>
    </div>
  );
}

