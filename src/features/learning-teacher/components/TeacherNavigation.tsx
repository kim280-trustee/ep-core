import { BookOpen, FileQuestion, LayoutDashboard, LogOut, PlusCircle } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/core/auth";

const items = [
  { to: "/teacher", label: "Teacher Dashboard", icon: LayoutDashboard },
  { to: "/teacher/assignments/new", label: "Create Assignment", icon: PlusCircle },
  { to: "/teacher/authoring", label: "Authoring", icon: BookOpen },
  { to: "/teacher/question-bank", label: "Question Bank", icon: FileQuestion },
];

export function TeacherNavigation() {
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
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut size={16} />
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>

      <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/teacher"}
            className={({ isActive }) =>
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition " +
              (isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100")
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
