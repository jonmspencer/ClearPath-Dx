import { NextResponse } from "next/server";
import { prisma } from "@clearpath/database";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "connected",
      userCount,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      db: "failed",
      error: error.message,
    }, { status: 500 });
  }
}
