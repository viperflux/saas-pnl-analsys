import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  verifyTokenEdge,
  getTokenPayloadFromRequest,
} from "./lib/auth/auth-edge";

// Define protected routes
const protectedRoutes = ["/dashboard", "/admin"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and debug routes to prevent issues
  if (pathname.startsWith("/api/") || pathname.startsWith("/debug")) {
    return NextResponse.next();
  }

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get token and verify it (without database call)
  let payload = null;

  try {
    payload = await getTokenPayloadFromRequest(request);
  } catch (error) {
    console.error("Middleware auth error:", error);
    // Clear invalid cookie
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth-token");
    return response;
  }

  // Handle authentication routes
  if (isAuthRoute) {
    // If user has valid token, redirect to main page
    if (payload) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Allow access to auth routes for non-authenticated users
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute) {
    // If user is not authenticated, redirect to login
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check admin routes
    if (isAdminRoute && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // For home page, require authentication
  if (pathname === "/" && !payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
