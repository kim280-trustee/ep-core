import { useEffect } from "react";
import type { ReactNode } from "react";

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

  useEffect(() => {
    const context = storeContext.getStore();

    if (!context?.tenantId) {
      return;
    }

    const settings = settingsEngine.getSettings(
      context.tenantId,
    );

    if (settings?.language === "th") {
      changeLanguage("th");
    } else {
      changeLanguage("en");
    }
  }, [changeLanguage]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
          <Sidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white">
            <Header />
          </header>

          <main className="min-w-0 flex-1 bg-slate-50">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
