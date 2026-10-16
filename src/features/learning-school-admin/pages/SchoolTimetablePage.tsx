import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useAuthorization } from "@/features/auth/authorization/useAuthorization";
import { learningAcademicService } from "@/features/learning-academic";
import { learningEnrollmentService } from "@/features/learning-enrollment";
import { learningSchoolAdminService } from "../services/learning-school-admin.service";
import { learningTimetableService } from "../services/learning-timetable.service";
import type { LearningTimetableEntry } from "../types/learning-timetable.types";

const fieldClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900";
const buttonClass = "inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const weekdays = [
  { value: 1, label: "Monday" }, { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" }, { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" }, { value: 6, label: "Saturday" }, { value: 7, label: "Sunday" },
];

function errorText(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "The timetable change could not be saved. Check your access and try again.";
}

function csvCell(value: string | null | undefined): string {
  const normalized = value ?? "";
  const safeValue = /^[=+@\-\t\r]/.test(normalized) ? "'" + normalized : normalized;
  return /[",\r\n]/.test(safeValue) ? '"' + safeValue.replace(/"/g, '""') + '"' : safeValue;
}

function downloadTimetableCsv(filename: string, rows: string[][]) {
  const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}

export default function SchoolTimetablePage() {
  const { user, loading: authLoading } = useAuth();
  const authorization = useAuthorization();
  const queryClient = useQueryClient();
  const canManage = authorization.hasPermission("learning.academic.manage");
  const [organizationId, setOrganizationId] = useState("");
  const [classGroupId, setClassGroupId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherUserId, setTeacherUserId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startsAt, setStartsAt] = useState("08:00");
  const [endsAt, setEndsAt] = useState("08:50");
  const [room, setRoom] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const organizationsQuery = useQuery({
    queryKey: ["school-admin", "organizations", user?.id],
    queryFn: () => learningSchoolAdminService.listManageableOrganizations(user!.id),
    enabled: Boolean(user?.id) && !authLoading && !authorization.loading && canManage,
  });
  const organizations = organizationsQuery.data ?? [];
  const activeOrganizationId = organizationId || organizations[0]?.id || "";

  const workspaceQuery = useQuery({
    queryKey: ["school-admin", "timetable-workspace", activeOrganizationId],
    queryFn: async () => {
      const [classes, subjects, eligibleUsers] = await Promise.all([
        learningAcademicService.listClassGroups(activeOrganizationId),
        learningAcademicService.listSubjects(),
        learningSchoolAdminService.listEligibleUsers(activeOrganizationId, user!.tenantId),
      ]);
      return { classes, subjects, eligibleUsers };
    },
    enabled: Boolean(activeOrganizationId && user?.tenantId && canManage),
  });
  const classes = workspaceQuery.data?.classes ?? [];
  const subjects = workspaceQuery.data?.subjects ?? [];
  const eligibleUsers = workspaceQuery.data?.eligibleUsers ?? [];
  const activeClassGroupId = classGroupId && classes.some((item) => item.id === classGroupId)
    ? classGroupId : classes.find((item) => item.status === "active")?.id ?? "";
  const classSubjectsQuery = useQuery({
    queryKey: ["school-admin", "class-subjects", activeOrganizationId, activeClassGroupId],
    queryFn: () => learningAcademicService.listClassSubjects(activeOrganizationId, activeClassGroupId),
    enabled: Boolean(activeOrganizationId && activeClassGroupId && canManage),
  });
  const activeClassSubjects = (classSubjectsQuery.data ?? []).filter((item) => item.status === "active");
  const activeSubjectId = subjectId && activeClassSubjects.some((item) => item.subjectId === subjectId)
    ? subjectId : activeClassSubjects[0]?.subjectId ?? "";
  const rosterQuery = useQuery({
    queryKey: ["school-admin", "roster", activeOrganizationId, activeClassGroupId],
    queryFn: () => learningEnrollmentService.listClassMembers(activeClassGroupId, true),
    enabled: Boolean(activeOrganizationId && activeClassGroupId && canManage),
  });
  const teacherIds = new Set((rosterQuery.data ?? []).filter((item) => item.membershipType === "teacher").map((item) => item.userId));
  const teachers = eligibleUsers.filter((item) => teacherIds.has(item.id));

  const timetableQuery = useQuery({
    queryKey: ["school-admin", "timetable", activeOrganizationId],
    queryFn: () => learningTimetableService.list(activeOrganizationId),
    enabled: Boolean(activeOrganizationId && canManage),
  });
  const entries = timetableQuery.data ?? [];
  const classById = useMemo(() => new Map(classes.map((item) => [item.id, item])), [classes]);
  const subjectById = useMemo(() => new Map(subjects.map((item) => [item.id, item])), [subjects]);
  const userById = useMemo(() => new Map(eligibleUsers.map((item) => [item.id, item])), [eligibleUsers]);

  const activeEntries = entries.filter((entry) => entry.status === "active");
  const scheduledClassCount = new Set(activeEntries.map((entry) => entry.classGroupId)).size;
  const assignedTeacherCount = new Set(activeEntries.flatMap((entry) => entry.teacherUserId ? [entry.teacherUserId] : [])).size;
  const exportTimetable = () => {
    const selectedOrganization = organizations.find((item) => item.id === activeOrganizationId);
    const rows = [
      ["school", selectedOrganization?.name ?? "", "school_code", selectedOrganization?.code ?? ""],
      ["day", "start_time", "end_time", "class_code", "class_name", "subject", "teacher_name", "teacher_email", "room", "status", "notes"],
      ...[...entries].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startsAt.localeCompare(b.startsAt)).map((entry) => {
        const day = weekdays.find((item) => item.value === entry.dayOfWeek)?.label ?? String(entry.dayOfWeek);
        const group = classById.get(entry.classGroupId);
        const subject = subjectById.get(entry.subjectId);
        const teacher = entry.teacherUserId ? userById.get(entry.teacherUserId) : undefined;
        return [day, entry.startsAt.slice(0, 5), entry.endsAt.slice(0, 5), group?.code ?? "", group?.name ?? "", subject?.name ?? "", teacher?.name ?? (entry.teacherUserId ? "Teacher account" : "Not assigned"), teacher?.email ?? "", entry.room ?? "", entry.status, entry.notes ?? ""];
      }),
    ];
    const schoolCode = (selectedOrganization?.code || "school").trim().replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "school";
    downloadTimetableCsv("timetable-" + schoolCode + ".csv", rows);
  };

  const saveMutation = useMutation({
    mutationFn: learningTimetableService.create,
    onSuccess: async () => {
      setErrorMessage("");
      setNotice("Timetable lesson saved.");
      setNotes("");
      await queryClient.invalidateQueries({ queryKey: ["school-admin", "timetable"] });
    },
    onError: (error) => { setNotice(""); setErrorMessage(errorText(error)); },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LearningTimetableEntry["status"] }) => learningTimetableService.setStatus(id, status),
    onSuccess: async () => {
      setErrorMessage("");
      setNotice("Timetable updated.");
      await queryClient.invalidateQueries({ queryKey: ["school-admin", "timetable"] });
    },
    onError: (error) => { setNotice(""); setErrorMessage(errorText(error)); },
  });
  const deleteMutation = useMutation({
    mutationFn: learningTimetableService.delete,
    onSuccess: async () => {
      setErrorMessage("");
      setNotice("Timetable entry deleted.");
      await queryClient.invalidateQueries({ queryKey: ["school-admin", "timetable"] });
    },
    onError: (error) => { setNotice(""); setErrorMessage(errorText(error)); },
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setNotice("");
    if (!activeOrganizationId || !user?.tenantId || !activeClassGroupId || !activeSubjectId) {
      setErrorMessage("Select a school, class, and active class subject before adding a lesson.");
      return;
    }
    if (!startsAt || !endsAt || endsAt <= startsAt) {
      setErrorMessage("The lesson end time must be later than its start time.");
      return;
    }
    const day = Number(dayOfWeek);
    const conflict = entries.find((entry) => {
      if (entry.status !== "active" || entry.dayOfWeek !== day || !overlaps(startsAt, endsAt, entry.startsAt, entry.endsAt)) return false;
      return entry.classGroupId === activeClassGroupId || (teacherUserId !== "" && entry.teacherUserId === teacherUserId);
    });
    if (conflict) {
      const reason = conflict.classGroupId === activeClassGroupId ? "This class already has a lesson during that time." : "This teacher is already scheduled during that time.";
      setErrorMessage(reason + " Adjust the day or time before saving.");
      return;
    }
    try {
      await saveMutation.mutateAsync({
        tenantId: user.tenantId,
        organizationId: activeOrganizationId,
        classGroupId: activeClassGroupId,
        subjectId: activeSubjectId,
        teacherUserId: teacherUserId || null,
        dayOfWeek: day,
        startsAt,
        endsAt,
        room: room.trim() || null,
        notes: notes.trim() || null,
        createdBy: user.id,
      });
    } catch { /* Mutation renders the actionable error. */ }
  };

  if (authLoading || authorization.loading) return <div className="mx-auto max-w-6xl p-8"><div className="h-28 animate-pulse rounded-2xl bg-slate-200" /></div>;
  if (!user) return <div className="mx-auto max-w-4xl p-8">Sign in to manage the school timetable.</div>;
  if (!canManage) return <div className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-950"><h1 className="text-xl font-semibold">School administration access required</h1><p className="mt-2 text-sm">Your account needs the learning.academic.manage permission.</p><Link className="mt-4 inline-block underline" to="/school-admin">Return to school administration</Link></div>;

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-sm text-slate-300">E&P Learning · School administration</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Timetable scheduling</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Schedule class subjects by day and time, assign an active class teacher, and record the room. Conflicting class or teacher times are blocked before saving.</p></div>
          <Link to="/school-admin" className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">School setup</Link>
        </div>
        <label className="mt-5 block max-w-xl text-sm font-medium text-slate-200">School / organization
          <select className="mt-1 w-full rounded-xl border border-white/20 bg-slate-800 px-3 py-2.5 text-sm text-white" value={activeOrganizationId} onChange={(event) => { setOrganizationId(event.target.value); setClassGroupId(""); setSubjectId(""); setTeacherUserId(""); setNotice(""); setErrorMessage(""); }}>
            {organizations.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
          </select>
        </label>
      </header>

      {errorMessage && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}
      {organizationsQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load school memberships. <button className="underline" onClick={() => void organizationsQuery.refetch()}>Retry</button></div>}
      {workspaceQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load classes and subjects. <button className="underline" onClick={() => void workspaceQuery.refetch()}>Retry</button></div>}
      {!organizationsQuery.isPending && organizations.length === 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">No active school organization is linked to this account.</div>}
      {activeOrganizationId && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-950">Add a lesson</h2>
            <p className="mt-1 text-sm text-slate-500">Choose a subject already activated for the class. Teacher assignment is optional if staffing is not yet finalized.</p>
            <form className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={(event) => void submit(event)}>
              <label className="text-sm font-medium text-slate-700">Class<select className={fieldClass} value={activeClassGroupId} onChange={(event) => { setClassGroupId(event.target.value); setSubjectId(""); setTeacherUserId(""); }} required><option value="">Select class</option>{classes.filter((item) => item.status === "active").map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
              <label className="text-sm font-medium text-slate-700">Class subject<select className={fieldClass} value={activeSubjectId} onChange={(event) => setSubjectId(event.target.value)} required><option value="">Select active subject</option>{activeClassSubjects.map((item) => <option key={item.id} value={item.subjectId}>{subjectById.get(item.subjectId)?.name ?? "Subject"}</option>)}</select></label>
              <label className="text-sm font-medium text-slate-700">Teacher<select className={fieldClass} value={teacherUserId} onChange={(event) => setTeacherUserId(event.target.value)}><option value="">Not assigned</option>{teachers.map((item) => <option key={item.id} value={item.id}>{item.name} {item.email ? "(" + item.email + ")" : ""}</option>)}</select></label>
              <label className="text-sm font-medium text-slate-700">Day<select className={fieldClass} value={dayOfWeek} onChange={(event) => setDayOfWeek(event.target.value)}>{weekdays.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}</select></label>
              <label className="text-sm font-medium text-slate-700">Starts at<input className={fieldClass} type="time" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required /></label>
              <label className="text-sm font-medium text-slate-700">Ends at<input className={fieldClass} type="time" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} required /></label>
              <label className="text-sm font-medium text-slate-700">Room / location<input className={fieldClass} value={room} onChange={(event) => setRoom(event.target.value)} maxLength={100} placeholder="e.g. Room 204" /></label>
              <label className="text-sm font-medium text-slate-700 lg:col-span-2">Notes<input className={fieldClass} value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} placeholder="Optional notes" /></label>
              <div className="flex items-end"><button className={buttonClass} type="submit" disabled={saveMutation.isPending || !activeClassGroupId || !activeSubjectId}>{saveMutation.isPending ? "Saving…" : "Add to timetable"}</button></div>
            </form>
            {activeClassGroupId && classSubjectsQuery.isError && <p role="alert" className="mt-3 text-sm text-red-700">Class subjects could not be loaded.</p>}
            {activeClassGroupId && rosterQuery.isError && <p role="alert" className="mt-3 text-sm text-red-700">Class teacher memberships could not be loaded.</p>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-950">Weekly timetable</h2><p className="mt-1 text-sm text-slate-500">Entries are stored per school and shown by weekday and start time.</p></div><div className="flex flex-wrap gap-3"><button type="button" disabled={!entries.length} className="text-sm font-semibold underline disabled:opacity-40" onClick={exportTimetable}>Export timetable CSV</button><button type="button" className="text-sm font-semibold underline" onClick={() => void timetableQuery.refetch()}>Refresh</button></div></div>
            {!timetableQuery.isPending && !timetableQuery.isError && entries.length > 0 && <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Active lessons</p><p className="mt-1 text-2xl font-semibold tabular-nums">{activeEntries.length}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Classes scheduled</p><p className="mt-1 text-2xl font-semibold tabular-nums">{scheduledClassCount}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Teachers assigned</p><p className="mt-1 text-2xl font-semibold tabular-nums">{assignedTeacherCount}</p></div></div>}
            {timetableQuery.isPending && <p className="text-sm text-slate-500">Loading timetable…</p>}
            {timetableQuery.isError && <p role="alert" className="text-sm text-red-700">Timetable could not be loaded. Check the database migration and your school access, then retry.</p>}
            {!timetableQuery.isPending && !timetableQuery.isError && entries.length === 0 && <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No lessons scheduled yet. Add the first lesson above.</p>}
            <div className="space-y-5">
              {weekdays.map((day) => {
                const dayEntries = entries.filter((entry) => entry.dayOfWeek === day.value);
                if (!dayEntries.length) return null;
                return <div key={day.value}><h3 className="mb-2 text-sm font-bold text-slate-700">{day.label}</h3><div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Time</th><th className="px-3 py-2">Class / subject</th><th className="px-3 py-2">Teacher</th><th className="px-3 py-2">Room</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Actions</th></tr></thead><tbody>{dayEntries.map((entry) => <tr key={entry.id} className={entry.status === "cancelled" ? "border-t bg-slate-50 text-slate-400" : "border-t"}><td className="whitespace-nowrap px-3 py-3">{entry.startsAt.slice(0, 5)}–{entry.endsAt.slice(0, 5)}</td><td className="px-3 py-3"><div className="font-semibold">{classById.get(entry.classGroupId)?.name ?? "Class"}</div><div className="text-xs text-slate-500">{subjectById.get(entry.subjectId)?.name ?? "Subject"}</div></td><td className="px-3 py-3">{entry.teacherUserId ? userById.get(entry.teacherUserId)?.name ?? "Teacher" : "Not assigned"}</td><td className="px-3 py-3">{entry.room || "—"}</td><td className="px-3 py-3">{entry.status === "active" ? "Active" : "Cancelled"}</td><td className="px-3 py-3"><div className="flex gap-3 whitespace-nowrap">{entry.status === "active" ? <button type="button" className="font-semibold underline" onClick={() => statusMutation.mutate({ id: entry.id, status: "cancelled" })}>Cancel</button> : <button type="button" className="font-semibold underline" onClick={() => statusMutation.mutate({ id: entry.id, status: "active" })}>Restore</button>}<button type="button" className="font-semibold text-red-700 underline" onClick={() => { if (window.confirm("Delete this timetable entry permanently?")) deleteMutation.mutate(entry.id); }}>Delete</button></div></td></tr>)}</tbody></table></div></div>;
              })}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
