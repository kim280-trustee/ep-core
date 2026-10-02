import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute, useAuth } from "@/core/auth";
import { TeacherNavigation } from "../components/TeacherNavigation";
import { learningTeacherService } from "../services/learning-teacher.service";

export default function TeacherLayout() {
  const { user, loading } = useAuth();
  const teacherAccess = useQuery({
    queryKey: ["learning", "teacher-access", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id) && !loading,
    staleTime: 60_000,
  });

  if (loading || teacherAccess.isPending) {
    return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl h-24 animate-pulse rounded-2xl bg-slate-200" /></div>;
  }

  if (!user || teacherAccess.isError) {
    return <Navigate to="/login" replace />;
  }

  if (!teacherAccess.data?.length) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-bold text-slate-900">E&P Learning</p>
                <p className="text-xs text-slate-500">Teacher workspace</p>
              </div>
              <TeacherNavigation />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
