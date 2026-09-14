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
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="flex min-h-screen w-full">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
          <Sidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="w-full border-b border-slate-200 bg-white">
            <Header />
          </header>

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
