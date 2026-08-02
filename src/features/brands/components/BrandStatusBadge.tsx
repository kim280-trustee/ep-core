import {

  BrandStatus,

} from "../types/brand.types";





interface Props {


  status:BrandStatus;


}






export function BrandStatusBadge({

  status,

}:Props){



  return (


    <span

      className="text-sm"

    >

      {status}


    </span>


  );


}