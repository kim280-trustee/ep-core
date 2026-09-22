import type { RouteObject } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";
import TeacherDashboardPage from "../pages/TeacherDashboardPage";
import TeacherClassPage from "../pages/TeacherClassPage";
import CreateTeacherAssignmentPage from "../pages/CreateTeacherAssignmentPage";
import TeacherAuthoringPage from "../pages/TeacherAuthoringPage";

export const learningTeacherRoutes: RouteObject[] = [
  {
    path: "teacher",
    element: <TeacherLayout />,
    children: [
      { index: true, element: <TeacherDashboardPage /> },
      {
        path: "classes/:classGroupId",
        element: <TeacherClassPage />,
      },
      {
        path: "assignments/new",
        element: <CreateTeacherAssignmentPage />,
      },
      {
        path: "authoring",
        element: <TeacherAuthoringPage />,
      },
    ],
  },
];
