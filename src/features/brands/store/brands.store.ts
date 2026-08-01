/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Brands Store
 * ============================================================
 */


import {

  create,

} from "zustand";



import {

  brandService,

} from "../services/brand.service";



import type {

  Brand,

  CreateBrandDto,

  UpdateBrandDto,

} from "../types/brand.types";







interface BrandsStore {


  brands:Brand[];


  search:string;




  loadBrands:()=>void;




  createBrand:(

    input:CreateBrandDto,

    tenantId:string,

    storeId:string,

  )=>void;





  updateBrand:(

    id:string,

    updates:UpdateBrandDto,

  )=>void;






  deleteBrand:(

    id:string,

  )=>void;






  setSearch:(

    value:string,

  )=>void;


}








export const useBrandsStore =


create<BrandsStore>(

(set)=>({





  brands:[],


  search:"",









  loadBrands(){


    set({


      brands:


        brandService.getBrands(),


    });


  },









  createBrand(


    input,


    tenantId,


    storeId,



  ){



    brandService.createBrand(


      input,


      tenantId,


      storeId,


    );





    set({


      brands:


        brandService.getBrands(),


    });



  },









  updateBrand(


    id,


    updates,



  ){



    brandService.updateBrand(


      id,


      updates,


    );





    set({


      brands:


        brandService.getBrands(),


    });



  },









  deleteBrand(


    id,


  ){



    brandService.deleteBrand(


      id,


    );





    set({


      brands:


        brandService.getBrands(),


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