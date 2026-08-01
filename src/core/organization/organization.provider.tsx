import {
  useState,
  type ReactNode,
} from "react";


import {
  OrganizationContext,
} from "./organization.context";


import type {
  Organization,
} from "./types/organization.types";



interface Props {

 children: ReactNode;

}



export function OrganizationProvider(
{
 children,
}:Props
){


 const [
   organization,
   setOrganization,
 ] =
 useState<Organization | null>(
   null,
 );


 return (

  <OrganizationContext.Provider

   value={{
    organization,
    setOrganization,
   }}

  >

   {children}

  </OrganizationContext.Provider>

 );


}