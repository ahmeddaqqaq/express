import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow access to /login without checking
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Read token from cookies
  const accessToken = req.cookies.get("token");

  // If token doesn't exist, redirect to login
  if (!accessToken) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  } else if (pathname === "") {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Token exists, allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
  // Matches all paths except Next.js internals and static files
};
