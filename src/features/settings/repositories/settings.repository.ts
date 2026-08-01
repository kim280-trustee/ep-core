import type {
  CompanySettings,
} from "../types";


export interface SettingsRepository {


  getSettings(

    tenantId: string,

  ): CompanySettings | undefined;



  saveSettings(

    settings: CompanySettings,

  ): CompanySettings;



}