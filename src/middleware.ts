import { NextRequest, NextResponse } from "next/server";
import { DASHBOARD, LOGIN } from "./constants/route";
import { verifySession } from "./lib/sessions";

const protectedRoutes = [DASHBOARD];

export default async function middleware(req: NextRequest) {
  const currentPath = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(currentPath);

  const { isLoggedIn } = await verifySession();

  if (isProtectedRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(LOGIN, req.nextUrl));
    }
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
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
