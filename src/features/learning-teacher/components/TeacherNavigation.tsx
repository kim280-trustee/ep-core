import { LayoutDashboard, PlusCircle } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/teacher", label: "Teacher Dashboard", icon: LayoutDashboard },
  { to: "/teacher/assignments/new", label: "Create Assignment", icon: PlusCircle },
];

export function TeacherNavigation() {
  return (
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
  );
}
