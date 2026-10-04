import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen, CheckCircle2, MessageSquare, Target, TrendingUp } from "lucide-react";
import { useAuth } from "@/core/auth";
import { learningParentService } from "../services/learning-parent.service";
import type { LearningParentOverview } from "../types/learning-parent.types";

export default function ParentProgressPage() {
  const { user } = useAuth();
  const childrenQuery = useQuery({
    queryKey:["learning","parent","children",user?.id],
    queryFn:()=>learningParentService.listChildren(user!.id),
    enabled:Boolean(user?.id),
  });
  const overviewQuery = useQuery({
    queryKey:["learning","parent","overview",childrenQuery.data?.map(x=>x.studentUserId).join(",")],
    queryFn:async()=>Promise.all((childrenQuery.data??[]).map(x=>learningParentService.getOverview(x.studentUserId))),
    enabled:Boolean(childrenQuery.data?.length),
  });

  if(!user)return <div className="rounded-2xl border bg-white p-6">Sign in to view the parent portal.</div>;
  if(childrenQuery.isPending || overviewQuery.isPending)return <div className="space-y-4"><div className="h-32 animate-pulse rounded-2xl bg-slate-200"/><div className="h-64 animate-pulse rounded-2xl bg-slate-200"/></div>;
  if(childrenQuery.isError || overviewQuery.isError)return <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><AlertCircle size={20}/><div><p className="font-semibold">Parent progress could not be loaded.</p><p className="mt-1 text-sm">Only children explicitly linked to your parent account are shown.</p></div></div>;
  const children=overviewQuery.data??[];

  return <div className="mx-auto max-w-6xl space-y-6">
    <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8"><p className="text-sm font-medium text-slate-300">E&P Learning Parent Portal</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Children's Progress</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">Monitor verified academic results, completed work, strengths, and areas that need attention.</p></section>
    {children.length ? <div className="space-y-6">{children.map(child=><ChildCard key={child.student.id} child={child}/>)}</div> : <section className="rounded-2xl border border-dashed bg-white p-10 text-center"><p className="font-semibold text-slate-900">No linked children yet.</p><p className="mt-2 text-sm text-slate-500">A school administrator or teacher must link a child to this parent account before progress can be displayed.</p></section>}
  </div>;
}

function ChildCard({child}:{child:LearningParentOverview}) {
  const completed=child.assignments.filter(x=>x.progressStatus==="completed").length;
  const inProgress=child.assignments.filter(x=>x.progressStatus==="in_progress").length;
  const average=child.subjectGrades.length?child.subjectGrades.reduce((s,x)=>s+x.score,0)/child.subjectGrades.length:null;
  const needsReview=child.mastery.filter(x=>x.state==="needs_review"||x.state==="developing").slice(0,5);
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="border-b border-slate-100 p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-slate-900">{child.student.name}</h2><p className="text-sm text-slate-500">{child.student.email}</p></div><div className="rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="text-slate-500">Current average</span><p className="text-xl font-bold text-slate-900">{average===null?"No finalized grades":average.toFixed(1)+"%"}</p></div></div></div>
    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={<BookOpen size={18}/>} label="Assignments" value={String(child.assignments.length)} detail={completed+" completed · "+inProgress+" in progress"}/><Metric icon={<TrendingUp size={18}/>} label="Subjects graded" value={String(child.subjectGrades.length)} detail="finalized records"/><Metric icon={<Target size={18}/>} label="Objectives" value={String(child.mastery.length)} detail={needsReview.length+" needing attention"}/><Metric icon={<MessageSquare size={18}/>} label="Teacher comments" value={String(child.comments.length)} detail="recent comments"/></div>
    <div className="grid gap-6 p-6 lg:grid-cols-2">
      <section><h3 className="text-lg font-semibold text-slate-900">Subject performance</h3><div className="mt-3 divide-y">{child.subjectGrades.slice(0,10).map((grade,i)=><div key={grade.termName+"-"+grade.subjectName+"-"+i} className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium text-slate-800">{grade.subjectName}</p><p className="text-xs text-slate-500">{grade.termName} · finalized {grade.finalizedAt?new Date(grade.finalizedAt).toLocaleDateString():""}</p></div><div className="text-right"><p className="font-semibold text-slate-900">{grade.score.toFixed(1)}%</p><p className="text-xs text-slate-500">{grade.grade??"—"}</p></div></div>)}</div></section>
      <section><h3 className="text-lg font-semibold text-slate-900">Learning strengths & improvement</h3>{child.mastery.length?<div className="mt-3 space-y-3">{child.mastery.slice(0,6).map(item=><div key={item.objectiveId} className="rounded-xl border border-slate-200 p-3"><div className="flex justify-between gap-3 text-sm"><span className="font-medium text-slate-700">Learning objective</span><span className="font-semibold">{Math.round(item.score)}% · {item.state.replaceAll("_"," ")}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-900" style={{width:Math.max(0,Math.min(100,item.score))+"%"}}/></div></div>)}</div>:<p className="mt-3 text-sm text-slate-500">Mastery information will appear after more learning evidence is recorded.</p>}</section>
    </div>
    <div className="grid gap-6 border-t border-slate-100 p-6 lg:grid-cols-2">
      <section><h3 className="text-lg font-semibold text-slate-900">Assignment progress</h3><div className="mt-3 space-y-2">{child.assignments.slice(0,8).map(item=><div key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3"><div><p className="font-medium text-slate-800">{item.title}</p><p className="text-xs text-slate-500">{item.dueAt?"Due "+new Date(item.dueAt).toLocaleDateString():"No due date"}</p></div><span className="flex items-center gap-1 text-xs font-semibold capitalize text-slate-600">{item.progressStatus==="completed"&&<CheckCircle2 size={14}/>} {item.progressStatus.replaceAll("_"," ")}</span></div>)}</div></section>
      <section><h3 className="text-lg font-semibold text-slate-900">Teacher comments</h3>{child.comments.length?<div className="mt-3 space-y-2">{child.comments.slice(0,5).map((comment,i)=><div key={i} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{comment}</div>)}</div>:<p className="mt-3 text-sm text-slate-500">No teacher comments have been recorded.</p>}</section>
    </div>
    {child.recommendations>0&&<div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-600">{child.recommendations} learning recommendation{child.recommendations===1?"":"s"} available for this student.</div>}
  </section>;
}
function Metric({icon,label,value,detail}:{icon:React.ReactNode;label:string;value:string;detail:string}){return <div className="rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-sm">{label}</span></div><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>}
