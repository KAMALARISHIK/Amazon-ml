import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isApiRoute = pathname.startsWith("/api");
  const isPublicAsset = pathname.startsWith("/_next") || pathname.includes(".");

  if (isApiRoute || isPublicAsset) {
    return NextResponse.next();
  }

  // If user is already authenticated and trying to view /login or /signup, redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If unauthenticated and trying to access protected pages (except login/signup), redirect to login
  // For easy preview/evaluation, if no cookie exists in dev, let the client-side AuthProvider handle demo mode if desired
  // or redirect to /login
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
