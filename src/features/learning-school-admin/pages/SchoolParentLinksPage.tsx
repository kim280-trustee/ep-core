import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
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
  if (!user) return <div className="mx-auto max-w-4xl p-8">Sign in to manage parent links.</div>;
  if (!canManage) return <div className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-950"><h1 className="text-xl font-semibold">School administration access required</h1><p className="mt-2 text-sm">Your account needs the learning.academic.manage permission.</p><Link className="mt-4 inline-block underline" to="/school-admin">Return to school administration</Link></div>;

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-sm text-slate-300">E&P Learning · School administration</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Parent and student links</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Manage which parent accounts can view a child's progress. Invitations are sent through the existing parent-invitation service; no authentication account is created in the browser.</p></div>
          <Link to="/school-admin" className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">School setup</Link>
        </div>
        <label className="mt-5 block max-w-xl text-sm font-medium text-slate-200">School / organization
          <select className="mt-1 w-full rounded-xl border border-white/20 bg-slate-800 px-3 py-2.5 text-sm text-white" value={organizationId} onChange={(event) => { setSelectedOrganizationId(event.target.value); setParentUserId(""); setStudentUserId(""); setInviteStudentId(""); setNotice(""); setErrorMessage(""); }}>
            {organizations.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
          </select>
        </label>
      </header>

      {errorMessage && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}
      {organizationsQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load manageable schools. <button className="underline" onClick={() => void organizationsQuery.refetch()}>Retry</button></div>}
      {workspaceQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load parent links and eligible accounts. Confirm the parent-link migration and your school access, then retry. <button className="ml-2 underline" onClick={() => void workspaceQuery.refetch()}>Retry</button></div>}

      {organizationId && <>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">Link an existing account</h2>
          <p className="mt-1 text-sm text-slate-500">Only accounts in this organization's membership or existing parent links are listed. Students must have an active student class membership.</p>
          <form className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={submitLink}>
            <label className="text-sm font-medium text-slate-700">Parent account<select className={fieldClass} value={parentUserId} onChange={(event) => setParentUserId(event.target.value)} required><option value="">Select parent</option>{parents.map((item) => <option key={item.id} value={item.id}>{item.name}{item.email ? " (" + item.email + ")" : ""}</option>)}</select></label>
            <label className="text-sm font-medium text-slate-700">Student<select className={fieldClass} value={studentUserId} onChange={(event) => setStudentUserId(event.target.value)} required><option value="">Select student</option>{students.map((item) => <option key={item.id} value={item.id}>{item.name}{item.email ? " (" + item.email + ")" : ""}</option>)}</select></label>
            <label className="text-sm font-medium text-slate-700">Relationship<input className={fieldClass} value={relationship} onChange={(event) => setRelationship(event.target.value)} maxLength={60} required placeholder="e.g. mother, father, guardian" /></label>
            <div className="flex items-end"><button className={buttonClass} type="submit" disabled={linkMutation.isPending || statusMutation.isPending || workspaceQuery.isPending || !parentUserId || !studentUserId}>{linkMutation.isPending || statusMutation.isPending ? "Saving…" : "Save parent link"}</button></div>
          </form>
          {!workspaceQuery.isPending && students.length === 0 && <p className="mt-3 text-sm text-amber-800">No active students are available in this organization. Add students to a class before linking parent accounts.</p>}
          {!workspaceQuery.isPending && parents.length === 0 && <p className="mt-3 text-sm text-amber-800">No existing parent-capable accounts are available. Use the invitation form below for a parent who needs an account.</p>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">Invite a parent who needs an account</h2>
          <p className="mt-1 text-sm text-slate-500">The server-side invitation flow handles account invitation and linking. The parent must accept using the invited email address.</p>
          <form className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={(event) => { event.preventDefault(); setErrorMessage(""); setNotice(""); void inviteMutation.mutateAsync().catch(() => undefined); }}>
            <label className="text-sm font-medium text-slate-700">Parent full name<input className={fieldClass} value={parentName} onChange={(event) => setParentName(event.target.value)} maxLength={120} autoComplete="name" required /></label>
            <label className="text-sm font-medium text-slate-700">Parent email<input className={fieldClass} type="email" value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} maxLength={254} autoComplete="email" required /></label>
            <label className="text-sm font-medium text-slate-700">Student<select className={fieldClass} value={inviteStudentId} onChange={(event) => setInviteStudentId(event.target.value)} required><option value="">Select student</option>{students.map((item) => <option key={item.id} value={item.id}>{item.name}{item.email ? " (" + item.email + ")" : ""}</option>)}</select></label>
            <label className="text-sm font-medium text-slate-700">Relationship<input className={fieldClass} value={inviteRelationship} onChange={(event) => setInviteRelationship(event.target.value)} maxLength={60} required placeholder="e.g. mother, father, guardian" /></label>
            <div className="flex items-end"><button className={buttonClass} type="submit" disabled={inviteMutation.isPending || workspaceQuery.isPending || !students.length}>{inviteMutation.isPending ? "Sending invitation…" : "Invite parent"}</button></div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-950">Parent links</h2><p className="mt-1 text-sm text-slate-500">{activeLinks.length} active of {links.length} saved links</p></div><button type="button" className="text-sm font-semibold underline" onClick={() => void workspaceQuery.refetch()}>Refresh</button></div>
          {workspaceQuery.isPending && <p className="text-sm text-slate-500">Loading parent links…</p>}
          {!workspaceQuery.isPending && !workspaceQuery.isError && !links.length && <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No parent links exist for this school yet.</p>}
          {!workspaceQuery.isError && links.length > 0 && <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Parent</th><th className="px-3 py-2">Student</th><th className="px-3 py-2">Relationship</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Actions</th></tr></thead><tbody>{links.map((link: LearningParentStudentLink) => <tr key={link.id} className="border-t"><td className="px-3 py-3"><div className="font-semibold">{userById.get(link.parentUserId)?.name ?? "Parent account"}</div><div className="text-xs text-slate-500">{userById.get(link.parentUserId)?.email ?? ""}</div></td><td className="px-3 py-3"><div className="font-semibold">{userById.get(link.studentUserId)?.name ?? "Student account"}</div><div className="text-xs text-slate-500">{userById.get(link.studentUserId)?.email ?? ""}</div></td><td className="px-3 py-3">{link.relationship}</td><td className="px-3 py-3">{link.status === "active" ? "Active" : "Inactive"}</td><td className="px-3 py-3"><button type="button" className="font-semibold underline" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: link.id, status: link.status === "active" ? "inactive" : "active" })}>{link.status === "active" ? "Deactivate" : "Reactivate"}</button></td></tr>)}</tbody></table></div>}
        </section>
      </>}
    </main>
  );
}
