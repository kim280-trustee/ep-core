/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Brands Hook
 * ============================================================
 */


import {

  useBrandsStore,

} from "../store/brands.store";







export function useBrands(){





  const brands =


    useBrandsStore(


      state => state.brands,


    );






  const search =


    useBrandsStore(


      state => state.search,


    );







  const loadBrands =


    useBrandsStore(


      state => state.loadBrands,


    );







  const createBrand =


    useBrandsStore(


      state => state.createBrand,


    );







  const updateBrand =


    useBrandsStore(


      state => state.updateBrand,


    );







  const deleteBrand =


    useBrandsStore(


      state => state.deleteBrand,


    );







  const setSearch =


    useBrandsStore(


      state => state.setSearch,


    );









  return {


    brands,


    search,


    loadBrands,


    createBrand,


    updateBrand,


    deleteBrand,


    setSearch,


  };


}