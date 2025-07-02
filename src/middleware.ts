import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "") {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow access to /login without checking
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Read access token from cookies
  const accessToken = req.cookies.get("access_token");
  const refreshToken = req.cookies.get("refresh_token");

  // If no tokens exist, redirect to login
  if (!accessToken && !refreshToken) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // At least one token exists, allow access
  // The client-side will handle token refresh if needed
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
  // Matches all paths except Next.js internals and static files
};
