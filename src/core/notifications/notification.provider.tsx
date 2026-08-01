import {
  useState,
} from "react";


import {
  v4 as uuid,
} from "uuid";


import {
  NotificationContext,
} from "./notification.context";


import type {
  Notification,
  NotificationType,
} from "./notification.context";



interface Props {

  children: React.ReactNode;

}





export function NotificationProvider({

  children,

}: Props) {



  const [

    notifications,

    setNotifications,

  ] = useState<Notification[]>([]);






  function notify(

    type: NotificationType,

    message: string,

  ): void {



    const notification: Notification = {


      id: uuid(),


      type,


      message,


    };





    setNotifications(

      (current) =>

        [

          ...current,

          notification,

        ],

    );


  }







  function removeNotification(

    id: string,

  ): void {



    setNotifications(

      (current) =>

        current.filter(

          (item) =>

            item.id !== id,

        ),

    );


  }







  return (

    <NotificationContext.Provider


      value={{


        notifications,


        notify,


        removeNotification,


      }}


    >

      {children}


    </NotificationContext.Provider>

  );


}