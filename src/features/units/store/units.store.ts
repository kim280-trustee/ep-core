/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Units Module
 * ------------------------------------------------------------
 * Units Zustand Store
 * ============================================================
 */


import {

  create,

} from "zustand";


import {

  unitService,

} from "../services/unit.service";


import type {

  Unit,

  CreateUnitDto,

  UpdateUnitDto,

} from "../types/unit.types";







interface UnitsStore {


  units:Unit[];


  search:string;





  loadUnits:()=>void;




  createUnit:(

    input:CreateUnitDto,

    tenantId:string,

    storeId:string,

  )=>void;





  updateUnit:(

    id:string,

    updates:UpdateUnitDto,

  )=>void;





  deleteUnit:(

    id:string,

  )=>void;





  setSearch:(

    value:string,

  )=>void;



}









export const useUnitsStore =


create<UnitsStore>(

(set)=>({





  units:[],



  search:"",







  loadUnits(){


    set({


      units:

        unitService.getUnits(),


    });


  },









  createUnit(

    input,

    tenantId,

    storeId,

  ){



    unitService.createUnit(

      input,

      tenantId,

      storeId,

    );





    set({


      units:

        unitService.getUnits(),


    });



  },









  updateUnit(

    id,

    updates,

  ){



    unitService.updateUnit(

      id,

      updates,

    );





    set({


      units:

        unitService.getUnits(),


    });



  },









  deleteUnit(

    id,

  ){



    unitService.deleteUnit(

      id,

    );





    set({


      units:

        unitService.getUnits(),


    });



  },









  setSearch(

    value,

  ){



    set({


      search:value,


    });



  },





})

);