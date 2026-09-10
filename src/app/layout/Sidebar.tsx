import {
  BarChart3,
  Boxes,
  ChevronDown,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Settings as SettingsIcon,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "../../core/i18n/useTranslation";
import { useAuth } from "../../core/auth/useAuth";

type NavItem = {
  labelKey: string;
  href: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const mainItems: NavItem[] = [
  { labelKey: "navigation.dashboard", href: "/", icon: LayoutDashboard, exact: true },
  { labelKey: "navigation.sales", href: "/sales", icon: ShoppingCart },
  { labelKey: "navigation.products", href: "/products", icon: Package },
  { labelKey: "navigation.inventory", href: "/inventory", icon: Boxes },
  { labelKey: "navigation.customers", href: "/customers", icon: Users },
];

const purchasingItems: NavItem[] = [
  { labelKey: "navigation.suppliers", href: "/suppliers", icon: Truck },
  {
    labelKey: "navigation.purchaseOrders",
    href: "/purchasing",
    icon: ClipboardList,
    exact: true,
  },
  {
    labelKey: "navigation.goodsReceipts",
    href: "/purchase-receiving",
    icon: Receipt,
  },
  {
    labelKey: "navigation.purchaseReturns",
    href: "/purchasing/returns",
    icon: FileText,
  },
];

const businessItems: NavItem[] = [
  { labelKey: "navigation.expenses", href: "/expenses", icon: Wallet },
  { labelKey: "navigation.reports", href: "/reports", icon: BarChart3 },
];

function NavigationItem({
  item,
  t,
}: {
  item: NavItem;
  t: (key: string) => string;
}) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      end={item.exact === true || item.href === "/"}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
          isActive
            ? "bg-slate-950 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        ].join(" ")
      }
    >
      <Icon size={18} className="shrink-0" />
      <span>{t(item.labelKey)}</span>
    </NavLink>
  );
}

function NavigationGroup({
  titleKey,
  items,
  t,
}: {
  titleKey: string;
  items: NavItem[];
  t: (key: string) => string;
}) {
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        <span>{t(titleKey)}</span>
        <ChevronDown size={13} />
      </div>

      <nav className="space-y-1">
        {items.map((item) => (
          <NavigationItem key={item.href} item={item} t={t} />
        ))}
      </nav>
    </div>
  );
}

export function Sidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <aside className="flex min-h-screen flex-col bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
            E&P
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-950">
              E&P Smart POS
            </p>
            <p className="text-xs text-slate-400">
              {t("common.businessManagement")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavigationGroup
          titleKey="navigation.main"
          items={mainItems}
          t={t}
        />

        <NavigationGroup
          titleKey="navigation.purchasing"
          items={purchasingItems}
          t={t}
        />

        <NavigationGroup
          titleKey="navigation.business"
          items={businessItems}
          t={t}
        />
      </div>

      <div className="border-t border-slate-200 p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            [
              "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition",
              isActive
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            ].join(" ")
          }
        >
          <SettingsIcon size={18} />
          <span>{t("navigation.settings")}</span>
        </NavLink>

        {user && (
          <div className="mt-2 border-t border-slate-100 pt-2">
            <div className="mb-2 px-3 py-2">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>

            <button
              type="button"
              onClick={() => void logout()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
