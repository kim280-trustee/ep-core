import {
  settingsService,
} from "../services";


import type {
  CompanySettings,
} from "../types";



class SettingsEngine {



  getSettings(

    tenantId: string,

  ) {


    return settingsService.getSettings(

      tenantId,

    );


  }





  saveSettings(

    settings: CompanySettings,

  ) {


    return settingsService.saveSettings(

      settings,

    );


  }



}



export const settingsEngine =

  new SettingsEngine();