import { NextRequest, NextResponse } from "next/server";

async function getUserRole(req: NextRequest): Promise<'ADMIN' | 'SUPERVISOR' | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lionsinternationalco.com'}/express/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': req.headers.get('cookie') || '',
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return userData.role;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch user role in middleware:', error);
    return null;
  }
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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

  // Handle root path redirect based on user role
  if (pathname === "" || pathname === "/") {
    const userRole = await getUserRole(req);
    
    if (userRole === 'ADMIN') {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    } else {
      // Supervisor or unknown role goes to schedule
      const scheduleUrl = new URL("/schedule", req.url);
      return NextResponse.redirect(scheduleUrl);
    }
  }

  // Block supervisors from accessing dashboard
  if (pathname === "/dashboard") {
    const userRole = await getUserRole(req);
    
    if (userRole === 'SUPERVISOR') {
      const scheduleUrl = new URL("/schedule", req.url);
      return NextResponse.redirect(scheduleUrl);
    }
  }

  // At least one token exists, allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
  // Matches all paths except Next.js internals and static files
};
