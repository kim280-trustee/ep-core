/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * App Providers
 * ============================================================
 */

import type {
  PropsWithChildren,
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
  useEffect,
} from "react";

import {
  registerCoreServices,
} from "../startup/registerCoreServices";

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

  );

}