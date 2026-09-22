import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";
import { TeacherNavigation } from "../components/TeacherNavigation";

export default function TeacherLayout() {
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
