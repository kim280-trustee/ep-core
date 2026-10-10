import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye, FileText, Save, Send, Archive, ClipboardPlus } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useAuth } from "@/core/auth";
import { Link, useNavigate, useParams } from "react-router-dom";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "@/features/learning-teacher";
import type { LearningContentStatus } from "@/features/learning-content";
const statusClasses:Record<LearningContentStatus,string>={draft:"bg-slate-100 text-slate-700",review:"bg-amber-100 text-amber-800",published:"bg-emerald-100 text-emerald-800",retired:"bg-red-100 text-red-700"};
export default function TeacherContentDetailPage(){
 const{id}=useParams<{id:string}>();const{user}=useAuth();const navigate=useNavigate();const[body,setBody]=useState("");const[edited,setEdited]=useState(false);const[summary,setSummary]=useState("");const[error,setError]=useState("");const[saving,setSaving]=useState(false);const[reviewing,setReviewing]=useState(false);const[publishing,setPublishing]=useState(false);const[retiring,setRetiring]=useState(false);const[preview,setPreview]=useState(false);
 const classes=useQuery({queryKey:["learning","teacher-classes",user?.id],queryFn:()=>learningTeacherService.listTeacherClasses(user!.id),enabled:Boolean(user?.id)});const org=classes.data?.[0]?.membership.organizationId;
 const content=useQuery({queryKey:["learning","content",id],queryFn:async()=>{const organizationIds=[...new Set((classes.data??[]).map(item=>item.membership.organizationId))];const collections=await Promise.all(organizationIds.map(organizationId=>learningContentService.listContent(organizationId)));const item=collections.flat().find(x=>x.id===id);if(!item)throw new Error("Content item not found in your teacher organizations.");return item},enabled:Boolean(id&&org)});
 const versions=useQuery({queryKey:["learning","content-versions",id],queryFn:()=>learningContentService.listContentVersions(id!),enabled:Boolean(id&&org)});const objectives=useQuery({queryKey:["learning","content-objectives",id],queryFn:()=>learningContentService.listContentObjectives(id!),enabled:Boolean(id&&org)});const latest=versions.data?.[0];
 const latestBody=useMemo(()=>{if(!latest?.body)return"";const sections=Array.isArray(latest.body.sections)?latest.body.sections:[];return sections.map(s=>s&&typeof s==="object"&&typeof(s as Record<string,unknown>).body==="string"?(s as Record<string,string>).body:"").filter(Boolean).join("\n\n")},[latest]);const current=edited?body:latestBody;const item=content.data;const retired=item?.status==="retired";const published=item?.status==="published";const review=item?.status==="review";const draft=item?.status==="draft";
 async function saveVersion(e:FormEvent){e.preventDefault();setError("");if(!user?.id||!id||!latest){setError("A current content version is required before saving.");return}if(retired){setError("Retired content cannot be edited.");return}if(!current.trim()){setError("Learning content cannot be empty.");return}setSaving(true);try{await learningContentService.createVersion({contentItemId:id,versionNo:latest.versionNo+1,body:{sections:[{type:"text",title:"Content",body:current.trim()}]},changeSummary:summary.trim()||"Updated content",createdBy:user.id});setBody("");setEdited(false);setSummary("");await Promise.all([versions.refetch(),content.refetch()])}catch(err){setError(err instanceof Error?err.message:"Could not save the new version.")}finally{setSaving(false)}}
 async function setStatus(status:LearningContentStatus){
  setError("");
  if(!user?.id||!id||!latest){setError("A content version is required.");return}
  try{
    if(status==="review")setReviewing(true);
    else if(status==="published")setPublishing(true);
    else setRetiring(true);

    if(status==="published"){
      if(latest.status!=="published")await learningContentService.updateVersionStatus(latest.id,"published",user.id);
      if(!published)await learningContentService.updateContentStatus(id,"published",user.id);
    }else if(status==="review"){
      if(published&&latest.status==="published"){
        const draft=await learningContentService.createVersion({contentItemId:id,versionNo:latest.versionNo+1,body:latest.body,changeSummary:"Submitted for review",createdBy:user.id});
        await learningContentService.updateVersionStatus(draft.id,"review",user.id);
      }else{
        if(latest.status!=="review")await learningContentService.updateVersionStatus(latest.id,"review",user.id);
        if(!published)await learningContentService.updateContentStatus(id,"review",user.id);
      }
    }else{
      await learningContentService.updateContentStatus(id,status,user.id);
    }
    await Promise.all([content.refetch(),versions.refetch()]);
  }catch(err){
    setError(err instanceof Error?err.message:`Could not change content status to ${status}.`);
  }finally{
    setReviewing(false);setPublishing(false);setRetiring(false);
  }
}
 if(!user)return <Message text="Sign in to manage learning content."/>;if(!id)return <Message text="No content item was selected."/>;if(classes.isPending||content.isPending||versions.isPending||objectives.isPending)return <div className="h-96 animate-pulse rounded-2xl bg-slate-200"/>;if(classes.isError||!org||content.isError||versions.isError||objectives.isError||!item)return <Message text="We could not load this content item."/>
 return <div className="mx-auto max-w-5xl space-y-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-start gap-3"><Link to="/teacher/content" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft size={19}/></Link><div><div className="flex items-center gap-2 text-sm font-medium text-slate-500"><FileText size={18}/>Teacher Content</div><h1 className="mt-1 text-2xl font-bold text-slate-900">{item.title}</h1><p className="mt-1 text-sm text-slate-500">{item.code} · {item.languageCode.toUpperCase()}</p></div></div><span className={"inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold "+statusClasses[item.status]}>{item.status[0].toUpperCase()+item.status.slice(1)}</span></header>
 {published&&<section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><h2 className="font-semibold text-emerald-900">Reuse this content</h2><p className="mt-1 text-sm text-emerald-800">Create a class assignment using this published content.</p><Link to={"/teacher/assignments/new?contentId="+item.id} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white"><ClipboardPlus size={17}/>Reuse in assignment</Link></section>}
 <section className="grid gap-4 md:grid-cols-3"><Info label="Content type" value={label(item.contentType)}/><Info label="Current version" value={latest?String(latest.versionNo):"None"}/><Info label="Learning objectives" value={String(objectives.data?.length??0)}/></section>
 <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold text-slate-900">Learning objectives</h2><div className="mt-4 space-y-2">{(objectives.data??[]).map(x=><div key={x.objectiveId} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Objective {x.sequenceNo}: {x.objectiveId}</div>)}</div></section>
 {retired&&<section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">This content is retired and is read-only.</section>}
 <form onSubmit={saveVersion} className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-slate-900">{retired?"Version history":latest?.status==="published"?"Create the next draft version":"Edit current draft"}</h2><p className="mt-1 text-sm text-slate-500">Published versions remain historical; saving changes creates a new version.</p></div><button type="button" onClick={()=>setPreview(v=>!v)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"><Eye size={17}/>{preview?"Hide preview":"Preview"}</button></div>{!retired&&<><textarea value={current} onChange={e=>{setEdited(true);setBody(e.target.value)}} className="input mt-5 min-h-72 w-full resize-y" required/><input value={summary} onChange={e=>setSummary(e.target.value)} className="input mt-4 w-full" placeholder="Change summary"/></>}{preview&&<div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 whitespace-pre-wrap text-sm leading-7">{current||"Nothing to preview yet."}</div>}</section>
 <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold text-slate-900">Version history</h2><div className="mt-4 space-y-2">{(versions.data??[]).map(v=><div key={v.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"><div><p className="text-sm font-semibold">Version {v.versionNo}</p><p className="text-xs text-slate-500">{v.changeSummary||"No change summary"}</p></div><span className={"rounded-full px-2.5 py-1 text-xs font-semibold "+statusClasses[v.status]}>{v.status}</span></div>)}</div></section>
 {error&&<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>} {!retired&&<div className="flex flex-wrap justify-end gap-3"><button type="submit" disabled={saving||!current.trim()} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold"><Save size={17}/>{saving?"Saving...":"Save New Version"}</button>{latest?.status==="draft"&&<button type="button" onClick={()=>void setStatus("review")} disabled={reviewing} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white"><Send size={17}/>{reviewing?"Submitting...":"Send for Review"}</button>}{latest?.status==="review"&&<button type="button" onClick={()=>void setStatus("published")} disabled={publishing} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white"><Send size={17}/>{publishing?"Publishing...":"Publish"}</button>}{published&&<button type="button" onClick={()=>void setStatus("retired")} disabled={retiring} className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700"><Archive size={17}/>{retiring?"Retiring...":"Retire"}</button>}</div>}</form><button type="button" onClick={()=>navigate("/teacher/content")} className="text-sm font-medium text-slate-500">Return to Content Library</button></div>
}
function Info({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 font-semibold text-slate-900">{value}</p></div>}
function Message({text}:{text:string}){return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>}
function label(v:string){return v.charAt(0).toUpperCase()+v.slice(1)}
