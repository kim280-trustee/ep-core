import { useState, type ReactNode } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService, useAuth, type LoginDestination } from "@/core/auth";
import { LearningLanguageSelector } from "./LearningLanguageSelector";

export type LearningWorkspaceRole = "student" | "teacher" | "parent" | "school-admin";

interface Props {
  role: LearningWorkspaceRole;
  navigation: ReactNode;
  children: ReactNode;
}

const PORTALS: Array<{ path: LoginDestination; label: string }> = [
  { path: "/learning", label: "Student Portal" },
  { path: "/teacher", label: "Teacher Portal" },
  { path: "/parent", label: "Parent Portal" },
  { path: "/school-admin", label: "School Admin Portal" },
];

const ROLE_LABELS: Record<LearningWorkspaceRole, string> = {
  student: "Student Portal",
  teacher: "Teacher Portal",
  parent: "Parent Portal",
  "school-admin": "School Admin Portal",
};

const ROLE_PATHS: Record<LearningWorkspaceRole, LoginDestination> = {
  student: "/learning",
  teacher: "/teacher",
  parent: "/parent",
  "school-admin": "/school-admin",
};

export function LearningWorkspaceShell({ role, navigation, children }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const destinationsQuery = useQuery({
    queryKey: ["learning", "portal-destinations", user?.authUserId],
    queryFn: () => authService.getLoginDestinations(user!.authUserId),
    enabled: Boolean(user?.authUserId),
    staleTime: 60_000,
    retry: 1,
  });

  const availablePortals = (destinationsQuery.data ?? []).filter((path) =>
    PORTALS.some((portal) => portal.path === path),
  );

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "We could not sign you out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const switchPortal = (path: string) => {
    if (!availablePortals.includes(path as LoginDestination)) return;
    setMobileOpen(false);
    navigate(path, { replace: true });
  };

  const portalSelector = availablePortals.length > 1 ? (
    <label className="block min-w-0">
      <span className="sr-only">Switch portal</span>
      <select
        aria-label="Switch portal"
        value={ROLE_PATHS[role]}
        onChange={(event) => switchPortal(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      >
        {PORTALS.filter((portal) => availablePortals.includes(portal.path)).map((portal) => (
          <option key={portal.path} value={portal.path}>{portal.label}</option>
        ))}
      </select>
    </label>
  ) : null;

  const sidebar = (
    <div className="flex min-h-full flex-col bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <p className="text-lg font-bold text-slate-950">E&P Learning</p>
        <p className="mt-1 text-xs text-slate-500">{ROLE_LABELS[role]}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4" onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) setMobileOpen(false);
      }}>
        {navigation}
      </div>
      <div className="border-t border-slate-200 p-4">
        <p className="truncate px-2 text-sm font-semibold text-slate-900">{user?.name || "Learning user"}</p>
        <p className="mt-1 truncate px-2 text-xs text-slate-500">{user?.email || ""}</p>
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className="mt-3 inline-flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut size={18} />
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
          {sidebar}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileOpen}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-950">E&P Learning</p>
                <p className="truncate text-xs text-slate-500">{ROLE_LABELS[role]}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <LearningLanguageSelector scope={role === "parent" ? "parent" : "account"} compact />
              {portalSelector && <div className="w-40 sm:w-48">{portalSelector}</div>}
            </div>
          </header>

          {mobileOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
                className="absolute inset-0 bg-slate-950/40"
              />
              <aside className="relative z-10 h-dvh w-80 max-w-[88vw] overflow-y-auto border-r border-slate-200 bg-white shadow-2xl">
                {sidebar}
              </aside>
            </div>
          )}

          {logoutError && (
            <p role="alert" aria-live="assertive" className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {logoutError}
            </p>
          )}
          <main className="min-w-0 flex-1">
            <div className="w-full px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
