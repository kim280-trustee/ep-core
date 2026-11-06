import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, ClipboardCheck, ClipboardList, Clock3, FileText, GraduationCap, Trophy, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningTeacherService } from "../services/learning-teacher.service";
import { useTranslation } from "@/core/i18n/useTranslation";

export default function TeacherClassPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { classGroupId = "" } = useParams();
  const query = useQuery({
    queryKey: ["learning", "teacher-class", user?.id, classGroupId],
    queryFn: () => learningTeacherService.getClassOverview(user!.id, classGroupId),
    enabled: Boolean(user?.id && classGroupId),
  });

  if (!user) return <div className="rounded-2xl border border-slate-200 bg-white p-6">{t("teacherClass.signIn")}</div>;
  if (query.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (query.isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">{t("teacherClass.loadError")}</div>;

  const { classInfo, students, assignments, performance } = query.data;
  const attentionMap = new Map(performance.attention.map((item) => [item.studentUserId, item]));

  return (
    <div className="space-y-6">
      <div><Link to="/teacher" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={16} />{t("teacherClass.back")}</Link></div>
      <section className="rounded-2xl bg-slate-900 p-6 text-white">
        <p className="text-sm text-slate-300">{classInfo.classGroup.code}</p>
        <h1 className="mt-1 text-2xl font-bold">{classInfo.classGroup.name}</h1>
        <p className="mt-2 text-sm text-slate-300">{classInfo.subjects.map((item) => item.subject.name).join(", ") || "No subjects assigned"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={"/teacher/classes/" + classGroupId + "/gradebook"} className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">{t("teacherClass.openGradebook")}</Link><Link to={"/teacher/classes/" + classGroupId + "/assignments/history"} className="inline-flex rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white">{t("teacherClass.assignmentHistory")}</Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t("teacherClass.workspace")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("teacherClass.workspaceHelp")}</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <QuickAction icon={<ClipboardList size={18} />} label={t("teacherClass.assignments")} description={t("teacherClass.assignmentHelp")} to={"/teacher/classes/" + classGroupId + "/assignments/history"} />
          <QuickAction icon={<Users size={18} />} label={t("teacherClass.students")} description={t("teacherClass.studentsHelp")} href="#students" />
          <QuickAction icon={<GraduationCap size={18} />} label={t("teacherClass.gradebook")} description={t("teacherClass.gradebookHelp")} to={"/teacher/classes/" + classGroupId + "/gradebook"} />
          <QuickAction icon={<BookOpen size={18} />} label={t("teacherClass.contentLibrary")} description={t("teacherClass.contentHelp")} to="/teacher/content" />
          <QuickAction icon={<Trophy size={18} />} label={t("teacherClass.gamification")} description={t("teacherClass.gamificationHelp")} to={"/teacher/classes/" + classGroupId + "/gamification"} />
          <QuickAction icon={<ClipboardCheck size={18} />} label={t("teacherClass.diagnostics")} description={t("teacherClass.diagnosticsHelp")} to={"/teacher/classes/" + classGroupId + "/diagnostics"} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t("teacherClass.pilotWorkflow")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("teacherClass.pilotHelp")}</p>
          </div>
          <Link to="/teacher/assignments/new" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">{t("teacherClass.createAssignment")}</Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <WorkflowStep number="1" title={t("teacherClass.content")} description={t("teacherClass.prepareContent")} to="/teacher/content" />
          <WorkflowStep number="2" title={t("teacherClass.assignment")} description={t("teacherClass.buildActivity")} to="/teacher/assignments/new" />
          <WorkflowStep number="3" title={t("teacherClass.publish")} description={t("teacherClass.makeAvailable")} to={"/teacher/classes/" + classGroupId + "/assignments/history"} />
          <WorkflowStep number="4" title={t("teacherClass.student")} description={t("teacherClass.completeAsStudent")} />
          <WorkflowStep number="5" title={t("teacherClass.results")} description={t("teacherClass.reviewResults")} to={"/teacher/classes/" + classGroupId + "/gradebook"} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Users size={18} />} label={t("teacherClass.students")} value={students.length} />
        <Stat icon={<Clock3 size={18} />} label={t("teacherClass.assignments")} value={assignments.length} />
        <Stat icon={<CheckCircle2 size={18} />} label={t("teacherClass.completedWork")} value={assignments.reduce((sum, item) => sum + item.completedCount, 0)} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-semibold text-slate-900">{t("teacherClass.classPerformance")}</h2><p className="mt-1 text-sm text-slate-500">{performance.termName ? "Current term: " + performance.termName : {t("teacherClass.noTermGrades")}}</p></div>
          <Link to={"/teacher/classes/" + classGroupId + "/gradebook"} className="text-sm font-medium text-slate-700">{t("teacherClass.openFullGradebook")}</Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {performance.subjects.map((subject) => <div key={subject.classSubjectId} className="rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">{subject.subjectName}</p><p className="mt-1 text-2xl font-bold">{subject.averageScore === null ? {t("teacherClass.noGrades")} : subject.averageScore.toFixed(1) + "%"}</p><p className="mt-1 text-xs text-slate-500">{subject.gradedStudents} {t("teacherClass.gradedStudent")}</p></div>)}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t("teacherClass.students")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t("teacherClass.studentProfileHelp")}</p>
        {students.length ? <div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">{t("teacherClass.student")}</th><th className="px-4 py-3">{t("teacherClass.attention")}</th><th className="px-4 py-3">{t("teacherClass.currentAverage")}</th><th className="px-4 py-3">{t("teacherClass.action")}</th></tr></thead><tbody className="divide-y divide-slate-100">{students.map((student) => { const attention = attentionMap.get(student.membership.userId); return <tr key={student.membership.id}><td className="px-4 py-3"><p className="font-medium text-slate-900">{student.name}</p><p className="text-xs text-slate-500">{student.email}</p></td><td className="px-4 py-3">{attention ? <span className="font-medium text-slate-700">{attention.reasons.join(" · ")}</span> : <span className="text-slate-400">{t("teacherClass.noSignal")}</span>}</td><td className="px-4 py-3">{attention?.averageScore === null || attention?.averageScore === undefined ? "—" : attention.averageScore.toFixed(1) + "%"}</td><td className="px-4 py-3"><Link to={"/teacher/classes/" + classGroupId + "/students/" + student.membership.userId} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold">{t("teacherClass.viewProfile")}</Link></td></tr>; })}</tbody></table></div> : <p className="mt-4 text-sm text-slate-500">{t("teacherClass.noStudents")}</p>}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{t("teacherClass.assignments")}</h2>
          {assignments.length ? <div className="space-y-3">{assignments.map((item) => <div key={item.assignment.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-slate-900">{item.assignment.title}</p><p className="mt-1 text-xs text-slate-500">{item.assignment.status}</p></div><span className="text-xs text-slate-500">{item.completedCount}/{item.studentCount} complete</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-slate-900" style={{ width: (item.studentCount ? Math.round(item.completedCount / item.studentCount * 100) : 0) + "%" }} /></div><div className="mt-2 flex gap-3 text-xs text-slate-500"><span>Started {item.startedCount}</span><span>Overdue {item.overdueCount}</span></div></div>)}</div> : <p className="text-sm text-slate-500">{t("teacherClass.noAssignments")}</p>}<Link to={"/teacher/classes/" + classGroupId + "/assignments/history"} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">{t("teacherClass.openAssignmentHistory")} <FileText size={15} /></Link>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{t("teacherClass.studentsNeedingAttention")}</h2>
          {performance.attention.length ? <div className="space-y-3">{performance.attention.map((item) => { const student = students.find((candidate) => candidate.membership.userId === item.studentUserId); return <div key={item.studentUserId} className="rounded-xl border border-slate-200 p-4"><p className="font-medium text-slate-900">{student?.name ?? t("teacherClass.student")}</p><p className="mt-1 text-sm text-slate-600">{item.reasons.join(" · ")}</p></div>; })}</div> : <p className="text-sm text-slate-500">{t("teacherClass.noAttention")}</p>}
        </section>
      </section>
    </div>
  );
}
function QuickAction({ icon, label, description, to, href }: { icon: ReactNode; label: string; description: string; to?: string; href?: string }) {
  const className = "group rounded-xl border border-slate-200 p-4 transition hover:border-slate-400 hover:bg-slate-50";
  const content = <><div className="flex items-center gap-2 text-slate-700"><span>{icon}</span><span className="font-semibold">{label}</span></div><p className="mt-2 text-xs leading-5 text-slate-500">{description}</p></>;
  return to ? <Link to={to} className={className}>{content}</Link> : <a href={href} className={className}>{content}</a>;
}
function WorkflowStep({ number, title, description, to }: { number: string; title: string; description: string; to?: string }) {
  const content = <><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{number}</span><p className="mt-3 font-semibold text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></>;
  return to ? <Link to={to} className="rounded-xl border border-slate-200 p-4 hover:border-slate-400 hover:bg-slate-50">{content}</Link> : <div className="rounded-xl border border-slate-200 p-4">{content}</div>;
}
function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-sm">{label}</span></div><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>;
}
