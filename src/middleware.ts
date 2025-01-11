import { NextRequest, NextResponse } from "next/server";
import { ADMIN_DASHBOARD, DASHBOARD, LOGIN } from "./constants/route";
import { refreshAccessToken, verifySession } from "./lib/sessions";
import {
  ACCESS_COOKIE_KEY,
  ACCESS_COOKIE_SETTINGS,
  REFRESH_COOKIE_KEY,
  REFRESH_COOKIE_SETTINGS,
} from "./constants/cookie";
import { cookies } from "next/headers";
import * as jose from "jose";
import { secret, alg } from "./constants/jwt";
import { PERMISSIONS, ROLENAME } from "./constants/permissions";
import { doesAllPermissionsExist } from "./lib/helper";

const protectedRoutes = [DASHBOARD, ADMIN_DASHBOARD];
const adminRoutes = [ADMIN_DASHBOARD];

export default async function middleware(req: NextRequest) {
  const cookieStore = await cookies();
  const currentPath = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(currentPath);

  let isLoggedIn = false;

  const { isLoggedIn: isVerifiedLoggedIn } = await verifySession();

  if (!!isVerifiedLoggedIn) {
    isLoggedIn = isVerifiedLoggedIn;
  }

  if (!isVerifiedLoggedIn) {
    const refreshToken = cookieStore.get(REFRESH_COOKIE_KEY)?.value;
    const { newAccessToken, newRefreshToken } = await refreshAccessToken(refreshToken as string);

    if (newAccessToken) {
      cookieStore.set(ACCESS_COOKIE_KEY, newAccessToken, ACCESS_COOKIE_SETTINGS);
    }
    if (newRefreshToken) {
      cookieStore.set(REFRESH_COOKIE_KEY, newRefreshToken, REFRESH_COOKIE_SETTINGS);
    }

    isLoggedIn = !!newAccessToken && !!newRefreshToken;
  }

  if (isProtectedRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(LOGIN, req.nextUrl));
    }
    if (isLoggedIn) {
      const { accessToken } = await verifySession();
      if (!accessToken) {
        return NextResponse.redirect(new URL(LOGIN, req.nextUrl));
      }

      const decodedToken = await jose.jwtVerify(accessToken, secret, {
        algorithms: [alg],
      });
      const { rolename, permissionsassignedtoeachrole } = decodedToken.payload;

      const isProtectedAdminRoute = adminRoutes.includes(currentPath);

      const doesAllPermissionsExists = doesAllPermissionsExist(
        PERMISSIONS.ADMIN,
        permissionsassignedtoeachrole as string,
      );
      if (isProtectedAdminRoute && (rolename !== ROLENAME.ADMIN || !doesAllPermissionsExists)) {
        return NextResponse.redirect(new URL(LOGIN, req.nextUrl));
      }
      // 1. If the url is admin, do I have admin role or not?
      // 2. Do I have the required permission or not?
      // 3. If yes, then I am allowed in the admin page
      // 4. Otherwise, redirect to admin/login
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
