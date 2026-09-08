import { useEffect, useState } from "react";
import { Building2, Globe2, Languages, Percent, Receipt, Save } from "lucide-react";
import { storeContext } from "../../../core/store/store.context";
import { useTranslation } from "../../../core/i18n/useTranslation";
import { useSettings } from "../hooks";
import type { CompanySettings } from "../types";

export default function SettingsPage() {
  const { t, changeLanguage } = useTranslation();
  const { settings, loadSettings, saveSettings } = useSettings();
  const [form, setForm] = useState<Partial<CompanySettings>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const context = storeContext.getStore();
    if (context?.tenantId) loadSettings(context.tenantId);
  }, [loadSettings]);

  useEffect(() => {
    if (!settings) return;
    setForm({ businessName: settings.businessName, country: settings.country, currency: settings.currency, language: settings.language, taxEnabled: settings.taxEnabled, taxRate: settings.taxRate, invoicePrefix: settings.invoicePrefix, receiptPrefix: settings.receiptPrefix });
    changeLanguage(settings.language === "th" ? "th" : "en");
  }, [settings, changeLanguage]);

  function updateField<K extends keyof CompanySettings>(field: K, value: CompanySettings[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    const context = storeContext.getStore();
    if (!context?.tenantId || !settings) return;
    const nextSettings: CompanySettings = { ...settings, businessName: form.businessName ?? settings.businessName, country: form.country ?? settings.country, currency: form.currency ?? settings.currency, language: form.language ?? settings.language, taxEnabled: form.taxEnabled ?? settings.taxEnabled, taxRate: form.taxRate ?? settings.taxRate, invoicePrefix: form.invoicePrefix ?? settings.invoicePrefix, receiptPrefix: form.receiptPrefix ?? settings.receiptPrefix, tenantId: context.tenantId, updatedAt: new Date().toISOString() };
    saveSettings(nextSettings);
    changeLanguage(nextSettings.language === "th" ? "th" : "en");
    setSaved(true);
  }

  if (!settings) return <div className="min-h-screen bg-slate-100 p-6"><div className="mx-auto max-w-5xl"><div className="rounded-3xl bg-slate-900 p-8 text-white"><h1 className="text-3xl font-bold">{t("settings.title")}</h1><p className="mt-2 text-slate-300">{t("settings.noSettings")}.</p></div></div></div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6"><div className="mx-auto max-w-5xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-900 text-white shadow-lg"><div className="flex items-start gap-4 p-8"><div className="rounded-2xl bg-blue-600 p-3"><Building2 size={28} /></div><div><p className="text-sm font-semibold uppercase tracking-wider text-blue-300">{t("common.businessManagement")}</p><h1 className="mt-1 text-3xl font-bold">{t("settings.title")}</h1><p className="mt-2 max-w-2xl text-slate-300">{t("settings.subtitle")}</p></div></div></section>
      <section className="rounded-3xl bg-white p-6 shadow-sm"><div className="mb-6 flex items-center gap-3"><Building2 className="text-blue-600" size={22} /><div><h2 className="text-xl font-bold text-slate-900">{t("settings.businessInformation")}</h2><p className="text-sm text-slate-500">{t("settings.businessInformationDescription")}</p></div></div><div className="grid gap-5 md:grid-cols-2"><div><label className="mb-2 block text-sm font-semibold text-slate-700">{t("settings.businessName")}</label><input value={form.businessName ?? ""} onChange={(event) => updateField("businessName", event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div><label className="mb-2 block text-sm font-semibold text-slate-700">{t("settings.country")}</label><div className="relative"><Globe2 size={18} className="absolute left-3 top-3.5 text-slate-400" /><select value={form.country ?? ""} onChange={(event) => updateField("country", event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="Thailand">{t("settings.thailand")}</option><option value="Kenya">{t("settings.kenya")}</option></select></div></div></div></section>
      <section className="rounded-3xl bg-white p-6 shadow-sm"><div className="mb-6 flex items-center gap-3"><Languages className="text-blue-600" size={22} /><div><h2 className="text-xl font-bold text-slate-900">{t("settings.languageAndCurrency")}</h2><p className="text-sm text-slate-500">{t("settings.languageAndCurrencyHelp")}</p></div></div><div className="grid gap-5 md:grid-cols-2"><div><label className="mb-2 block text-sm font-semibold text-slate-700">{t("settings.language")}</label><select value={form.language === "th" ? "th" : "en"} onChange={(event) => updateField("language", event.target.value as "en" | "th")} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="en">{t("settings.english")}</option><option value="th">{t("settings.thai")}</option></select></div><div><label className="mb-2 block text-sm font-semibold text-slate-700">{t("settings.currency")}</label><select value={form.currency ?? "THB"} onChange={(event) => updateField("currency", event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="THB">{t("settings.thaiBaht")}</option><option value="KES">{t("settings.kenyanShilling")}</option></select></div></div></section>
      <section className="rounded-3xl bg-white p-6 shadow-sm"><div className="mb-6 flex items-center gap-3"><Percent className="text-blue-600" size={22} /><div><h2 className="text-xl font-bold text-slate-900">{t("settings.taxSettings")}</h2><p className="text-sm text-slate-500">{t("settings.taxSettingsDescription")}</p></div></div><div className="grid gap-5 md:grid-cols-2"><div><label className="mb-2 block text-sm font-semibold text-slate-700">{t("settings.taxEnabled")}</label><select value={form.taxEnabled ? "yes" : "no"} onChange={(event) => updateField("taxEnabled", event.target.value === "yes")} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="yes">{t("common.yes")}</option><option value="no">{t("common.no")}</option></select></div><div><label className="mb-2 block text-sm font-semibold text-slate-700">{t("settings.taxRate")}</label><input type="number" min="0" step="0.01" value={form.taxRate ?? 0} onChange={(event) => updateField("taxRate", Number(event.target.value))} disabled={!form.taxEnabled} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100" /></div></div></section>
      <section className="rounded-3xl bg-white p-6 shadow-sm"><div className="mb-6 flex items-center gap-3"><Receipt className="text-blue-600" size={22} /><div><h2 className="text-xl font-bold text-slate-900">{t("settings.documentNumbering")}</h2><p className="text-sm text-slate-500">{t("settings.documentNumberingDescription")}</p></div></div><div className="grid gap-5 md:grid-cols-2"><div><label className="mb-2 block text-sm font-semibold text-slate-700">{t("settings.invoicePrefix")}</label><input value={form.invoicePrefix ?? ""} onChange={(event) => updateField("invoicePrefix", event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div><label className="mb-2 block text-sm font-semibold text-slate-700">{t("settings.receiptPrefix")}</label><input value={form.receiptPrefix ?? ""} onChange={(event) => updateField("receiptPrefix", event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div></div></section>
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div>{saved && <p className="font-semibold text-green-600">{t("settings.savedSuccessfully")}</p>}{!saved && <p className="text-sm text-slate-500">{t("settings.saveHelp")}</p>}</div><button type="button" onClick={handleSave} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"><Save size={18} />{t("common.save")}</button></section>
    </div></div>
  );
}
