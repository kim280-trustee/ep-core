import { BookOpen, Compass, LayoutDashboard, LogOut, TrendingUp } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/core/auth";

const items = [
  { to: "/learning", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/learning/assignments", label: "Assignments", icon: BookOpen },
  { to: "/learning/progress", label: "Progress", icon: TrendingUp },
  { to: "/learning/recommendations", label: "For You", icon: Compass },
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
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {user?.email && (
          <span className="px-2 text-xs text-slate-500" title={user.email}>
            {user.email}
          </span>
        )}
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut size={16} />
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="Learning navigation">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50",
              ].join(" ")
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
