import { Home, UserPlus, Search, Bell, Megaphone, CalendarDays } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { learningSchoolAnnouncementsService } from "@/features/learning-school-announcements";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { LearningWorkspaceShell } from "@/features/learning-shared/components/LearningWorkspaceShell";

type ParentNavigationItem = { to: string; label: string; icon: typeof Home; end?: boolean };

const items: ParentNavigationItem[] = [
  { to: "/parent", label: "learning.dashboard", icon: Home, end: true },
  { to: "/parent/invite", label: "learning.invitation", icon: UserPlus },
  { to: "/parent/announcements", label: "learning.announcements", icon: Megaphone },
  { to: "/calendar", label: "learning.schoolCalendar", icon: CalendarDays },
  { to: "/notifications", label: "learning.notifications", icon: Bell },
  { to: "/marketplace", label: "learning.extraClasses", icon: Search },
];

export default function ParentLayout() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const announcementsQuery = useQuery({
    queryKey: ["learning", "parent", "school-announcements", user?.id],
    queryFn: () => learningSchoolAnnouncementsService.listForParent(50),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });
  const unreadAnnouncementCount = (announcementsQuery.data ?? []).filter((item) => !item.read_at).length;

  return (
    <LearningWorkspaceShell
      role="parent"
      navigation={
        <nav className="space-y-1" aria-label="Parent portal navigation">
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
              <span className="min-w-0 flex-1">{t(label)}</span>
              {label === "learning.announcements" && unreadAnnouncementCount > 0 && (
                <span aria-label={`${unreadAnnouncementCount} unread announcements`} className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800">
                  {unreadAnnouncementCount > 99 ? "99+" : unreadAnnouncementCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      }
    >
      <Outlet />
    </LearningWorkspaceShell>
  );
}
