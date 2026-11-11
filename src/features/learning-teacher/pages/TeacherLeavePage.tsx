import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock3, PlusCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { learningTeacherService } from "../services/learning-teacher.service";
import { learningTeacherLeaveService } from "@/features/learning-school-admin/services/learning-teacher-leave.service";
import type { LearningTeacherLeaveType } from "@/features/learning-school-admin/types/learning-teacher-leave.types";

function localDateValue(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value + "T12:00:00"));
}

export default function TeacherLeavePage() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const [organizationId, setOrganizationId] = useState("");
  const [startDate, setStartDate] = useState(localDateValue(new Date()));
  const [endDate, setEndDate] = useState(localDateValue(new Date()));
  const [leaveType, setLeaveType] = useState<LearningTeacherLeaveType>("personal");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const locale = language === "th" ? "th-TH" : "en-US";

  const workspace = useQuery({
    queryKey: ["learning", "teacher-leave-workspace", user?.id],
    enabled: Boolean(user?.id) && !authLoading,
    queryFn: async () => {
      const [classes, requests, coverages] = await Promise.all([
        learningTeacherService.listTeacherClasses(user!.id),
        learningTeacherLeaveService.listMyRequests(),
        learningTeacherLeaveService.listMyCoverages(),
      ]);
      return { classes, requests, coverages };
    },
  });

  const organizations = [...new Map((workspace.data?.classes ?? []).map((item) => [
    item.membership.organizationId,
    { id: item.membership.organizationId, name: item.organization?.name ?? item.classGroup.organizationId },
  ])).values()];
  const selectedOrganizationId = organizationId || organizations[0]?.id || "";
  const profileUserId = workspace.data?.classes[0]?.membership.userId;
  const classById = new Map((workspace.data?.classes ?? []).map((item) => [item.classGroup.id, item.classGroup.name]));

  const createRequest = useMutation({
    mutationFn: () => learningTeacherLeaveService.createRequest({
      organizationId: selectedOrganizationId,
      startDate,
      endDate,
      leaveType,
      reason: reason.trim(),
    }),
    onSuccess: async () => {
      setFormError("");
      setNotice(t("teacherLeave.requestSubmitted"));
      setReason("");
      await queryClient.invalidateQueries({ queryKey: ["learning", "teacher-leave-workspace", user?.id] });
    },
    onError: (error: Error) => {
      setNotice("");
      setFormError(error.message || t("teacherLeave.submitError"));
    },
  });

  if (authLoading || workspace.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (!user) return <Message text={t("teacherLeave.signIn")} />;
  if (workspace.isError) return <Message text={workspace.error instanceof Error ? workspace.error.message : t("teacherLeave.loadError")} />;
  if (!workspace.data?.classes.length) return <Message text={t("teacherLeave.noTeacherClasses")} />;

  return <div className="mx-auto max-w-5xl space-y-6">
    <header className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
      <div className="flex items-center gap-2 text-slate-300"><CalendarDays size={19} /><span className="text-sm font-semibold">{t("teacherLeave.workspace")}</span></div>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t("teacherLeave.title")}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{t("teacherLeave.teacherIntro")}</p>
    </header>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2"><PlusCircle size={19} className="text-slate-500" /><h2 className="text-lg font-bold text-slate-950">{t("teacherLeave.newRequest")}</h2></div>
      {formError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{formError}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {organizations.length > 1 && <label className="block text-sm font-medium text-slate-700">{t("teacherLeave.school")}
          <select value={selectedOrganizationId} onChange={(event) => setOrganizationId(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
            {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
          </select>
        </label>}
        <label className="block text-sm font-medium text-slate-700">{t("teacherLeave.leaveType")}
          <select value={leaveType} onChange={(event) => setLeaveType(event.target.value as LearningTeacherLeaveType)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
            {(["annual", "sick", "personal", "other"] as const).map((type) => <option key={type} value={type}>{t("teacherLeave.types." + type)}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">{t("teacherLeave.startDate")}
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" />
        </label>
        <label className="block text-sm font-medium text-slate-700">{t("teacherLeave.endDate")}
          <input type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" />
        </label>
      </div>
      <label className="mt-4 block text-sm font-medium text-slate-700">{t("teacherLeave.reason")}
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} rows={3} placeholder={t("teacherLeave.reasonPlaceholder")} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" />
      </label>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">{t("teacherLeave.managerApprovalRequired")}</p>
        <button type="button" disabled={createRequest.isPending || !selectedOrganizationId || !reason.trim() || startDate > endDate} onClick={() => createRequest.mutate()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          <PlusCircle size={17} />{createRequest.isPending ? t("teacherLeave.submitting") : t("teacherLeave.submitRequest")}
        </button>
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2"><Clock3 size={19} className="text-slate-500" /><h2 className="text-lg font-bold text-slate-950">{t("teacherLeave.myRequests")}</h2></div>
      {workspace.data.requests.length ? <div className="mt-4 divide-y divide-slate-100">
        {workspace.data.requests.map((request) => <article key={request.id} className="py-4 first:pt-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="font-semibold text-slate-900">{t("teacherLeave.types." + request.leaveType)} · {formatDate(request.startDate, locale)} – {formatDate(request.endDate, locale)}</p><p className="mt-1 text-sm text-slate-600">{request.reason}</p></div>
            <Status status={request.status} t={t} />
          </div>
          {request.reviewNote && <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{t("teacherLeave.managerNote")}: {request.reviewNote}</p>}
        </article>)}
      </div> : <Empty title={t("teacherLeave.noRequests")} description={t("teacherLeave.noRequestsDescription")} />}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2"><ShieldCheck size={19} className="text-slate-500" /><h2 className="text-lg font-bold text-slate-950">{t("teacherLeave.substituteDuties")}</h2></div>
      {workspace.data.coverages.length ? <div className="mt-4 divide-y divide-slate-100">
        {workspace.data.coverages.map((coverage) => <article key={coverage.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div><p className="font-semibold text-slate-900">{formatDate(coverage.coverageDate, locale)} · {classById.get(coverage.classGroupId) ?? t("teacherLeave.class")}</p><p className="mt-1 text-sm text-slate-500">{coverage.substituteTeacherUserId === profileUserId ? t("teacherLeave.youAreSubstitute") : t("teacherLeave.yourClassHasCover")} · {coverage.timetableEntryId.slice(0, 8)}</p></div>
          <Status status={coverage.status} t={t} />
        </article>)}
      </div> : <Empty title={t("teacherLeave.noSubstituteDuties")} description={t("teacherLeave.noSubstituteDutiesDescription")} />}
    </section>
  </div>;
}

function Status({ status, t }: { status: string; t: (key: string) => string }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{t("teacherLeave.status." + status)}</span>;
}

function Empty({ title, description }: { title: string; description: string }) {
  return <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div>;
}

function Message({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">{text}</div>;
}
