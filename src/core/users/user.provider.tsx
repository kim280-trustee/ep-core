/**
 * User Provider
 */

import type {
  PropsWithChildren,
} from "react";

import {
  UserContext,
} from "./user.context";

export function UserProvider({
  children,
}: PropsWithChildren) {

  return (

    <UserContext.Provider
      value={null}
    >

      {children}

    </UserContext.Provider>

  );

}