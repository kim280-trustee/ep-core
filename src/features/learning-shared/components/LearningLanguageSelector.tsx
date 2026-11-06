import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { useAuth } from "@/core/auth";
import { supabase } from "@/core/database";
import { learningParentService } from "@/features/learning-parent";
import { useTranslation } from "@/core/i18n/useTranslation";
import type { Language } from "@/core/i18n/i18n";

interface Props {
  scope?: "account" | "parent";
  compact?: boolean;
}

export function LearningLanguageSelector({ scope = "account", compact = false }: Props) {
  const { user } = useAuth();
  const { language, changeLanguage, t } = useTranslation();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const loadPreference = async () => {
      try {
        let preferred: Language = "en";
        if (scope === "parent") {
          const saved = await learningParentService.getLanguagePreference();
          preferred = saved === "th" ? "th" : "en";
        } else {
          const { data, error } = await supabase.auth.getUser();
          if (error) throw error;
          preferred = data.user?.user_metadata?.learning_language === "th" ? "th" : "en";
        }
        if (active) changeLanguage(preferred);
      } catch {
        // Preserve the current language if preference loading fails.
      }
    };
    if (user?.id) void loadPreference();
    return () => { active = false; };
  }, [changeLanguage, scope, user?.id]);

  const handleChange = async (next: Language) => {
    if (saving || next === language) return;
    setSaving(true);
    try {
      if (scope === "parent") {
        await learningParentService.setLanguagePreference(next);
      } else {
        const { error } = await supabase.auth.updateUser({ data: { learning_language: next } });
        if (error) throw error;
      }
      changeLanguage(next);
    } catch {
      // Do not change the interface when saving the preference fails.
    } finally {
      setSaving(false);
    }
  };

  return (
    <label className={compact ? "inline-flex items-center gap-2" : "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"}>
      <Languages size={16} className="shrink-0 text-slate-500" />
      {!compact && <span className="text-xs font-medium text-slate-600">{t("learning.language")}</span>}
      <select
        aria-label={t("learning.language")}
        value={language}
        disabled={saving}
        onChange={(event) => void handleChange(event.target.value as Language)}
        className="min-w-0 bg-transparent text-sm font-semibold text-slate-700 outline-none disabled:opacity-50"
      >
        <option value="en">{t("learning.english")}</option>
        <option value="th">{t("learning.thai")}</option>
      </select>
    </label>
  );
}
