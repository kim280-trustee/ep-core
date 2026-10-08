import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calculator, Download, Filter, Lock, RefreshCw, Save, Settings, Trash2, Unlock, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningGradebookService } from "../services/learning-gradebook.service";
import { GradebookBulkImportPanel } from "../components/GradebookBulkImportPanel";
import { learningTeacherService } from "@/features/learning-teacher";
import type { LearningGradebookEntry, LearningGradebookEntryStatus } from "../types/learning-gradebook.types";

const statuses: LearningGradebookEntryStatus[]=["graded","missing","absent","excused","pending"];

export default function TeacherGradebookPage() {
  const { user }=useAuth(); const { classGroupId="" }=useParams(); const qc=useQueryClient();
  const [subjectId,setSubjectId]=useState(""); const [termId,setTermId]=useState(""); const [studentId,setStudentId]=useState("");
  const [title,setTitle]=useState(""); const [score,setScore]=useState(""); const [maxScore,setMaxScore]=useState("100"); const [categoryId,setCategoryId]=useState("");
  const [search,setSearch]=useState(""); const [statusFilter,setStatusFilter]=useState("all"); const [categoryFilter,setCategoryFilter]=useState("all");
  const [editing,setEditing]=useState<LearningGradebookEntry|null>(null);

  const classQuery=useQuery({queryKey:["learning","teacher-gradebook-class",user?.id,classGroupId],queryFn:()=>learningTeacherService.getClassOverview(user!.id,classGroupId),enabled:Boolean(user?.id&&classGroupId)});
  const organizationId=classQuery.data?.classInfo.membership.organizationId??""; const subjects=classQuery.data?.classInfo.subjects??[]; const selectedSubjectId=subjectId||subjects[0]?.id||"";
  const termsQuery=useQuery({queryKey:["learning","gradebook-terms",organizationId],queryFn:()=>learningGradebookService.listTerms(organizationId),enabled:Boolean(organizationId)});
  const selectedTermId=termId||termsQuery.data?.[0]?.id||"";
  const entriesQuery=useQuery({queryKey:["learning","teacher-gradebook-entries",selectedTermId,selectedSubjectId],queryFn:()=>learningGradebookService.listEntries({termId:selectedTermId,classSubjectId:selectedSubjectId}),enabled:Boolean(selectedTermId&&selectedSubjectId)});
  const categoriesQuery=useQuery({queryKey:["learning","gradebook-categories",organizationId],queryFn:()=>learningGradebookService.listCategories(organizationId),enabled:Boolean(organizationId)});
  const termGradesQuery=useQuery({queryKey:["learning","teacher-term-grades",selectedTermId,selectedSubjectId],queryFn:()=>learningGradebookService.listTermGrades({termId:selectedTermId,classSubjectId:selectedSubjectId}),enabled:Boolean(selectedTermId&&selectedSubjectId)});
  const students=classQuery.data?.students??[]; const entries=entriesQuery.data??[]; const termGrades=termGradesQuery.data??[];

  const assessmentColumns=useMemo(()=>{const m=new Map<string,{id:string;title:string}>();for(const e of entries)if(e.recordType==="assessment"&&e.assessmentId&&!m.has(e.assessmentId))m.set(e.assessmentId,{id:e.assessmentId,title:e.title});return[...m.values()]},[entries]);
  const entryByStudent=useMemo(()=>{const m=new Map<string,LearningGradebookEntry[]>();for(const e of entries){const a=m.get(e.studentUserId)??[];a.push(e);m.set(e.studentUserId,a)}return m},[entries]);
  const gradeByStudent=useMemo(()=>new Map(termGrades.map(g=>[g.studentUserId,g])),[termGrades]);
  const auditQuery=useQuery({queryKey:["learning","gradebook-audit",selectedTermId,selectedSubjectId],queryFn:()=>learningGradebookService.listAudit({termId:selectedTermId,classSubjectId:selectedSubjectId}),enabled:Boolean(selectedTermId&&selectedSubjectId)});
  const filteredStudents=students.filter(s=>{const okName=!search||s.name.toLowerCase().includes(search.toLowerCase())||s.email.toLowerCase().includes(search.toLowerCase());if(!okName)return false;const es=entryByStudent.get(s.membership.userId)??[];return statusFilter==="all"||es.some(e=>e.status===statusFilter)||(statusFilter==="ungraded"&&!gradeByStudent.has(s.membership.userId))});
  const included=entries.filter(e=>e.includedInGrade&&e.status==="graded"); const classAvg=included.length?included.reduce((a,e)=>a+e.percentage,0)/included.length:0;
  const pass=included.filter(e=>e.percentage>=50).length; const low=included.filter(e=>e.percentage<50).length;
  const refresh=()=>{void entriesQuery.refetch();void termGradesQuery.refetch();void categoriesQuery.refetch()};

  const addScore=useMutation({mutationFn:()=>{const s=Number(score),m=Number(maxScore);if(!studentId)throw new Error("Select a student.");if(!title.trim())throw new Error("Score title is required.");if(!Number.isFinite(s)||!Number.isFinite(m))throw new Error("Enter valid score values.");return learningGradebookService.createManualEntry({termId:selectedTermId,classSubjectId:selectedSubjectId,studentUserId:studentId,title:title.trim(),score:s,maxScore:m,categoryId:categoryId||null})},onSuccess:()=>{setTitle("");setScore("");setStudentId("");void qc.invalidateQueries({queryKey:["learning","teacher-gradebook-entries"]});void qc.invalidateQueries({queryKey:["learning","teacher-term-grades"]})}});
  const update=useMutation({mutationFn:(v:{entry:LearningGradebookEntry;status:string;comment:string;late:boolean;reason:string})=>learningGradebookService.updateManualEntry({entryId:v.entry.id,title:v.entry.title,score:v.entry.score,maxScore:v.entry.maxScore,categoryId:v.entry.categoryId,status:v.status,comment:v.comment,late:v.late,reason:v.reason}),onSuccess:()=>{setEditing(null);void qc.invalidateQueries({queryKey:["learning","teacher-gradebook-entries"]});void qc.invalidateQueries({queryKey:["learning","teacher-term-grades"]})}});
  const remove=useMutation({mutationFn:(v:{id:string;reason:string})=>learningGradebookService.deleteManualEntry(v.id,v.reason),onSuccess:()=>{void qc.invalidateQueries({queryKey:["learning","teacher-gradebook-entries"]});void qc.invalidateQueries({queryKey:["learning","teacher-term-grades"]})}}); const toggleIncluded=useMutation({mutationFn:(v:{id:string;included:boolean})=>learningGradebookService.setEntryIncludedInGrade(v.id,v.included,user!.id),onSuccess:()=>{void qc.invalidateQueries({queryKey:["learning","teacher-gradebook-entries"]});void qc.invalidateQueries({queryKey:["learning","teacher-term-grades"]})}});
  const calculate=useMutation({mutationFn:(id:string)=>learningGradebookService.calculateTermGrade({termId:selectedTermId,classSubjectId:selectedSubjectId,studentUserId:id}),onSuccess:()=>void qc.invalidateQueries({queryKey:["learning","teacher-term-grades"]})});
  const finalize=useMutation({mutationFn:(id:string)=>learningGradebookService.finalizeTermGrade({termId:selectedTermId,classSubjectId:selectedSubjectId,studentUserId:id}),onSuccess:()=>void qc.invalidateQueries({queryKey:["learning","teacher-term-grades"]})});
  const override=useMutation({mutationFn:(v:{id:string;score:number;grade:string;reason:string})=>learningGradebookService.overrideTermGrade({termId:selectedTermId,classSubjectId:selectedSubjectId,studentUserId:v.id,score:v.score,grade:v.grade,reason:v.reason}),onSuccess:()=>void qc.invalidateQueries({queryKey:["learning","teacher-term-grades"]})});
  const reopen=useMutation({mutationFn:(id:string)=>{const reason=window.prompt("Reason for reopening this finalized grade?");if(!reason?.trim())throw new Error("A reason is required.");return learningGradebookService.reopenTermGrade({termId:selectedTermId,classSubjectId:selectedSubjectId,studentUserId:id,reason})},onSuccess:()=>void qc.invalidateQueries({queryKey:["learning","teacher-term-grades"]})});

  const actionError=[addScore,update,remove,calculate,finalize,override,reopen].find(m=>m.isError)?.error as Error|undefined;

  function exportCsv() {
    const rows = [
      ["student_id","student_name","email","title","category","status","score","max_score","percentage","included","late","comment"],
      ...entries.map((e) => {
        const s = students.find((x) => x.membership.userId === e.studentUserId);
        const category = categoriesQuery.data?.find((x) => x.id === e.categoryId);
        return [
          e.studentUserId,
          s?.name ?? "",
          s?.email ?? "",
          e.title,
          category?.name ?? "",
          e.status,
          e.score,
          e.maxScore,
          e.percentage.toFixed(2),
          e.includedInGrade,
          e.late,
          e.comment ?? "",
        ];
      }),
    ];
    const csv =
      "\uFEFF" +
      rows
        .map((row) =>
          row.map((value) => '"' + String(value).replaceAll('"', '""') + '"').join(","),
        )
        .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "gradebook-" + selectedTermId + ".csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if(!user)return <EmptyState text="Sign in to access the Gradebook."/>; if(classQuery.isPending||termsQuery.isPending)return <div className="h-64 animate-pulse rounded-2xl bg-slate-200"/>; if(classQuery.isError||termsQuery.isError)return <ErrorState onRetry={refresh}/>;
  const selectedSubject=subjects.find(x=>x.id===selectedSubjectId); const selectedTerm=termsQuery.data?.find(x=>x.id===selectedTermId);

  return <div className="space-y-6">
    <div className="flex flex-wrap justify-between gap-3"><Link to={"/teacher/classes/"+classGroupId} className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={16}/>Back to class</Link><div className="flex gap-3"><Link to={"/teacher/classes/"+classGroupId+"/gradebook/reports"} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">Reports</Link><Link to={"/teacher/classes/"+classGroupId+"/gradebook/settings"} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><Settings size={16}/>Gradebook settings</Link><Link to="/teacher" className="text-sm font-medium text-slate-700">Teacher Dashboard</Link></div></div>
    <section className="rounded-2xl bg-slate-900 p-6 text-white"><p className="text-sm text-slate-300">Gradebook</p><h1 className="mt-1 text-2xl font-bold">{classQuery.data?.classInfo.classGroup.name}</h1><p className="mt-2 text-sm text-slate-300">Scores, academic status, term calculations, corrections, and finalized records.</p></section>
    {actionError&&<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><b>Gradebook action failed.</b> {actionError.message}</div>}
    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"><label className="text-sm font-medium">Subject<select value={selectedSubjectId} onChange={e=>setSubjectId(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5">{subjects.map(x=><option key={x.id} value={x.id}>{x.subject.name}</option>)}</select></label><label className="text-sm font-medium">Term<select value={selectedTermId} onChange={e=>setTermId(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5">{(termsQuery.data??[]).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label></section>
    <section className="grid gap-3 md:grid-cols-4"><Stat label="Included records" value={String(included.length)}/><Stat label="Record average" value={classAvg.toFixed(1)+"%"}/><Stat label="Passing records" value={String(pass)}/><Stat label="Below 50%" value={String(low)}/></section>
    <section className="rounded-2xl border bg-white p-5"><div className="flex items-center gap-2"><Save size={18}/><h2 className="font-semibold">Add manual score</h2></div><div className="mt-4 grid gap-3 md:grid-cols-5"><select value={studentId} onChange={e=>setStudentId(e.target.value)} className="rounded-xl border px-3 py-2.5 text-sm"><option value="">Student</option>{students.map(s=><option key={s.membership.userId} value={s.membership.userId}>{s.name}</option>)}</select><input value={title} onChange={e=>setTitle(e.target.value)} className="rounded-xl border px-3 py-2.5 text-sm" placeholder="Score title"/><input value={score} onChange={e=>setScore(e.target.value)} type="number" min="0" className="rounded-xl border px-3 py-2.5 text-sm" placeholder="Score"/><input value={maxScore} onChange={e=>setMaxScore(e.target.value)} type="number" min="1" className="rounded-xl border px-3 py-2.5 text-sm" placeholder="Max"/><select value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="rounded-xl border px-3 py-2.5 text-sm"><option value="">No category</option>{(categoriesQuery.data??[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div><button type="button" disabled={addScore.isPending} onClick={()=>addScore.mutate()} className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"><Save size={16} className="mr-2 inline"/>{addScore.isPending?"Saving...":"Save score"}</button>{addScore.isError&&<p className="mt-3 text-sm text-red-700">{(addScore.error as Error).message}</p>}</section>
    {selectedTermId&&selectedSubjectId&&<GradebookBulkImportPanel termId={selectedTermId} classSubjectId={selectedSubjectId} students={students} categories={(categoriesQuery.data??[]).map(c=>({id:c.id,name:c.name}))} onImported={()=>{void qc.invalidateQueries({queryKey:["learning","teacher-gradebook-entries"]});void qc.invalidateQueries({queryKey:["learning","teacher-term-grades"]})}}/>}
    <section className="rounded-2xl border bg-white"><div className="flex flex-wrap items-center gap-3 border-b p-5"><div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border px-3"><Filter size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students" className="w-full border-0 py-2 outline-none"/></div><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="rounded-xl border px-3 py-2.5 text-sm"><option value="all">All statuses</option><option value="ungraded">No term grade</option>{statuses.map(s=><option key={s} value={s}>{s}</option>)}</select><select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="rounded-xl border px-3 py-2.5 text-sm"><option value="all">All categories</option>{(categoriesQuery.data??[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold"><Download size={16}/>Export CSV</button>{entriesQuery.isFetching&&<RefreshCw size={17} className="animate-spin text-slate-400"/>}</div>
      <div className="border-b bg-slate-50 px-5 py-3 text-xs text-slate-500">Only <b>graded</b> and included records contribute to calculations. Missing, absent, excused, and pending records remain visible without silently becoming zero.</div>
      <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="sticky left-0 bg-slate-50 px-5 py-3">Student</th>{assessmentColumns.map(c=><th key={c.id} className="px-5 py-3">{c.title}</th>)}<th className="px-5 py-3">Manual / Other</th><th className="px-5 py-3">Term grade</th><th className="px-5 py-3">Action</th></tr></thead><tbody className="divide-y">{filteredStudents.map(student=>{const es=(entryByStudent.get(student.membership.userId)??[]).filter(e=>categoryFilter==="all"||e.categoryId===categoryFilter);const grade=gradeByStudent.get(student.membership.userId);const manual=es.filter(e=>e.recordType!=="assessment");return <tr key={student.membership.id}><td className="sticky left-0 bg-white px-5 py-4"><b>{student.name}</b><p className="text-xs text-slate-500">{student.email}</p></td>{assessmentColumns.map(col=>{const e=es.find(x=>x.assessmentId===col.id&&x.includedInGrade)??es.find(x=>x.assessmentId===col.id);return <td key={col.id} className="px-5 py-4">{e?<span className={e.status!=="graded"?"text-amber-700":""}>{e.score}/{e.maxScore} <span className="text-xs text-slate-500">{e.status}</span></span>:<span className="text-slate-300">—</span>}</td>})}<td className="px-5 py-4"><div className="space-y-2">{manual.length?manual.map(e=><div key={e.id} className="flex min-w-[220px] items-center justify-between gap-2 text-xs"><span>{e.title}: <b>{e.score}/{e.maxScore}</b> • {e.status}{e.late?" • late":""}</span>{e.sourceType==="manual"&&<span className="flex items-center gap-1"><button type="button" onClick={()=>setEditing(e)} className="rounded border px-2 py-1 font-semibold">Edit</button><button type="button" onClick={()=>toggleIncluded.mutate({id:e.id,included:!e.includedInGrade})} className="rounded border px-2 py-1 font-semibold" title={e.includedInGrade?"Exclude from grade":"Include in grade"}>{e.includedInGrade?"Included":"Excluded"}</button><button type="button" onClick={()=>{const reason=window.prompt("Reason for deleting this manual score?");if(reason?.trim())remove.mutate({id:e.id,reason})}} className="rounded border px-2 py-1 text-red-700"><Trash2 size={12}/></button></span>}</div>):<span className="text-slate-300">—</span>}</div></td><td className="whitespace-nowrap px-5 py-4">{grade?<><b>{grade.score.toFixed(2)}%</b>{grade.letterGrade&&<span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs">Grade {grade.letterGrade}</span>}<span className="ml-2 text-xs text-slate-500">{grade.status}</span></>:<span className="text-slate-300">Not calculated</span>}</td><td className="px-5 py-4">
  <div className="flex flex-wrap gap-2">
    <Link
      to={"/teacher/classes/" + classGroupId + "/gradebook/" + student.membership.userId}
      className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-semibold"
    >
      <UserRound size={14} />
      Performance
    </Link>

    {grade?.status === "finalized" ? (
      <>
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Lock size={14} />
          Finalized
        </span>
        <button
          type="button"
          onClick={() => reopen.mutate(student.membership.userId)}
          className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-semibold"
        >
          <Unlock size={14} />
          Reopen
        </button>
      </>
    ) : (
      <>
        <button
          type="button"
          onClick={() => calculate.mutate(student.membership.userId)}
          className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-semibold"
        >
          <Calculator size={14} />
          Calculate
        </button>

        {grade && (
          <>
            <button
              type="button"
              onClick={() => {
                const raw = window.prompt(
                  "Override percentage (0-100):",
                  String(grade.score),
                );
                if (raw === null) return;

                const score = Number(raw);
                if (!Number.isFinite(score)) return;

                const label = window.prompt(
                  "Override grade/label:",
                  grade.letterGrade ?? "",
                );
                if (label === null) return;

                const reason = window.prompt("Reason for override:");
                if (reason?.trim()) {
                  override.mutate({
                    id: student.membership.userId,
                    score,
                    grade: label,
                    reason,
                  });
                }
              }}
              className="rounded-lg border px-2.5 py-2 text-xs font-semibold"
            >
              Override
            </button>

            <button
              type="button"
              onClick={() => finalize.mutate(student.membership.userId)}
              className="rounded-lg bg-slate-900 px-2.5 py-2 text-xs font-semibold text-white"
            >
              Finalize
            </button>
          </>
        )}
      </>
    )}
  </div>
</td></tr>})}</tbody></table></div></section>
    {editing&&<EditPanel entry={editing} onCancel={()=>setEditing(null)} onSave={(v)=>update.mutate(v)}/>}
    <section className="rounded-2xl border bg-white p-5"><h2 className="font-semibold">Recent grade changes</h2><p className="mt-1 text-sm text-slate-500">Corrections, deletions, overrides, and term-grade reopenings are recorded here.</p><div className="mt-4 space-y-2">{(auditQuery.data??[]).slice(0,10).map((a:any)=><div key={a.id} className="rounded-xl bg-slate-50 p-3 text-xs"><b>{a.action}</b><span className="ml-2 text-slate-500">{new Date(a.changed_at).toLocaleString()}</span>{a.reason&&<p className="mt-1 text-slate-600">Reason: {a.reason}</p>}</div>)}{!(auditQuery.data??[]).length&&<p className="text-sm text-slate-400">No changes recorded for this selection.</p>}</div></section>    <p className="text-xs text-slate-400">{selectedSubject?.subject.name} • {selectedTerm?.name}. Finalized grades are protected; reopening and corrections require an audit reason.</p>
  </div>
}
function EditPanel({entry,onCancel,onSave}:{entry:LearningGradebookEntry;onCancel:()=>void;onSave:(v:{entry:LearningGradebookEntry;status:string;comment:string;late:boolean;reason:string})=>void}){const[status,setStatus]=useState(entry.status);const[comment,setComment]=useState(entry.comment??"");const[late,setLate]=useState(entry.late);return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-lg font-semibold">Edit score</h2><p className="mt-1 text-sm text-slate-500">{entry.title} • {entry.score}/{entry.maxScore}</p><label className="mt-4 block text-sm font-medium">Status<select value={status} onChange={e=>setStatus(e.target.value as LearningGradebookEntryStatus)} className="mt-2 w-full rounded-xl border px-3 py-2.5">{statuses.map(s=><option key={s}>{s}</option>)}</select></label><label className="mt-4 block text-sm font-medium">Comment<textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border px-3 py-2.5"/></label><label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={late} onChange={e=>setLate(e.target.checked)}/>Late work</label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-xl border px-4 py-2 text-sm">Cancel</button><button type="button" onClick={()=>{const reason=window.prompt("Reason for this correction?");if(reason?.trim())onSave({entry,status,comment,late,reason})}} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">Save correction</button></div></div></div>}
function Stat({label,value}:{label:string;value:string}){return <div className="rounded-2xl border bg-white p-4"><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>}
function EmptyState({text}:{text:string}){return <div className="rounded-2xl border bg-white p-8 text-sm text-slate-600">{text}</div>}
function ErrorState({onRetry}:{onRetry:()=>void}){return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><b>The Gradebook could not be loaded.</b><button type="button" onClick={onRetry} className="ml-3 rounded bg-white px-3 py-2 text-sm">Try again</button></div>}






