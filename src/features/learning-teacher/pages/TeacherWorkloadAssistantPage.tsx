import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, BookOpen, CalendarDays, CheckCircle2, ClipboardCheck, ClipboardList, Clock3, FileCheck2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { learningAssignmentsService } from "@/features/learning-assignments/services/learning-assignments.service";
import { learningContentService } from "@/features/learning-content/services/learning-content.service";
import { learningAttendanceService } from "@/features/learning-school-admin/services/learning-attendance.service";
import { learningTimetableService } from "@/features/learning-school-admin/services/learning-timetable.service";
import { learningTeacherService } from "../services/learning-teacher.service";

function localDateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function localWeekday(date: Date) {
  return date.getDay() === 0 ? 7 : date.getDay();
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function formatDate(value: string | null, locale: string) {
  if (!value) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}

export default function TeacherWorkloadAssistantPage() {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const today = new Date();
  const todayKey = localDateKey(today);
  const locale = language === "th" ? "th-TH" : "en-US";

  const workload = useQuery({
    queryKey: ["learning", "teacher-workload", user?.id, todayKey],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const classes = await learningTeacherService.listTeacherClasses(user!.id);
      const organizationIds = [...new Set(classes.map((item) => item.membership.organizationId || item.classGroup.organizationId).filter(Boolean))];
      const [timetables, overviews] = await Promise.all([
        Promise.all(organizationIds.map((organizationId) => learningTimetableService.list(organizationId))),
        Promise.all(classes.map(async (classInfo) => ({
          classInfo,
          overview: await learningTeacherService.getClassOverview(user!.id, classInfo.classGroup.id),
        }))),
      ]);

      const todayLessons = timetables.flat()
        .filter((entry) => entry.status === "active" && entry.teacherUserId === user!.id && entry.dayOfWeek === localWeekday(today))
        .map((entry) => {
          const classInfo = classes.find((item) => item.classGroup.id === entry.classGroupId);
          const subject = classInfo?.subjects.find((item) => item.subjectId === entry.subjectId)?.subject.name;
          return { entry, classInfo, subjectName: subject ?? t("teacherWorkload.subject") };
        })
        .filter((item): item is typeof item & { classInfo: NonNullable<typeof item.classInfo> } => Boolean(item.classInfo))
        .sort((a, b) => a.entry.startsAt.localeCompare(b.entry.startsAt));

      const todayClassIds = [...new Set(todayLessons.map((item) => item.classInfo.classGroup.id))];
      const attendanceTasks = await Promise.all(todayClassIds.map(async (classGroupId) => {
        const classInfo = classes.find((item) => item.classGroup.id === classGroupId)!;
        const organizationId = classInfo.membership.organizationId || classInfo.classGroup.organizationId;
        const register = await learningAttendanceService.getRegister(organizationId, classGroupId, todayKey);
        return { classInfo, register, status: register.sessionStatus ?? "not_started" as const };
      }));

      const assignmentRows = overviews.flatMap(({ classInfo, overview }) =>
        overview.assignments
          .filter((item) => item.assignment.status === "published")
          .map((item) => ({ classInfo, ...item })),
      );
      const assignmentTasks = assignmentRows
        .filter((item) => item.completedCount < item.studentCount || item.overdueCount > 0)
        .sort((a, b) => {
          if (a.overdueCount !== b.overdueCount) return b.overdueCount - a.overdueCount;
          const aDue = a.assignment.dueAt ? new Date(a.assignment.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
          const bDue = b.assignment.dueAt ? new Date(b.assignment.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
          return aDue - bDue;
        });

      const responseGroups = await Promise.all(assignmentRows.map(async (item) => ({
        item,
        responses: await learningContentService.listTeacherResponses(item.assignment.id),
      })));
      const gradingTasks = responseGroups.flatMap(({ item, responses }) =>
        responses
          .filter((response) => response.status === "submitted" && (response.score === null || response.maxScore === null))
          .map((response) => ({ item, response })),
      );

      return { classes, todayLessons, attendanceTasks, assignmentTasks, gradingTasks };
    },
  });

  if (!user) return <Message text={t("teacherWorkload.signIn")} />;
  if (workload.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" aria-label={t("teacherWorkload.loading")} />;
  if (workload.isError) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
      <div className="flex items-start gap-3"><AlertCircle size={20} /><div className="min-w-0">
        <h1 className="font-semibold">{t("teacherWorkload.loadError")}</h1>
        <p className="mt-1 text-sm">{workload.error instanceof Error ? workload.error.message : t("teacherWorkload.tryAgain")}</p>
        <button type="button" onClick={() => void workload.refetch()} className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-semibold">{t("teacherWorkload.retry")}</button>
      </div></div>
    </div>;
  }

  const data = workload.data;
  const dateLabel = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(today);
  const attendanceOpen = data.attendanceTasks.filter((item) => item.status !== "submitted").length;
  const overdueAssignments = data.assignmentTasks.reduce((sum, item) => sum + item.overdueCount, 0);

  return <div className="mx-auto max-w-6xl space-y-6">
    <header className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
      <div className="flex items-center gap-2 text-slate-300"><ClipboardCheck size={19} /><span className="text-sm font-semibold">{t("teacherWorkload.workspace")}</span></div>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t("teacherWorkload.title")}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{t("teacherWorkload.intro")}</p>
      <p className="mt-4 text-sm font-medium text-white">{dateLabel}</p>
    </header>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat icon={<CalendarDays size={19} />} label={t("teacherWorkload.classesToday")} value={data.todayLessons.length} />
      <Stat icon={<ClipboardCheck size={19} />} label={t("teacherWorkload.attendanceDue")} value={attendanceOpen} />
      <Stat icon={<FileCheck2 size={19} />} label={t("teacherWorkload.gradingDue")} value={data.gradingTasks.length} />
      <Stat icon={<ClipboardList size={19} />} label={t("teacherWorkload.overdueStudents")} value={overdueAssignments} />
    </section>

    <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><CalendarDays size={19} className="text-slate-500" /><h2 className="text-lg font-bold text-slate-950">{t("teacherWorkload.todaySchedule")}</h2></div>
        {data.todayLessons.length ? <div className="mt-4 divide-y divide-slate-100">
          {data.todayLessons.map(({ entry, classInfo, subjectName }) => <article key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{classInfo.classGroup.name} · {subjectName}</p>
              <p className="mt-1 text-sm text-slate-500">{formatTime(entry.startsAt)}–{formatTime(entry.endsAt)}{entry.room ? " · " + entry.room : ""}</p>
            </div>
            <Link to={"/teacher/classes/" + classInfo.classGroup.id} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-950">{t("teacherWorkload.openClass")}<ArrowRight size={15} /></Link>
          </article>)}
        </div> : <Empty title={t("teacherWorkload.noLessons")} description={t("teacherWorkload.noLessonsDescription")} />}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><ClipboardCheck size={19} className="text-slate-500" /><h2 className="text-lg font-bold text-slate-950">{t("teacherWorkload.attendanceActions")}</h2></div>
        {data.attendanceTasks.length ? <div className="mt-4 space-y-3">
          {data.attendanceTasks.map(({ classInfo, status }) => <article key={classInfo.classGroup.id} className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-2"><div><p className="font-semibold text-slate-900">{classInfo.classGroup.name}</p><p className="mt-1 text-xs text-slate-500">{status === "open" ? t("teacherWorkload.attendanceOpen") : t("teacherWorkload.attendanceNotStarted")}</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{t("teacherWorkload.actionNeeded")}</span></div>
            <Link to={"/teacher/classes/" + classInfo.classGroup.id} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-700">{t("teacherWorkload.openClass")}<ArrowRight size={15} /></Link>
          </article>)}
        </div> : <Empty title={t("teacherWorkload.attendanceComplete")} description={t("teacherWorkload.attendanceCompleteDescription")} />}
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2"><FileCheck2 size={19} className="text-slate-500" /><h2 className="text-lg font-bold text-slate-950">{t("teacherWorkload.gradingQueue")}</h2></div>
      {data.gradingTasks.length ? <div className="mt-4 divide-y divide-slate-100">
        {data.gradingTasks.slice(0, 8).map(({ item, response }) => <article key={response.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
          <div><p className="font-semibold text-slate-900">{response.studentName}</p><p className="mt-1 text-sm text-slate-500">{item.assignment.title} · {item.classInfo.classGroup.name}</p></div>
          <Link to={"/teacher/assignments/" + item.assignment.id + "/responses"} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700">{t("teacherWorkload.gradeResponse")}<ArrowRight size={15} /></Link>
        </article>)}
      </div> : <Empty title={t("teacherWorkload.noGrading")} description={t("teacherWorkload.noGradingDescription")} />}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2"><ClipboardList size={19} className="text-slate-500" /><h2 className="text-lg font-bold text-slate-950">{t("teacherWorkload.assignmentFollowUps")}</h2></div>
      {data.assignmentTasks.length ? <div className="mt-4 divide-y divide-slate-100">
        {data.assignmentTasks.slice(0, 8).map((item) => <article key={item.assignment.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
          <div><p className="font-semibold text-slate-900">{item.assignment.title}</p><p className="mt-1 text-sm text-slate-500">{item.classInfo.classGroup.name} · {item.completedCount}/{item.studentCount} {t("teacherWorkload.completed")}{item.assignment.dueAt ? " · " + t("teacherWorkload.due") + " " + formatDate(item.assignment.dueAt, locale) : ""}</p><p className="mt-1 text-xs text-amber-700">{item.overdueCount ? item.overdueCount + " " + t("teacherWorkload.overdueStudents") : item.studentCount - item.completedCount + " " + t("teacherWorkload.studentsRemaining")}</p></div>
          <Link to={"/teacher/classes/" + item.classInfo.classGroup.id + "/assignments/history"} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700">{t("teacherWorkload.openAssignments")}<ArrowRight size={15} /></Link>
        </article>)}
      </div> : <Empty title={t("teacherWorkload.noAssignmentFollowUps")} description={t("teacherWorkload.noAssignmentFollowUpsDescription")} />}
    </section>

    <section className="flex flex-wrap gap-3">
      <Link to="/teacher/lesson-plans" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800"><BookOpen size={17} />{t("teacherWorkload.prepareLesson")}</Link>
      <Link to="/teacher/ai-assistant" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"><Clock3 size={17} />{t("teacherWorkload.createMaterials")}</Link>
    </section>
  </div>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-sm text-slate-500">{icon}{label}</div><p className="mt-2 text-2xl font-bold tabular-nums text-slate-950">{value}</p></article>;
}

function Empty({ title, description }: { title: string; description: string }) {
  return <div className="mt-4 rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><CheckCircle2 size={17} />{title}</div><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div>;
}

function Message({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">{text}</div>;
}
