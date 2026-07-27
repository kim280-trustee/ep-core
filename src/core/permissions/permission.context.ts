export interface PermissionContext {

  role: string;

  permissions: string[];

}



class PermissionContextManager {


  private context:
    PermissionContext | null = null;



  setPermissions(
    context: PermissionContext,
  ) {

    this.context = context;

  }



  getPermissions():

  PermissionContext | null {

    return this.context;

  }



  can(
    permission: string,
  ): boolean {


    return (

      this.context?.permissions.includes(
        permission,
      ) ?? false

    );


  }



  clearPermissions() {

    this.context = null;

  }


}



export const permissionContext =
  new PermissionContextManager();