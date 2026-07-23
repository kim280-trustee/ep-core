import {
  useState,
} from "react";


import {
  brandService,
} from "../services/brand.service";



export function useBrands() {


  const [
    brands,
    setBrands,
  ] = useState(
    brandService.getBrands(),
  );



  function refresh() {

    setBrands(
      brandService.getBrands(),
    );

  }



  function removeBrand(
    id: string,
  ) {


    brandService.deleteBrand(
      id,
    );


    refresh();

  }



  return {

    brands,

    refresh,

    removeBrand,

  };

}