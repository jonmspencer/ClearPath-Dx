import { describe, it, expect } from "vitest";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissions,
  hasRole,
  ORG_SCOPED_ROLES,
  SELF_SCOPED_ROLES,
} from "../check";
import { UserRole } from "@clearpath/types";

describe("hasPermission", () => {
  it("returns true when the role has the permission", () => {
    expect(hasPermission(UserRole.SUPER_ADMIN, "REFERRAL:CREATE")).toBe(true);
    expect(hasPermission(UserRole.PSYCHOLOGIST, "REPORT:CREATE")).toBe(true);
    expect(hasPermission(UserRole.FINANCE_ADMIN, "BILLING:EXPORT")).toBe(true);
  });

  it("returns false when the role lacks the permission", () => {
    expect(hasPermission(UserRole.PARENT_GUARDIAN, "REFERRAL:CREATE")).toBe(false);
    expect(hasPermission(UserRole.PSYCHOLOGIST, "REPORT:DELETE")).toBe(false);
    expect(hasPermission(UserRole.FINANCE_ADMIN, "USER:CREATE")).toBe(false);
  });

  it("returns false for an unknown role value", () => {
    expect(hasPermission("UNKNOWN_ROLE" as UserRole, "REFERRAL:CREATE")).toBe(false);
  });
});

describe("hasAnyPermission", () => {
  it("returns true when the role has at least one of the permissions", () => {
    expect(
      hasAnyPermission(UserRole.PSYCHOLOGIST, ["REPORT:CREATE", "USER:DELETE"])
    ).toBe(true);
  });

  it("returns false when the role has none of the permissions", () => {
    expect(
      hasAnyPermission(UserRole.PARENT_GUARDIAN, ["REFERRAL:CREATE", "USER:DELETE"])
    ).toBe(false);
  });

  it("returns false for an empty permissions array", () => {
    expect(hasAnyPermission(UserRole.SUPER_ADMIN, [])).toBe(false);
  });
});

describe("hasAllPermissions", () => {
  it("returns true when the role has all of the permissions", () => {
    expect(
      hasAllPermissions(UserRole.SUPER_ADMIN, ["REFERRAL:CREATE", "REFERRAL:READ", "REFERRAL:DELETE"])
    ).toBe(true);
  });

  it("returns false when the role is missing at least one permission", () => {
    expect(
      hasAllPermissions(UserRole.PSYCHOLOGIST, ["REPORT:CREATE", "REPORT:DELETE"])
    ).toBe(false);
  });

  it("returns true for an empty permissions array", () => {
    expect(hasAllPermissions(UserRole.PARENT_GUARDIAN, [])).toBe(true);
  });
});

describe("getPermissions", () => {
  it("returns the full permission array for a valid role", () => {
    const perms = getPermissions(UserRole.PARENT_GUARDIAN);
    expect(perms).toContain("CLIENT:READ");
    expect(perms).toContain("REPORT:READ");
    expect(perms.length).toBe(5);
  });

  it("returns an empty array for an unknown role", () => {
    expect(getPermissions("UNKNOWN_ROLE" as UserRole)).toEqual([]);
  });
});

describe("hasRole", () => {
  it("returns true when the user role is in the allowed list", () => {
    expect(hasRole(UserRole.ADMIN, [UserRole.SUPER_ADMIN, UserRole.ADMIN])).toBe(true);
  });

  it("returns false when the user role is not in the allowed list", () => {
    expect(hasRole(UserRole.PARENT_GUARDIAN, [UserRole.SUPER_ADMIN, UserRole.ADMIN])).toBe(false);
  });

  it("returns false for an empty allowed list", () => {
    expect(hasRole(UserRole.SUPER_ADMIN, [])).toBe(false);
  });
});

describe("ORG_SCOPED_ROLES", () => {
  it("contains exactly the demand-side roles", () => {
    expect(ORG_SCOPED_ROLES).toContain(UserRole.ABA_PROVIDER_ADMIN);
    expect(ORG_SCOPED_ROLES).toContain(UserRole.ABA_PROVIDER_STAFF);
    expect(ORG_SCOPED_ROLES).toContain(UserRole.PEDIATRICIAN_ADMIN);
    expect(ORG_SCOPED_ROLES).toHaveLength(3);
  });

  it("does not contain internal roles", () => {
    expect(ORG_SCOPED_ROLES).not.toContain(UserRole.SUPER_ADMIN);
    expect(ORG_SCOPED_ROLES).not.toContain(UserRole.ADMIN);
    expect(ORG_SCOPED_ROLES).not.toContain(UserRole.PSYCHOLOGIST);
  });
});

describe("SELF_SCOPED_ROLES", () => {
  it("contains supply-side and family roles", () => {
    expect(SELF_SCOPED_ROLES).toContain(UserRole.PSYCHOLOGIST);
    expect(SELF_SCOPED_ROLES).toContain(UserRole.PSYCHOMETRIST);
    expect(SELF_SCOPED_ROLES).toContain(UserRole.PARENT_GUARDIAN);
    expect(SELF_SCOPED_ROLES).toHaveLength(3);
  });

  it("does not contain internal or demand-side roles", () => {
    expect(SELF_SCOPED_ROLES).not.toContain(UserRole.SUPER_ADMIN);
    expect(SELF_SCOPED_ROLES).not.toContain(UserRole.ABA_PROVIDER_ADMIN);
  });
});
