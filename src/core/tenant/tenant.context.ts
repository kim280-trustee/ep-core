export interface TenantContext {

  tenantId: string;

  name: string;

  country: string;

  currency: string;

}


class TenantContextManager {


  private context:
    TenantContext | null = null;



  setTenant(
    context: TenantContext,
  ) {

    this.context = context;

  }



  getTenant():

  TenantContext | null {

    return this.context;

  }



  clearTenant() {

    this.context = null;

  }


}


export const tenantContext =
  new TenantContextManager();