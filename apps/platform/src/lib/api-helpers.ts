import { NextResponse } from "next/server";
import { auth } from "@clearpath/auth";
import { hasPermission } from "@clearpath/rbac";
import type { Permission, ApiResponse, PaginatedResponse } from "@clearpath/types";

export async function getSessionOrThrow() {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError("Unauthorized", 401);
  }
  return session;
}

export function requirePermission(
  session: Awaited<ReturnType<typeof auth>>,
  permission: Permission
) {
  if (!session?.user) {
    throw new ApiError("Unauthorized", 401);
  }
  if (!hasPermission((session.user as any).activeRole as any, permission)) {
    throw new ApiError("Forbidden", 403);
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown): NextResponse<ApiResponse<never>> {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    );
  }
  console.error("Unhandled API error:", error);
  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 }
  );
}

export function buildPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "25")));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message });
}
