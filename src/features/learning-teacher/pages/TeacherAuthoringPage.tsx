import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, ClipboardCheck, FileQuestion, Plus, Send, AlertCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningContentService } from "@/features/learning-content";
import { learningAssessmentService } from "@/features/learning-assessment";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningTeacherService } from "../services/learning-teacher.service";

export default function TeacherAuthoringPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [classGroupId,setClassGroupId]=useState("");
  const [contentTitle,setContentTitle]=useState("");
  const [contentCode,setContentCode]=useState("");
  const [contentText,setContentText]=useState("");
  const [contentType,setContentType]=useState<"lesson"|"worksheet"|"reading">("lesson");
  const [questionCode,setQuestionCode]=useState("");
  const [questionPrompt,setQuestionPrompt]=useState("");
  const [questionType,setQuestionType]=useState<"single_choice"|"true_false"|"short_answer">("single_choice");
  const [questionConfig,setQuestionConfig]=useState("");
  const [objectiveId,setObjectiveId]=useState("");
  const [assessmentCode,setAssessmentCode]=useState("");
  const [assessmentTitle,setAssessmentTitle]=useState("");
  const [assessmentType,setAssessmentType]=useState<"quiz"|"test"|"practice">("quiz");
  const [selectedQuestionId,setSelectedQuestionId]=useState("");
  const [assignmentId,setAssignmentId]=useState("");
  const [selectedContentId,setSelectedContentId]=useState("");
  const [selectedAssessmentId,setSelectedAssessmentId]=useState("");
  const [searchParams]=useSearchParams();
  const [message,setMessage]=useState<string|null>(null);
  const [messageKind,setMessageKind]=useState<"success"|"error"|"info">("info");

  const classes=useQuery({queryKey:["learning","teacher-classes",user?.id],queryFn:()=>learningTeacherService.listTeacherClasses(user!.id),enabled:Boolean(user?.id)});
  const selected=classes.data?.find(x=>x.classGroup.id===classGroupId);
  const organizationId=selected?.membership.organizationId;
  const content=useQuery({queryKey:["learning","authoring","content",organizationId],queryFn:()=>learningContentService.listContent(organizationId),enabled:Boolean(organizationId)});
  const questions=useQuery({queryKey:["learning","authoring","questions",organizationId],queryFn:()=>learningAssessmentService.listQuestions(organizationId),enabled:Boolean(organizationId)});
  const assessments=useQuery({queryKey:["learning","authoring","assessments",organizationId],queryFn:()=>learningAssessmentService.listAssessments(organizationId),enabled:Boolean(organizationId)});
  const teacherAssignments=useQuery({queryKey:["learning","authoring","assignments",classGroupId],queryFn:()=>learningAssignmentsService.listAssignmentsForClass(classGroupId),enabled:Boolean(classGroupId)});
  const assignmentItems=useQuery({queryKey:["learning","authoring","assignment-items",assignmentId],queryFn:()=>learningAssignmentsService.listItems(assignmentId),enabled:Boolean(assignmentId)});
  const draftAssignments=teacherAssignments.data?.filter(a=>a.status==="draft")??[];
  const publishedAssignments=teacherAssignments.data?.filter(a=>a.status==="published")??[];
  const selectedAssignment=teacherAssignments.data?.find(a=>a.id===assignmentId);
  const selectedIsDraft=selectedAssignment?.status==="draft";
  const skills=useQuery({queryKey:["learning","authoring","skills"],queryFn:()=>learningContentService.listSkills(),enabled:Boolean(user)});
  const topics=useQuery({queryKey:["learning","authoring","topics"],queryFn:()=>learningContentService.listTopics(),enabled:Boolean(user)});
  const objectives=useQuery({queryKey:["learning","authoring","objectives"],queryFn:()=>learningContentService.listObjectives(),enabled:Boolean(user)});

  const showMessage=(text:string,kind:"success"|"error"|"info"="info")=>{setMessage(text);setMessageKind(kind);};

  const createContent=useMutation({mutationFn:async()=>{if(!user||!organizationId)throw new Error("Select a teacher class first.");if(!contentTitle.trim()||!contentCode.trim()||!contentText.trim()||!objectiveId)throw new Error("Content title, code, body, and objective are required.");const item=await learningContentService.createContent({organizationId,code:contentCode.trim().toUpperCase(),title:contentTitle.trim(),contentType,languageCode:"en",createdBy:user.id});await learningContentService.createVersion({contentItemId:item.id,versionNo:1,body:{blocks:[{type:"text",text:contentText.trim()}]},changeSummary:"Initial authoring version",createdBy:user.id});await learningContentService.addObjective({contentItemId:item.id,objectiveId,sequenceNo:1});return item;},onSuccess:()=>{setMessage("Content saved as draft. Submit/review it before attaching it to a published assignment.");void qc.invalidateQueries({queryKey:["learning","authoring","content"]});setContentTitle("");setContentCode("");setContentText("");},onError:(e:Error)=>setMessage(e.message)});
  const publishContent=useMutation({mutationFn:(id:string)=>learningContentService.updateContentStatus(id,"published",user!.id),onSuccess:()=>{setMessage("Content published.");void qc.invalidateQueries({queryKey:["learning","authoring","content"]});},onError:(e:Error)=>setMessage(e.message)});
  const createQuestion=useMutation({mutationFn:async()=>{if(!user||!organizationId)throw new Error("Select a teacher class first.");if(!questionCode.trim()||!questionPrompt.trim()||!objectiveId)throw new Error("Question code, prompt, and objective are required.");let configuration:Record<string,unknown>={};if(questionConfig.trim())configuration=JSON.parse(questionConfig);const q=await learningAssessmentService.createQuestion({organizationId,code:questionCode.trim().toUpperCase(),questionType,createdBy:user.id});const v=await learningAssessmentService.createQuestionVersion({questionId:q.id,versionNo:1,prompt:{text:questionPrompt.trim()},configuration,createdBy:user.id});await learningAssessmentService.addQuestionObjective({questionVersionId:v.id,objectiveId,weight:1});return q;},onSuccess:()=>{setMessage("Question saved as draft.");void qc.invalidateQueries({queryKey:["learning","authoring","questions"]});setQuestionCode("");setQuestionPrompt("");setQuestionConfig("");},onError:(e:Error)=>setMessage(e.message)});
  const publishQuestion=useMutation({mutationFn:(id:string)=>learningAssessmentService.publishQuestion(id,user!.id),onSuccess:()=>{setMessage("Question published.");void qc.invalidateQueries({queryKey:["learning","authoring","questions"]});},onError:(e:Error)=>setMessage(e.message)});
  const createAssessment=useMutation({mutationFn:async()=>{if(!user||!organizationId)throw new Error("Select a teacher class first.");if(!assessmentCode.trim()||!assessmentTitle.trim()||!selectedQuestionId)throw new Error("Assessment code, title, and question are required.");const a=await learningAssessmentService.createAssessment({organizationId,code:assessmentCode.trim().toUpperCase(),title:assessmentTitle.trim(),assessmentType,languageCode:"en",createdBy:user.id});const versions=await learningAssessmentService.listQuestionVersions(selectedQuestionId);const version=versions[0];if(!version)throw new Error("Selected question has no version.");await learningAssessmentService.addAssessmentQuestion({assessmentId:a.id,questionVersionId:version.id,sequenceNo:1,points:1,required:true});return a;},onSuccess:()=>{setMessage("Assessment saved as draft.");void qc.invalidateQueries({queryKey:["learning","authoring","assessments"]});setAssessmentCode("");setAssessmentTitle("");},onError:(e:Error)=>setMessage(e.message)});
  const publishAssessment=useMutation({mutationFn:(id:string)=>learningAssessmentService.publishAssessment(id,user!.id),onSuccess:()=>{setMessage("Assessment published.");void qc.invalidateQueries({queryKey:["learning","authoring","assessments"]});},onError:(e:Error)=>setMessage(e.message)});
  const addAssignmentItem=useMutation({mutationFn:async(input:{itemType:"content"|"assessment";id:string})=>{if(!assignmentId||!organizationId)throw new Error("Create/select an assignment first.");return learningAssignmentsService.addItem({organizationId,assignmentId,itemType:input.itemType,contentItemId:input.itemType==="content"?input.id:null,assessmentId:input.itemType==="assessment"?input.id:null,sequenceNo:(assignmentItems.data?.length??0)+1,required:true});},onSuccess:()=>{showMessage("Learning item attached. Check the attached items below.","success");setSelectedContentId("");setSelectedAssessmentId("");void assignmentItems.refetch();},onError:(e:Error)=>setMessage(e.message)});
  const publishAssignment=useMutation({mutationFn:async()=>{if(!assignmentId)throw new Error("Select an assignment first.");if(selectedAssignment?.status==="published")return selectedAssignment;return learningAssignmentsService.publishAssignment(assignmentId);},onSuccess:()=>{showMessage("Assignment is published and ready for students.","success");void teacherAssignments.refetch();void assignmentItems.refetch();},onError:(e:Error)=>showMessage(e.message,"error")});

  useEffect(()=>{const id=searchParams.get("assignmentId");if(!id)return;const match=teacherAssignments.data?.find(a=>a.id===id);if(match?.status==="draft"||match?.status==="published"){setAssignmentId(id);}},[searchParams,teacherAssignments.data]);
  useEffect(()=>{if(assignmentId||!draftAssignments.length)return;setAssignmentId(draftAssignments[0].id);},[assignmentId,draftAssignments]);
  useEffect(()=>{if(!classGroupId&&classes.data?.length)setClassGroupId(classes.data[0].classGroup.id);},[classGroupId,classes.data]);

  if(!user)return <Panel title="Teacher authoring"><p>Sign in to continue.</p></Panel>;
  if(classes.isPending)return <div className="h-64 animate-pulse rounded-2xl bg-slate-200"/>;
  if(classes.isError)return <Panel title="Teacher authoring"><p>Teacher classes could not be loaded.</p></Panel>;

  const attachedContentCount=assignmentItems.data?.filter(i=>i.itemType==="content").length??0;
  const attachedAssessmentCount=assignmentItems.data?.filter(i=>i.itemType==="assessment").length??0;
  const canPublish=Boolean(selectedIsDraft)&&!publishAssignment.isPending&&Boolean(assignmentItems.data?.length);

  return <div className="mx-auto max-w-6xl space-y-6">
    <div><Link to="/teacher" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={16}/>Back to teacher workspace</Link><h1 className="mt-3 text-2xl font-bold text-slate-900">Teacher authoring</h1><p className="mt-2 text-sm text-slate-500">Build reusable content, questions, assessments, and publish-ready assignment items.</p></div>
    <Panel title="Authoring context"><Field label="Teacher class"><select value={classGroupId} onChange={e=>setClassGroupId(e.target.value)} className="input"><option value="">Select a class</option>{classes.data?.map(x=><option key={x.classGroup.id} value={x.classGroup.id}>{x.classGroup.name}</option>)}</select></Field></Panel>
    {message&&<div className={`flex items-start gap-3 rounded-xl border p-4 text-sm font-medium ${messageKind==="error"?"border-red-300 bg-red-50 text-red-800":messageKind==="success"?"border-emerald-300 bg-emerald-50 text-emerald-800":"border-blue-300 bg-blue-50 text-blue-800"}`}>{messageKind==="error"?<AlertCircle size={18} className="mt-0.5 shrink-0"/>:<CheckCircle2 size={18} className="mt-0.5 shrink-0"/>}<span>{message}</span></div>}
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Content library" icon={<BookOpen size={18}/>}>
        <div className="space-y-3"><Field label="Code"><input value={contentCode} onChange={e=>setContentCode(e.target.value)} className="input" placeholder="ENG-M1-LESSON-001"/></Field><Field label="Title"><input value={contentTitle} onChange={e=>setContentTitle(e.target.value)} className="input" placeholder="Present simple"/></Field><Field label="Type"><select value={contentType} onChange={e=>setContentType(e.target.value as typeof contentType)} className="input"><option value="lesson">Lesson</option><option value="worksheet">Worksheet</option><option value="reading">Reading</option></select></Field><Field label="Learning objective"><select value={objectiveId} onChange={e=>setObjectiveId(e.target.value)} className="input"><option value="">Select objective</option>{objectives.data?.map(o=><option key={o.id} value={o.id}>{o.code} — {o.name}</option>)}</select></Field><Field label="Body"><textarea value={contentText} onChange={e=>setContentText(e.target.value)} rows={5} className="input" placeholder="Write the learner-facing content..."/></Field><button disabled={!organizationId||createContent.isPending} onClick={()=>createContent.mutate()} className="btn"><Plus size={16}/>Create draft</button></div>
        <div className="mt-6 space-y-2">{content.data?.slice(0,8).map(c=><div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3"><div><p className="font-medium">{c.title}</p><p className="text-xs text-slate-500">{c.code} · {c.status}</p></div>{c.status!=="published"&&<button onClick={()=>publishContent.mutate(c.id)} className="text-xs font-semibold text-slate-700">Publish</button>}</div>)}</div>
      </Panel>
      <Panel title="Question bank" icon={<FileQuestion size={18}/>}>
        <div className="space-y-3"><Field label="Code"><input value={questionCode} onChange={e=>setQuestionCode(e.target.value)} className="input" placeholder="ENG-M1-Q001"/></Field><Field label="Type"><select value={questionType} onChange={e=>setQuestionType(e.target.value as typeof questionType)} className="input"><option value="single_choice">Single choice</option><option value="true_false">True / False</option><option value="short_answer">Short answer</option></select></Field><Field label="Prompt"><textarea value={questionPrompt} onChange={e=>setQuestionPrompt(e.target.value)} rows={4} className="input" placeholder="Choose the correct answer..."/></Field><Field label="Configuration JSON"><textarea value={questionConfig} onChange={e=>setQuestionConfig(e.target.value)} rows={3} className="input" placeholder='{"options":[{"id":"a","text":"Option A"},{"id":"b","text":"Option B"}]}'/></Field><Field label="Learning objective"><select value={objectiveId} onChange={e=>setObjectiveId(e.target.value)} className="input"><option value="">Select objective</option>{objectives.data?.map(o=><option key={o.id} value={o.id}>{o.code} — {o.name}</option>)}</select></Field><button disabled={!organizationId||createQuestion.isPending} onClick={()=>createQuestion.mutate()} className="btn"><Plus size={16}/>Create question</button></div>
        <div className="mt-6 space-y-2">{questions.data?.slice(0,8).map(q=><div key={q.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3"><div><p className="font-medium">{q.code}</p><p className="text-xs text-slate-500">{q.questionType} · {q.status}</p></div>{q.status!=="published"&&<button onClick={()=>publishQuestion.mutate(q.id)} className="text-xs font-semibold text-slate-700">Publish</button>}</div>)}</div>
      </Panel>
      <Panel title="Assessment builder" icon={<ClipboardCheck size={18}/>}>
        <div className="space-y-3"><Field label="Code"><input value={assessmentCode} onChange={e=>setAssessmentCode(e.target.value)} className="input" placeholder="ENG-M1-QZ-001"/></Field><Field label="Title"><input value={assessmentTitle} onChange={e=>setAssessmentTitle(e.target.value)} className="input" placeholder="Present simple quiz"/></Field><Field label="Type"><select value={assessmentType} onChange={e=>setAssessmentType(e.target.value as typeof assessmentType)} className="input"><option value="practice">Practice</option><option value="quiz">Quiz</option><option value="test">Test</option></select></Field><Field label="Question"><select value={selectedQuestionId} onChange={e=>setSelectedQuestionId(e.target.value)} className="input"><option value="">Select question</option>{questions.data?.map(q=><option key={q.id} value={q.id}>{q.code} — {q.status}</option>)}</select></Field><button disabled={!organizationId||createAssessment.isPending} onClick={()=>createAssessment.mutate()} className="btn"><Plus size={16}/>Create draft assessment</button></div>
        <div className="mt-6 space-y-2">{assessments.data?.slice(0,8).map(a=><div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3"><div><p className="font-medium">{a.title}</p><p className="text-xs text-slate-500">{a.code} · {a.status}</p></div>{a.status!=="published"&&<button onClick={()=>publishAssessment.mutate(a.id)} className="text-xs font-semibold text-slate-700">Publish</button>}</div>)}</div>
      </Panel>
      <Panel title="Assignment builder" icon={<Send size={18}/>}>
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Step 1 of 3</p><h3 className="mt-1 text-lg font-bold text-slate-900">Choose a draft assignment</h3><p className="mt-1 text-sm text-slate-600">Only draft assignments can be edited and published.</p></div>
            <Link to="/teacher/assignments/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16}/>Create new draft</Link>
          </div>
          <div className="mt-4">
            {draftAssignments.length>0?<Field label="Draft assignment"><select value={assignmentId} onChange={e=>setAssignmentId(e.target.value)} className="input border-blue-300 bg-white font-medium"><option value="">Select a draft assignment</option>{draftAssignments.map(a=><option key={a.id} value={a.id}>{a.title} · {a.code}</option>)}</select></Field>:<div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-900">No draft assignments for this class.</p><p className="mt-1 text-sm text-amber-800">Create a draft assignment first. You will return here automatically after creating it.</p><Link to="/teacher/assignments/new" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-amber-900 underline"><Plus size={15}/>Create draft assignment</Link></div>}
          </div>
          {selectedAssignment&&<div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"><span><span className="font-semibold">{selectedAssignment.title}</span> · {selectedAssignment.code}</span><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">draft</span></div>}
          {publishedAssignments.length>0&&<details className="mt-4 rounded-lg border border-slate-200 bg-white p-3"><summary className="cursor-pointer text-sm font-semibold text-slate-700">Published assignments ({publishedAssignments.length})</summary><div className="mt-2 space-y-2">{publishedAssignments.map(a=><div key={a.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"><span>{a.title} · {a.code}</span><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">published</span></div>)}</div></details>}
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Step 2 of 3</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">Attach learning items</h3>
          <p className="mt-1 text-sm text-slate-600">Choose published content and/or a published assessment, then attach it to the draft.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4"><Field label="Published content"><select value={selectedContentId} onChange={e=>setSelectedContentId(e.target.value)} className="input" disabled={!selectedIsDraft}><option value="">Select content</option>{content.data?.filter(x=>x.status==="published").map(x=><option key={x.id} value={x.id}>{x.title} · {x.code}</option>)}</select></Field><button disabled={!selectedIsDraft||!selectedContentId||addAssignmentItem.isPending} onClick={()=>addAssignmentItem.mutate({itemType:"content",id:selectedContentId})} className="btn mt-3 w-full justify-center"><Plus size={16}/>Attach content</button></div>
            <div className="rounded-xl border border-slate-200 p-4"><Field label="Published assessment"><select value={selectedAssessmentId} onChange={e=>setSelectedAssessmentId(e.target.value)} className="input" disabled={!selectedIsDraft}><option value="">Select assessment</option>{assessments.data?.filter(x=>x.status==="published").map(x=><option key={x.id} value={x.id}>{x.title} · {x.code}</option>)}</select></Field><button disabled={!selectedIsDraft||!selectedAssessmentId||addAssignmentItem.isPending} onClick={()=>addAssignmentItem.mutate({itemType:"assessment",id:selectedAssessmentId})} className="btn mt-3 w-full justify-center"><Plus size={16}/>Attach assessment</button></div>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-800">Attached to this draft</p>{assignmentItems.isPending?<p className="mt-2 text-sm text-slate-500">Loading attached items…</p>:assignmentItems.data?.length?<div className="mt-2 space-y-2">{assignmentItems.data.map(i=><div key={i.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><span className="font-medium capitalize">{i.itemType}</span><span className="text-slate-500">Sequence {i.sequenceNo} · {i.required?"Required":"Optional"}</span></div>)}</div>:<p className="mt-2 text-sm font-medium text-amber-700">No learning items attached yet.</p>}</div>
        </div>
        <div className="mt-4 rounded-xl border-2 border-slate-900 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Step 3 of 3</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">Validate and publish</h3>
          <p className="mt-1 text-sm text-slate-600">{!selectedIsDraft?"Select a draft assignment above.":!assignmentItems.data?.length?"Attach at least one published learning item.":"Everything is ready. The system will validate the attached content and assessments before publishing."}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">{attachedContentCount} content</span><span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">{attachedAssessmentCount} assessment</span></div>
          <button disabled={!canPublish} onClick={()=>publishAssignment.mutate()} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-base font-bold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 sm:w-auto"><Send size={18}/>{publishAssignment.isPending?"Validating…":"Validate & publish assignment"}</button>
          {!selectedIsDraft&&<p className="mt-2 text-sm font-medium text-amber-700">A published assignment cannot be published again. Create or select a draft assignment.</p>}
          {selectedIsDraft&&!assignmentItems.data?.length&&<p className="mt-2 text-sm font-medium text-amber-700">Attach at least one learning item before publishing.</p>}
        </div>
      </Panel>
    </div>
    <p className="text-xs text-slate-400">The academic catalog currently contains {skills.data?.length??0} skills, {topics.data?.length??0} topics, and {objectives.data?.length??0} learning objectives.</p>
  </div>;
}
function Panel({title,icon,children}:{title:string;icon?:ReactNode;children:ReactNode}){return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 font-semibold text-slate-900">{icon}{title}</h2><div className="mt-4">{children}</div></section>}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">{label}</span>{children}</label>}
