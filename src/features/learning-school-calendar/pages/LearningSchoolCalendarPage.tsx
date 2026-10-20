import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock3, Plus, Send, AlertCircle } from "lucide-react";
import { useAuth } from "@/core/auth";
import { useAuthorization } from "@/features/auth/authorization/useAuthorization";
import { learningAcademicService } from "@/features/learning-academic";
import { learningSchoolCalendarService } from "../services/learning-school-calendar.service";
import type { LearningCalendarEvent, LearningCalendarEventType } from "../types/learning-school-calendar.types";

const fieldClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50";
const eventTypes: Array<{ value: LearningCalendarEventType; label: string }> = [
  { value: "school_event", label: "School event" },
  { value: "holiday", label: "Holiday / closure" },
  { value: "examination", label: "Examination" },
  { value: "assessment_deadline", label: "Assessment deadline" },
];
function localDateValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function dateLabel(value: string): string {
  return new Date(value + "T12:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
function eventRange(event: LearningCalendarEvent): string {
  return event.startDate === event.endDate ? dateLabel(event.startDate) : dateLabel(event.startDate) + " – " + dateLabel(event.endDate);
}

export default function LearningSchoolCalendarPage() {
  const { user } = useAuth();
  const authorization = useAuthorization();
  const queryClient = useQueryClient();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [selectedClassGroupId, setSelectedClassGroupId] = useState("");
  const [startDate, setStartDate] = useState(() => localDateValue(new Date()));
  const [endDate, setEndDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 90); return localDateValue(d); });
  const [eventType, setEventType] = useState<LearningCalendarEventType>("school_event");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventStartDate, setEventStartDate] = useState(() => localDateValue(new Date()));
  const [eventEndDate, setEventEndDate] = useState(() => localDateValue(new Date()));
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const organizationsQuery = useQuery({
    queryKey: ["learning-calendar", "manageable-organizations", user?.id],
    queryFn: () => learningSchoolCalendarService.listManageableOrganizations(),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });
  const organizations = organizationsQuery.data ?? [];
  const organizationId = organizations.some((item) => item.id === selectedOrganizationId)
    ? selectedOrganizationId : organizations[0]?.id ?? "";
  const organization = organizations.find((item) => item.id === organizationId);
  const canManage = Boolean(organizationId && authorization.hasPermission("learning.academic.manage"));

  const yearsQuery = useQuery({
    queryKey: ["learning-calendar", "years", organizationId],
    queryFn: () => learningAcademicService.listAcademicYears(organizationId),
    enabled: Boolean(organizationId && canManage),
  });
  const years = yearsQuery.data ?? [];
  const academicYearId = years.some((item) => item.id === selectedAcademicYearId)
    ? selectedAcademicYearId : years.find((item) => item.status === "active")?.id ?? years[0]?.id ?? "";
  const termsQuery = useQuery({
    queryKey: ["learning-calendar", "terms", organizationId, academicYearId],
    queryFn: () => learningAcademicService.listTerms(organizationId, academicYearId),
    enabled: Boolean(organizationId && academicYearId && canManage),
  });
  const terms = termsQuery.data ?? [];
  const termId = terms.some((item) => item.id === selectedTermId) ? selectedTermId : "";
  const classesQuery = useQuery({
    queryKey: ["learning-calendar", "classes", organizationId, academicYearId],
    queryFn: () => learningAcademicService.listClassGroups(organizationId, academicYearId || undefined),
    enabled: Boolean(organizationId && canManage),
  });
  const classes = (classesQuery.data ?? []).filter((item) => item.status === "active");
  const classGroupId = classes.some((item) => item.id === selectedClassGroupId) ? selectedClassGroupId : "";

  const manageableEventsQuery = useQuery({
    queryKey: ["learning-calendar", "manage-events", organizationId, startDate, endDate],
    queryFn: () => learningSchoolCalendarService.listManageableEvents(organizationId, startDate, endDate),
    enabled: Boolean(user?.id && canManage && startDate && endDate && startDate <= endDate),
  });
  const visibleEventsQuery = useQuery({
    queryKey: ["learning-calendar", "visible-events", user?.id, startDate, endDate],
    queryFn: () => learningSchoolCalendarService.listVisibleEvents(startDate, endDate),
    enabled: Boolean(user?.id && !canManage && startDate && endDate && startDate <= endDate),
  });
  const events = canManage ? manageableEventsQuery.data ?? [] : visibleEventsQuery.data ?? [];
  const eventsQuery = canManage ? manageableEventsQuery : visibleEventsQuery;

  const createMutation = useMutation({
    mutationFn: () => learningSchoolCalendarService.createDraft({
      organizationId,
      academicYearId: academicYearId || undefined,
      termId: termId || undefined,
      classGroupId: classGroupId || undefined,
      eventType,
      title: title.trim(),
      description: description.trim(),
      startDate: eventStartDate,
      endDate: eventEndDate,
      isAllDay,
      startTime: isAllDay ? undefined : startTime,
      endTime: isAllDay ? undefined : endTime,
    }),
    onSuccess: () => {
      setTitle(""); setDescription("");
      setFeedback({ kind: "success", text: "Calendar event saved as a draft. Publish it below when the details are ready." });
      void queryClient.invalidateQueries({ queryKey: ["learning-calendar", "manage-events", organizationId] });
    },
    onError: (error: Error) => setFeedback({ kind: "error", text: error.message }),
  });
  const publishMutation = useMutation({
    mutationFn: (eventId: string) => learningSchoolCalendarService.publish(eventId),
    onSuccess: () => {
      setFeedback({ kind: "success", text: "Calendar event published to authorised school, class, student and parent views." });
      void queryClient.invalidateQueries({ queryKey: ["learning-calendar", "manage-events", organizationId] });
      void queryClient.invalidateQueries({ queryKey: ["learning-calendar", "visible-events"] });
    },
    onError: (error: Error) => setFeedback({ kind: "error", text: error.message }),
  });

  const cancelMutation = useMutation({
    mutationFn: (eventId: string) => learningSchoolCalendarService.cancel(eventId),
    onSuccess: () => {
      setFeedback({ kind: "success", text: "Calendar event cancelled. It is no longer shown to parents, students or teachers." });
      void queryClient.invalidateQueries({ queryKey: ["learning-calendar", "manage-events", organizationId] });
      void queryClient.invalidateQueries({ queryKey: ["learning-calendar", "visible-events"] });
    },
    onError: (error: Error) => setFeedback({ kind: "error", text: error.message }),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    if (!organizationId) { setFeedback({ kind: "error", text: "Select a manageable school first." }); return; }
    if (!title.trim() || title.trim().length > 120) { setFeedback({ kind: "error", text: "Title must contain 1–120 characters." }); return; }
    if (eventEndDate < eventStartDate) { setFeedback({ kind: "error", text: "End date must be on or after start date." }); return; }
    if (!isAllDay && (endTime <= startTime && eventStartDate === eventEndDate)) { setFeedback({ kind: "error", text: "End time must be after start time." }); return; }
    createMutation.mutate();
  };

  if (!user) return <main className="mx-auto max-w-6xl p-6">Sign in to view the school calendar.</main>;

  return <main className="mx-auto max-w-6xl space-y-6">
    <header>
      <p className="text-sm font-semibold text-indigo-700">E&P Learning · School operations</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Academic calendar and exams</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">View published school events, holidays, examinations and assessment deadlines. Authorised school owners and managers can prepare and publish events for the whole school or a class. Notices appear in the portal; this does not send email, SMS or LINE reminders.</p>
    </header>

    {feedback && <div role={feedback.kind === "error" ? "alert" : "status"} className={feedback.kind === "error" ? "flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" : "flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"}>{feedback.kind === "error" ? <AlertCircle size={18}/> : <CheckCircle2 size={18}/>}<span>{feedback.text}</span></div>}

    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {canManage && <label className="block text-sm font-medium text-slate-700">School<select value={organizationId} onChange={(event) => { setSelectedOrganizationId(event.target.value); setSelectedAcademicYearId(""); setSelectedTermId(""); setSelectedClassGroupId(""); }} className={fieldClass}>{organizations.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>}
        <label className="block text-sm font-medium text-slate-700">From<input type="date" value={startDate} max={endDate} onChange={(event) => setStartDate(event.target.value)} className={fieldClass}/></label>
        <label className="block text-sm font-medium text-slate-700">Through<input type="date" value={endDate} min={startDate} onChange={(event) => setEndDate(event.target.value)} className={fieldClass}/></label>
      </div>
      {organization && <p className="mt-3 text-xs text-slate-500">School timezone: {organization.timezone}. Event dates and times are entered as school-local values.</p>}
      {organizationsQuery.isError && <p role="status" className="mt-3 text-xs text-slate-500">School-management options are unavailable for this account. Published events are still loaded using your authorised class/parent access.</p>}
    </section>

    {canManage && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950"><Plus size={18}/> Create calendar event</h2>
      <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">Event type<select value={eventType} onChange={(event) => setEventType(event.target.value as LearningCalendarEventType)} className={fieldClass}>{eventTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label className="block text-sm font-medium text-slate-700">Academic year (optional)<select value={academicYearId} onChange={(event) => { setSelectedAcademicYearId(event.target.value); setSelectedTermId(""); setSelectedClassGroupId(""); }} className={fieldClass}><option value="">Not linked to an academic year</option>{years.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="block text-sm font-medium text-slate-700">Term (optional)<select value={termId} onChange={(event) => setSelectedTermId(event.target.value)} disabled={!academicYearId} className={fieldClass}><option value="">No term selected</option>{terms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="block text-sm font-medium text-slate-700">Audience<select value={classGroupId} onChange={(event) => setSelectedClassGroupId(event.target.value)} className={fieldClass}><option value="">Whole school</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
        <label className="block text-sm font-medium text-slate-700 md:col-span-2">Title<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required className={fieldClass} placeholder="e.g. M1 English midterm examination"/></label>
        <label className="block text-sm font-medium text-slate-700 md:col-span-2">Details<textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={3000} rows={3} className={fieldClass} placeholder="Exam coverage, room, materials or event information."/></label>
        <label className="block text-sm font-medium text-slate-700">Start date<input type="date" value={eventStartDate} onChange={(event) => { setEventStartDate(event.target.value); if (event.target.value > eventEndDate) setEventEndDate(event.target.value); }} required className={fieldClass}/></label>
        <label className="block text-sm font-medium text-slate-700">End date<input type="date" value={eventEndDate} min={eventStartDate} onChange={(event) => setEventEndDate(event.target.value)} required className={fieldClass}/></label>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700 md:col-span-2"><input type="checkbox" checked={isAllDay} onChange={(event) => setIsAllDay(event.target.checked)} className="h-4 w-4"/> All-day / date-only event</label>
        {!isAllDay && <><label className="block text-sm font-medium text-slate-700">Start time<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required className={fieldClass}/></label><label className="block text-sm font-medium text-slate-700">End time<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} required className={fieldClass}/></label></>}
        <div className="md:col-span-2"><button type="submit" disabled={!organizationId || !title.trim() || createMutation.isPending || eventEndDate < eventStartDate} className={buttonClass}><Plus size={16}/>{createMutation.isPending ? "Saving draft…" : "Save draft event"}</button></div>
      </form>
      {yearsQuery.isError || termsQuery.isError || classesQuery.isError ? <p role="status" className="mt-3 text-xs text-amber-700">Academic-year, term or class options could not all be loaded. Refresh before publishing a linked event.</p> : null}
    </section>}

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950"><CalendarDays size={19}/> Calendar events</h2><p className="mt-1 text-sm text-slate-500">{canManage ? "Drafts and published events for the selected school." : "Only published events for your school/class memberships or linked children are shown."}</p></div><span className="text-xs text-slate-500">{events.length} events</span></div>
      {!startDate || !endDate || startDate > endDate ? <p role="alert" className="mt-4 text-sm text-rose-700">Choose a valid date range.</p>
      : eventsQuery.isPending ? <div className="mt-4 h-36 animate-pulse rounded-xl bg-slate-100"/>
      : eventsQuery.isError ? <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Calendar events could not be loaded. Refresh the page and verify your access.</p>
      : !events.length ? <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center"><CalendarDays size={24} className="mx-auto text-slate-400"/><p className="mt-2 font-semibold text-slate-900">No events in this date range</p><p className="mt-1 text-sm text-slate-500">Try a wider date range or check again after your school publishes its calendar.</p></div>
      : <div className="mt-4 space-y-3">{events.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{eventTypes.find((type) => type.value === item.eventType)?.label ?? item.eventType}{item.organizationName ? " · " + item.organizationName : ""}</p><h3 className="mt-1 text-lg font-semibold text-slate-950">{item.title}</h3><p className="mt-1 text-sm text-slate-600">{eventRange(item)}{!item.isAllDay && item.startTime && item.endTime ? " · " + item.startTime.slice(0, 5) + "–" + item.endTime.slice(0, 5) : " · All day"}</p><p className="mt-1 text-xs text-slate-500">{item.className ? "Class: " + item.className : "School-wide"}{item.termName ? " · " + item.termName : ""}{item.academicYearName ? " · " + item.academicYearName : ""}</p></div>{canManage && item.status && <span className={item.status === "published" ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800" : "rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800"}>{item.status}</span>}</div>
        {item.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.description}</p>}
        {canManage && item.status !== "cancelled" && <div className="mt-4 flex flex-wrap gap-2">
          {item.status === "draft" && <button type="button" disabled={publishMutation.isPending} onClick={() => { setFeedback(null); publishMutation.mutate(item.id); }} className={buttonClass}><Send size={15}/>{publishMutation.isPending ? "Publishing…" : "Publish event"}</button>}
          <button type="button" disabled={cancelMutation.isPending} onClick={() => { if (window.confirm("Cancel this calendar event? It will no longer appear in parent, student or teacher views.")) { setFeedback(null); cancelMutation.mutate(item.id); } }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Cancel event</button>
        </div>}
      </article>)}</div>}
    </section>
  </main>;
}
