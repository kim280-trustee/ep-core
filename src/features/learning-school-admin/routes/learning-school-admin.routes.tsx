/* eslint-disable react-refresh/only-export-components -- Route config modules intentionally define lazy page components and export route objects. */
import { lazy, useState, type ReactNode } from "react";
import type { RouteObject } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { LearningRoleRoute, useAuth } from "@/core/auth";

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

function SchoolAdminSessionBar({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="font-bold text-slate-950">E&P Learning</p>
          <p className="truncate text-xs text-slate-500">{user?.email ?? "School administrator"}</p>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut size={16} />
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>
      {children}
    </div>
  );
}

function SchoolAdminPortal({ children }: { children: ReactNode }) {
  return (
    <LearningRoleRoute role="school-admin">
      <SchoolAdminSessionBar>{children}</SchoolAdminSessionBar>
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
