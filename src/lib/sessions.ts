import "server-only";
// "use server";
import { cookies } from "next/headers";
import {
  ACCESS_COOKIE_KEY,
  ACCESS_COOKIE_SETTINGS,
  domain,
  JWT_MAX_AGE_15_MINS,
  JWT_MAX_AGE_SEVEN_DAYS,
  REFRESH_COOKIE_KEY,
  REFRESH_COOKIE_SETTINGS,
} from "@/constants/cookie";
import * as jose from "jose";
import { secret, alg } from "@/constants/jwt";
import { db } from "@vercel/postgres";

export const createSession = async (accessToken: string, refreshToken: string) => {
  try {
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE_KEY, accessToken, ACCESS_COOKIE_SETTINGS);
    cookieStore.set(REFRESH_COOKIE_KEY, refreshToken, REFRESH_COOKIE_SETTINGS);
  } catch (error) {
    console.error(error); // TODO: winston logger
  }
};

export const verifySession = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_KEY)?.value;

  if (!!accessToken) {
    try {
      await jose.jwtVerify(accessToken, secret);
      return {
        isLoggedIn: true,
        accessToken,
      };
    } catch (err) {
      console.error(err);
      return {
        isLoggedIn: false,
        accessToken: null,
      };
    }
  }

  return {
    isLoggedIn: false,
    accessToken: null,
  };
};

export const deleteSession = async () => {
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

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const client = await db.connect();

    const dbData = await client.sql<{
      id: string;
      name: string;
      email: string;
      refresh_token: string;
      rolename: string;
      permissionsassignedtoeachrole: string;
    }>`
      SELECT
            u.id AS id,
            u.name AS name,
            u.email AS email,
            u.refresh_token AS refreshToken
            r.name AS rolename,
            STRING_AGG(p.name, ', ') AS permissionsassignedtoeachrole
        FROM
            users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN roles_permissions rp ON r.id = rp.role_id
        LEFT JOIN permissions p ON rp.permission_id = p.id
        WHERE refresh_token=${refreshToken}
        GROUP BY
            u.id, u.name, u.email, u.password, r.name;
      `;

    const user = dbData.rows[0];
    const decodedToken = await jose.jwtVerify(user.refresh_token, secret, {
      algorithms: [alg],
    });
    const {
      id: userId,
      name: username,
      email: userEmail,
      rolename,
      permissionsassignedtoeachrole,
    } = decodedToken.payload;

    const newAccessToken = await new jose.SignJWT({
      id: userId,
      name: username,
      email: userEmail,
      rolename,
      permissionsassignedtoeachrole,
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime(JWT_MAX_AGE_15_MINS)
      .sign(secret);

    const newRefreshToken = await new jose.SignJWT({
      id: userId,
      name: username,
      email: userEmail,
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime(JWT_MAX_AGE_SEVEN_DAYS)
      .sign(secret);

    await client.sql`UPDATE users SET refresh_token=${newRefreshToken} WHERE email=${userEmail as string}`;
    client.release();

    return { newAccessToken, newRefreshToken };
  } catch (error) {
    console.error(error);
    return { newAccessToken: null, newRefreshToken: null };
  }
};
