import {
  create,
} from "zustand";


import {
  settingsEngine,
} from "../engine";


import type {
  CompanySettings,
} from "../types";



interface SettingsState {


  settings?: CompanySettings;


  loadSettings: (

    tenantId: string,

  ) => void;



  saveSettings: (

    settings: CompanySettings,

  ) => void;



}



export const useSettingsStore =

create<SettingsState>((set) => ({



  settings: undefined,



  loadSettings: (

    tenantId,

  ) => {


    set({

      settings:

        settingsEngine.getSettings(

          tenantId,

        ),

    });


  },



  saveSettings: (

    settings,

  ) => {


    set({

      settings:

        settingsEngine.saveSettings(

          settings,

        ),

    });


  },



}));