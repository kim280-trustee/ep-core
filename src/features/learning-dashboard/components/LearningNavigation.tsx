import { BookOpen, Compass, LayoutDashboard, LogOut, TrendingUp } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/core/auth";

const items = [
  { to: "/learning", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/learning/assignments", label: "Assignments", icon: BookOpen },
  { to: "/learning/progress", label: "Progress", icon: TrendingUp },
  { to: "/learning/recommendations", label: "Recommendations", icon: Compass },
];

export function LearningNavigation() {
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
    <header className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-950">E&P Learning</p>
          <p className="truncate text-xs text-slate-500">
            {user?.name || "Student"}{user?.email ? ` · ${user.email}` : ""}
          </p>
        </div>

        <nav className="flex flex-wrap gap-2" aria-label="Student navigation">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-slate-950",
                ].join(" ")
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut size={16} />
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
