"use server";

import { JWT_MAX_AGE_15_MINS, JWT_MAX_AGE_SEVEN_DAYS } from "@/constants/cookie";
import { alg, secret } from "@/constants/jwt";
import { createSession } from "@/lib/sessions";
import { db } from "@vercel/postgres";
import { redirect } from "next/navigation";
import { z } from "zod";
import argon2 from "argon2";
import * as jose from "jose";
import { ADMIN_DASHBOARD } from "@/constants/route";

const signInFormSchema = z.object({
  email: z.string().email({ message: "Please enter your email" }),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
      "Password must be at least 12 characters long, include at least one upper-case letter, one lower-case letter, one digit, and one special character (@$!%*?&)",
    ),
});

export const signInAction = async (_: unknown, formData: FormData) => {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = signInFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing fields. Failed to register user",
      data: rawFormData,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const client = await db.connect();
    const dbData = await client.sql<{
      id: string;
      name: string;
      email: string;
      password: string;
      rolename: string;
      permissionsassignedtoeachrole: string;
    }>`SELECT
          u.id AS id,
          u.name AS name,
          u.email AS email,
          u.password AS password,
          r.name AS rolename,
          STRING_AGG(p.name, ', ') AS permissionsassignedtoeachrole
      FROM
          users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN roles_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE email=${email}
      GROUP BY
          u.id, u.name, u.email, u.password, r.name;
      `;

    const user = dbData.rows[0];

    if (await argon2.verify(user.password, password)) {
      const accessToken = await new jose.SignJWT({
        id: user.id,
        name: user.name,
        email: user.email,
        rolename: user.rolename,
        permissionsassignedtoeachrole: user.permissionsassignedtoeachrole,
      })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime(JWT_MAX_AGE_15_MINS)
        .sign(secret);

      const refreshToken = await new jose.SignJWT({
        id: user.id,
        name: user.name,
        email: user.email,
      })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime(JWT_MAX_AGE_SEVEN_DAYS)
        .sign(secret);

      await client.sql`UPDATE users SET refresh_token=${refreshToken} WHERE email=${user.email}`;
      client.release();
      await createSession(accessToken, refreshToken);
    } else {
      client.release();
      throw Error("Login Failed");
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Database error: Cannot create new user!",
    };
  }

  redirect(ADMIN_DASHBOARD);
};
