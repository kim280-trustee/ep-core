import { BookOpen, FileQuestion, FileText, LayoutDashboard, LogOut, PlusCircle } from "lucide-react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute, useAuth } from "@/core/auth";
import { learningTeacherService } from "../services/learning-teacher.service";

const items = [
  { to: "/teacher", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/teacher/assignments/new", label: "Create Assignment", icon: PlusCircle },
  { to: "/teacher/content", label: "Content Library", icon: FileText },
  { to: "/teacher/authoring", label: "Authoring", icon: BookOpen },
  { to: "/teacher/question-bank", label: "Question Bank", icon: FileQuestion },
];

export default function TeacherLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const teacherAccess = useQuery({
    queryKey: ["learning", "teacher-access", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id) && !loading,
    staleTime: 60_000,
  });

  if (loading || teacherAccess.isPending) return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto h-24 max-w-7xl animate-pulse rounded-2xl bg-slate-200" /></div>;
  if (!user || teacherAccess.isError || !teacherAccess.data?.length) return <Navigate to="/login" replace />;

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try { await logout(); navigate("/login", { replace: true }); }
    finally { setLoggingOut(false); }
  };

  const linkClass = (active: boolean) => [
    "inline-flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
    active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
  ].join(" ");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-[1600px]">
          <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-4 lg:flex lg:flex-col">
            <div className="px-3 py-3">
              <p className="text-lg font-bold text-slate-950">E&P Learning</p>
              <p className="mt-1 text-xs text-slate-500">Teacher Workspace</p>
            </div>
            <nav className="mt-6 space-y-1" aria-label="Teacher portal navigation">
              {items.map(({to,label,icon:Icon,end}) => <NavLink key={to} to={to} end={end} className={({isActive}) => linkClass(isActive)}><Icon size={18}/>{label}</NavLink>)}
            </nav>
            <div className="mt-6 border-t border-slate-200 pt-4">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">My Classes</p>
              <div className="mt-2 space-y-1">
                {teacherAccess.data.slice(0, 8).map(cls => <NavLink key={cls.classGroupId} to={"/teacher/classes/"+cls.classGroupId} className={({isActive}) => linkClass(isActive)}>{cls.className}</NavLink>)}
              </div>
            </div>
            <div className="mt-auto border-t border-slate-200 pt-4">
              <p className="truncate px-3 text-xs text-slate-500">{user.email || ""}</p>
              <button type="button" onClick={() => void handleLogout()} disabled={loggingOut} className="mt-3 inline-flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"><LogOut size={18}/>{loggingOut ? "Signing out..." : "Logout"}</button>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div><p className="font-bold text-slate-950">E&P Learning</p><p className="text-xs text-slate-500">Teacher Workspace</p></div>
                <button type="button" onClick={() => void handleLogout()} disabled={loggingOut} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-50">{loggingOut ? "Signing out..." : "Logout"}</button>
              </div>
              <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Teacher mobile navigation">
                {items.map(({to,label,icon:Icon,end}) => <NavLink key={to} to={to} end={end} className={({isActive}) => "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold "+(isActive ? "bg-slate-900 text-white" : "text-slate-600 ring-1 ring-inset ring-slate-200")}><Icon size={16}/>{label}</NavLink>)}
              </nav>
            </div>
            <div className="p-4 sm:p-6 lg:p-8"><Outlet /></div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
