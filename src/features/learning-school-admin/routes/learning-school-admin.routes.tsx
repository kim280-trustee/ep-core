/* eslint-disable react-refresh/only-export-components -- Route config modules intentionally define lazy page components and export route objects. */
import { lazy, type ReactNode } from "react";
import type { RouteObject } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { BarChart3, CalendarDays, ClipboardCheck, GraduationCap, LayoutDashboard, Megaphone, Users } from "lucide-react";
import { LearningRoleRoute } from "@/core/auth";
import { LearningWorkspaceShell } from "@/features/learning-shared/components/LearningWorkspaceShell";

const SchoolAdministrationPage = lazy(() => import("../pages/SchoolAdministrationPage"));
const SchoolAnalyticsPage = lazy(() => import("../pages/SchoolAnalyticsPage"));
const SchoolStudentAdmissionsPage = lazy(() => import("../pages/SchoolStudentAdmissionsPage"));
const StudentInvitationPage = lazy(() => import("../pages/StudentInvitationPage"));
const SchoolParentLinksPage = lazy(() => import("../pages/SchoolParentLinksPage"));
const SchoolTimetablePage = lazy(() => import("../pages/SchoolTimetablePage"));
const SchoolStaffAdministrationPage = lazy(() => import("../pages/SchoolStaffAdministrationPage"));
const SchoolAttendanceReportPage = lazy(() => import("../pages/SchoolAttendanceReportPage"));
const SchoolAnnouncementsPage = lazy(() => import("../pages/SchoolAnnouncementsPage"));
const SchoolTeacherLeaveManagementPage = lazy(() => import("../pages/SchoolTeacherLeaveManagementPage"));

type SchoolAdminNavigationItem = { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean };

const adminItems: SchoolAdminNavigationItem[] = [
  { to: "/school-admin", label: "School Overview", icon: LayoutDashboard, end: true },
  { to: "/school-admin/analytics", label: "School Analytics", icon: BarChart3 },
  { to: "/school-admin/admissions", label: "Student Admissions", icon: GraduationCap },
  { to: "/school-admin/parents", label: "Parent Links", icon: Users },
  { to: "/student/invite", label: "Invite Student", icon: Users },
  { to: "/school-admin/staff", label: "Staff Management", icon: Users },
  { to: "/school-admin/timetable", label: "School Timetable", icon: CalendarDays },
  { to: "/school-admin/attendance-report", label: "Attendance Reports", icon: ClipboardCheck },
  { to: "/school-admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/school-admin/teacher-leave", label: "Teacher Leave", icon: CalendarDays },
];

function SchoolAdminNavigation() {
  return (
    <nav className="space-y-1" aria-label="School Admin portal navigation">
      {adminItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => [
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
          isActive ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        ].join(" ")}>
          <Icon size={18} />{label}
        </NavLink>
      ))}
    </nav>
  );
}

function SchoolAdminPortal({ children }: { children: ReactNode }) {
  return (
    <LearningRoleRoute role="school-admin">
      <LearningWorkspaceShell role="school-admin" navigation={<SchoolAdminNavigation />}>
        {children}
      </LearningWorkspaceShell>
    </LearningRoleRoute>
  );
}

export const learningSchoolAdminRoutes: RouteObject[] = [
  { path: "school-admin", element: <SchoolAdminPortal><SchoolAdministrationPage /></SchoolAdminPortal> },
  { path: "school-admin/analytics", element: <SchoolAdminPortal><SchoolAnalyticsPage /></SchoolAdminPortal> },
  { path: "school-admin/parents", element: <SchoolAdminPortal><SchoolParentLinksPage /></SchoolAdminPortal> },
  { path: "school-admin/admissions", element: <SchoolAdminPortal><SchoolStudentAdmissionsPage /></SchoolAdminPortal> },
  { path: "student/invite", element: <SchoolAdminPortal><StudentInvitationPage /></SchoolAdminPortal> },
  { path: "school-admin/timetable", element: <SchoolAdminPortal><SchoolTimetablePage /></SchoolAdminPortal> },
  { path: "school-admin/staff", element: <SchoolAdminPortal><SchoolStaffAdministrationPage /></SchoolAdminPortal> },
  { path: "school-admin/attendance-report", element: <SchoolAdminPortal><SchoolAttendanceReportPage /></SchoolAdminPortal> },
  { path: "school-admin/announcements", element: <SchoolAdminPortal><SchoolAnnouncementsPage /></SchoolAdminPortal> },
  { path: "school-admin/teacher-leave", element: <SchoolAdminPortal><SchoolTeacherLeaveManagementPage /></SchoolAdminPortal> },
];
