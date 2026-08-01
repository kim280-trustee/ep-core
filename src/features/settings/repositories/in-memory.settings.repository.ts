import type {
  SettingsRepository,
} from "./settings.repository";


import type {
  CompanySettings,
} from "../types";



class InMemorySettingsRepository

implements SettingsRepository {



  private settings:

    CompanySettings[] = [];





  getSettings(

    tenantId: string,

  ) {


    return this.settings.find(

      (item) =>

        item.tenantId === tenantId,

    );


  }





  saveSettings(

    settings: CompanySettings,

  ) {


    const existing =

      this.settings.find(

        (item) =>

          item.id === settings.id,

      );



    if (existing) {


      Object.assign(

        existing,

        settings,

      );


      return existing;


    }



    this.settings.push(

      settings,

    );


    return settings;


  }



}



export const inMemorySettingsRepository =

  new InMemorySettingsRepository();