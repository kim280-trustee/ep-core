warning: in the working copy of 'src/app/layout/Sidebar.tsx', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/src/app/layout/Sidebar.tsx b/src/app/layout/Sidebar.tsx[m
[1mindex cd96609..c27c443 100644[m
[1m--- a/src/app/layout/Sidebar.tsx[m
[1m+++ b/src/app/layout/Sidebar.tsx[m
[36m@@ -1,10 +1,11 @@[m
[31m-﻿import {[m
[32m+[m[32mimport {[m
   BarChart3,[m
   Boxes,[m
   ChevronDown,[m
   ClipboardList,[m
   FileText,[m
   LayoutDashboard,[m
[32m+[m[32m  LogOut,[m
   Package,[m
   Receipt,[m
   Settings as SettingsIcon,[m
[36m@@ -15,6 +16,7 @@[m
 } from "lucide-react";[m
 import { NavLink } from "react-router-dom";[m
 import { useTranslation } from "../../core/i18n/useTranslation";[m
[32m+[m[32mimport { useAuth } from "../../core/auth/useAuth";[m
 [m
 type NavItem = {[m
   labelKey: string;[m
[36m@@ -109,6 +111,7 @@[m [mfunction NavigationGroup({[m
 [m
 export function Sidebar() {[m
   const { t } = useTranslation();[m
[32m+[m[32m  const { user, logout } = useAuth();[m
 [m
   return ([m
     <aside className="flex min-h-screen flex-col bg-white">[m
[36m@@ -147,9 +150,7 @@[m [mexport function Sidebar() {[m
           items={businessItems}[m
           t={t}[m
         />[m
[31m-      </div>[m
[31m-[m
[31m-      <div className="border-t border-slate-200 p-3">[m
[32m+[m[32m      </div>      <div className="border-t border-slate-200 p-3">[m
         <NavLink[m
           to="/settings"[m
           className={({ isActive }) =>[m
[36m@@ -164,8 +165,27 @@[m [mexport function Sidebar() {[m
           <SettingsIcon size={18} />[m
           <span>{t("navigation.settings")}</span>[m
         </NavLink>[m
[32m+[m
[32m+[m[32m        {user && ([m
[32m+[m[32m          <div className="mt-2 border-t border-slate-100 pt-2">[m
[32m+[m[32m            <div className="mb-2 px-3 py-2">[m
[32m+[m[32m              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>[m
[32m+[m[32m              <p className="truncate text-xs text-slate-400">{user.email}</p>[m
[32m+[m[32m            </div>[m
[32m+[m
[32m+[m[32m            <button[m
[32m+[m[32m              type="button"[m
[32m+[m[32m              onClick={() => void logout()}[m
[32m+[m[32m              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"[m
[32m+[m[32m            >[m
[32m+[m[32m              <LogOut size={18} />[m
[32m+[m[32m              <span>Logout</span>[m
[32m+[m[32m            </button>[m
[32m+[m[32m          </div>[m
[32m+[m[32m        )}[m
       </div>[m
     </aside>[m
   );[m
 }[m
 [m
[41m+[m
