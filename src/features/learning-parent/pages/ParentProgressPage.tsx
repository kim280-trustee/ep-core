import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen, CheckCircle2, MessageSquare, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/core/auth";
import { learningParentService } from "../services/learning-parent.service";
import type { LearningParentOverview } from "../types/learning-parent.types";

type Language="en"|"th";
const copy={
  en:{portal:"E&P Learning Parent Portal",title:"Children's Progress",intro:"Monitor verified academic results, completed work, strengths, and areas that need attention.",none:"No linked children yet.",noneHelp:"A school administrator or teacher must link a child to this parent account before progress can be displayed.",signIn:"Sign in to view the parent portal.",load:"Parent progress could not be loaded.",secure:"Only children explicitly linked to your parent account are shown.",average:"Current average",noGrades:"No finalized grades",assignments:"Assignments",completed:"completed",inProgress:"in progress",subjects:"Subjects graded",finalized:"finalized records",objectives:"Objectives",attention:"needing attention",comments:"Teacher comments",recent:"recent comments",performance:"Subject performance",strengths:"Learning strengths & improvement",objective:"Learning objective",masteryEmpty:"Mastery information will appear after more learning evidence is recorded.",assignmentProgress:"Assignment progress",due:"Due",noDue:"No due date",teacherComments:"Teacher comments",completedStatus:"Completed",inProgressStatus:"In progress",notStartedStatus:"Not started",noAssignments:"No assignments have been assigned yet.",recommendationPractice:"Practice",recommendationReview:"Review",recommendationExtend:"Extend learning",noComments:"No teacher comments have been recorded.",recommendation:"learning recommendation",recommendations:"learning recommendations",available:"available for this student",recommendationDetails:"Learning recommendations",reason:"Why",generated:"Generated",language:"Language"},
  th:{portal:"พอร์ทัลผู้ปกครอง E&P Learning",title:"ความก้าวหน้าของบุตรหลาน",intro:"ติดตามผลการเรียนที่ยืนยันแล้ว งานที่ทำสำเร็จ จุดแข็ง และด้านที่ควรได้รับการดูแลเพิ่มเติม",none:"ยังไม่มีบุตรหลานที่เชื่อมโยง",noneHelp:"ผู้ดูแลระบบของโรงเรียนหรือครูต้องเชื่อมโยงบุตรหลานกับบัญชีผู้ปกครองนี้ก่อนจึงจะแสดงข้อมูลได้",signIn:"เข้าสู่ระบบเพื่อดูพอร์ทัลผู้ปกครอง",load:"ไม่สามารถโหลดข้อมูลความก้าวหน้าของบุตรหลานได้",secure:"จะแสดงเฉพาะบุตรหลานที่เชื่อมโยงกับบัญชีผู้ปกครองของคุณเท่านั้น",average:"ค่าเฉลี่ยปัจจุบัน",noGrades:"ยังไม่มีผลการเรียนที่สรุปแล้ว",assignments:"งานที่ได้รับมอบหมาย",completed:"เสร็จแล้ว",inProgress:"กำลังทำ",subjects:"วิชาที่มีผลการเรียน",finalized:"รายการที่สรุปแล้ว",objectives:"จุดประสงค์การเรียนรู้",attention:"ควรติดตาม",comments:"ความคิดเห็นจากครู",recent:"ความคิดเห็นล่าสุด",performance:"ผลการเรียนรายวิชา",strengths:"จุดแข็งและด้านที่ควรพัฒนา",objective:"จุดประสงค์การเรียนรู้",masteryEmpty:"ข้อมูลความเชี่ยวชาญจะแสดงเมื่อมีหลักฐานการเรียนรู้เพิ่มขึ้น",assignmentProgress:"ความคืบหน้าของงาน",due:"กำหนดส่ง",noDue:"ไม่มีกำหนดส่ง",teacherComments:"ความคิดเห็นจากครู",completedStatus:"เสร็จแล้ว",inProgressStatus:"กำลังทำ",notStartedStatus:"ยังไม่เริ่ม",noAssignments:"ยังไม่มีงานที่ได้รับมอบหมาย",recommendationPractice:"ฝึกฝน",recommendationReview:"ทบทวน",recommendationExtend:"ต่อยอดการเรียนรู้",noComments:"ยังไม่มีความคิดเห็นจากครู",recommendation:"คำแนะนำการเรียนรู้",recommendations:"คำแนะนำการเรียนรู้",available:"รายการสำหรับนักเรียนคนนี้",recommendationDetails:"คำแนะนำการเรียนรู้",reason:"เหตุผล",generated:"สร้างเมื่อ",language:"ภาษา"}
} as const;
type Copy=typeof copy[Language];

export default function ParentProgressPage() {
  const { user } = useAuth();
  const [language,setLanguage]=useState<Language>("en");
  const t=copy[language];
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

  if(!user)return <div className="rounded-2xl border bg-white p-6">{t.signIn}</div>;
  if(childrenQuery.isPending)return <div className="space-y-4"><div className="h-32 animate-pulse rounded-2xl bg-slate-200"/><div className="h-64 animate-pulse rounded-2xl bg-slate-200"/></div>;
  if(childrenQuery.isError)return <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><AlertCircle size={20}/><div><p className="font-semibold">{t.load}</p><p className="mt-1 text-sm">{t.secure}</p></div></div>;
  if(!childrenQuery.data?.length)return <PortalEmpty t={t} language={language} setLanguage={setLanguage}/>;
  if(overviewQuery.isPending)return <div className="space-y-4"><div className="h-32 animate-pulse rounded-2xl bg-slate-200"/><div className="h-64 animate-pulse rounded-2xl bg-slate-200"/></div>;
  if(overviewQuery.isError)return <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><AlertCircle size={20}/><div><p className="font-semibold">{t.load}</p><p className="mt-1 text-sm">{t.secure}</p></div></div>;
  const children=overviewQuery.data??[];

  return <div className="mx-auto max-w-6xl space-y-6">
    <PortalHeader t={t} language={language} setLanguage={setLanguage}/>
    <div className="space-y-6">{children.map(child=><ChildCard key={child.student.id} child={child} t={t}/>)}</div>
  </div>;
}

function PortalHeader({t,language,setLanguage}:{t:Copy;language:Language;setLanguage:(v:Language)=>void}) {
  return <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-300">{t.portal}</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t.title}</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">{t.intro}</p></div><div className="rounded-xl border border-white/20 p-1"><span className="px-2 text-xs text-slate-300">{t.language}</span><button onClick={()=>setLanguage("en")} className={"rounded-lg px-3 py-1 text-sm "+(language==="en"?"bg-white text-slate-900":"text-white")}>EN</button><button onClick={()=>setLanguage("th")} className={"rounded-lg px-3 py-1 text-sm "+(language==="th"?"bg-white text-slate-900":"text-white")}>ไทย</button></div></div></section>;
}

function PortalEmpty({t,language,setLanguage}:{t:Copy;language:Language;setLanguage:(v:Language)=>void}) {
  return <div className="mx-auto max-w-6xl space-y-6"><PortalHeader t={t} language={language} setLanguage={setLanguage}/><section className="rounded-2xl border border-dashed bg-white p-10 text-center"><p className="font-semibold text-slate-900">{t.none}</p><p className="mt-2 text-sm text-slate-500">{t.noneHelp}</p></section></div>;
}

function ChildCard({child,t}:{child:LearningParentOverview;t:Copy}) {
  const completed=child.assignments.filter(x=>x.progressStatus==="completed").length;
  const inProgress=child.assignments.filter(x=>x.progressStatus==="in_progress").length;
  const latestBySubject=new Map<string,number>(); for(const grade of child.subjectGrades){if(!latestBySubject.has(grade.subjectName))latestBySubject.set(grade.subjectName,grade.score);} const currentScores=[...latestBySubject.values()]; const average=currentScores.length?currentScores.reduce((s,x)=>s+x,0)/currentScores.length:null;
  const needsReview=child.mastery.filter(x=>x.state==="needs_review"||x.state==="developing").slice(0,5);
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="border-b border-slate-100 p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-slate-900">{child.student.name}</h2><p className="text-sm text-slate-500">{child.student.email}</p></div><div className="rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="text-slate-500">{t.average}</span><p className="text-xl font-bold text-slate-900">{average===null?t.noGrades:average.toFixed(1)+"%"}</p></div></div></div>
    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={<BookOpen size={18}/>} label={t.assignments} value={String(child.assignments.length)} detail={completed+" "+t.completed+" · "+inProgress+" "+t.inProgress}/><Metric icon={<TrendingUp size={18}/>} label={t.subjects} value={String(child.subjectGrades.length)} detail={t.finalized}/><Metric icon={<Target size={18}/>} label={t.objectives} value={String(child.mastery.length)} detail={needsReview.length+" "+t.attention}/><Metric icon={<MessageSquare size={18}/>} label={t.comments} value={String(child.comments.length)} detail={t.recent}/></div>
    <div className="grid gap-6 p-6 lg:grid-cols-2">
      <section><h3 className="text-lg font-semibold text-slate-900">{t.performance}</h3><div className="mt-3 divide-y">{child.subjectGrades.slice(0,10).map((grade,i)=><div key={grade.termName+"-"+grade.subjectName+"-"+i} className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium text-slate-800">{grade.subjectName}</p><p className="text-xs text-slate-500">{grade.termName} · {grade.finalizedAt?new Date(grade.finalizedAt).toLocaleDateString():""}</p></div><div className="text-right"><p className="font-semibold text-slate-900">{grade.score.toFixed(1)}%</p><p className="text-xs text-slate-500">{grade.grade??"—"}</p></div></div>)}</div></section>
      <section><h3 className="text-lg font-semibold text-slate-900">{t.strengths}</h3>{child.mastery.length?<div className="mt-3 space-y-3">{child.mastery.slice(0,6).map(item=><div key={item.objectiveId} className="rounded-xl border border-slate-200 p-3"><div className="flex justify-between gap-3 text-sm"><span className="font-medium text-slate-700">{item.objectiveName}</span><span className="font-semibold">{Math.round(item.score)}% · {item.state.replaceAll("_"," ")}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-900" style={{width:Math.max(0,Math.min(100,item.score))+"%"}}/></div></div>)}</div>:<p className="mt-3 text-sm text-slate-500">{t.masteryEmpty}</p>}</section>
    </div>
    <div className="grid gap-6 border-t border-slate-100 p-6 lg:grid-cols-2">
      <section><h3 className="text-lg font-semibold text-slate-900">{t.assignmentProgress}</h3>{child.assignments.length?<div className="mt-4 space-y-3">{child.assignments.slice(0,10).map(item=><AssignmentRow key={item.id} item={item} t={t}/>)}</div>:<div className="mt-4 rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">{t.noAssignments}</div>}</section>
      <section><h3 className="text-lg font-semibold text-slate-900">{t.teacherComments}</h3>{child.comments.length?<div className="mt-4 space-y-3">{child.comments.slice(0,5).map((comment,i)=><div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"><p>{comment.text}</p><p className="mt-2 text-xs text-slate-500">{[comment.subjectName,comment.termName,new Date(comment.recordedAt).toLocaleDateString()].filter(Boolean).join(" · ")}</p></div>)}</div>:<div className="mt-4 rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">{t.noComments}</div>}</section>
    </div>
    {child.recommendations.length>0&&<section className="border-t border-slate-100 bg-slate-50 p-6"><h3 className="text-lg font-semibold text-slate-900">{t.recommendationDetails}</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{child.recommendations.slice(0,5).map(item=><div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><p className="font-semibold text-slate-800">{item.objectiveName??recommendationLabel(item.type,t)}</p><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{recommendationLabel(item.type,t)}</span></div>{item.reason&&<p className="mt-2 text-sm text-slate-600"><span className="font-medium">{t.reason}:</span> {item.reason}</p>}<p className="mt-2 text-xs text-slate-400">{t.generated} {new Date(item.generatedAt).toLocaleDateString()}</p></div>)}</div></section>}
  </section>;
}
function AssignmentRow({item,t}:{item:LearningParentOverview["assignments"][number];t:Copy}) {
  const status=item.progressStatus==="completed"?t.completedStatus:item.progressStatus==="in_progress"?t.inProgressStatus:t.notStartedStatus;
  const badge=item.progressStatus==="completed"?"bg-emerald-50 text-emerald-700":item.progressStatus==="in_progress"?"bg-amber-50 text-amber-700":"bg-slate-100 text-slate-600";
  return <div className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="font-medium text-slate-800">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.dueAt?t.due+" "+new Date(item.dueAt).toLocaleDateString():t.noDue}</p></div><span className={"shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold "+badge}>{status}</span></div></div>;
}
function recommendationLabel(type:string,t:Copy){if(type==="practice")return t.recommendationPractice;if(type==="review")return t.recommendationReview;if(type==="extend")return t.recommendationExtend;return type.replaceAll("_"," ");}
function Metric({icon,label,value,detail}:{icon:ReactNode;label:string;value:string;detail:string}){return <div className="rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-sm">{label}</span></div><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>}
