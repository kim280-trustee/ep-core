/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Permission Repository Provider
 * ============================================================
 */

import type {
  PermissionRepository,
} from "./permission.repository";

import {
  InMemoryPermissionRepository,
} from "./in-memory.permission.repository";

let repository: PermissionRepository =
  new InMemoryPermissionRepository();

export function getPermissionRepository() {

  return repository;

}

export function setPermissionRepository(
  implementation: PermissionRepository,
) {

  repository = implementation;

}