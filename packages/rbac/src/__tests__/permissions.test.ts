import { describe, it, expect } from "vitest";
import { ROLE_PERMISSIONS } from "../permissions";
import { UserRole } from "@clearpath/types";

describe("ROLE_PERMISSIONS", () => {
  it("should have entries for all 13 roles", () => {
    const roles = Object.values(UserRole);
    expect(Object.keys(ROLE_PERMISSIONS)).toHaveLength(roles.length);
    for (const role of roles) {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
      expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true);
    }
  });

  it("SUPER_ADMIN should have the most permissions", () => {
    const superAdminPerms = ROLE_PERMISSIONS[UserRole.SUPER_ADMIN];
    for (const role of Object.values(UserRole)) {
      if (role === UserRole.SUPER_ADMIN) continue;
      expect(superAdminPerms.length).toBeGreaterThanOrEqual(ROLE_PERMISSIONS[role].length);
    }
  });

  it("PARENT_GUARDIAN should have minimal read-only permissions", () => {
    const parentPerms = ROLE_PERMISSIONS[UserRole.PARENT_GUARDIAN];
    expect(parentPerms.length).toBeLessThan(10);
    for (const perm of parentPerms) {
      expect(perm).toMatch(/:(READ|LIST)$/);
    }
  });

  it("all permissions should follow RESOURCE:ACTION format", () => {
    for (const [, perms] of Object.entries(ROLE_PERMISSIONS)) {
      for (const perm of perms) {
        expect(perm).toMatch(/^[A-Z_]+:[A-Z_]+$/);
      }
    }
  });

  it("PSYCHOLOGIST should have REPORT:CREATE but not REPORT:DELETE", () => {
    const perms = ROLE_PERMISSIONS[UserRole.PSYCHOLOGIST];
    expect(perms).toContain("REPORT:CREATE");
    expect(perms).not.toContain("REPORT:DELETE");
  });

  it("FINANCE_ADMIN should have BILLING permissions", () => {
    const perms = ROLE_PERMISSIONS[UserRole.FINANCE_ADMIN];
    expect(perms).toContain("BILLING:READ");
    expect(perms).toContain("BILLING:UPDATE");
    expect(perms).toContain("BILLING:LIST");
    expect(perms).toContain("BILLING:EXPORT");
  });
});
