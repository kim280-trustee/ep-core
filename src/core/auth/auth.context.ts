export interface AuthContext {

  userId: string;

  tenantId: string;

  storeId: string;

  role: string;

  permissions: string[];

}



class AuthContextManager {


  private context:
    AuthContext | null = null;



  setAuth(
    context: AuthContext,
  ) {

    this.context = context;

  }



  getAuth():

  AuthContext | null {

    return this.context;

  }



  hasPermission(
    permission: string,
  ): boolean {


    return (

      this.context?.permissions.includes(
        permission,
      ) ?? false

    );


  }



  clearAuth() {

    this.context = null;

  }


}



export const authContext =
  new AuthContextManager();