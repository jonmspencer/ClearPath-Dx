import { describe, it, expect } from "vitest";
import {
  buildOrgScopeFilter,
  buildReferralScopeFilter,
  buildClientScopeFilter,
  buildCaseScopeFilter,
  isOrgScoped,
  isSelfScoped,
} from "../data-scoping";
import { UserRole } from "@clearpath/types";

function makeUser(role: UserRole, orgId = "org_123", id = "user_abc") {
  return { id, activeRole: role, activeOrganizationId: orgId };
}

// ---------- buildOrgScopeFilter ----------

describe("buildOrgScopeFilter", () => {
  it("returns organizationId filter for org-scoped roles", () => {
    for (const role of [
      UserRole.ABA_PROVIDER_ADMIN,
      UserRole.ABA_PROVIDER_STAFF,
      UserRole.PEDIATRICIAN_ADMIN,
    ]) {
      const filter = buildOrgScopeFilter(makeUser(role, "org_456"));
      expect(filter).toEqual({ organizationId: "org_456" });
    }
  });

  it("returns empty object for internal roles", () => {
    for (const role of [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.INTAKE_COORDINATOR,
      UserRole.SCHEDULER,
      UserRole.ACCOUNT_MANAGER,
      UserRole.FINANCE_ADMIN,
      UserRole.COMMUNITY_DEVELOPMENT_MANAGER,
    ]) {
      expect(buildOrgScopeFilter(makeUser(role))).toEqual({});
    }
  });

  it("returns empty object for self-scoped roles", () => {
    for (const role of [
      UserRole.PSYCHOLOGIST,
      UserRole.PSYCHOMETRIST,
      UserRole.PARENT_GUARDIAN,
    ]) {
      expect(buildOrgScopeFilter(makeUser(role))).toEqual({});
    }
  });
});

// ---------- buildReferralScopeFilter ----------

describe("buildReferralScopeFilter", () => {
  it("returns referringOrgId filter for org-scoped roles", () => {
    const filter = buildReferralScopeFilter(
      makeUser(UserRole.ABA_PROVIDER_ADMIN, "org_789")
    );
    expect(filter).toEqual({ referringOrgId: "org_789" });
  });

  it("returns empty object for internal roles", () => {
    expect(buildReferralScopeFilter(makeUser(UserRole.ADMIN))).toEqual({});
    expect(buildReferralScopeFilter(makeUser(UserRole.SUPER_ADMIN))).toEqual({});
  });

  it("returns empty object for self-scoped roles", () => {
    expect(buildReferralScopeFilter(makeUser(UserRole.PSYCHOLOGIST))).toEqual({});
  });
});

// ---------- buildClientScopeFilter ----------

describe("buildClientScopeFilter", () => {
  it("returns referringOrgId filter for org-scoped roles", () => {
    const filter = buildClientScopeFilter(
      makeUser(UserRole.PEDIATRICIAN_ADMIN, "org_100")
    );
    expect(filter).toEqual({ referringOrgId: "org_100" });
  });

  it("returns empty object for non-org-scoped roles", () => {
    expect(buildClientScopeFilter(makeUser(UserRole.SUPER_ADMIN))).toEqual({});
    expect(buildClientScopeFilter(makeUser(UserRole.PSYCHOLOGIST))).toEqual({});
  });
});

// ---------- buildCaseScopeFilter ----------

describe("buildCaseScopeFilter", () => {
  it("returns referral filter for org-scoped roles", () => {
    const filter = buildCaseScopeFilter(
      makeUser(UserRole.ABA_PROVIDER_STAFF, "org_200")
    );
    expect(filter).toEqual({
      referral: { referringOrgId: "org_200" },
    });
  });

  it("returns OR clause for self-scoped roles with providerProfileId", () => {
    const filter = buildCaseScopeFilter(
      makeUser(UserRole.PSYCHOLOGIST),
      "provider_xyz"
    );
    expect(filter).toEqual({
      OR: [
        { psychologistId: "provider_xyz" },
        { psychometristId: "provider_xyz" },
      ],
    });
  });

  it("returns empty object for self-scoped roles without providerProfileId", () => {
    const filter = buildCaseScopeFilter(makeUser(UserRole.PSYCHOLOGIST));
    expect(filter).toEqual({});
  });

  it("returns empty object for self-scoped roles with null providerProfileId", () => {
    const filter = buildCaseScopeFilter(makeUser(UserRole.PSYCHOMETRIST), null);
    expect(filter).toEqual({});
  });

  it("returns empty object for internal roles", () => {
    const filter = buildCaseScopeFilter(makeUser(UserRole.SUPER_ADMIN), "provider_xyz");
    expect(filter).toEqual({});
  });

  it("PARENT_GUARDIAN with providerProfileId returns OR clause", () => {
    const filter = buildCaseScopeFilter(
      makeUser(UserRole.PARENT_GUARDIAN),
      "provider_abc"
    );
    expect(filter).toEqual({
      OR: [
        { psychologistId: "provider_abc" },
        { psychometristId: "provider_abc" },
      ],
    });
  });
});

// ---------- isOrgScoped ----------

describe("isOrgScoped", () => {
  it("returns true for org-scoped roles", () => {
    expect(isOrgScoped(UserRole.ABA_PROVIDER_ADMIN)).toBe(true);
    expect(isOrgScoped(UserRole.ABA_PROVIDER_STAFF)).toBe(true);
    expect(isOrgScoped(UserRole.PEDIATRICIAN_ADMIN)).toBe(true);
  });

  it("returns false for internal roles", () => {
    expect(isOrgScoped(UserRole.SUPER_ADMIN)).toBe(false);
    expect(isOrgScoped(UserRole.ADMIN)).toBe(false);
    expect(isOrgScoped(UserRole.INTAKE_COORDINATOR)).toBe(false);
  });

  it("returns false for self-scoped roles", () => {
    expect(isOrgScoped(UserRole.PSYCHOLOGIST)).toBe(false);
    expect(isOrgScoped(UserRole.PARENT_GUARDIAN)).toBe(false);
  });
});

// ---------- isSelfScoped ----------

describe("isSelfScoped", () => {
  it("returns true for self-scoped roles", () => {
    expect(isSelfScoped(UserRole.PSYCHOLOGIST)).toBe(true);
    expect(isSelfScoped(UserRole.PSYCHOMETRIST)).toBe(true);
    expect(isSelfScoped(UserRole.PARENT_GUARDIAN)).toBe(true);
  });

  it("returns false for internal roles", () => {
    expect(isSelfScoped(UserRole.SUPER_ADMIN)).toBe(false);
    expect(isSelfScoped(UserRole.ADMIN)).toBe(false);
  });

  it("returns false for org-scoped roles", () => {
    expect(isSelfScoped(UserRole.ABA_PROVIDER_ADMIN)).toBe(false);
    expect(isSelfScoped(UserRole.PEDIATRICIAN_ADMIN)).toBe(false);
  });
});
