import {
  createContext,
} from "react";



export type NotificationType =

  | "success"

  | "error"

  | "warning"

  | "info";





export interface Notification {


  id: string;


  type: NotificationType;


  message: string;


}




export interface NotificationContextValue {


  notifications: Notification[];



  notify:

    (

      type: NotificationType,

      message: string,

    ) => void;




  removeNotification:

    (

      id: string,

    ) => void;


}





export const NotificationContext =

  createContext<

    NotificationContextValue | undefined

  >(undefined);