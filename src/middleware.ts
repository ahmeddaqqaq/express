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
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

async function refreshAccessToken(refreshToken: string, baseUrl: string): Promise<{ access_token: string; refresh_token: string } | null> {
  try {
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refresh_token=${refreshToken}`
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        access_token: data.access_token,
        refresh_token: response.headers.get('set-cookie')?.match(/refresh_token=([^;]+)/)?.[1] || refreshToken
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow access to /login without checking
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Read tokens from cookies
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

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

  // If only refresh token exists, try to get new access token
  if (!accessToken && refreshToken) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    const newTokens = await refreshAccessToken(refreshToken, baseUrl);
    
    if (newTokens) {
      const response = NextResponse.next();
      response.cookies.set("access_token", newTokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      });
      response.cookies.set("refresh_token", newTokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
      return response;
    } else {
      // Refresh failed, redirect to login
      const loginUrl = new URL("/login", req.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      return response;
    }
  }

  // If access token exists, check if it's expired
  if (accessToken) {
    if (isTokenExpired(accessToken)) {
      if (refreshToken) {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
        const newTokens = await refreshAccessToken(refreshToken, baseUrl);
        
        if (newTokens) {
          const response = NextResponse.next();
          response.cookies.set("access_token", newTokens.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
            path: '/',
          });
          response.cookies.set("refresh_token", newTokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
          });
          return response;
        } else {
          // Refresh failed, redirect to login
          const loginUrl = new URL("/login", req.url);
          const response = NextResponse.redirect(loginUrl);
          response.cookies.delete("access_token");
          response.cookies.delete("refresh_token");
          return response;
        }
      } else {
        // No refresh token, redirect to login
        const loginUrl = new URL("/login", req.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("access_token");
        return response;
      }
    }
  }

  // Token is valid, continue
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
  // Matches all paths except Next.js internals and static files
};
