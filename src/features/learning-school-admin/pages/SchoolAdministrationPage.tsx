import { useState } from "react";
import { BookOpen, CalendarDays, GraduationCap, School, Users } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useAuthorization } from "@/features/auth/authorization/useAuthorization";
import { learningAcademicService } from "@/features/learning-academic";
import type {
  AcademicPeriodStatus,
  ClassGroupStatus,
  LearningAcademicYear,
  LearningClassGroup,
  LearningTerm,
} from "@/features/learning-academic";
import { learningEnrollmentService } from "@/features/learning-enrollment";
import { learningSchoolAdminService } from "../services/learning-school-admin.service";

const fieldClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
const buttonClass = "inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButtonClass = "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50";

type YearForm = { curriculumId: string; name: string; code: string; startsOn: string; endsOn: string; status: AcademicPeriodStatus };
type TermForm = { name: string; code: string; sequenceNo: string; startsOn: string; endsOn: string; status: AcademicPeriodStatus };
type ClassForm = { curriculumId: string; gradeLevelId: string; code: string; name: string; status: ClassGroupStatus };

const emptyYearForm: YearForm = { curriculumId: "", name: "", code: "", startsOn: "", endsOn: "", status: "planned" };
const emptyTermForm: TermForm = { name: "", code: "", sequenceNo: "1", startsOn: "", endsOn: "", status: "planned" };
const emptyClassForm: ClassForm = { curriculumId: "", gradeLevelId: "", code: "", name: "", status: "active" };

function errorText(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "The operation could not be completed. Check your access and the entered values, then try again.";
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_32px_-22px_rgba(15,23,42,0.35)]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-teal-50/40 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700">{label}{children}</label>;
}

export default function SchoolAdministrationPage() {
  const { user, loading: authLoading } = useAuth();
  const authorization = useAuthorization();
  const queryClient = useQueryClient();
  const canManage = authorization.hasPermission("learning.academic.manage");

  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedClassGroupId, setSelectedClassGroupId] = useState("");
  const [yearForm, setYearForm] = useState<YearForm>(emptyYearForm);
  const [editingYearId, setEditingYearId] = useState("");
  const [termForm, setTermForm] = useState<TermForm>(emptyTermForm);
  const [editingTermId, setEditingTermId] = useState("");
  const [classForm, setClassForm] = useState<ClassForm>(emptyClassForm);
  const [editingClassId, setEditingClassId] = useState("");
  const [subjectToAdd, setSubjectToAdd] = useState("");
  const [userToAdd, setUserToAdd] = useState("");
  const [membershipType, setMembershipType] = useState<"student" | "teacher">("student");
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");

  const organizationsQuery = useQuery({
    queryKey: ["school-admin", "organizations", user?.id],
    queryFn: () => learningSchoolAdminService.listManageableOrganizations(user!.id),
    enabled: Boolean(user?.id) && !authLoading && !authorization.loading && canManage,
  });
  const organizations = organizationsQuery.data ?? [];
  const organizationId = selectedOrganizationId || organizations[0]?.id || "";

  const workspaceQuery = useQuery({
    queryKey: ["school-admin", "workspace", organizationId],
    queryFn: async () => {
      const [academicYears, curricula, subjects, classGroups] = await Promise.all([
        learningAcademicService.listAcademicYears(organizationId),
        learningAcademicService.listCurricula(),
        learningAcademicService.listSubjects(),
        learningAcademicService.listClassGroups(organizationId),
      ]);
      return { academicYears, curricula, subjects, classGroups };
    },
    enabled: Boolean(organizationId) && canManage,
  });
  const workspace = workspaceQuery.data;
  const academicYears = workspace?.academicYears ?? [];
  const curricula = workspace?.curricula ?? [];
  const subjects = workspace?.subjects ?? [];
  const allClassGroups = workspace?.classGroups ?? [];
  const academicYearId = selectedAcademicYearId && academicYears.some((year) => year.id === selectedAcademicYearId)
    ? selectedAcademicYearId
    : academicYears[0]?.id ?? "";
  const selectedYear = academicYears.find((year) => year.id === academicYearId);
  const classGroups = allClassGroups.filter((group) => group.academicYearId === academicYearId);
  const classGroupId = selectedClassGroupId && classGroups.some((group) => group.id === selectedClassGroupId)
    ? selectedClassGroupId
    : classGroups[0]?.id ?? "";

  const termsQuery = useQuery({
    queryKey: ["school-admin", "terms", organizationId, academicYearId],
    queryFn: () => learningAcademicService.listTerms(organizationId, academicYearId),
    enabled: Boolean(organizationId && academicYearId) && canManage,
  });
  const terms = termsQuery.data ?? [];

  const yearCurriculumId = yearForm.curriculumId || curricula[0]?.id || "";
  const classCurriculumId = classForm.curriculumId || selectedYear?.curriculumId || curricula[0]?.id || "";
  const gradeLevelsQuery = useQuery({
    queryKey: ["school-admin", "grade-levels", classCurriculumId],
    queryFn: () => learningAcademicService.listGradeLevels(classCurriculumId),
    enabled: Boolean(classCurriculumId) && canManage,
  });
  const gradeLevels = gradeLevelsQuery.data ?? [];
  const classGradeLevelId = classForm.gradeLevelId || gradeLevels[0]?.id || "";

  const classSubjectsQuery = useQuery({
    queryKey: ["school-admin", "class-subjects", organizationId, classGroupId],
    queryFn: () => learningAcademicService.listClassSubjects(organizationId, classGroupId),
    enabled: Boolean(organizationId && classGroupId) && canManage,
  });
  const classSubjects = classSubjectsQuery.data ?? [];

  const rosterQuery = useQuery({
    queryKey: ["school-admin", "roster", organizationId, classGroupId],
    queryFn: () => learningEnrollmentService.listClassMembers(classGroupId, true),
    enabled: Boolean(organizationId && classGroupId) && canManage,
  });
  const roster = rosterQuery.data ?? [];
  const rosterUserIds = [...new Set(roster.map((member) => member.userId))];

  const rosterUsersQuery = useQuery({
    queryKey: ["school-admin", "roster-users", user?.tenantId, rosterUserIds.join(",")],
    queryFn: () => learningSchoolAdminService.listUsersByIds(user!.tenantId, rosterUserIds),
    enabled: Boolean(user?.tenantId && rosterUserIds.length) && canManage,
  });

  const eligibleUsersQuery = useQuery({
    queryKey: ["school-admin", "eligible-users", organizationId, user?.tenantId],
    queryFn: () => learningSchoolAdminService.listEligibleUsers(organizationId, user!.tenantId),
    enabled: Boolean(organizationId && user?.tenantId) && canManage,
  });
  const eligibleUsers = eligibleUsersQuery.data ?? [];
  const userById = new Map([...eligibleUsers, ...(rosterUsersQuery.data ?? [])].map((item) => [item.id, item]));
  const existingMembershipKeys = new Set(roster.map((item) => item.userId + ":" + item.membershipType));
  const addableUsers = eligibleUsers.filter((item) => !existingMembershipKeys.has(item.id + ":" + membershipType));
  const activeClassSubjects = classSubjects.filter((item) => item.status === "active");
  const availableSubjects = subjects.filter((subject) => !activeClassSubjects.some((item) => item.subjectId === subject.id));

  const saveMutation = useMutation({
    mutationFn: (action: () => Promise<unknown>) => action(),
    onSuccess: async () => {
      setActionError("");
      setActionNotice("Changes saved successfully.");
      await queryClient.invalidateQueries({ queryKey: ["school-admin"] });
    },
    onError: (error) => { setActionNotice(""); setActionError(errorText(error)); },
  });

  const submitYear = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!organizationId || !yearCurriculumId || !yearForm.name.trim() || !yearForm.code.trim() || !yearForm.startsOn || !yearForm.endsOn) {
      setActionError("Complete every required academic-year field.");
      return;
    }
    if (yearForm.endsOn < yearForm.startsOn) {
      setActionError("The academic-year end date must be on or after the start date.");
      return;
    }
    const values = {
      organizationId,
      curriculumId: yearCurriculumId,
      name: yearForm.name.trim(),
      code: yearForm.code.trim(),
      startsOn: yearForm.startsOn,
      endsOn: yearForm.endsOn,
      status: yearForm.status,
    };
    const wasEditing = Boolean(editingYearId);
    try {
      const saved = await saveMutation.mutateAsync(() => wasEditing
        ? learningAcademicService.updateAcademicYear(editingYearId, values)
        : learningAcademicService.createAcademicYear(values));
      if (!wasEditing) setSelectedAcademicYearId((saved as LearningAcademicYear).id);
      setEditingYearId("");
      setYearForm(emptyYearForm);
    } catch { /* The mutation exposes the actionable error above the forms. */ }
  };

  const submitTerm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!organizationId || !academicYearId || !termForm.name.trim() || !termForm.code.trim() || !termForm.startsOn || !termForm.endsOn) {
      setActionError("Complete every required term field.");
      return;
    }
    const sequenceNo = Number(termForm.sequenceNo);
    if (!Number.isInteger(sequenceNo) || sequenceNo < 1) {
      setActionError("Term sequence must be a positive whole number.");
      return;
    }
    if (termForm.endsOn < termForm.startsOn) {
      setActionError("The term end date must be on or after the start date.");
      return;
    }
    if (selectedYear && (termForm.startsOn < selectedYear.startsOn || termForm.endsOn > selectedYear.endsOn)) {
      setActionError("Term dates must fall within " + selectedYear.name + ".");
      return;
    }
    const values = {
      organizationId,
      academicYearId,
      name: termForm.name.trim(),
      code: termForm.code.trim(),
      sequenceNo,
      startsOn: termForm.startsOn,
      endsOn: termForm.endsOn,
      status: termForm.status,
    };
    const wasEditing = Boolean(editingTermId);
    try {
      await saveMutation.mutateAsync(() => wasEditing
        ? learningAcademicService.updateTerm(editingTermId, values)
        : learningAcademicService.createTerm(values));
      setEditingTermId("");
      setTermForm(emptyTermForm);
    } catch { /* The mutation exposes the actionable error above the forms. */ }
  };

  const submitClass = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!organizationId || !academicYearId || !classCurriculumId || !classGradeLevelId || !classForm.code.trim() || !classForm.name.trim()) {
      setActionError("Complete every required class field.");
      return;
    }
    const values = {
      organizationId,
      academicYearId,
      curriculumId: classCurriculumId,
      gradeLevelId: classGradeLevelId,
      code: classForm.code.trim(),
      name: classForm.name.trim(),
      status: classForm.status,
    };
    const wasEditing = Boolean(editingClassId);
    try {
      const saved = await saveMutation.mutateAsync(() => wasEditing
        ? learningAcademicService.updateClassGroup(editingClassId, values)
        : learningAcademicService.createClassGroup(values));
      if (!wasEditing) setSelectedClassGroupId((saved as LearningClassGroup).id);
      setEditingClassId("");
      setClassForm(emptyClassForm);
    } catch { /* The mutation exposes the actionable error above the forms. */ }
  };

  const editYear = (year: LearningAcademicYear) => {
    setSelectedAcademicYearId(year.id);
    setYearForm({ curriculumId: year.curriculumId, name: year.name, code: year.code, startsOn: year.startsOn, endsOn: year.endsOn, status: year.status });
    setEditingYearId(year.id);
    setActionError("");
    setActionNotice("");
  };

  const editTerm = (term: LearningTerm) => {
    setTermForm({ name: term.name, code: term.code, sequenceNo: String(term.sequenceNo), startsOn: term.startsOn, endsOn: term.endsOn, status: term.status });
    setEditingTermId(term.id);
    setActionError("");
    setActionNotice("");
  };

  const editClass = (group: LearningClassGroup) => {
    setSelectedClassGroupId(group.id);
    setClassForm({ curriculumId: group.curriculumId, gradeLevelId: group.gradeLevelId, code: group.code, name: group.name, status: group.status });
    setEditingClassId(group.id);
    setActionError("");
    setActionNotice("");
  };

  if (authLoading || authorization.loading) {
    return <div className="mx-auto max-w-7xl p-8"><div className="h-32 animate-pulse rounded-2xl bg-slate-200" /></div>;
  }
  if (!user) return <div className="mx-auto max-w-4xl p-8">Sign in to access school administration.</div>;
  if (!canManage) return <div className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-950"><h1 className="text-xl font-semibold">School administration access required</h1><p className="mt-2 text-sm">Your account needs the learning.academic.manage permission to manage academic setup and class rosters.</p><Link className="mt-4 inline-block text-sm font-semibold underline" to="/teacher">Return to teaching workspace</Link></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-teal-900 p-5 text-white shadow-xl shadow-indigo-950/10 sm:p-7 lg:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full border-[28px] border-white/[0.05]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-1/3 -z-10 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-inner sm:flex"><School size={28} strokeWidth={1.7} /></div>
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-100"><GraduationCap size={14} /> E&P Learning · School administration</p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">School setup</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/90">Build a clear academic structure for your school — from year and term dates to class subjects and trusted teacher and student rosters.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/school-admin/analytics" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"><CalendarDays size={16} /> School analytics</Link>
            <Link to="/teacher" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-950 transition hover:bg-teal-50"><BookOpen size={16} /> Teacher workspace</Link>
          </div>
        </div>
        <div className="mt-6 grid gap-4 border-t border-white/15 pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className="block max-w-2xl text-sm font-semibold text-indigo-100">School / organization
            <select className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950/30 px-3.5 py-3 text-sm font-medium text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-300/25" value={organizationId} onChange={(event) => { setSelectedOrganizationId(event.target.value); setSelectedAcademicYearId(""); setSelectedClassGroupId(""); setEditingYearId(""); setEditingTermId(""); setEditingClassId(""); setYearForm(emptyYearForm); setTermForm(emptyTermForm); setClassForm(emptyClassForm); setActionError(""); setActionNotice(""); }}>
              {organizations.map((organization) => <option key={organization.id} value={organization.id} className="bg-white text-slate-900">{organization.name} ({organization.code})</option>)}
            </select>
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-300/15 text-teal-100"><Users size={20} /></div>
            <div><p className="text-xs font-medium text-indigo-100">Selected academic year</p><p className="mt-0.5 text-sm font-bold">{selectedYear?.name ?? "Choose an academic year"}</p></div>
          </div>
        </div>
      </header>

      {actionError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><div className="flex items-start justify-between gap-3"><p>{actionError}</p><button type="button" className="font-semibold" onClick={() => setActionError("")}>Dismiss</button></div></div>}
      {actionNotice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><div className="flex items-start justify-between gap-3"><p>{actionNotice}</p><button type="button" className="font-semibold" onClick={() => setActionNotice("")}>Dismiss</button></div></div>}
      {termsQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Terms could not be loaded. <button type="button" className="font-semibold underline" onClick={() => void termsQuery.refetch()}>Retry</button></div>}
      {classSubjectsQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Class subjects could not be loaded. <button type="button" className="font-semibold underline" onClick={() => void classSubjectsQuery.refetch()}>Retry</button></div>}
      {rosterQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">The class roster could not be loaded. <button type="button" className="font-semibold underline" onClick={() => void rosterQuery.refetch()}>Retry</button></div>}
      {eligibleUsersQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">School accounts could not be loaded. <button type="button" className="font-semibold underline" onClick={() => void eligibleUsersQuery.refetch()}>Retry</button></div>}
      {rosterUsersQuery.isError && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Roster membership records loaded, but some account details could not be resolved. <button type="button" className="font-semibold underline" onClick={() => void rosterUsersQuery.refetch()}>Retry account lookup</button></div>}
      {organizationsQuery.isPending && <div className="rounded-xl bg-white p-5 text-sm text-slate-500">Loading your schools…</div>}
      {organizationsQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">Could not load your school memberships. <button type="button" className="font-semibold underline" onClick={() => void organizationsQuery.refetch()}>Try again</button></div>}
      {!organizationsQuery.isPending && !organizationsQuery.isError && !organizations.length && <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">No active school organization is linked to this account. An organization owner must add your account to the school before setup can continue.</div>}

      {organizationId && (
        <>
          {workspaceQuery.isPending && <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />}
          {workspaceQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">Could not load academic setup. <button type="button" className="font-semibold underline" onClick={() => void workspaceQuery.refetch()}>Try again</button></div>}
          {workspace && (
            <>
              <Section title="1. Academic years" description="Create and edit the school year, curriculum, dates, and planning status.">
                <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={submitYear}>
                  <Field label="Curriculum"><select className={fieldClass} required value={yearCurriculumId} onChange={(event) => setYearForm((form) => ({ ...form, curriculumId: event.target.value }))}><option value="">Choose curriculum</option>{curricula.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></Field>
                  <Field label="Year name"><input className={fieldClass} required maxLength={100} value={yearForm.name} onChange={(event) => setYearForm((form) => ({ ...form, name: event.target.value }))} placeholder="Academic Year 2026" /></Field>
                  <Field label="Year code"><input className={fieldClass} required maxLength={40} value={yearForm.code} onChange={(event) => setYearForm((form) => ({ ...form, code: event.target.value }))} placeholder="AY-2026" /></Field>
                  <Field label="Status"><select className={fieldClass} value={yearForm.status} onChange={(event) => setYearForm((form) => ({ ...form, status: event.target.value as AcademicPeriodStatus }))}><option value="planned">Planned</option><option value="active">Active</option><option value="closed">Closed</option></select></Field>
                  <Field label="Starts on"><input className={fieldClass} type="date" required value={yearForm.startsOn} onChange={(event) => setYearForm((form) => ({ ...form, startsOn: event.target.value }))} /></Field>
                  <Field label="Ends on"><input className={fieldClass} type="date" required value={yearForm.endsOn} onChange={(event) => setYearForm((form) => ({ ...form, endsOn: event.target.value }))} /></Field>
                  <div className="flex items-end gap-2 md:col-span-2"><button className={buttonClass} type="submit" disabled={saveMutation.isPending || !curricula.length}>{saveMutation.isPending ? "Saving…" : editingYearId ? "Save academic year" : "Create academic year"}</button>{editingYearId && <button className={secondaryButtonClass} type="button" onClick={() => { setEditingYearId(""); setYearForm(emptyYearForm); }}>Cancel edit</button>}</div>
                </form>
                <div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Year</th><th className="px-3 py-3">Dates</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{academicYears.map((year) => <tr key={year.id} className={year.id === academicYearId ? "bg-slate-50" : ""}><td className="px-3 py-3"><p className="font-semibold text-slate-900">{year.name}</p><p className="text-xs text-slate-500">{year.code}</p></td><td className="px-3 py-3 text-slate-600">{year.startsOn} – {year.endsOn}</td><td className="px-3 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">{year.status}</span></td><td className="px-3 py-3"><div className="flex flex-wrap gap-2"><button type="button" className={secondaryButtonClass} onClick={() => { setSelectedAcademicYearId(year.id); setSelectedClassGroupId(""); setEditingTermId(""); setTermForm(emptyTermForm); setEditingClassId(""); setClassForm(emptyClassForm); setSubjectToAdd(""); setUserToAdd(""); }}>Select</button><button type="button" className={secondaryButtonClass} onClick={() => editYear(year)}>Edit</button></div></td></tr>)}</tbody></table>{!academicYears.length && <p className="py-4 text-sm text-slate-500">No academic years have been created for this school.</p>}</div>
              </Section>

              <Section title="2. Terms" description={selectedYear ? "Manage terms within " + selectedYear.name + "." : "Create an academic year before adding terms."}>
                {!selectedYear ? <p className="text-sm text-slate-500">Select or create an academic year to continue.</p> : <>
                  <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={submitTerm}>
                    <Field label="Term name"><input className={fieldClass} required maxLength={100} value={termForm.name} onChange={(event) => setTermForm((form) => ({ ...form, name: event.target.value }))} placeholder="Term 1" /></Field>
                    <Field label="Term code"><input className={fieldClass} required maxLength={40} value={termForm.code} onChange={(event) => setTermForm((form) => ({ ...form, code: event.target.value }))} placeholder="T1" /></Field>
                    <Field label="Sequence"><input className={fieldClass} type="number" min={1} step={1} required value={termForm.sequenceNo} onChange={(event) => setTermForm((form) => ({ ...form, sequenceNo: event.target.value }))} /></Field>
                    <Field label="Status"><select className={fieldClass} value={termForm.status} onChange={(event) => setTermForm((form) => ({ ...form, status: event.target.value as AcademicPeriodStatus }))}><option value="planned">Planned</option><option value="active">Active</option><option value="closed">Closed</option></select></Field>
                    <Field label="Starts on"><input className={fieldClass} type="date" required value={termForm.startsOn} onChange={(event) => setTermForm((form) => ({ ...form, startsOn: event.target.value }))} /></Field>
                    <Field label="Ends on"><input className={fieldClass} type="date" required value={termForm.endsOn} onChange={(event) => setTermForm((form) => ({ ...form, endsOn: event.target.value }))} /></Field>
                    <div className="flex items-end gap-2 md:col-span-2"><button className={buttonClass} type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving…" : editingTermId ? "Save term" : "Create term"}</button>{editingTermId && <button className={secondaryButtonClass} type="button" onClick={() => { setEditingTermId(""); setTermForm(emptyTermForm); }}>Cancel edit</button>}</div>
                  </form>
                  {termsQuery.isPending ? <p className="mt-4 text-sm text-slate-500">Loading terms…</p> : <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">{terms.map((term) => <div key={term.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-semibold text-slate-900">{term.sequenceNo}. {term.name} <span className="text-xs font-normal text-slate-500">({term.code})</span></p><p className="mt-1 text-xs text-slate-500">{term.startsOn} – {term.endsOn} · {term.status}</p></div><button type="button" className={secondaryButtonClass} onClick={() => editTerm(term)}>Edit</button></div>)}{!termsQuery.isPending && !termsQuery.isError && !terms.length && <p className="p-4 text-sm text-slate-500">No terms exist for this academic year yet.</p>}</div>}
                </>}
              </Section>

              <Section title="3. Classes and subjects" description="Create classes for the selected year, then attach the subjects taught to each class.">
                {!selectedYear ? <p className="text-sm text-slate-500">Create or select an academic year first.</p> : <>
                  <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={submitClass}>
                    <Field label="Curriculum"><select className={fieldClass} required value={classCurriculumId} onChange={(event) => setClassForm((form) => ({ ...form, curriculumId: event.target.value, gradeLevelId: "" }))}><option value="">Choose curriculum</option>{curricula.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
                    <Field label="Grade level"><select className={fieldClass} required value={classGradeLevelId} onChange={(event) => setClassForm((form) => ({ ...form, gradeLevelId: event.target.value }))}><option value="">Choose grade</option>{gradeLevels.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></Field>
                    <Field label="Class code"><input className={fieldClass} required maxLength={40} value={classForm.code} onChange={(event) => setClassForm((form) => ({ ...form, code: event.target.value }))} placeholder="M1-MEP-A" /></Field>
                    <Field label="Class name"><input className={fieldClass} required maxLength={100} value={classForm.name} onChange={(event) => setClassForm((form) => ({ ...form, name: event.target.value }))} placeholder="M1 MEP English" /></Field>
                    <Field label="Status"><select className={fieldClass} value={classForm.status} onChange={(event) => setClassForm((form) => ({ ...form, status: event.target.value as ClassGroupStatus }))}><option value="planned">Planned</option><option value="active">Active</option><option value="archived">Archived</option></select></Field>
                    <div className="flex items-end gap-2 md:col-span-2"><button className={buttonClass} type="submit" disabled={saveMutation.isPending || !gradeLevels.length}>{saveMutation.isPending ? "Saving…" : editingClassId ? "Save class" : "Create class"}</button>{editingClassId && <button className={secondaryButtonClass} type="button" onClick={() => { setEditingClassId(""); setClassForm(emptyClassForm); }}>Cancel edit</button>}</div>
                  </form>
                  <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">{classGroups.map((group) => <div key={group.id} className={"flex flex-wrap items-center justify-between gap-3 p-4 " + (group.id === classGroupId ? "bg-slate-50" : "")}><div><p className="font-semibold text-slate-900">{group.name}</p><p className="mt-1 text-xs text-slate-500">{group.code} · {group.status}</p></div><div className="flex gap-2"><button type="button" className={secondaryButtonClass} onClick={() => { setSelectedClassGroupId(group.id); setEditingClassId(""); setClassForm(emptyClassForm); setSubjectToAdd(""); setUserToAdd(""); }}>Select</button><button type="button" className={secondaryButtonClass} onClick={() => editClass(group)}>Edit</button></div></div>)}{!classGroups.length && <p className="p-4 text-sm text-slate-500">No classes exist for this year yet.</p>}</div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h3 className="font-semibold text-slate-900">{classGroups.find((group) => group.id === classGroupId)?.name ?? "Select a class"} · Subjects</h3>
                      {classGroupId ? <>
                        <div className="mt-3 flex flex-wrap gap-2"><select aria-label="Subject to add" className={fieldClass + " min-w-0 flex-1"} value={subjectToAdd} onChange={(event) => setSubjectToAdd(event.target.value)}><option value="">Choose subject</option>{availableSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>)}</select><button type="button" className={buttonClass} disabled={!subjectToAdd || saveMutation.isPending} onClick={async () => { const id = subjectToAdd; try { await saveMutation.mutateAsync(() => learningAcademicService.activateClassSubject(organizationId, classGroupId, id)); setSubjectToAdd(""); } catch { /* The mutation displays the failure above the forms. */ } }}>Add subject</button></div>
                        <div className="mt-4 space-y-2">{classSubjectsQuery.isPending ? <p className="text-sm text-slate-500">Loading subjects…</p> : classSubjects.map((item) => { const subject = subjects.find((candidate) => candidate.id === item.subjectId); return <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"><div><p className="text-sm font-medium text-slate-800">{subject?.name ?? "Unknown subject"}</p><p className="text-xs text-slate-500">{item.status}</p></div><button type="button" className={secondaryButtonClass} disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(() => learningAcademicService.updateClassSubjectStatus(item.id, item.status === "active" ? "archived" : "active"))}>{item.status === "active" ? "Archive" : "Reactivate"}</button></div>; })}{!classSubjectsQuery.isPending && !classSubjectsQuery.isError && !classSubjects.length && <p className="text-sm text-slate-500">No subjects assigned yet.</p>}</div>
                      </> : <p className="mt-3 text-sm text-slate-500">Select a class to manage subjects.</p>}
                    </div>
                  </div>
                </>}
              </Section>

              <Section title="4. Teacher and student rosters" description="Assign existing school accounts to the selected class. New accounts must be created through the school's approved user-provisioning workflow first.">
                {!classGroupId ? <p className="text-sm text-slate-500">Create or select a class first.</p> : <>
                  <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
                    <Field label="School user"><select className={fieldClass} value={userToAdd} onChange={(event) => setUserToAdd(event.target.value)}><option value="">Choose an existing school account</option>{addableUsers.map((item) => <option key={item.id} value={item.id}>{item.name}{item.email ? " · " + item.email : ""}</option>)}</select></Field>
                    <Field label="Class role"><select className={fieldClass} value={membershipType} onChange={(event) => { setMembershipType(event.target.value as "student" | "teacher"); setUserToAdd(""); }}><option value="student">Student</option><option value="teacher">Teacher</option></select></Field>
                    <div className="flex items-end"><button type="button" className={buttonClass} disabled={!userToAdd || saveMutation.isPending} onClick={async () => { const selectedUserId = userToAdd; try { await saveMutation.mutateAsync(() => learningEnrollmentService.addMember({ tenantId: user.tenantId, organizationId, classGroupId, userId: selectedUserId, membershipType, status: "active" })); setUserToAdd(""); } catch { /* The mutation displays the failure above the forms. */ } }}>Add to class</button></div>
                  </div>
                  <div className="mt-5 overflow-x-auto">
                    {rosterQuery.isPending ? <p className="py-4 text-sm text-slate-500">Loading roster…</p> : roster.length ? (
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">School account</th><th className="px-3 py-3">Class role</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Action</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                          {roster.map((member) => {
                            const account = userById.get(member.userId);
                            return <tr key={member.id}>
                              <td className="px-3 py-3"><p className="font-semibold text-slate-900">{account?.name ?? "Account details unavailable"}</p><p className="text-xs text-slate-500">{account?.email || (rosterUsersQuery.isPending ? "Loading account details…" : "Contact your school administrator to verify this account")}</p></td>
                              <td className="px-3 py-3 capitalize">{member.membershipType}</td>
                              <td className="px-3 py-3 capitalize">{member.status}</td>
                              <td className="px-3 py-3">{member.status === "active"
                                ? <button type="button" className={secondaryButtonClass} disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(() => learningEnrollmentService.removeMember(member.id))}>Deactivate</button>
                                : <button type="button" className={secondaryButtonClass} disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(() => learningEnrollmentService.updateMember(member.id, { status: "active", joinedAt: new Date().toISOString() }))}>Reactivate</button>}</td>
                            </tr>;
                          })}
                        </tbody>
                      </table>
                    ) : <p className="py-4 text-sm text-slate-500">No teachers or students are assigned to this class yet.</p>}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">Only active class memberships are used by teacher and student workflows. Deactivation preserves the membership record and history.</p>
                </>}
              </Section>
            </>
          )}
        </>
      )}
    </div>
  );
}
