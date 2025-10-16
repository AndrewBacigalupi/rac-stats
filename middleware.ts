import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "admin_auth";
const PUBLIC_PATHS = new Set(["/", "/api/login"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[MIDDLEWARE] Processing request for: ${pathname}`);

  // Allow requests for Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Always allow explicitly public routes
  if (PUBLIC_PATHS.has(pathname)) {
    const hasAuth = request.cookies.get(AUTH_COOKIE)?.value === "true";
    if (hasAuth && pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const hasAuth = request.cookies.get(AUTH_COOKIE)?.value === "true";

  if (!hasAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};