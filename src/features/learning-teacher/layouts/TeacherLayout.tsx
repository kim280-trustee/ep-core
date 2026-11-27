import { BookOpen, BookOpenCheck, FileQuestion, FileText, Languages, LayoutDashboard, PlusCircle, GraduationCap, Sparkles, Bell, Target, CalendarDays, ClipboardCheck } from "lucide-react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { LearningWorkspaceShell } from "@/features/learning-shared/components/LearningWorkspaceShell";
import { learningTeacherService } from "../services/learning-teacher.service";

const navigationGroups = [
  {
    label: null,
    items: [{ to: "/teacher", label: "learning.dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    label: "learning.teaching",
    items: [
      { to: "/teacher/workload", label: "teacherWorkload.title", icon: ClipboardCheck },
      { to: "/teacher/leave", label: "teacherLeave.title", icon: CalendarDays },
      { to: "/teacher/content", label: "learning.contentLibrary", icon: FileText },
      { to: "/teacher/lesson-plans", label: "learning.lessonPlanning", icon: BookOpenCheck },
      { to: "/teacher/vocabulary", label: "learning.vocabulary", icon: Languages },
      { to: "/calendar", label: "learning.schoolCalendar", icon: CalendarDays },
      { to: "/teacher/vocabulary/assignments/new", label: "learning.vocabularyAssignment", icon: BookOpenCheck },
      { to: "/notifications", label: "learning.notifications", icon: Bell },
      { to: "/marketplace", label: "learning.extraClasses", icon: GraduationCap },
      { to: "/teacher/authoring", label: "learning.authoring", icon: BookOpen },
      { to: "/teacher/ai-assistant", label: "learning.aiAssistant", icon: Sparkles },
      { to: "/teacher/interventions", label: "learning.studentSupport", icon: Target },
      { to: "/teacher/question-bank", label: "learning.questionBank", icon: FileQuestion },
      { to: "/teacher/assessments", label: "assessmentBuilder.title", icon: ClipboardCheck },
      { to: "/teacher/assignments/new", label: "learning.createAssignment", icon: PlusCircle },
    ],
  },
];

export default function TeacherLayout() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const teacherAccess = useQuery({
    queryKey: ["learning", "teacher-access", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id) && !loading,
    staleTime: 60_000,
  });

  if (loading || teacherAccess.isPending) {
    return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto h-24 max-w-7xl animate-pulse rounded-2xl bg-slate-200" /></div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (teacherAccess.isError || !teacherAccess.data?.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">{teacherAccess.isError ? "Teacher access could not be loaded" : "No active teaching classes"}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {teacherAccess.isError
              ? "Your teacher membership was verified, but the class list could not be loaded. Please try again."
              : "Your account does not currently have an active teaching class. Contact your school administrator if this is unexpected."}
          </p>
          {teacherAccess.isError && <button type="button" onClick={() => void teacherAccess.refetch()} className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Try again</button>}
        </section>
      </main>
    );
  }

  const primaryClassId = teacherAccess.data[0]?.classGroup.id;
  const classLinks = primaryClassId ? [
    { to: `/teacher/classes/${primaryClassId}`, label: "learning.classOverview" },
    { to: `/teacher/classes/${primaryClassId}/assignments/history`, label: "learning.assignmentHistory" },
    { to: `/teacher/classes/${primaryClassId}/parents`, label: "learning.parents" },
    { to: `/teacher/classes/${primaryClassId}/gradebook`, label: "learning.gradebook" },
    { to: `/teacher/classes/${primaryClassId}/gradebook/reports`, label: "learning.gradebookReports" },
    { to: `/teacher/classes/${primaryClassId}/gradebook/settings`, label: "learning.gradebookSettings" },
    { to: `/teacher/classes/${primaryClassId}/gamification`, label: "learning.classGamification" },
    { to: `/teacher/classes/${primaryClassId}/live-games`, label: "liveGames.navigation" },
  ] : [];

  const linkClass = (active: boolean) => [
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
    active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  ].join(" ");

  return (
    <LearningWorkspaceShell
      role="teacher"
      navigation={
        <nav className="space-y-5" aria-label="Teacher portal navigation">
          {navigationGroups.map((group) => (
            <div key={group.label ?? "dashboard"}>
              {group.label && <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{t(group.label)}</p>}
              <div className={group.label ? "mt-2 space-y-1" : "space-y-1"}>
                {group.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink key={to} to={to} end={end} className={({ isActive }) => linkClass(isActive)}>
                    <Icon size={18} />{t(label)}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
          <div className="border-t border-slate-200 pt-4">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{t("learning.academic")}</p>
            <div className="mt-2 space-y-1">
              {classLinks.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => linkClass(isActive)}>{t(item.label)}</NavLink>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{t("learning.myClasses")}</p>
            <div className="mt-2 space-y-1">
              {teacherAccess.data.slice(0, 8).map((cls) => (
                <NavLink key={cls.classGroup.id} to={`/teacher/classes/${cls.classGroup.id}`} className={({ isActive }) => linkClass(isActive)}>
                  {cls.classGroup.name}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      }
    >
      <Outlet />
    </LearningWorkspaceShell>
  );
}
