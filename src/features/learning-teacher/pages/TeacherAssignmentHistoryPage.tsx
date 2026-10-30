import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Archive, ArrowLeft, RotateCcw, UserPlus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningTeacherService } from "../services/learning-teacher.service";

export default function TeacherAssignmentHistoryPage() {
  const { user } = useAuth();
  const { classGroupId = "" } = useParams();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [studentByAssignment, setStudentByAssignment] = useState<Record<string,string>>({});
  const classesQuery = useQuery({
    queryKey: ["learning","teacher-classes",user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });
  const classOverviewQuery = useQuery({
    queryKey: ["learning","teacher-class",user?.id,classGroupId],
    queryFn: () => learningTeacherService.getClassOverview(user!.id,classGroupId),
    enabled: Boolean(user?.id && classGroupId),
  });
  const historyQuery = useQuery({
    queryKey: ["learning","assignment-history",classGroupId],
    queryFn: () => learningAssignmentsService.listAssignmentHistoryForClass(classGroupId),
    enabled: Boolean(classGroupId),
  });
  const lifecycleQuery = useQuery({queryKey:["learning","assignment-lifecycle-events",classGroupId,historyQuery.data?.map(x=>x.id).join(",")],queryFn:()=>learningAssignmentsService.listLifecycleEventsForAssignments((historyQuery.data??[]).map(x=>x.id)),enabled:Boolean(historyQuery.data?.length)});
  const statusMutation = useMutation({
    mutationFn: ({ id,status }: { id:string; status:"published"|"closed" }) => status==="published"
      ? learningAssignmentsService.reopenAssignment(id)
      : learningAssignmentsService.closeAssignment(id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey:["learning","assignment-history",classGroupId] }); void queryClient.invalidateQueries({ queryKey:["learning"] }); },
  });
  const reassignMutation = useMutation({
    mutationFn: ({ id,studentUserId }: { id:string; studentUserId:string }) => learningAssignmentsService.reassignToStudent(id,studentUserId,null),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey:["learning","assignment-history",classGroupId] }); void queryClient.invalidateQueries({ queryKey:["learning"] }); },
  });

  if (!user) return <div className="rounded-2xl border bg-white p-6">Sign in to continue.</div>;
  if (classesQuery.isPending || classOverviewQuery.isPending || historyQuery.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classesQuery.isError || classOverviewQuery.isError || historyQuery.isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">Assignment history could not be loaded.</div>;

  const classInfo = classesQuery.data.find((item) => item.classGroup.id === classGroupId);
  if (!classInfo) return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">You are not assigned to this class.</div>;
  const students = classOverviewQuery.data.students;
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const assignments = historyQuery.data.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesSearch = !normalizedSearch || [item.title, item.code, item.description ?? ""].some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
    return matchesStatus && matchesSearch;
  });
  const events=lifecycleQuery.data??[];
  const eventLabels=new Map([["reassigned","Reassigned"],["reopened","Reopened"],["closed","Closed"]]);
  function exportCsv() {
    const rows = [["code", "title", "status", "due_at", "lifecycle_type"], ...assignments.map((item) => [item.code, item.title, item.status, item.dueAt ?? "", item.lifecycleType])];
    const csvCell = (value: string) => {
      const firstNonWhitespace = value.trimStart()[0];
      const safe = firstNonWhitespace && "=+-@".includes(firstNonWhitespace) ? "'" + value : value;
      return '"' + safe.replaceAll('"', '""') + '"' ;
    };
    const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "assignment-history-" + classGroupId + ".csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="space-y-6">
    <div><Link to={"/teacher/classes/"+classGroupId} className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={16}/>Back to class</Link></div>
    <section className="rounded-2xl bg-slate-900 p-6 text-white">
      <p className="text-sm text-slate-300">{classInfo.classGroup.code}</p>
      <h1 className="mt-1 text-2xl font-bold">Assignment History</h1>
      <p className="mt-2 text-sm text-slate-300">Review published and past assignments, reopen closed work, or give an existing assignment to a specific student without deleting historical results.</p>
    </section>
    <div className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-[1fr_auto_auto]">
      <label className="text-sm font-medium text-slate-700">Search assignments<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Title, code or instructions" className="mt-1 block w-full rounded-xl border px-3 py-2 font-normal"/></label>
      <label className="text-sm font-medium text-slate-700">Status<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="mt-1 block w-full rounded-xl border px-3 py-2 font-normal"><option value="all">All statuses</option><option value="published">Published</option><option value="closed">Closed</option><option value="archived">Archived</option><option value="draft">Draft</option></select></label>
      <div className="flex flex-col justify-end gap-2"><button type="button" onClick={exportCsv} disabled={!assignments.length} className="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-40">Export filtered CSV</button>{(search||statusFilter!=="all")&&<button type="button" onClick={()=>{setSearch("");setStatusFilter("all");}} className="rounded-xl border px-3 py-2 text-sm">Clear filters</button>}</div>
      <p className="text-xs text-slate-500 sm:col-span-3" aria-live="polite">Showing {assignments.length} of {historyQuery.data.length} assignments.</p>
    </div>
    <section className="overflow-hidden rounded-2xl border bg-white">
      {assignments.length ? <div className="divide-y">{assignments.map((assignment) => <article key={assignment.id} className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{assignment.title}</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize">{assignment.status}</span>{assignment.lifecycleType!=="original"&&<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{assignment.lifecycleType}</span>}</div><p className="mt-1 text-sm text-slate-500">{assignment.code}{assignment.dueAt ? " · Due "+new Date(assignment.dueAt).toLocaleString() : " · No due date"}</p></div>
          <div className="flex flex-wrap gap-2">
            {assignment.status==="closed" && <button type="button" onClick={()=>statusMutation.mutate({id:assignment.id,status:"published"})} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"><RotateCcw size={15}/>Reopen</button>}
            {assignment.status==="published" && <button type="button" onClick={()=>statusMutation.mutate({id:assignment.id,status:"closed"})} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"><Archive size={15}/>Close</button>}
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lifecycle events</p>{events.filter(e=>e.assignmentId===assignment.id).length?<div className="mt-2 space-y-2">{events.filter(e=>e.assignmentId===assignment.id).slice(0,5).map(e=><div key={e.id} className="flex flex-wrap items-center gap-2 text-xs text-slate-600"><span className="rounded-full bg-white px-2 py-1 font-semibold">{eventLabels.get(e.action)??e.action}</span><span>{new Date(e.createdAt).toLocaleString()}</span>{e.targetStudentUserId&&<span>· student {students.find(x=>x.membership.userId===e.targetStudentUserId)?.name??e.targetStudentUserId}</span>}</div>)}</div>:<p className="mt-1 text-xs text-slate-400">No lifecycle events recorded yet.</p>}</div><div className="mt-4 flex flex-col gap-2 sm:flex-row"><Link to={"/teacher/assignments/"+assignment.id+"/responses"} className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Review responses</Link>
          <select value={studentByAssignment[assignment.id]??""} onChange={e=>setStudentByAssignment(v=>({...v,[assignment.id]:e.target.value}))} className="min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm"><option value="">Select student to give again</option>{students.map(s=><option key={s.membership.id} value={s.membership.userId}>{s.name}</option>)}</select>
          <button type="button" disabled={!studentByAssignment[assignment.id]||reassignMutation.isPending} onClick={()=>{const studentUserId=studentByAssignment[assignment.id];if(studentUserId)reassignMutation.mutate({id:assignment.id,studentUserId});}} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"><UserPlus size={15}/>Give again</button>
        </div>
      </article>)}</div> : <div className="p-10 text-center text-sm text-slate-500">No assignment history for this class.</div>}
    </section>
  </div>;
}
