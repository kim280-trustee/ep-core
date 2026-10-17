import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useAuthorization } from "@/features/auth/authorization/useAuthorization";
import { learningAcademicService } from "@/features/learning-academic";
import { learningSchoolAdminService } from "../services/learning-school-admin.service";
import { learningEnrollmentService } from "@/features/learning-enrollment";

const fieldClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900";
const buttonClass = "inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50";

function errorText(error: unknown) {
  return error instanceof Error && error.message ? error.message : "The student invitation could not be sent. Check your school access and try again.";
}

export default function SchoolStudentAdmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const authorization = useAuthorization();
  const queryClient = useQueryClient();
  const canManage = authorization.hasPermission("learning.academic.manage");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [classGroupId, setClassGroupId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const organizationsQuery = useQuery({
    queryKey: ["school-admin", "organizations", user?.id],
    queryFn: () => learningSchoolAdminService.listManageableOrganizations(user!.id),
    enabled: Boolean(user?.id) && !authLoading && !authorization.loading && canManage,
  });
  const organizations = organizationsQuery.data ?? [];
  const organizationId = selectedOrganizationId || organizations[0]?.id || "";
  const classesQuery = useQuery({
    queryKey: ["school-admin", "admissions-classes", organizationId],
    queryFn: () => learningAcademicService.listClassGroups(organizationId),
    enabled: Boolean(organizationId && canManage),
  });
  const classes = (classesQuery.data ?? []).filter((item) => item.status === "active");

  const inviteMutation = useMutation({
    mutationFn: () => {
      if (!organizationId || !classGroupId || !studentName.trim() || !studentEmail.trim()) {
        throw new Error("Enter the student's name and email, then select a class.");
      }
      return learningEnrollmentService.inviteStudent({
        organizationId,
        classGroupId,
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim().toLowerCase(),
      });
    },
    onSuccess: async (result) => {
      setErrorMessage("");
      setNotice(result.sent
        ? "Invitation email sent. The student must open the email and accept using the same email address. The class roster is updated after acceptance."
        : "The request completed, but email delivery was not confirmed. Check the invitation status before retrying.");
      setStudentName("");
      setStudentEmail("");
      await queryClient.invalidateQueries({ queryKey: ["school-admin"] });
    },
    onError: (error) => {
      setNotice("");
      setErrorMessage(errorText(error));
    },
  });

  if (authLoading || authorization.loading) {
    return <main className="mx-auto max-w-4xl p-8"><div className="h-28 animate-pulse rounded-2xl bg-slate-200" /></main>;
  }
  if (!user) return <main className="mx-auto max-w-4xl p-8">Sign in to manage student admissions.</main>;
  if (!canManage) return <main className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-950"><h1 className="text-xl font-semibold">School administration access required</h1><p className="mt-2 text-sm">Your account needs the learning.academic.manage permission.</p><Link className="mt-4 inline-block underline" to="/school-admin">Return to school administration</Link></main>;

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <header className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-sm text-slate-300">E&P Learning · School administration</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">New student admissions</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Invite a student into an active class. The account is provisioned by the server after the student accepts the email invitation; the browser never creates authentication accounts.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/school-admin" className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">School setup</Link>
          <Link to="/school-admin/parents" className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">Parent links</Link>
        </div>
      </header>

      {errorMessage && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}
      {organizationsQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load schools. Check your access and retry.</div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-950">Invite a new student</h2>
        <p className="mt-1 text-sm text-slate-500">The invitation expires after seven days. Existing accounts should be enrolled from the school roster instead.</p>
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); setErrorMessage(""); setNotice(""); void inviteMutation.mutateAsync().catch(() => undefined); }}>
          <label className="text-sm font-medium text-slate-700">School / organization
            <select className={fieldClass} value={organizationId} onChange={(event) => { setSelectedOrganizationId(event.target.value); setClassGroupId(""); setErrorMessage(""); setNotice(""); }} required>
              <option value="">Select school</option>
              {organizations.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Class
            <select className={fieldClass} value={classGroupId} onChange={(event) => setClassGroupId(event.target.value)} required>
              <option value="">Select active class</option>
              {classes.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Student full name
            <input className={fieldClass} value={studentName} onChange={(event) => setStudentName(event.target.value)} maxLength={120} autoComplete="name" required />
          </label>
          <label className="text-sm font-medium text-slate-700">Student email
            <input className={fieldClass} type="email" value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} maxLength={254} autoComplete="email" required />
          </label>
          <div className="sm:col-span-2">
            {classesQuery.isPending && <p className="mb-3 text-sm text-slate-500">Loading active classes…</p>}
            {classesQuery.isError && <p role="alert" className="mb-3 text-sm text-red-700">Could not load classes for this school.</p>}
            {!classesQuery.isPending && !classesQuery.isError && classes.length === 0 && <p className="mb-3 text-sm text-amber-800">Create an active class before inviting a student.</p>}
            <button className={buttonClass} type="submit" disabled={inviteMutation.isPending || classesQuery.isPending || !classes.length || !organizationId || !classGroupId}>
              {inviteMutation.isPending ? "Sending invitation…" : "Send student invitation"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
