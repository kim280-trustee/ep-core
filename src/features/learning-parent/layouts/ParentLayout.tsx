import { Home, LogOut, UserPlus } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/core/auth";

const items = [
  { to: "/parent", label: "Dashboard", icon: Home, end: true },
  { to: "/parent/invite", label: "Invitation", icon: UserPlus },
];

export default function ParentLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try { await logout(); navigate("/login", { replace: true }); }
    finally { setLoggingOut(false); }
  };
  const linkClass = (active: boolean) => [
    "inline-flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
    active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
  ].join(" ");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 lg:flex lg:flex-col">
          <div className="px-3 py-3">
            <p className="text-lg font-bold text-slate-950">E&P Learning</p>
            <p className="mt-1 text-xs text-slate-500">Parent Portal</p>
          </div>
          <nav className="mt-6 space-y-1" aria-label="Parent portal navigation">
            {items.map(({to,label,icon:Icon,end}) => (
              <NavLink key={to} to={to} end={end} className={({isActive}) => linkClass(isActive)}>
                <Icon size={18} />{label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-slate-200 pt-4">
            <p className="truncate px-3 text-xs text-slate-500">{user?.email || ""}</p>
            <button type="button" onClick={() => void handleLogout()} disabled={loggingOut}
              className="mt-3 inline-flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50">
              <LogOut size={18} />{loggingOut ? "Signing out..." : "Logout"}
            </button>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0"><p className="font-bold text-slate-950">E&P Learning</p><p className="truncate text-xs text-slate-500">{user?.email || "Parent"}</p></div>
              <button type="button" onClick={() => void handleLogout()} disabled={loggingOut} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-50">{loggingOut ? "Signing out..." : "Logout"}</button>
            </div>
            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Parent mobile navigation">
              {items.map(({to,label,icon:Icon,end}) => <NavLink key={to} to={to} end={end} className={({isActive}) => linkClass(isActive)}><Icon size={16}/><span className="whitespace-nowrap">{label}</span></NavLink>)}
            </nav>
          </div>
          <div className="p-4 sm:p-6 lg:p-8"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
