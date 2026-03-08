import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import bcrypt from "bcryptjs";
import { providerRegistrationServerSchema } from "@/lib/validations/provider-registration";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = providerRegistrationServerSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Find ClearPath org
    const clearpath = await prisma.organization.findFirst({
      where: { type: "DIAGNOSTICS_OPERATOR" },
    });
    if (!clearpath) {
      return NextResponse.json(
        { success: false, error: "Platform organization not found" },
        { status: 500 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const role = data.providerType === "PSYCHOLOGIST" ? "PSYCHOLOGIST" : "PSYCHOMETRIST";

    // Create user + org membership + provider profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          phone: data.phone || null,
          passwordHash,
          isActive: true,
        },
      });

      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: clearpath.id,
          role: role as any,
          isPrimary: true,
          isActive: true,
        },
      });

      const specialties = data.specialties
        ? data.specialties.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

      await tx.providerProfile.create({
        data: {
          userId: user.id,
          organizationId: clearpath.id,
          providerType: data.providerType as any,
          licenseNumber: data.licenseNumber || null,
          licenseState: data.licenseState || null,
          npiNumber: data.npiNumber || null,
          specialties,
          yearsExperience: data.yearsExperience ?? null,
          maxWeeklyCases: 5,
          isAcceptingCases: true,
        },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful. You can now sign in.",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Invalid registration data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Provider registration error:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
