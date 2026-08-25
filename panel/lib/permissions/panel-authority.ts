'use client'

import React, { createContext, useContext } from 'react'
import type { Employee, WorkflowStepInstance } from '@/types/domain'
import type { PermissionKey } from '@/config/permissions'
import {
  resolvePanelAuthority as resolvePanelAuthorityCore,
  isManagerOrAdmin as isManagerOrAdminCore,
  isStepInScope as isStepInScopeCore,
  ROLE_TO_TEAM,
} from './panel-authority-core.js'

export { ROLE_TO_TEAM }

export interface PanelPrincipal {
  principalType: 'admin' | 'employee' | 'anonymous'
  isDedicatedAdmin: boolean
  adminId: string | null
  employeeId: string | null
  authResolved: boolean
}

export const ANONYMOUS_PRINCIPAL: PanelPrincipal = {
  principalType: 'anonymous',
  isDedicatedAdmin: false,
  adminId: null,
  employeeId: null,
  authResolved: false,
}

export interface WorkspaceAuthContextValue {
  principal: PanelPrincipal
  activeEmployee: Employee | null
  serverEmployee: any | null
  isLoadingAuth: boolean
}

export const WorkspaceAuthContext = createContext<WorkspaceAuthContextValue>({
  principal: ANONYMOUS_PRINCIPAL,
  activeEmployee: null,
  serverEmployee: null,
  isLoadingAuth: true,
})

export function useWorkspaceAuth(): WorkspaceAuthContextValue {
  return useContext(WorkspaceAuthContext)
}

export function usePrincipal(): {
  principal: PanelPrincipal
  activeEmployee: Employee | null
  isLoadingAuth: boolean
} {
  const ctx = useContext(WorkspaceAuthContext)
  return {
    principal: ctx.principal,
    activeEmployee: ctx.activeEmployee,
    isLoadingAuth: ctx.isLoadingAuth,
  }
}

/**
 * Pure panel authority resolver.
 * Evaluates canonical server-resolved principal and employee permissions.
 * NEVER reads browser storage.
 */
export function resolvePanelAuthority(
  principal: PanelPrincipal | null | undefined,
  employee: Employee | null | undefined,
  requiredPermissionOrPermissions: PermissionKey | PermissionKey[] | string | string[]
): boolean {
  return resolvePanelAuthorityCore(principal, employee, requiredPermissionOrPermissions)
}

/**
 * Pure manager/admin authority checker.
 * NEVER reads browser storage.
 */
export function isManagerOrAdmin(
  principal: PanelPrincipal | null | undefined,
  employee: Employee | null | undefined
): boolean {
  return isManagerOrAdminCore(principal, employee)
}

/**
 * Pure step-in-scope checker for Tasks / Operations.
 * NEVER reads browser storage.
 */
export function isStepInScope(
  principal: PanelPrincipal | null | undefined,
  step: WorkflowStepInstance,
  employee: Employee | null | undefined,
  allEmployees: Employee[] = []
): boolean {
  return isStepInScopeCore(principal, step, employee, allEmployees)
}
