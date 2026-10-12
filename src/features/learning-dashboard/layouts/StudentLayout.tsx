import { BookOpen, Compass, LayoutDashboard, LogOut, Sparkles, TrendingUp } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/core/auth";

const items = [
  { to: "/learning", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/learning/assignments", label: "My learning", icon: BookOpen },
  { to: "/learning/progress", label: "Progress", icon: TrendingUp },
  { to: "/learning/recommendations", label: "Explore", icon: Compass },
];

function navigationClass(isActive: boolean) {
  return [
    "student-nav-link inline-flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-all duration-200",
    isActive
      ? "student-nav-link-active bg-violet-600 text-white shadow-lg shadow-violet-200"
      : "text-slate-600 hover:bg-violet-50 hover:text-violet-800",
  ].join(" ");
}

export default function StudentLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
    <div className="student-experience min-h-screen bg-[#f7f5ff] text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-[1720px]">
        <aside className="student-sidebar sticky top-0 hidden h-screen w-[272px] shrink-0 flex-col border-r border-violet-100 bg-white/90 p-5 backdrop-blur-xl lg:flex">
          <NavLink to="/learning" className="student-brand flex items-center gap-3 rounded-3xl p-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-200">
              <Sparkles size={24} />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-black tracking-tight text-slate-900">E&P Learning</span>
              <span className="block text-xs font-semibold text-violet-500">Your learning adventure</span>
            </span>
          </NavLink>

          <div className="student-profile mt-7 rounded-3xl bg-gradient-to-br from-amber-100 via-pink-100 to-violet-100 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-black text-violet-600 shadow-sm">
                {(user?.name || "S").trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-slate-900">{user?.name || "Student"}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-600">Ready to learn?</p>
              </div>
            </div>
          </div>

          <p className="mb-2 mt-8 px-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Your space</p>
          <nav className="space-y-2" aria-label="Student portal navigation">
            {items.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => navigationClass(isActive)}>
                <Icon size={19} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-violet-100 bg-violet-50/80 p-4">
            <p className="text-sm font-extrabold text-violet-900">Little steps add up!</p>
            <p className="mt-1 text-xs leading-5 text-violet-700">Keep practising and celebrate what you discover.</p>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
            >
              <LogOut size={16} />
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
            <p className="mt-3 truncate text-[11px] text-slate-400">{user?.email || ""}</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-24 lg:pb-0">
          <header className="student-mobile-header sticky top-0 z-30 border-b border-violet-100/80 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <NavLink to="/learning" className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                  <Sparkles size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black text-slate-900">E&P Learning</span>
                  <span className="block max-w-48 truncate text-xs font-medium text-slate-500">{user?.name || "Student"}</span>
                </span>
              </NavLink>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
                aria-label="Sign out"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 disabled:opacity-50"
              >
                <LogOut size={17} />
              </button>
            </div>
          </header>

          <div className="student-page-shell mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-9">
            <Outlet />
          </div>

          <nav className="student-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 gap-1 border-t border-violet-100 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_28px_rgba(76,29,149,0.08)] backdrop-blur-xl lg:hidden" aria-label="Student mobile navigation">
            {items.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => [
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-extrabold transition",
                isActive ? "bg-violet-100 text-violet-700" : "text-slate-500 hover:bg-violet-50",
              ].join(" ")}>
                <Icon size={20} />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </nav>
        </main>
      </div>
    </div>
  );
}
