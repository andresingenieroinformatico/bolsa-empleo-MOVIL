import type { UserRole } from '@/data/mock-data';

export type RoleEntry =
  | { destination: 'login'; role: UserRole }
  | { destination: 'dashboard'; role: UserRole };

export function resolveRoleEntry(
  authenticatedRole: UserRole | null,
  requestedRole: UserRole,
): RoleEntry {
  return authenticatedRole
    ? { destination: 'dashboard', role: authenticatedRole }
    : { destination: 'login', role: requestedRole };
}
