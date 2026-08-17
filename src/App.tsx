/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Application Root
 * ============================================================
 */

import {
  AppRouter,
} from "@/app/router/AppRouter";

import {
  storeContext,
} from "@/core/store/store.context";

/*
 * ------------------------------------------------------------
 * DEVELOPMENT TEST CONTEXT
 * ------------------------------------------------------------
 *
 * Current database:
 *
 * Tenant:
 * a0d812af-194c-4561-b4ea-5fd9885d0866
 *
 * Business:
 * e pcoreuser
 *
 * There is currently no stores table in the database, so the
 * tenant is temporarily used as the business/store scope.
 *
 * This does NOT modify the database.
 * ------------------------------------------------------------
 */

const DEVELOPMENT_TENANT_ID =
  "a0d812af-194c-4561-b4ea-5fd9885d0866";

const DEVELOPMENT_STORE_ID =
  DEVELOPMENT_TENANT_ID;

const DEVELOPMENT_STORE_NAME =
  "epcoreuser";

/*
 * ------------------------------------------------------------
 * Initialize context BEFORE React renders the application.
 * ------------------------------------------------------------
 */

storeContext.setStore({

  tenantId:
    DEVELOPMENT_TENANT_ID,

  storeId:
    DEVELOPMENT_STORE_ID,

  name:
    DEVELOPMENT_STORE_NAME,

});

function App() {

  return (
    <AppRouter />
  );

}

export default App;