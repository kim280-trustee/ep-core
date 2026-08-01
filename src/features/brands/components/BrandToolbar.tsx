/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Brand Toolbar
 * ============================================================
 */





interface BrandToolbarProps {


  search:string;



  onSearchChange:(

    value:string,

  )=>void;


}








export function BrandToolbar({


  search,


  onSearchChange,


}:BrandToolbarProps){





  return (



    <div

      className="mb-4"

    >




      <input



        value={search}



        onChange={(event)=>


          onSearchChange(

            event.target.value,

          )


        }



        placeholder="Search brands"



        className="

        border

        rounded

        p-2

        w-full

        "



      />






    </div>



  );


}