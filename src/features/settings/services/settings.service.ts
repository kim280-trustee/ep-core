import {
  settingsRepository,
} from "../repositories";


import type {
  CompanySettings,
} from "../types";



class SettingsService {



  getSettings(

    tenantId: string,

  ) {


    return settingsRepository.getSettings(

      tenantId,

    );


  }





  saveSettings(

    settings: CompanySettings,

  ) {


    return settingsRepository.saveSettings(

      settings,

    );


  }



}



export const settingsService =

  new SettingsService();