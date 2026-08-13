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
  useEffect,
} from "react";

import {
  AuthProvider,
} from "@/core/auth";

import {
  TenantProvider,
} from "@/core/tenant";

import {
  PermissionProvider,
} from "@/core/permissions";

import {
  EventProvider,
} from "@/core/events";

import {
  AuditProvider,
} from "@/core/audit";

import {
  registerCoreServices,
} from "../startup/registerCoreServices";

import {
  QueryProvider,
} from "./QueryProvider";


export function AppProviders({
  children,
}: PropsWithChildren) {


  useEffect(
    () => {

      registerCoreServices();

    },
    [],
  );


  return (

    <QueryProvider>

      <AuthProvider>

        <TenantProvider>

          <PermissionProvider>

            <EventProvider>

              <AuditProvider>

                {children}

              </AuditProvider>

            </EventProvider>

          </PermissionProvider>

        </TenantProvider>

      </AuthProvider>

    </QueryProvider>

  );

}