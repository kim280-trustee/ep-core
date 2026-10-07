import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Link2, Mail, UserMinus, Users } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/core/auth";
import { learningParentService } from "@/features/learning-parent";
import { learningTeacherService } from "../services/learning-teacher.service";

export default function TeacherParentLinksPage() {
  const { user } = useAuth();
  const { classGroupId="" } = useParams();
  const queryClient=useQueryClient();
  const [parentUserId,setParentUserId]=useState("");
  const [studentUserId,setStudentUserId]=useState("");
  const [relationship,setRelationship]=useState("parent");
  const [inviteEmail,setInviteEmail]=useState("");
  const [inviteName,setInviteName]=useState("");
  const [inviteStudentId,setInviteStudentId]=useState("");
  const [error,setError]=useState("");

  const classQuery=useQuery({
    queryKey:["learning","teacher-class",user?.id,classGroupId],
    queryFn:()=>learningTeacherService.getClassOverview(user!.id,classGroupId),
    enabled:Boolean(user?.id&&classGroupId),
  });
  const organizationId=classQuery.data?.classInfo.membership.organizationId??"";
  const usersQuery=useQuery({
    queryKey:["learning","parent-link-users",organizationId],
    queryFn:()=>learningParentService.listOrganizationUsers(organizationId),
    enabled:Boolean(organizationId),
  });
  const linksQuery=useQuery({
    queryKey:["learning","parent-links",organizationId],
    queryFn:()=>learningParentService.listLinks(organizationId),
    enabled:Boolean(organizationId),
  });
  const saveMutation=useMutation({
    mutationFn:()=>learningParentService.createLink({organizationId,parentUserId,studentUserId,relationship,createdBy:user!.id}),
    onSuccess:()=>{setParentUserId("");setStudentUserId("");setRelationship("parent");setError("");void queryClient.invalidateQueries({queryKey:["learning","parent-links",organizationId]});},
    onError:(e)=>setError(e instanceof Error?e.message:"The parent link could not be saved."),
  });
  const inviteMutation=useMutation({
    mutationFn:()=>learningParentService.inviteParent({organizationId,parentEmail:inviteEmail,parentName:inviteName,studentUserId:inviteStudentId,relationship}),
    onSuccess:()=>{setInviteEmail("");setInviteName("");setInviteStudentId("");setError("");},
    onError:(e)=>setError(e instanceof Error?e.message:"The parent invitation could not be sent."),
  });
  const statusMutation=useMutation({
    mutationFn:({id,status}:{id:string;status:"active"|"inactive"})=>learningParentService.setLinkStatus(id,status),
    onError:(e)=>setError(e instanceof Error?e.message:"The parent link could not be updated."),
    onSuccess:()=>{setError("");void queryClient.invalidateQueries({queryKey:["learning","parent-links",organizationId]});},
  });

  if(!user)return <div className="rounded-2xl border bg-white p-6">Sign in to continue.</div>;
  if(classQuery.isPending)return <div className="h-64 animate-pulse rounded-2xl bg-slate-200"/>;
  if(classQuery.isError)return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">This class could not be loaded.</div>;

  const students=classQuery.data.students;
  const studentIds=new Set(students.map(x=>x.membership.userId));
  const users=usersQuery.data??[];
  const parentCandidates=users.filter(x=>!studentIds.has(x.id));
  const links=(linksQuery.data??[]).filter(x=>studentIds.has(x.studentUserId));
  const userMap=new Map(users.map(x=>[x.id,x]));
  const canSave=Boolean(parentUserId&&studentUserId&&relationship.trim()&&!saveMutation.isPending);

  return <div className="space-y-6">
    <div><Link to={"/teacher/classes/"+classGroupId} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={16}/>Back to class</Link></div>
    <section className="rounded-2xl bg-slate-900 p-6 text-white">
      <p className="text-sm text-slate-300">{classQuery.data.classInfo.classGroup.code}</p>
      <h1 className="mt-1 text-2xl font-bold">Parent & Child Links</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-300">Connect a parent account to a student. Parents only see academic information for children explicitly linked to their account.</p>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2"><Mail size={18}/><h2 className="text-lg font-semibold">Invite a parent</h2></div>
      <p className="mt-1 text-sm text-slate-500">Send a secure Supabase invitation to a new parent account. The parent is linked to the selected student after accepting.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <label className="text-sm"><span className="mb-1 block font-medium">Parent email</span><input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="parent@example.com"/></label>
        <label className="text-sm"><span className="mb-1 block font-medium">Parent name</span><input value={inviteName} onChange={e=>setInviteName(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="Parent name"/></label>
        <label className="text-sm"><span className="mb-1 block font-medium">Student</span><select value={inviteStudentId} onChange={e=>setInviteStudentId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2"><option value="">Select student</option>{students.map(x=><option key={x.membership.userId} value={x.membership.userId}>{x.name} · {x.email}</option>)}</select></label>
        <div className="flex items-end"><button disabled={!inviteEmail.trim()||!inviteStudentId||inviteMutation.isPending} onClick={()=>inviteMutation.mutate()} className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-40">{inviteMutation.isPending?"Sending...":"Send invitation"}</button></div>
      </div>
      {inviteMutation.isSuccess&&<p className="mt-3 text-sm text-emerald-700">Invitation sent. The parent can use the email link to finish account setup.</p>}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2"><Link2 size={18}/><h2 className="text-lg font-semibold">Link a parent</h2></div>
      <p className="mt-1 text-sm text-slate-500">The parent must already have an E&P Learning user account. Account creation/invitation should remain an authenticated admin action.</p>
      {error&&<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="text-sm"><span className="mb-1 block font-medium">Parent account</span><select value={parentUserId} onChange={e=>setParentUserId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2"><option value="">Select parent</option>{parentCandidates.map(x=><option key={x.id} value={x.id}>{x.name} · {x.email}</option>)}</select></label>
        <label className="text-sm"><span className="mb-1 block font-medium">Student</span><select value={studentUserId} onChange={e=>setStudentUserId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2"><option value="">Select student</option>{students.map(x=><option key={x.membership.userId} value={x.membership.userId}>{x.name} · {x.email}</option>)}</select></label>
        <label className="text-sm"><span className="mb-1 block font-medium">Relationship</span><input value={relationship} onChange={e=>setRelationship(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="parent"/><button disabled={!canSave} onClick={()=>saveMutation.mutate()} className="mt-3 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">{saveMutation.isPending?"Saving...":"Link parent"}</button></label>
      </div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 p-5"><Users size={18}/><div><h2 className="text-lg font-semibold">Links for this class</h2><p className="text-sm text-slate-500">{links.length} relationship{links.length===1?"":"s"}</p></div></div>
      {linksQuery.isPending||usersQuery.isPending?<div className="p-5 text-sm text-slate-500">Loading parent links...</div>:links.length?<div className="divide-y">{links.map(link=>{const parent=userMap.get(link.parentUserId);const student=userMap.get(link.studentUserId);return <div key={link.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"><div><p className="font-medium text-slate-900">{parent?.name??"Parent"} <span className="font-normal text-slate-400">→</span> {student?.name??"Student"}</p><p className="text-sm text-slate-500">{parent?.email??"Unknown"} · {link.relationship} · <span className="capitalize">{link.status}</span></p></div><button onClick={()=>statusMutation.mutate({id:link.id,status:link.status==="active"?"inactive":"active"})} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold">{link.status==="active"?<><UserMinus size={15}/>Unlink</>:<><Link2 size={15}/>Reactivate</>}</button></div>})}</div>:<div className="p-8 text-center text-sm text-slate-500">No parent links exist for this class yet.</div>}
    </section>
  </div>;
}
