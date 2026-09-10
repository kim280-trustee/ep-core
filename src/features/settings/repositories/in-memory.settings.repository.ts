import type { SettingsRepository } from "./settings.repository";
import type { CompanySettings } from "../types";

const STORAGE_KEY = "ep-core-company-settings";

function createSettingsId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `settings-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

class InMemorySettingsRepository implements SettingsRepository {
  private settings: CompanySettings[] = this.loadFromStorage();

  private loadFromStorage(): CompanySettings[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persist() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.settings),
    );
  }

  getSettings(tenantId: string): CompanySettings {
    const existing = this.settings.find(
      (item) => item.tenantId === tenantId,
    );

    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();

    const defaults: CompanySettings = {
      id: createSettingsId(),
      tenantId,
      businessName: "My Business",
      country: "Thailand",
      currency: "THB",
      language: "en",
      taxEnabled: true,
      taxRate: 7,
      invoicePrefix: "INV",
      receiptPrefix: "REC",
      createdAt: now,
      updatedAt: now,
    };

    this.settings.push(defaults);
    this.persist();

    return defaults;
  }

  saveSettings(settings: CompanySettings): CompanySettings {
    const existingIndex = this.settings.findIndex(
      (item) => item.id === settings.id,
    );

    const updatedSettings: CompanySettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.settings[existingIndex] = updatedSettings;
    } else {
      this.settings.push(updatedSettings);
    }

    this.persist();

    return updatedSettings;
  }
}

export const inMemorySettingsRepository =
  new InMemorySettingsRepository();
