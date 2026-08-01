export interface Database {


  public: {


    Tables: {



      tenants: {


        Row: {


          id: string;


          name: string;


          country: string;


          currency: string;


        };


      };



      users: {


        Row: {


          id: string;


          tenantId: string;


          email: string;


          name: string;


        };


      };



    };


  };


}