export interface StoreContext {

  storeId: string;

  tenantId: string;

  name: string;

}



class StoreContextManager {


  private context:
    StoreContext | null = null;



  setStore(
    context: StoreContext,
  ) {

    this.context = context;

  }



  getStore():

  StoreContext | null {

    return this.context;

  }



  clearStore() {

    this.context = null;

  }


}


export const storeContext =
  new StoreContextManager();