import {
  Navigate,
} from "react-router-dom";

import type {
  ReactNode,
} from "react";

import {
  useAuth,
} from "./useAuth";


interface Props {

  children: ReactNode;

}


export function ProtectedRoute({

  children,

}: Props) {

  const {

    user,

    loading,

  } = useAuth();


  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center">

        Loading...

      </div>

    );

  }


  if (!user) {

    return (

      <Navigate

        to="/login"

        replace

      />

    );

  }


  return <>{children}</>;

}