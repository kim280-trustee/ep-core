import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Check, Clock3, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { useAuthorization } from "@/features/auth/authorization/useAuthorization";
import { learningAcademicService } from "@/features/learning-academic/services/learning-academic.service";
import { learningEnrollmentService } from "@/features/learning-enrollment/services/learning-enrollment.service";
import { learningSchoolAdminService } from "../services/learning-school-admin.service";
import { learningTeacherLeaveService } from "../services/learning-teacher-leave.service";
import { learningTimetableService } from "../services/learning-timetable.service";
import { learningSchoolCalendarService } from "@/features/learning-school-calendar/services/learning-school-calendar.service";
import type { LearningTeacherLeaveRequest } from "../types/learning-teacher-leave.types";

function dateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value + "T12:00:00"));
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function getOccurrences(request: LearningTeacherLeaveRequest, entries: Awaited<ReturnType<typeof learningTimetableService.list>>, calendarEvents: Awaited<ReturnType<typeof learningSchoolCalendarService.listManageableEvents>>) {
  const assignedEntries = entries.filter((entry) => entry.status === "active" && entry.teacherUserId === request.teacherUserId);
  const start = new Date(request.startDate + "T12:00:00");
  const end = new Date(request.endDate + "T12:00:00");
  const occurrences: { entry: typeof entries[number]; date: string }[] = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const dayOfWeek = cursor.getDay() === 0 ? 7 : cursor.getDay();
    const date = dateKey(cursor);
    for (const entry of assignedEntries) {
      const isSchoolHoliday = calendarEvents.some((event) =>
        event.eventType === "holiday"
        && event.status === "published"
        && event.startDate <= date
        && event.endDate >= date
        && (!event.classGroupId || event.classGroupId === entry.classGroupId)
      );
      if (entry.dayOfWeek === dayOfWeek && !isSchoolHoliday) occurrences.push({ entry, date });
    }
  }
  return occurrences.sort((a, b) => a.date.localeCompare(b.date) || a.entry.startsAt.localeCompare(b.entry.startsAt));
}

export default function SchoolTeacherLeaveManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useTranslation();
  const authorization = useAuthorization();
  const canManage = authorization.hasPermission("learning.academic.manage");
  const queryClient = useQueryClient();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [selectedSubstitutes, setSelectedSubstitutes] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const locale = language === "th" ? "th-TH" : "en-US";

  const organizationsQuery = useQuery({
    queryKey: ["school-admin", "organizations", user?.id],
    queryFn: () => learningSchoolAdminService.listManageableOrganizations(user!.id),
    enabled: Boolean(user?.id) && !authLoading && !authorization.loading && canManage,
  });
  const organizations = organizationsQuery.data ?? [];
  const organizationId = selectedOrganizationId || organizations[0]?.id || "";
  const organization = organizations.find((item) => item.id === organizationId);

  const workload = useQuery({
    queryKey: ["school-admin", "teacher-leave", organizationId],
    enabled: Boolean(organizationId && canManage && organization),
    queryFn: async () => {
      const [requests, coverages, timetable, classGroups, subjects] = await Promise.all([
        learningTeacherLeaveService.listManageableRequests(organizationId),
        learningTeacherLeaveService.listManageableCoverages(organizationId),
        learningTimetableService.list(organizationId),
        learningAcademicService.listClassGroups(organizationId),
        learningAcademicService.listSubjects(),
      ]);
      const firstDate = requests.length ? requests.reduce((min, request) => request.startDate < min ? request.startDate : min, requests[0].startDate) : null;
      const lastDate = requests.length ? requests.reduce((max, request) => request.endDate > max ? request.endDate : max, requests[0].endDate) : null;
      const calendarEvents = firstDate && lastDate
        ? await learningSchoolCalendarService.listManageableEvents(organizationId, firstDate, lastDate)
        : [];
      const classIds = classGroups.filter((classGroup) => classGroup.status === "active").map((classGroup) => classGroup.id);
      const [classMemberships, eligibleUsers] = await Promise.all([
        Promise.all(classIds.map((classGroupId) => learningEnrollmentService.listClassMembers(classGroupId))),
        learningSchoolAdminService.listEligibleUsers(organizationId, organization!.tenantId),
      ]);
      const teacherMemberships = classMemberships.flat().filter((membership) => membership.membershipType === "teacher" && membership.status === "active");
      const userIds = [...new Set([
        ...requests.map((request) => request.teacherUserId),
        ...teacherMemberships.map((membership) => membership.userId),
        ...eligibleUsers.map((profile) => profile.id),
        ...coverages.flatMap((coverage) => [coverage.absentTeacherUserId, coverage.substituteTeacherUserId]),
      ])];
      const profiles = await learningSchoolAdminService.listUsersByIds(organization!.tenantId, userIds);
      return { requests, coverages, timetable, classGroups, subjects, calendarEvents, teacherMemberships, eligibleUsers, profiles };
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ requestId, decision }: { requestId: string; decision: "approved" | "rejected" }) =>
      learningTeacherLeaveService.reviewRequest({ requestId, decision, reviewNote: reviewNotes[requestId] ?? null }),
    onSuccess: async (_, variables) => {
      setActionError("");
      setActionNotice(t(variables.decision === "approved" ? "teacherLeave.requestApproved" : "teacherLeave.requestRejected"));
      await queryClient.invalidateQueries({ queryKey: ["school-admin", "teacher-leave", organizationId] });
    },
    onError: (error: Error) => { setActionNotice(""); setActionError(error.message); },
  });

  const cancelMutation = useMutation({
    mutationFn: (coverageId: string) => learningTeacherLeaveService.cancelCoverage(coverageId),
    onSuccess: async () => {
      setActionError("");
      setActionNotice(t("teacherLeave.coverageCancelled"));
      await queryClient.invalidateQueries({ queryKey: ["school-admin", "teacher-leave", organizationId] });
    },
    onError: (error: Error) => { setActionNotice(""); setActionError(error.message); },
  });

  const assignMutation = useMutation({
    mutationFn: ({ leaveRequestId, timetableEntryId, coverageDate, substituteTeacherUserId }: {
      leaveRequestId: string; timetableEntryId: string; coverageDate: string; substituteTeacherUserId: string;
    }) => learningTeacherLeaveService.assignSubstitute({ leaveRequestId, timetableEntryId, coverageDate, substituteTeacherUserId }),
    onSuccess: async () => {
      setActionError("");
      setActionNotice(t("teacherLeave.coverageAssigned"));
      await queryClient.invalidateQueries({ queryKey: ["school-admin", "teacher-leave", organizationId] });
    },
    onError: (error: Error) => { setActionNotice(""); setActionError(error.message); },
  });

  if (authLoading || authorization.loading || organizationsQuery.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (!user) return <Message text={t("teacherLeave.signIn")} />;
  if (!canManage) return <Message text={t("teacherLeave.managerAccessRequired")} />;
  if (organizationsQuery.isError) return <Message text={organizationsQuery.error instanceof Error ? organizationsQuery.error.message : t("teacherLeave.loadError")} />;
  if (!organizations.length) return <Message text={t("teacherLeave.noManagedSchools")} />;

  const data = workload.data;
  const profileById = new Map((data?.profiles ?? []).map((profile) => [profile.id, profile]));
  const classById = new Map((data?.classGroups ?? []).map((classGroup) => [classGroup.id, classGroup]));
  const subjectById = new Map((data?.subjects ?? []).map((subject) => [subject.id, subject]));
  const coverageBySlot = new Map((data?.coverages ?? []).filter((coverage) => coverage.status === "assigned").map((coverage) => [
    coverage.leaveRequestId + ":" + coverage.timetableEntryId + ":" + coverage.coverageDate,
    coverage,
  ]));

  return <div className="mx-auto max-w-6xl space-y-6">
    <header className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
      <div className="flex items-center gap-2 text-slate-300"><CalendarCheck size={19} /><span className="text-sm font-semibold">{t("teacherLeave.schoolWorkspace")}</span></div>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t("teacherLeave.title")}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{t("teacherLeave.managerIntro")}</p>
    </header>

    <label className="block max-w-lg text-sm font-semibold text-slate-700">{t("teacherLeave.school")}
      <select value={organizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
        {organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>

    {actionError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{actionError}</p>}
    {actionNotice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{actionNotice}</p>}
    {workload.isPending ? <div className="h-56 animate-pulse rounded-2xl bg-slate-200" /> : workload.isError ? <Message text={workload.error instanceof Error ? workload.error.message : t("teacherLeave.loadError")} /> : data ? <>
      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label={t("teacherLeave.pendingRequests")} value={data.requests.filter((request) => request.status === "pending").length} />
        <Stat label={t("teacherLeave.approvedRequests")} value={data.requests.filter((request) => request.status === "approved").length} />
        <Stat label={t("teacherLeave.assignedLessons")} value={data.coverages.filter((coverage) => coverage.status === "assigned").length} />
      </section>

      <section className="space-y-4">
        {data.requests.length ? data.requests.map((request) => {
          const teacherName = profileById.get(request.teacherUserId)?.name ?? request.teacherUserId.slice(0, 8);
          const occurrences = request.status === "approved" ? getOccurrences(request, data.timetable, data.calendarEvents) : [];
          return <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="font-bold text-slate-950">{teacherName} · {t("teacherLeave.types." + request.leaveType)}</h2><p className="mt-1 text-sm text-slate-500">{formatDate(request.startDate, locale)} – {formatDate(request.endDate, locale)}</p><p className="mt-2 text-sm text-slate-700">{request.reason}</p>{request.reviewNote && <p className="mt-2 text-sm text-slate-500">{t("teacherLeave.managerNote")}: {request.reviewNote}</p>}</div>
              <Status status={request.status} t={t} />
            </div>

            {request.status === "pending" && <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              <label className="block text-sm font-medium text-slate-700">{t("teacherLeave.reviewNote")}
                <textarea rows={2} maxLength={1000} value={reviewNotes[request.id] ?? ""} onChange={(event) => setReviewNotes((current) => ({ ...current, [request.id]: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder={t("teacherLeave.reviewNotePlaceholder")} />
              </label>
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ requestId: request.id, decision: "rejected" })} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"><X size={16} />{t("teacherLeave.reject")}</button>
                <button type="button" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ requestId: request.id, decision: "approved" })} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Check size={16} />{t("teacherLeave.approve")}</button>
              </div>
            </div>}

            {request.status === "approved" && <div className="mt-4 border-t border-slate-100 pt-4">
              <h3 className="font-semibold text-slate-900">{t("teacherLeave.lessonCoverage")}</h3>
              {occurrences.length ? <div className="mt-3 space-y-3">
                {occurrences.map(({ entry, date }) => {
                  const slotKey = request.id + ":" + entry.id + ":" + date;
                  const existing = coverageBySlot.get(slotKey);
                  const eligibleUserIds = new Set(data.eligibleUsers.map((profile) => profile.id));
                  const eligible = [...new Map(data.teacherMemberships.filter((membership) => eligibleUserIds.has(membership.userId) && membership.userId !== request.teacherUserId).map((membership) => [membership.userId, membership])).values()];
                  const selected = selectedSubstitutes[slotKey] ?? existing?.substituteTeacherUserId ?? "";
                  const className = classById.get(entry.classGroupId)?.name ?? t("teacherLeave.class");
                  const subjectName = subjectById.get(entry.subjectId)?.name ?? t("teacherLeave.subject");
                  const assignedName = existing ? profileById.get(existing.substituteTeacherUserId)?.name ?? existing.substituteTeacherUserId.slice(0, 8) : "";
                  return <div key={slotKey} className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.9fr)] sm:items-center">
                    <div><p className="font-semibold text-slate-900">{formatDate(date, locale)} · {className}</p><p className="mt-1 text-sm text-slate-500">{subjectName} · {formatTime(entry.startsAt)}–{formatTime(entry.endsAt)}{entry.room ? " · " + entry.room : ""}</p>{existing && <p className="mt-1 text-xs text-emerald-700">{t("teacherLeave.currentSubstitute")}: {assignedName}</p>}</div>
                    <div className="flex gap-2">
                      <select value={selected} onChange={(event) => setSelectedSubstitutes((current) => ({ ...current, [slotKey]: event.target.value }))} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm">
                        <option value="">{t("teacherLeave.chooseSubstitute")}</option>
                        {eligible.map((membership) => <option key={membership.userId} value={membership.userId}>{profileById.get(membership.userId)?.name ?? membership.userId.slice(0, 8)}</option>)}
                      </select>
                      <button type="button" disabled={!selected || assignMutation.isPending} onClick={() => assignMutation.mutate({ leaveRequestId: request.id, timetableEntryId: entry.id, coverageDate: date, substituteTeacherUserId: selected })} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{existing ? t("teacherLeave.updateCoverage") : t("teacherLeave.assign")}</button>
                      {existing && <button type="button" disabled={cancelMutation.isPending} onClick={() => cancelMutation.mutate(existing.id)} className="rounded-lg border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50" aria-label={t("teacherLeave.cancelCoverage")}><X size={15} /></button>}
                    </div>
                    {!eligible.length && <p className="text-xs text-amber-700 sm:col-span-2">{t("teacherLeave.noEligibleSubstitutes")}</p>}
                  </div>;
                })}
              </div> : <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">{t("teacherLeave.noLessonsInLeavePeriod")}</p>}
            </div>}
          </article>;
        }) : <div className="rounded-2xl border border-slate-200 bg-white p-6"><p className="font-semibold text-slate-900">{t("teacherLeave.noRequests")}</p><p className="mt-1 text-sm text-slate-500">{t("teacherLeave.noManagerRequests")}</p></div>}
      </section>
    </> : null}
  </div>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tabular-nums text-slate-950">{value}</p></article>;
}

function Status({ status, t }: { status: string; t: (key: string) => string }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{t("teacherLeave.status." + status)}</span>;
}

function Message({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">{text}</div>;
}
