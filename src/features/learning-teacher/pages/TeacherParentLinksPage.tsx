import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Link2, Mail, UserMinus, Users } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { learningParentService } from "@/features/learning-parent";
import { learningTeacherService } from "../services/learning-teacher.service";

export default function TeacherParentLinksPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
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
    onError:(e)=>setError(e instanceof Error?e.message:t("teacherParentLinks.saveError")),
  });
  const inviteMutation=useMutation({
    mutationFn:()=>learningParentService.inviteParent({organizationId,parentEmail:inviteEmail,parentName:inviteName,studentUserId:inviteStudentId,relationship}),
    onSuccess:()=>{setInviteEmail("");setInviteName("");setInviteStudentId("");setError("");},
    onError:(e)=>setError(e instanceof Error?e.message:t("teacherParentLinks.inviteError")),
  });
  const statusMutation=useMutation({
    mutationFn:({id,status}:{id:string;status:"active"|"inactive"})=>learningParentService.setLinkStatus(id,status),
    onError:(e)=>setError(e instanceof Error?e.message:t("teacherParentLinks.updateError")),
    onSuccess:()=>{setError("");void queryClient.invalidateQueries({queryKey:["learning","parent-links",organizationId]});},
  });

  if(!user)return <div className="rounded-2xl border bg-white p-6">{t("teacherParentLinks.signIn")}</div>;
  if(classQuery.isPending)return <div className="h-64 animate-pulse rounded-2xl bg-slate-200"/>;
  if(classQuery.isError)return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">{t("teacherParentLinks.classLoadError")}</div>;

  const students=classQuery.data.students;
  const studentIds=new Set(students.map(x=>x.membership.userId));
  const users=usersQuery.data??[];
  const parentCandidates=users.filter(x=>!studentIds.has(x.id));
  const links=(linksQuery.data??[]).filter(x=>studentIds.has(x.studentUserId));
  const userMap=new Map(users.map(x=>[x.id,x]));
  const canSave=Boolean(parentUserId&&studentUserId&&relationship.trim()&&!saveMutation.isPending);

  return <div className="space-y-6">
    <div><Link to={"/teacher/classes/"+classGroupId} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={16}/>{t("teacherParentLinks.backToClass")}</Link></div>
    <section className="rounded-2xl bg-slate-900 p-6 text-white">
      <p className="text-sm text-slate-300">{classQuery.data.classInfo.classGroup.code}</p>
      <h1 className="mt-1 text-2xl font-bold">{t("teacherParentLinks.title")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-300">{t("teacherParentLinks.intro")}</p>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2"><Mail size={18}/><h2 className="text-lg font-semibold">{t("teacherParentLinks.inviteTitle")}</h2></div>
      <p className="mt-1 text-sm text-slate-500">{t("teacherParentLinks.inviteHelp")}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <label className="text-sm"><span className="mb-1 block font-medium">{t("teacherParentLinks.parentEmail")}</span><input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder={t("teacherParentLinks.emailPlaceholder")}/></label>
        <label className="text-sm"><span className="mb-1 block font-medium">{t("teacherParentLinks.parentName")}</span><input value={inviteName} onChange={e=>setInviteName(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder={t("teacherParentLinks.namePlaceholder")}/></label>
        <label className="text-sm"><span className="mb-1 block font-medium">{t("teacherParentLinks.student")}</span><select value={inviteStudentId} onChange={e=>setInviteStudentId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2"><option value="">{t("teacherParentLinks.selectStudent")}</option>{students.map(x=><option key={x.membership.userId} value={x.membership.userId}>{x.name} · {x.email}</option>)}</select></label>
        <div className="flex items-end"><button disabled={!inviteEmail.trim()||!inviteStudentId||inviteMutation.isPending} onClick={()=>inviteMutation.mutate()} className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-40">{inviteMutation.isPending?t("teacherParentLinks.sending"):t("teacherParentLinks.sendInvitation")}</button></div>
      </div>
      {inviteMutation.isSuccess&&<p className="mt-3 text-sm text-emerald-700">{t("teacherParentLinks.invitationSent")}</p>}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2"><Link2 size={18}/><h2 className="text-lg font-semibold">{t("teacherParentLinks.linkTitle")}</h2></div>
      <p className="mt-1 text-sm text-slate-500">{t("teacherParentLinks.linkHelp")}</p>
      {error&&<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="text-sm"><span className="mb-1 block font-medium">{t("teacherParentLinks.parentAccount")}</span><select value={parentUserId} onChange={e=>setParentUserId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2"><option value="">{t("teacherParentLinks.selectParent")}</option>{parentCandidates.map(x=><option key={x.id} value={x.id}>{x.name} · {x.email}</option>)}</select></label>
        <label className="text-sm"><span className="mb-1 block font-medium">{t("teacherParentLinks.student")}</span><select value={studentUserId} onChange={e=>setStudentUserId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2"><option value="">{t("teacherParentLinks.selectStudent")}</option>{students.map(x=><option key={x.membership.userId} value={x.membership.userId}>{x.name} · {x.email}</option>)}</select></label>
        <label className="text-sm"><span className="mb-1 block font-medium">{t("teacherParentLinks.relationship")}</span><input value={relationship} onChange={e=>setRelationship(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder={t("teacherParentLinks.relationshipPlaceholder")}/><button disabled={!canSave} onClick={()=>saveMutation.mutate()} className="mt-3 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">{saveMutation.isPending?t("teacherParentLinks.saving"):t("teacherParentLinks.linkParent")}</button></label>
      </div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 p-5"><Users size={18}/><div><h2 className="text-lg font-semibold">{t("teacherParentLinks.classLinks")}</h2><p className="text-sm text-slate-500">{links.length} {t("teacherParentLinks.relationships")}</p></div></div>
      {linksQuery.isPending||usersQuery.isPending?<div className="p-5 text-sm text-slate-500">{t("teacherParentLinks.loading")}</div>:links.length?<div className="divide-y">{links.map(link=>{const parent=userMap.get(link.parentUserId);const student=userMap.get(link.studentUserId);return <div key={link.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"><div><p className="font-medium text-slate-900">{parent?.name??t("teacherParentLinks.parentFallback")} <span className="font-normal text-slate-400">→</span> {student?.name??t("teacherParentLinks.studentFallback")}</p><p className="text-sm text-slate-500">{parent?.email??t("teacherParentLinks.unknown")} · {link.relationship} · <span className="capitalize">{link.status}</span></p></div><button onClick={()=>statusMutation.mutate({id:link.id,status:link.status==="active"?"inactive":"active"})} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold">{link.status==="active"?<><UserMinus size={15}/>{t("teacherParentLinks.unlink")}</>:<><Link2 size={15}/>{t("teacherParentLinks.reactivate")}</>}</button></div>})}</div>:<div className="p-8 text-center text-sm text-slate-500">{t("teacherParentLinks.empty")}</div>}
    </section>
  </div>;
}
