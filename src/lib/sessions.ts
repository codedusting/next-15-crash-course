import "server-only";
// "use server";
import { getBaseDomain } from "./helper";
import { cookies } from "next/headers";
import { ACCESS_COOKIE_KEY, REFRESH_COOKIE_KEY, USEREMAIL, USERNAME } from "@/constants/cookie";

const MAX_AGE_15_MINS = 60 * 15;
const MAX_AGE_SEVEN_DAYS = 60 * 60 * 24 * 7;

export const createSession = async (user: { name: string; email: string }) => {
  const domain =
    process.env.NODE_ENV === "production"
      ? getBaseDomain(process.env.FRONTEND_APP_URL || "")
      : undefined;

  // set dummy cookie for mimicking actual mechanism
  const ACCESS_COOKIE_SETTINGS = {
    secure: process.env.NODE_ENV === "production",
    samesite: "strict",
    path: "/",
    httpOnly: true,
    maxAge: MAX_AGE_15_MINS,
    domain: domain,
  };

  const REFRESH_COOKIE_SETTINGS = {
    secure: process.env.NODE_ENV === "production",
    samesite: "strict",
    path: "/",
    httpOnly: true,
    maxAge: MAX_AGE_SEVEN_DAYS,
    domain: domain,
  };

  const mimickedValue = process.env.JWT_SECRET || "My_Secret";

  try {
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE_KEY, mimickedValue, ACCESS_COOKIE_SETTINGS);
    cookieStore.set(REFRESH_COOKIE_KEY, mimickedValue, REFRESH_COOKIE_SETTINGS);
    cookieStore.set(USERNAME, user.name, REFRESH_COOKIE_SETTINGS);
    cookieStore.set(USEREMAIL, user.email, REFRESH_COOKIE_SETTINGS);
  } catch (error) {
    console.error(error); // TODO: winston logger
  }
};

export const verifySession = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_KEY)?.value;
  const email = cookieStore.get(USEREMAIL)?.value;
  const isLoggedIn = !!accessToken && !!email;

  return {
    isLoggedIn,
    accessToken,
    email,
  };
};

export const deleteSession = async () => {
  const domain =
    process.env.NODE_ENV === "production"
      ? getBaseDomain(process.env.FRONTEND_APP_URL || "")
      : undefined;

  const cookieStore = await cookies();
  cookieStore.delete({
    name: ACCESS_COOKIE_KEY,
    domain: domain,
  });
  cookieStore.delete({
    name: REFRESH_COOKIE_KEY,
    domain: domain,
  });
};
