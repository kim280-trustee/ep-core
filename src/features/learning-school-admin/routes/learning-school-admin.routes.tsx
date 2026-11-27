/* eslint-disable react-refresh/only-export-components -- Route config modules intentionally define lazy page components and export route objects. */
import type { RouteObject } from "react-router-dom";
import { LearningRoleRoute } from "@/core/auth";

import { lazy } from "react";

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

export const learningSchoolAdminRoutes: RouteObject[] = [
  { path: "school-admin", element: <LearningRoleRoute role="school-admin"><SchoolAdministrationPage /></LearningRoleRoute> },
  { path: "school-admin/analytics", element: <LearningRoleRoute role="school-admin"><SchoolAnalyticsPage /></LearningRoleRoute> },
  { path: "school-admin/parents", element: <LearningRoleRoute role="school-admin"><SchoolParentLinksPage /></LearningRoleRoute> },
  { path: "school-admin/admissions", element: <LearningRoleRoute role="school-admin"><SchoolStudentAdmissionsPage /></LearningRoleRoute> },
  { path: "student/invite", element: <LearningRoleRoute role="school-admin"><StudentInvitationPage /></LearningRoleRoute> },
  { path: "school-admin/timetable", element: <LearningRoleRoute role="school-admin"><SchoolTimetablePage /></LearningRoleRoute> },
  { path: "school-admin/staff", element: <LearningRoleRoute role="school-admin"><SchoolStaffAdministrationPage /></LearningRoleRoute> },
  { path: "school-admin/attendance-report", element: <LearningRoleRoute role="school-admin"><SchoolAttendanceReportPage /></LearningRoleRoute> },
  { path: "school-admin/announcements", element: <LearningRoleRoute role="school-admin"><SchoolAnnouncementsPage /></LearningRoleRoute> },
  { path: "school-admin/teacher-leave", element: <LearningRoleRoute role="school-admin"><SchoolTeacherLeaveManagementPage /></LearningRoleRoute> },
];
