import { getBaseDomain } from "@/lib/helper";

export const ACCESS_COOKIE_KEY = "access_token";
export const REFRESH_COOKIE_KEY = "refresh_token";

export const COOKIE_MAX_AGE_15_MINS = 60 * 15;
export const COOKIE_MAX_AGE_SEVEN_DAYS = 60 * 60 * 24 * 7;

export const JWT_MAX_AGE_15_MINS = "15min";
export const JWT_MAX_AGE_SEVEN_DAYS = "7d";

export const domain =
  process.env.NODE_ENV === "production"
    ? getBaseDomain(process.env.FRONTEND_APP_URL || "")
    : undefined;

export const ACCESS_COOKIE_SETTINGS = {
  secure: process.env.NODE_ENV === "production",
  samesite: "strict",
  path: "/",
  httpOnly: true,
  maxAge: COOKIE_MAX_AGE_15_MINS,
  domain: domain,
};

export const REFRESH_COOKIE_SETTINGS = {
  secure: process.env.NODE_ENV === "production",
  samesite: "strict",
  path: "/",
  httpOnly: true,
  maxAge: COOKIE_MAX_AGE_SEVEN_DAYS,
  domain: domain,
};
