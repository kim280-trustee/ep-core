import {
  useContext,
} from "react";


import {
  NotificationContext,
} from "./notification.context";





export function useNotification() {



  const context =

    useContext(

      NotificationContext,

    );





  if (!context) {


    throw new Error(

      "useNotification must be used inside NotificationProvider",

    );


  }





  return {


    notify:

      context.notify,



    removeNotification:

      context.removeNotification,



    notifications:

      context.notifications,




    success:

      (

        message: string,

      ) =>

        context.notify(

          "success",

          message,

        ),




    error:

      (

        message: string,

      ) =>

        context.notify(

          "error",

          message,

        ),




    warning:

      (

        message: string,

      ) =>

        context.notify(

          "warning",

          message,

        ),




    info:

      (

        message: string,

      ) =>

        context.notify(

          "info",

          message,

        ),


  };


}