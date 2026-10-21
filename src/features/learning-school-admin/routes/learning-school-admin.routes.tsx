import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";

import { lazy } from "react";

const SchoolAdministrationPage = lazy(() => import("../pages/SchoolAdministrationPage"));
const SchoolAnalyticsPage = lazy(() => import("../pages/SchoolAnalyticsPage"));
const SchoolStudentAdmissionsPage = lazy(() => import("../pages/SchoolStudentAdmissionsPage"));
const StudentInvitationPage = lazy(() => import("../pages/StudentInvitationPage"));
const SchoolParentLinksPage = lazy(() => import("../pages/SchoolParentLinksPage"));
const SchoolTimetablePage = lazy(() => import("../pages/SchoolTimetablePage"));
const SchoolStaffAdministrationPage = lazy(() => import("../pages/SchoolStaffAdministrationPage"));
const SchoolAttendanceReportPage = lazy(() => import("../pages/SchoolAttendanceReportPage"));

export const learningSchoolAdminRoutes: RouteObject[] = [
  { path: "school-admin", element: <ProtectedRoute><SchoolAdministrationPage /></ProtectedRoute> },
  { path: "school-admin/analytics", element: <ProtectedRoute><SchoolAnalyticsPage /></ProtectedRoute> },
  { path: "school-admin/parents", element: <ProtectedRoute><SchoolParentLinksPage /></ProtectedRoute> },
  { path: "school-admin/admissions", element: <ProtectedRoute><SchoolStudentAdmissionsPage /></ProtectedRoute> },
  { path: "student/invite", element: <ProtectedRoute><StudentInvitationPage /></ProtectedRoute> },
  { path: "school-admin/timetable", element: <ProtectedRoute><SchoolTimetablePage /></ProtectedRoute> },
  { path: "school-admin/staff", element: <ProtectedRoute><SchoolStaffAdministrationPage /></ProtectedRoute> },
  { path: "school-admin/attendance-report", element: <ProtectedRoute><SchoolAttendanceReportPage /></ProtectedRoute> },
];
