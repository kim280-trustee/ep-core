import { Award, BookOpen, CalendarDays, Compass, Languages, LayoutDashboard, TrendingUp, Sparkles, Bell, Gamepad2, GraduationCap } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { LearningWorkspaceShell } from "@/features/learning-shared/components/LearningWorkspaceShell";

const items = [
  { to: "/learning", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/learning/today", label: "Daily Hub", icon: CalendarDays },
  { to: "/learning/live-games", label: "Live Games", icon: Gamepad2 },
  { to: "/learning/coach", label: "AI Coach", icon: Sparkles },
  { to: "/learning/assignments", label: "Assignments", icon: BookOpen },
  { to: "/learning/progress", label: "Progress", icon: TrendingUp },
  { to: "/learning/recommendations", label: "Recommendations", icon: Compass },
  { to: "/learning/rewards", label: "Rewards", icon: Award },
  { to: "/learning/vocabulary", label: "Vocabulary", icon: Languages },
  { to: "/calendar", label: "School Calendar", icon: CalendarDays },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/marketplace", label: "Extra Classes", icon: GraduationCap },
];

export default function StudentLayout() {
  return (
    <LearningWorkspaceShell
      role="student"
      navigation={
        <nav className="space-y-1" aria-label="Student portal navigation">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => [
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                isActive ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              ].join(" ")}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      }
    >
      <Outlet />
    </LearningWorkspaceShell>
  );
}
