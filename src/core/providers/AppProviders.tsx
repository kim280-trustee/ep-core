/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Application Providers
 * ============================================================
 */

import type {
  PropsWithChildren,
} from "react";


import {
  TenantProvider,
} from "../tenant";


import {
  EventProvider,
} from "../events";


import {
  FeatureFlagProvider,
} from "../feature-flags";


import {
  CacheProvider,
} from "../cache";


import {
  StorageProvider,
} from "../storage";


import {
  JobProvider,
} from "../jobs";



export function AppProviders({

  children,

}: PropsWithChildren) {


  return (

    <TenantProvider>

      <EventProvider>

        <FeatureFlagProvider>

          <CacheProvider>

            <StorageProvider>

              <JobProvider>

                {children}

              </JobProvider>

            </StorageProvider>

          </CacheProvider>

        </FeatureFlagProvider>

      </EventProvider>

    </TenantProvider>

  );

}