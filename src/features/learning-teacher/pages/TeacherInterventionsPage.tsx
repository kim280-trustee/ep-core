import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, CalendarDays, ClipboardCheck, Plus, Save, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { learningTeacherService } from "../services/learning-teacher.service";
import { learningInterventionsService } from "@/features/learning-interventions";
import type { LearningInterventionCase, LearningInterventionCategory, LearningInterventionPriority, LearningInterventionStatus } from "@/features/learning-interventions";

const inputClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50";
type CaseDraft = { status: LearningInterventionStatus; priority: LearningInterventionPriority; notes: string; evidenceReference: string; reviewDate: string; outcome: string };

const categoryOptions: Array<{ value: LearningInterventionCategory; labelKey: string }> = [
  { value: "missing_assignment", labelKey: "teacherInterventions.missingAssignment" },
  { value: "assessment_result", labelKey: "teacherInterventions.assessmentResult" },
  { value: "learning_objective", labelKey: "teacherInterventions.learningObjective" },
  { value: "teacher_observation", labelKey: "teacherInterventions.teacherObservation" },
  { value: "other", labelKey: "teacherInterventions.other" },
];

function initialDraft(item: LearningInterventionCase): CaseDraft {
  return { status: item.status, priority: item.priority, notes: item.notes, evidenceReference: item.evidenceReference ?? "", reviewDate: item.reviewDate ?? "", outcome: item.outcome ?? "" };
}

export default function TeacherInterventionsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LearningInterventionStatus>("all");
  const [caseSearch, setCaseSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | LearningInterventionPriority>("all");
  const [studentUserId, setStudentUserId] = useState("");
  const [category, setCategory] = useState<LearningInterventionCategory>("teacher_observation");
  const [priority, setPriority] = useState<LearningInterventionPriority>("normal");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [evidenceReference, setEvidenceReference] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [drafts, setDrafts] = useState<Record<string, CaseDraft>>({});
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const classesQuery = useQuery({
    queryKey: ["learning", "teacher-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });
  const classes = classesQuery.data ?? [];
  const classGroupId = classes.some((item) => item.classGroup.id === selectedClassId) ? selectedClassId : classes[0]?.classGroup.id ?? "";

  const classOverviewQuery = useQuery({
    queryKey: ["learning", "teacher-interventions", "class-overview", user?.id, classGroupId],
    queryFn: () => learningTeacherService.getClassOverview(user!.id, classGroupId),
    enabled: Boolean(user?.id && classGroupId),
  });
  const students = classOverviewQuery.data?.students ?? [];

  const casesQuery = useQuery({
    queryKey: ["learning", "interventions", "cases", classGroupId, statusFilter],
    queryFn: () => learningInterventionsService.listCases(classGroupId, statusFilter === "all" ? undefined : statusFilter),
    enabled: Boolean(user?.id && classGroupId),
  });

  const createMutation = useMutation({
    mutationFn: () => learningInterventionsService.createCase({
      classGroupId,
      studentUserId,
      category,
      priority,
      title: title.trim(),
      notes: notes.trim(),
      evidenceReference: evidenceReference.trim() || undefined,
      reviewDate: reviewDate || undefined,
    }),
    onSuccess: () => {
      setTitle(""); setNotes(""); setEvidenceReference(""); setReviewDate(""); setStudentUserId("");
      setFeedback({ kind: "success", text: t("teacherInterventions.created") });
      void queryClient.invalidateQueries({ queryKey: ["learning", "interventions", "cases", classGroupId] });
    },
    onError: (error: Error) => setFeedback({ kind: "error", text: error.message }),
  });

  const updateMutation = useMutation({
    mutationFn: (input: CaseDraft & { caseId: string }) => learningInterventionsService.updateCase({
      caseId: input.caseId,
      status: input.status,
      priority: input.priority,
      notes: input.notes.trim(),
      evidenceReference: input.evidenceReference.trim() || undefined,
      reviewDate: input.reviewDate || undefined,
      outcome: input.outcome.trim() || undefined,
    }),
    onSuccess: (_result, variables) => {
      setDrafts((previous) => {
        const nextDrafts = { ...previous };
        delete nextDrafts[variables.caseId];
        return nextDrafts;
      });
      setFeedback({ kind: "success", text: t("teacherInterventions.updatedSuccess") });
      void queryClient.invalidateQueries({ queryKey: ["learning", "interventions", "cases", classGroupId] });
    },
    onError: (error: Error) => setFeedback({ kind: "error", text: error.message }),
  });

  const normalizedCaseSearch = caseSearch.trim().toLocaleLowerCase();
  const visibleCases = (casesQuery.data ?? []).filter((item) => {
    const matchesSearch = !normalizedCaseSearch || [item.studentName, item.title, item.notes, item.evidenceReference ?? "", item.className, item.classCode].some((value) => value.toLocaleLowerCase().includes(normalizedCaseSearch));
    return matchesSearch && (priorityFilter === "all" || item.priority === priorityFilter);
  });
  const exportCasesCsv = () => {
    const rows = [["class", "class_code", "student", "title", "category", "priority", "status", "review_date", "evidence_reference", "notes", "outcome"], ...visibleCases.map((item) => [item.className, item.classCode, item.studentName, item.title, item.category, item.priority, item.status, item.reviewDate ?? "", item.evidenceReference ?? "", item.notes, item.outcome ?? ""])];
    const csvCell = (value: string) => {
      const firstNonWhitespace = value.trimStart()[0];
      const safe = firstNonWhitespace && "=+-@".includes(firstNonWhitespace) ? "'" + value : value;
      return '"' + safe.replaceAll('"', '""') + '"';
    };
    const blob = new Blob(["\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "student-support-follow-ups-" + classGroupId + ".csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const getDraft = (item: LearningInterventionCase): CaseDraft => drafts[item.id] ?? initialDraft(item);
  const changeDraft = (item: LearningInterventionCase, patch: Partial<CaseDraft>) => {
    setDrafts((previous) => ({ ...previous, [item.id]: { ...(previous[item.id] ?? initialDraft(item)), ...patch } }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    if (!classGroupId || !studentUserId) { setFeedback({ kind: "error", text: t("teacherInterventions.selectClassStudent") }); return; }
    if (!title.trim() || title.trim().length > 120) { setFeedback({ kind: "error", text: t("teacherInterventions.titleLength") }); return; }
    if (!notes.trim() || notes.trim().length > 3000) { setFeedback({ kind: "error", text: t("teacherInterventions.notesLength") }); return; }
    createMutation.mutate();
  };

  if (!user) return <main className="mx-auto max-w-6xl p-6">{t("teacherInterventions.signIn")}</main>;
  if (classesQuery.isPending) return <main className="mx-auto max-w-6xl p-6"><div className="h-40 animate-pulse rounded-2xl bg-slate-200"/></main>;
  if (classesQuery.isError) return <main className="mx-auto max-w-6xl p-6"><div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{t("teacherInterventions.loadError")}</div></main>;
  if (!classes.length) return <main className="mx-auto max-w-6xl p-6"><div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">{t("teacherInterventions.noClasses")}</div></main>;

  return <main className="mx-auto max-w-6xl space-y-6">
    <header>
      <Link to="/teacher" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={16}/> Teacher workspace</Link>
      <p className="mt-4 text-sm font-semibold text-indigo-700">{t("teacherInterventions.teachingSupport")}</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{t("teacherInterventions.title")}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t("teacherInterventions.intro")}</p>
    </header>

    {feedback && <div role={feedback.kind === "error" ? "alert" : "status"} className={feedback.kind === "error" ? "flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" : "flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"}><AlertCircle size={18} className="shrink-0"/><span>{feedback.text}</span></div>}

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950"><Plus size={18}/> Record a support case</h2><p className="mt-1 text-sm text-slate-500">{t("teacherInterventions.createHelp")}</p></div></div>
      <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">Class
          <select value={classGroupId} onChange={(event) => { setSelectedClassId(event.target.value); setStudentUserId(""); }} className={inputClass}>{classes.map((item) => <option key={item.classGroup.id} value={item.classGroup.id}>{item.classGroup.name} ({item.classGroup.code})</option>)}</select>
        </label>
        <label className="block text-sm font-medium text-slate-700">Student
          <select value={studentUserId} onChange={(event) => setStudentUserId(event.target.value)} required disabled={classOverviewQuery.isPending || !students.length} className={inputClass}><option value="">{t("teacherInterventions.selectStudent")}</option>{students.map((student) => <option key={student.membership.userId} value={student.membership.userId}>{student.name}</option>)}</select>
        </label>
        <label className="block text-sm font-medium text-slate-700">Reason category
          <select value={category} onChange={(event) => setCategory(event.target.value as LearningInterventionCategory)} className={inputClass}>{categoryOptions.map((item) => <option key={item.value} value={item.value}>{t(item.labelKey)}</option>)}</select>
        </label>
        <label className="block text-sm font-medium text-slate-700">Priority
          <select value={priority} onChange={(event) => setPriority(event.target.value as LearningInterventionPriority)} className={inputClass}><option value="low">{t("teacherInterventions.low")}</option><option value="normal">{t("teacherInterventions.normal")}</option><option value="high">{t("teacherInterventions.high")}</option></select>
        </label>
        <label className="block text-sm font-medium text-slate-700 md:col-span-2">Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required className={inputClass} placeholder={t("teacherInterventions.titlePlaceholder")}/>
        </label>
        <label className="block text-sm font-medium text-slate-700">Evidence reference (optional)
          <input value={evidenceReference} onChange={(event) => setEvidenceReference(event.target.value)} maxLength={160} className={inputClass} placeholder={t("teacherInterventions.evidencePlaceholder")}/>
        </label>
        <label className="block text-sm font-medium text-slate-700">Review date (optional)
          <input type="date" value={reviewDate} onChange={(event) => setReviewDate(event.target.value)} className={inputClass}/>
        </label>
        <label className="block text-sm font-medium text-slate-700 md:col-span-2">Evidence and planned support
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={3000} required rows={4} className={inputClass} placeholder={t("teacherInterventions.notesPlaceholder")}/>
        </label>
        <div className="md:col-span-2"><button type="submit" disabled={!classGroupId || !studentUserId || !title.trim() || !notes.trim() || createMutation.isPending} className={buttonClass}><Plus size={16}/>{createMutation.isPending ? "Saving support case…" : "Save support case"}</button></div>
      </form>
      {classOverviewQuery.isError && <p role="alert" className="mt-3 text-sm text-rose-700">{t("teacherInterventions.rosterError")}</p>}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950"><Target size={19}/> Follow-up register</h2><p className="mt-1 text-sm text-slate-500">{t("teacherInterventions.registerHelp")}</p></div>
        <label className="text-sm font-medium text-slate-700">{t("teacherInterventions.status")}<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className={inputClass}><option value="all">{t("teacherInterventions.allStatuses")}</option><option value="open">{t("teacherInterventions.open")}</option><option value="in_progress">{t("teacherInterventions.inProgress")}</option><option value="resolved">{t("teacherInterventions.resolved")}</option></select></label>
      </div>
      <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="text-sm font-medium text-slate-700">{t("teacherInterventions.search")}<input type="search" value={caseSearch} onChange={(event) => setCaseSearch(event.target.value)} placeholder={t("teacherInterventions.searchPlaceholder")} className={inputClass}/></label>
        <label className="text-sm font-medium text-slate-700">{t("teacherInterventions.priority")}<select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as typeof priorityFilter)} className={inputClass}><option value="all">{t("teacherInterventions.allPriorities")}</option><option value="high">{t("teacherInterventions.high")}</option><option value="normal">{t("teacherInterventions.normal")}</option><option value="low">{t("teacherInterventions.low")}</option></select></label>
        <button type="button" onClick={exportCasesCsv} disabled={!visibleCases.length} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-40">{t("teacherInterventions.export")}</button>
        <p className="text-xs text-slate-500 sm:col-span-3" aria-live="polite">{t("teacherInterventions.showing")} {visibleCases.length} {t("teacherInterventions.of")} {casesQuery.data?.length ?? 0} {t("teacherInterventions.cases")}</p>
        {(caseSearch || priorityFilter !== "all") && <button type="button" onClick={() => { setCaseSearch(""); setPriorityFilter("all"); }} className="justify-self-start rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold sm:col-span-3">Clear filters</button>}
      </div>
      {casesQuery.isPending ? <div className="mt-4 h-36 animate-pulse rounded-xl bg-slate-100"/>
      : casesQuery.isError ? <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{t("teacherInterventions.casesLoadError")}</p>
      : !casesQuery.data?.length ? <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center"><ClipboardCheck size={24} className="mx-auto text-slate-400"/><p className="mt-2 font-semibold text-slate-900">{t("teacherInterventions.noCases")}</p><p className="mt-1 text-sm text-slate-500">{t("teacherInterventions.noCasesHelp")}</p></div>
      : !visibleCases.length ? <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center"><p className="font-semibold text-slate-900">{t("teacherInterventions.noMatch")}</p><p className="mt-1 text-sm text-slate-500">{t("teacherInterventions.noMatchHelp")}</p></div>
      : <div className="mt-4 space-y-4">{visibleCases.map((item) => {
        const draft = getDraft(item);
        return <article key={item.id} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.className} ({item.classCode}) · {item.studentName}</p><h3 className="mt-1 text-lg font-semibold text-slate-950">{item.title}</h3><p className="mt-1 text-xs text-slate-500">{t(categoryOptions.find((option) => option.value === item.category)?.labelKey ?? "teacherInterventions.other")} · Updated {new Date(item.updatedAt).toLocaleString()}</p></div><span className={item.status === "resolved" ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800" : item.priority === "high" ? "rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800" : "rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800"}>{item.status === "in_progress" ? "In progress" : item.status} · {item.priority} {t("teacherInterventions.priority")}</span></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">{t("teacherInterventions.followStatus")}<select value={draft.status} onChange={(event) => changeDraft(item, { status: event.target.value as LearningInterventionStatus })} className={inputClass}><option value="open">{t("teacherInterventions.open")}</option><option value="in_progress">{t("teacherInterventions.inProgress")}</option><option value="resolved">{t("teacherInterventions.resolved")}</option></select></label>
            <label className="block text-sm font-medium text-slate-700">{t("teacherInterventions.priority")}<select value={draft.priority} onChange={(event) => changeDraft(item, { priority: event.target.value as LearningInterventionPriority })} className={inputClass}><option value="low">{t("teacherInterventions.low")}</option><option value="normal">{t("teacherInterventions.normal")}</option><option value="high">{t("teacherInterventions.high")}</option></select></label>
            <label className="block text-sm font-medium text-slate-700">Review date<input type="date" value={draft.reviewDate} onChange={(event) => changeDraft(item, { reviewDate: event.target.value })} className={inputClass}/></label>
            <label className="block text-sm font-medium text-slate-700">Evidence reference<input value={draft.evidenceReference} onChange={(event) => changeDraft(item, { evidenceReference: event.target.value })} maxLength={160} className={inputClass}/></label>
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">{t("teacherInterventions.followNotes")}<textarea value={draft.notes} onChange={(event) => changeDraft(item, { notes: event.target.value })} maxLength={3000} rows={3} className={inputClass}/></label>
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">{t("teacherInterventions.outcome")}<textarea value={draft.outcome} onChange={(event) => changeDraft(item, { outcome: event.target.value })} maxLength={2000} rows={2} className={inputClass}/></label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="inline-flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={14}/>{draft.reviewDate ? t("teacherInterventions.reviewOn") + " " + draft.reviewDate : t("teacherInterventions.noReviewDate")}{item.resolvedAt ? " · Resolved " + new Date(item.resolvedAt).toLocaleDateString() : ""}</p><button type="button" disabled={updateMutation.isPending || !draft.notes.trim()} onClick={() => { setFeedback(null); updateMutation.mutate({ caseId: item.id, ...draft }); }} className={buttonClass}><Save size={15}/>{updateMutation.isPending ? "Saving…" : "Save follow-up"}</button></div>
        </article>;
      })}</div>}
    </section>
    <p className="text-xs text-slate-400">{t("teacherInterventions.registerNotice")}</p>
  </main>;
}
