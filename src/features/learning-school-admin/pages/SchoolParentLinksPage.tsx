import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { LearningLanguageSelector } from "@/features/learning-shared/components/LearningLanguageSelector";
import { useAuthorization } from "@/features/auth/authorization/useAuthorization";
import { learningParentService } from "@/features/learning-parent";
import type { LearningParentStudentLink } from "@/features/learning-parent";
import { learningSchoolAdminService } from "../services/learning-school-admin.service";

const fieldClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900";
const buttonClass = "inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50";

function errorText(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "The parent link could not be saved. Check your school access and try again.";
}

export default function SchoolParentLinksPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const authorization = useAuthorization();
  const queryClient = useQueryClient();
  const canManage = authorization.hasPermission("learning.academic.manage");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [parentUserId, setParentUserId] = useState("");
  const [studentUserId, setStudentUserId] = useState("");
  const [relationship, setRelationship] = useState("parent");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [inviteStudentId, setInviteStudentId] = useState("");
  const [inviteRelationship, setInviteRelationship] = useState("parent");
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const organizationsQuery = useQuery({
    queryKey: ["school-admin", "organizations", user?.id],
    queryFn: () => learningSchoolAdminService.listManageableOrganizations(user!.id),
    enabled: Boolean(user?.id) && !authLoading && !authorization.loading && canManage,
  });
  const organizations = organizationsQuery.data ?? [];
  const organizationId = selectedOrganizationId || organizations[0]?.id || "";

  const workspaceQuery = useQuery({
    queryKey: ["school-admin", "parent-links-workspace", organizationId],
    queryFn: async () => {
      const [users, students, links] = await Promise.all([
        learningParentService.listOrganizationUsers(organizationId),
        learningParentService.listOrganizationStudents(organizationId),
        learningParentService.listLinks(organizationId),
      ]);
      return { users, students, links };
    },
    enabled: Boolean(organizationId && canManage),
  });
  const users = useMemo(() => workspaceQuery.data?.users ?? [], [workspaceQuery.data?.users]);
  const students = useMemo(() => workspaceQuery.data?.students ?? [], [workspaceQuery.data?.students]);
  const links = useMemo(() => workspaceQuery.data?.links ?? [], [workspaceQuery.data?.links]);
  const userById = useMemo(() => new Map(users.map((item) => [item.id, item])), [users]);
  const studentIds = useMemo(() => new Set(students.map((item) => item.id)), [students]);
  const existingParentIds = useMemo(() => new Set(links.map((item) => item.parentUserId)), [links]);
  const parents = users.filter((item) => !studentIds.has(item.id) || existingParentIds.has(item.id));
  const activeLinks = links.filter((item) => item.status === "active");
  const existingPair = links.some((item) => item.parentUserId === parentUserId && item.studentUserId === studentUserId);

  const refreshLinks = async () => {
    await queryClient.invalidateQueries({ queryKey: ["school-admin", "parent-links-workspace", organizationId] });
    await queryClient.invalidateQueries({ queryKey: ["learning-parent"] });
  };
  const linkMutation = useMutation({
    mutationFn: () => {
      if (!user?.id || !organizationId || !parentUserId || !studentUserId) throw new Error("Select a parent account and an active student.");
      if (parentUserId === studentUserId) throw new Error("A parent account cannot be linked to itself as a student.");
      return learningParentService.createLink({ organizationId, parentUserId, studentUserId, relationship, createdBy: user.id });
    },
    onSuccess: async () => {
      setErrorMessage("");
      setNotice("Parent and student accounts linked successfully.");
      await refreshLinks();
    },
    onError: (error) => { setNotice(""); setErrorMessage(errorText(error)); },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "inactive" }) => learningParentService.setLinkStatus(id, status),
    onSuccess: async (_result, input) => {
      setErrorMessage("");
      setNotice(input.status === "active" ? "Parent link reactivated." : "Parent link deactivated.");
      await refreshLinks();
    },
    onError: (error) => { setNotice(""); setErrorMessage(errorText(error)); },
  });
  const inviteMutation = useMutation({
    mutationFn: () => {
      if (!organizationId || !inviteStudentId || !parentName.trim() || !parentEmail.trim()) {
        throw new Error("Enter the parent's name and email, then select a student.");
      }
      return learningParentService.inviteParent({
        organizationId,
        parentEmail: parentEmail.trim(),
        parentName: parentName.trim(),
        studentUserId: inviteStudentId,
        relationship: inviteRelationship.trim() || "parent",
      });
    },
    onSuccess: async (result) => {
      setErrorMessage("");
      setNotice(result.sent
        ? "Parent invitation submitted successfully. The parent must use the invitation email and sign in with that email address."
        : "The invitation request was accepted, but the service did not confirm that an email was sent. Check the invitation status before retrying.");
      setParentName("");
      setParentEmail("");
      await refreshLinks();
    },
    onError: (error) => { setNotice(""); setErrorMessage(errorText(error)); },
  });

  const submitLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setNotice("");
    if (existingPair) {
      const current = links.find((item) => item.parentUserId === parentUserId && item.studentUserId === studentUserId);
      if (current?.status === "active") {
        setErrorMessage("These accounts are already linked.");
        return;
      }
      if (current?.status === "inactive") {
        void statusMutation.mutateAsync({ id: current.id, status: "active" }).catch(() => undefined);
        return;
      }
    }
    void linkMutation.mutateAsync().catch(() => undefined);
  };

  if (authLoading || authorization.loading) return <div className="mx-auto max-w-6xl p-8"><div className="h-28 animate-pulse rounded-2xl bg-slate-200" /></div>;
  if (!user) return <div className="mx-auto max-w-4xl p-8">{t("schoolAdmin.signInParentLinks")}</div>;
  if (!canManage) return <div className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-950"><h1 className="text-xl font-semibold">{t("schoolAdmin.accessRequired")}</h1><p className="mt-2 text-sm">{t("schoolAdmin.attendancePermission")}</p><Link className="mt-4 inline-block underline" to="/school-admin">{t("schoolAdmin.return")}</Link></div>;

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <div className="flex justify-end"><LearningLanguageSelector compact /></div>
      <header className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-sm text-slate-300">E&P Learning · {t("schoolAdmin.setup")}</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t("schoolAdmin.parentStudentLinks")}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{t("schoolAdmin.parentLinksDescription")}</p></div>
          <Link to="/school-admin" className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">{t("schoolAdmin.setup")}</Link>
        </div>
        <label className="mt-5 block max-w-xl text-sm font-medium text-slate-200">{t("schoolAdmin.schoolOrganization")}
          <select className="mt-1 w-full rounded-xl border border-white/20 bg-slate-800 px-3 py-2.5 text-sm text-white" value={organizationId} onChange={(event) => { setSelectedOrganizationId(event.target.value); setParentUserId(""); setStudentUserId(""); setInviteStudentId(""); setNotice(""); setErrorMessage(""); }}>
            {organizations.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
          </select>
        </label>
      </header>

      {errorMessage && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}
      {organizationsQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{t("schoolAdmin.schoolListLoadError")} <button className="underline" onClick={() => void organizationsQuery.refetch()}>Retry</button></div>}
      {workspaceQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{t("schoolAdmin.parentWorkspaceLoadError")} <button className="ml-2 underline" onClick={() => void workspaceQuery.refetch()}>Retry</button></div>}

      {organizationId && <>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">{t("schoolAdmin.linkExistingAccount")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("schoolAdmin.existingAccountHelp")}</p>
          <form className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={submitLink}>
            <label className="text-sm font-medium text-slate-700">{t("schoolAdmin.parentAccount")}<select className={fieldClass} value={parentUserId} onChange={(event) => setParentUserId(event.target.value)} required><option value="">{t("schoolAdmin.selectParent")}</option>{parents.map((item) => <option key={item.id} value={item.id}>{item.name}{item.email ? " (" + item.email + ")" : ""}</option>)}</select></label>
            <label className="text-sm font-medium text-slate-700">{t("schoolAdmin.student")}<select className={fieldClass} value={studentUserId} onChange={(event) => setStudentUserId(event.target.value)} required><option value="">{t("schoolAdmin.selectStudent")}</option>{students.map((item) => <option key={item.id} value={item.id}>{item.name}{item.email ? " (" + item.email + ")" : ""}</option>)}</select></label>
            <label className="text-sm font-medium text-slate-700">{t("schoolAdmin.relationship")}<input className={fieldClass} value={relationship} onChange={(event) => setRelationship(event.target.value)} maxLength={60} required placeholder={t("schoolAdmin.relationshipPlaceholder")} /></label>
            <div className="flex items-end"><button className={buttonClass} type="submit" disabled={linkMutation.isPending || statusMutation.isPending || workspaceQuery.isPending || !parentUserId || !studentUserId}>{linkMutation.isPending || statusMutation.isPending ? t("schoolAdmin.saving") : t("schoolAdmin.saveParentLink")}</button></div>
          </form>
          {!workspaceQuery.isPending && students.length === 0 && <p className="mt-3 text-sm text-amber-800">{t("schoolAdmin.noActiveStudents")}</p>}
          {!workspaceQuery.isPending && parents.length === 0 && <p className="mt-3 text-sm text-amber-800">{t("schoolAdmin.noParentAccounts")}</p>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">{t("schoolAdmin.inviteParent")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("schoolAdmin.parentInvitationHelp")}</p>
          <form className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={(event) => { event.preventDefault(); setErrorMessage(""); setNotice(""); void inviteMutation.mutateAsync().catch(() => undefined); }}>
            <label className="text-sm font-medium text-slate-700">{t("schoolAdmin.parentFullName")}<input className={fieldClass} value={parentName} onChange={(event) => setParentName(event.target.value)} maxLength={120} autoComplete="name" required /></label>
            <label className="text-sm font-medium text-slate-700">{t("schoolAdmin.parentEmail")}<input className={fieldClass} type="email" value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} maxLength={254} autoComplete="email" required /></label>
            <label className="text-sm font-medium text-slate-700">{t("schoolAdmin.student")}<select className={fieldClass} value={inviteStudentId} onChange={(event) => setInviteStudentId(event.target.value)} required><option value="">{t("schoolAdmin.selectStudent")}</option>{students.map((item) => <option key={item.id} value={item.id}>{item.name}{item.email ? " (" + item.email + ")" : ""}</option>)}</select></label>
            <label className="text-sm font-medium text-slate-700">{t("schoolAdmin.relationship")}<input className={fieldClass} value={inviteRelationship} onChange={(event) => setInviteRelationship(event.target.value)} maxLength={60} required placeholder={t("schoolAdmin.relationshipPlaceholder")} /></label>
            <div className="flex items-end"><button className={buttonClass} type="submit" disabled={inviteMutation.isPending || workspaceQuery.isPending || !students.length}>{inviteMutation.isPending ? t("schoolAdmin.sendingInvitation") : t("schoolAdmin.inviteParent")}</button></div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-950">{t("learning.parentLinks")}</h2><p className="mt-1 text-sm text-slate-500">{activeLinks.length} {t("schoolAdmin.activeOf")} {links.length} {t("schoolAdmin.savedLinks")}</p></div><button type="button" className="text-sm font-semibold underline" onClick={() => void workspaceQuery.refetch()}>{t("schoolAdmin.refresh")}</button></div>
          {workspaceQuery.isPending && <p className="text-sm text-slate-500">{t("schoolAdmin.loadingParentLinks")}</p>}
          {!workspaceQuery.isPending && !workspaceQuery.isError && !links.length && <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">{t("schoolAdmin.noParentLinks")}</p>}
          {!workspaceQuery.isError && links.length > 0 && <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">{t("schoolAdmin.parent")}</th><th className="px-3 py-2">{t("schoolAdmin.student")}</th><th className="px-3 py-2">{t("schoolAdmin.relationship")}</th><th className="px-3 py-2">{t("schoolAdmin.status")}</th><th className="px-3 py-2">{t("schoolAdmin.actions")}</th></tr></thead><tbody>{links.map((link: LearningParentStudentLink) => <tr key={link.id} className="border-t"><td className="px-3 py-3"><div className="font-semibold">{userById.get(link.parentUserId)?.name ?? t("schoolAdmin.parentAccountFallback")}</div><div className="text-xs text-slate-500">{userById.get(link.parentUserId)?.email ?? ""}</div></td><td className="px-3 py-3"><div className="font-semibold">{userById.get(link.studentUserId)?.name ?? t("schoolAdmin.studentAccountFallback")}</div><div className="text-xs text-slate-500">{userById.get(link.studentUserId)?.email ?? ""}</div></td><td className="px-3 py-3">{link.relationship}</td><td className="px-3 py-3">{link.status === "active" ? t("schoolAdmin.active") : t("schoolAdmin.inactive")}</td><td className="px-3 py-3"><button type="button" className="font-semibold underline" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: link.id, status: link.status === "active" ? "inactive" : "active" })}>{link.status === "active" ? t("schoolAdmin.deactivate") : t("schoolAdmin.reactivate")}</button></td></tr>)}</tbody></table></div>}
        </section>
      </>}
    </main>
  );
}
