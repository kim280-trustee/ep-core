import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";
import SchoolAdministrationPage from "../pages/SchoolAdministrationPage";
import SchoolStudentAdmissionsPage from "../pages/SchoolStudentAdmissionsPage";
import StudentInvitationPage from "../pages/StudentInvitationPage";
import SchoolParentLinksPage from "../pages/SchoolParentLinksPage";
import SchoolTimetablePage from "../pages/SchoolTimetablePage";
import SchoolStaffAdministrationPage from "../pages/SchoolStaffAdministrationPage";

export const learningSchoolAdminRoutes: RouteObject[] = [
  { path: "school-admin", element: <ProtectedRoute><SchoolAdministrationPage /></ProtectedRoute> },
  { path: "school-admin/parents", element: <ProtectedRoute><SchoolParentLinksPage /></ProtectedRoute> },
  { path: "school-admin/admissions", element: <ProtectedRoute><SchoolStudentAdmissionsPage /></ProtectedRoute> },
  { path: "student/invite", element: <ProtectedRoute><StudentInvitationPage /></ProtectedRoute> },
  { path: "school-admin/timetable", element: <ProtectedRoute><SchoolTimetablePage /></ProtectedRoute> },
  { path: "school-admin/staff", element: <ProtectedRoute><SchoolStaffAdministrationPage /></ProtectedRoute> },
];
