import {
  TenantContext,
} from "./tenant";


export const runtime = {

  tenantContext: TenantContext,

};


export function initializeRuntime() {

  return runtime;

}