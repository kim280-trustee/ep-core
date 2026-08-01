import type {
  ReactNode,
} from "react";


import {
  Header,
} from "./Header";


import {
  Sidebar,
} from "./Sidebar";



interface Props {

  children: ReactNode;

}



export function AppLayout({

  children,

}: Props) {


  return (

    <div className="min-h-screen flex">


      <aside className="w-64">

        <Sidebar />

      </aside>




      <div className="flex-1 flex flex-col">


        <header>

          <Header />

        </header>




        <main className="flex-1 p-4">

          {children}

        </main>


      </div>


    </div>

  );

}