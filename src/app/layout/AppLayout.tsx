import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Menu, X } from "lucide-react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { storeContext } from "../../core/store/store.context";
import { settingsEngine } from "../../features/settings/engine";
import { useTranslation } from "../../core/i18n/useTranslation";

interface Props {
  children: ReactNode;
}

export function AppLayout({ children }: Props) {
  const { changeLanguage } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const context = storeContext.getStore();

    if (!context?.tenantId) {
      return;
    }

    const settings = settingsEngine.getSettings(context.tenantId);

    if (settings?.language === "th") {
      changeLanguage("th");
    } else {
      changeLanguage("en");
    }
  }, [changeLanguage]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="flex min-h-screen w-full">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
          <Sidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="w-full border-b border-slate-200 bg-white">
            <Header>
              <div className="flex min-h-14 items-center px-3 sm:px-6 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
                  aria-expanded={mobileMenuOpen}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
                </button>
              </div>
            </Header>
          </header>

          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute inset-0 bg-slate-950/40"
              />

              <aside className="relative z-10 h-dvh w-72 max-w-[85vw] overflow-y-auto overscroll-contain border-r border-slate-200 bg-white shadow-2xl">
                <Sidebar />
              </aside>
            </div>
          )}

          <main className="min-w-0 flex-1 bg-slate-50">
            <div className="mx-auto w-full min-w-0 max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
