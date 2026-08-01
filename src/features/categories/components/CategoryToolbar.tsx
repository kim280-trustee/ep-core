/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Category Toolbar
 * ============================================================
 */


interface CategoryToolbarProps {


  search:string;



  onSearchChange:

    (

      value:string,

    )=>void;


}







export function CategoryToolbar({


  search,


  onSearchChange,


}:CategoryToolbarProps){





  return (


    <div

      className="

      mb-4

      "

    >



      <input



        value={search}



        onChange={(event)=>


          onSearchChange(

            event.target.value,

          )


        }



        placeholder="Search categories"



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