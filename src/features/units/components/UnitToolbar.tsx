import {
  Link,
} from "react-router-dom";



interface UnitToolbarProps {

  search:string;

  onSearchChange(
    value:string,
  ):void;

}



export function UnitToolbar({

  search,

  onSearchChange,

}:UnitToolbarProps){



return (

<div className="flex gap-4 mb-6">


<input

value={search}

onChange={(event)=>

  onSearchChange(
    event.target.value,
  )

}

aria-label="Search units"

placeholder="Search units..."

className="border rounded p-2 flex-1"

/>



<Link

to="/units/create"

className="bg-black text-white px-4 py-2 rounded"

>

Add Unit

</Link>


</div>

);


}