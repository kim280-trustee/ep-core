import { useMemo } from "react";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/core/auth";
import { learningGradebookService } from "../services/learning-gradebook.service";
import { learningTeacherService } from "@/features/learning-teacher";

export default function TeacherGradebookReportsPage(){
 const{user}=useAuth();const{classGroupId=""}=useParams();
 const classQ=useQuery({queryKey:["learning","gradebook-report-class",user?.id,classGroupId],queryFn:()=>learningTeacherService.getClassOverview(user!.id,classGroupId),enabled:Boolean(user?.id&&classGroupId)});
 const org=classQ.data?.classInfo.membership.organizationId??"";const subjects=classQ.data?.classInfo.subjects??[];
 const termsQ=useQuery({queryKey:["learning","gradebook-report-terms",org],queryFn:()=>learningGradebookService.listTerms(org),enabled:Boolean(org)});
 const term=termsQ.data?.[0];const subject=subjects[0];
 const gradesQ=useQuery({queryKey:["learning","gradebook-report-grades",term?.id,subject?.id],queryFn:()=>learningGradebookService.listTermGrades({termId:term!.id,classSubjectId:subject!.id}),enabled:Boolean(term?.id&&subject?.id)});
 const grades=gradesQ.data??[];const students=classQ.data?.students??[];
 const rows=useMemo(()=>students.map(s=>({student:s,grade:grades.find(g=>g.studentUserId===s.membership.userId)})).sort((a,b)=>(b.grade?.score??-1)-(a.grade?.score??-1)),[students,grades]);
 const dist=useMemo(()=>{const m=new Map<string,number>();for(const r of rows){const g=r.grade?.letterGrade??"Ungraded";m.set(g,(m.get(g)??0)+1)}return[...m.entries()]},[rows]);
 const avg=grades.length?grades.reduce((a,g)=>a+g.score,0)/grades.length:0;
 function exportCsv(){const csv=[["rank","student","email","percentage","grade","status"],...rows.map((r,i)=>[i+1,r.student.name,r.student.email,r.grade?.score.toFixed(2)??"",r.grade?.letterGrade??"",r.grade?.status??"ungraded"])].map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(",")).join("\n");const blob=new Blob([csv],{type:"text/csv"});const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download="gradebook-report.csv";a.click();URL.revokeObjectURL(u)}
 if(!user)return <div className="p-6">Sign in required.</div>;if(classQ.isPending||termsQ.isPending)return <div className="h-64 animate-pulse rounded-2xl bg-slate-200"/>;
 return <div className="space-y-6 print:space-y-3"><div className="flex justify-between print:hidden"><Link to={"/teacher/classes/"+classGroupId+"/gradebook"} className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={16}/>Back to Gradebook</Link><div className="flex gap-2"><button type="button" onClick={()=>window.print()} className="rounded-xl border px-3 py-2 text-sm font-semibold"><Printer size={15} className="mr-1 inline"/>Print</button><button type="button" onClick={exportCsv} className="rounded-xl border px-3 py-2 text-sm font-semibold"><Download size={15} className="mr-1 inline"/>Export CSV</button></div></div>
 <section className="rounded-2xl bg-slate-900 p-6 text-white print:bg-white print:p-0 print:text-black"><p className="text-sm text-slate-300 print:text-slate-500">Academic report</p><h1 className="mt-1 text-2xl font-bold">{classQ.data?.classInfo.classGroup.name}</h1><p className="mt-2 text-sm text-slate-300 print:text-slate-600">{subject?.subject.name??"Subject"} · {term?.name??"Term"}</p></section>
 <section className="grid gap-3 md:grid-cols-4"><Metric label="Students" value={String(students.length)}/><Metric label="Graded" value={String(grades.length)}/><Metric label="Class average" value={avg.toFixed(2)+"%"}/><Metric label="Finalized" value={String(grades.filter(g=>g.status==="finalized").length)}/></section>
 <section className="rounded-2xl border bg-white p-5"><h2 className="font-semibold">Grade distribution</h2><div className="mt-4 grid gap-2 md:grid-cols-4">{dist.map(([g,n])=><div key={g} className="rounded-xl bg-slate-50 p-3"><b>{g}</b><p className="text-sm text-slate-500">{n} student{n===1?"":"s"}</p></div>)}</div></section>
 <section className="rounded-2xl border bg-white"><div className="border-b p-5"><h2 className="font-semibold">Class result report</h2><p className="mt-1 text-sm text-slate-500">Rank is teacher-facing and should not be exposed to students or parents without an organization policy.</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Rank</th><th className="px-5 py-3">Student</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Percentage</th><th className="px-5 py-3">Grade</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y">{rows.map((r,i)=><tr key={r.student.membership.id}><td className="px-5 py-3">{r.grade?i+1:"—"}</td><td className="px-5 py-3 font-semibold">{r.student.name}</td><td className="px-5 py-3 text-slate-500">{r.student.email}</td><td className="px-5 py-3">{r.grade?r.grade.score.toFixed(2)+"%":"—"}</td><td className="px-5 py-3">{r.grade?.letterGrade??"—"}</td><td className="px-5 py-3">{r.grade?.status??"ungraded"}</td></tr>)}</tbody></table></div></section>
 <p className="text-xs text-slate-400 print:hidden">This report uses the selected/current term and subject. Final academic-year aggregation remains policy-driven rather than assuming an average across terms.</p></div>
}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl border bg-white p-4"><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>}
