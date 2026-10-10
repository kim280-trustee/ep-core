import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Save } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { learningContentService } from "@/features/learning-content";

export default function TeacherContentResponsesPage() {
  const { assignmentId = "" } = useParams();
  const queryClient = useQueryClient();
  const [drafts,setDrafts]=useState<Record<string,{score:string;maxScore:string;feedback:string}>>({});
  const responses=useQuery({queryKey:["learning","teacher-content-responses",assignmentId],queryFn:()=>learningContentService.listTeacherResponses(assignmentId),enabled:Boolean(assignmentId)});
  const grade=useMutation({
    mutationFn:({responseId,score,maxScore,feedback}:{responseId:string;score:number;maxScore:number;feedback:string})=>learningContentService.gradeTeacherResponse({responseId,score,maxScore,teacherFeedback:feedback}),
    onSuccess:()=>{void queryClient.invalidateQueries({queryKey:["learning","teacher-content-responses",assignmentId]});void queryClient.invalidateQueries({queryKey:["learning"]});},
  });
  if(!assignmentId)return <Message text="No assignment was selected." />;
  if(responses.isPending)return <div className="h-64 animate-pulse rounded-2xl bg-slate-200"/>;
  if(responses.isError)return <Message text={responses.error instanceof Error?responses.error.message:"Responses could not be loaded."}/>;
  const items=responses.data??[];
  return <div className="space-y-6">
    <Link to="/teacher" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={16}/>Teacher Dashboard</Link>
    <header className="rounded-2xl bg-slate-900 p-6 text-white"><p className="text-sm text-slate-300">Teacher Assessment</p><h1 className="mt-1 text-2xl font-bold">Student Responses</h1><p className="mt-2 text-sm text-slate-300">Review submitted writing/content work, give feedback, and record the grade in the gradebook.</p></header>
    {!items.length?<Message text="No student responses have been submitted for this assignment yet."/>:
    <section className="space-y-4">{items.map(r=>{
      const d=drafts[r.id]??{score:r.score===null?"":String(r.score),maxScore:r.maxScore===null?"":String(r.maxScore),feedback:r.teacherFeedback??""};
      const set=(patch:Partial<typeof d>)=>setDrafts(v=>({...v,[r.id]:{...d,...patch}}));
      const numericScore=Number(d.score);const numericMaxScore=Number(d.maxScore);const valid=r.status==="submitted"&&d.score.trim()!==""&&d.maxScore.trim()!==""&&Number.isFinite(numericScore)&&Number.isFinite(numericMaxScore)&&numericScore>=0&&numericMaxScore>0&&numericScore<=numericMaxScore;
      return <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-semibold text-slate-900">{r.studentName}</h2><p className="text-xs text-slate-500">{r.studentEmail??r.studentUserId}{r.submittedAt?" · Submitted "+new Date(r.submittedAt).toLocaleString():""}</p></div>{r.status==="submitted"?<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14}/>Submitted</span>:<span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Draft · Awaiting submission</span>}</div>
        <div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Student response</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">{r.responseText||"No response text."}</p></div>
        <div className="mt-5 grid gap-4 md:grid-cols-[120px_120px_1fr]"><label className="text-sm font-medium text-slate-700">Score<input type="number" min="0" step="0.01" value={d.score} onChange={e=>set({score:e.target.value})} className="input mt-1 w-full"/></label><label className="text-sm font-medium text-slate-700">Max score<input type="number" min="0.01" step="0.01" value={d.maxScore} onChange={e=>set({maxScore:e.target.value})} className="input mt-1 w-full"/></label><label className="text-sm font-medium text-slate-700">Teacher feedback<textarea value={d.feedback} onChange={e=>set({feedback:e.target.value})} className="input mt-1 min-h-24 w-full resize-y"/></label></div>
        <div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs text-slate-500">{r.score!==null&&r.maxScore!==null?"Recorded: "+r.score+"/"+r.maxScore:"Not graded yet"}</span><button type="button" disabled={!valid||grade.isPending} onClick={()=>grade.mutate({responseId:r.id,score:Number(d.score),maxScore:Number(d.maxScore),feedback:d.feedback})} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"><Save size={16}/>{grade.isPending?"Saving...":"Save Grade & Feedback"}</button></div>
      </article>;
    })}</section>}
    {grade.isError&&<Message text={grade.error instanceof Error?grade.error.message:"Could not save the grade."}/>}
  </div>;
}
function Message({text}:{text:string}){return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>}
