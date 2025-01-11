"use server";

import { z } from "zod";
import argon2 from "argon2";
import { db } from "@vercel/postgres";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/sessions";
import { DASHBOARD, LOGIN } from "@/constants/route";
import * as jose from "jose";
import { secret, alg } from "@/constants/jwt";
import { JWT_MAX_AGE_15_MINS, JWT_MAX_AGE_SEVEN_DAYS } from "@/constants/cookie";
import { ROLE } from "@/constants/permissions";

const signUpFormSchema = z
  .object({
    name: z.string().min(1, { message: "Please enter your name" }),
    email: z.string().email({ message: "Please enter your email" }),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
        "Password must be at least 12 characters long, include at least one upper-case letter, one lower-case letter, one digit, and one special character (@$!%*?&)",
      ),
    confirmPassword: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
        "Password must be at least 12 characters long, include at least one upper-case letter, one lower-case letter, one digit, and one special character (@$!%*?&)",
      ),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Confirm password doesn't match Password!",
        path: ["confirmPassword"],
      });
    }
  });

export const signUpAction = async (_: unknown, formData: FormData) => {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = signUpFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing fields. Failed to register user",
      data: rawFormData,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const client = await db.connect();

    const dbLimiter = await client.sql`SELECT COUNT(*) from users`;
    const totalAllowedUsers = Number(dbLimiter.rows[0].count);
    if (totalAllowedUsers > 10) {
      throw Error("Database error: User limit reached in this public DB");
    }

    const hashPassword = await argon2.hash(password);

    await client.sql`INSERT INTO users (name, email, password, refresh_token, created_at, role_id) VALUES (${name}, ${email}, ${hashPassword}, NULL, ${new Date().toUTCString()}, ${ROLE.CUSTOMER})`;

    const dbData2 = await client.sql<{
      id: string;
      name: string;
      email: string;
      rolename: string;
      permissionsassignedtoeachrole: string;
    }>`
      SELECT
            u.id AS id,
            u.name AS name,
            u.email AS email,
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

    const user2 = dbData2.rows[0];

    const {
      id: userId,
      name: username,
      email: userEmail,
      rolename,
      permissionsassignedtoeachrole,
    } = user2;

    const accessToken = await new jose.SignJWT({
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

    const refreshToken = await new jose.SignJWT({
      id: userId,
      name: username,
      email: userEmail,
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime(JWT_MAX_AGE_SEVEN_DAYS)
      .sign(secret);

    await client.sql`UPDATE users SET refresh_token=${refreshToken} where id=${userId}`;

    client.release();
    console.log("Registration success...");
    await createSession(accessToken, refreshToken);
  } catch (error) {
    console.error(error);
    return {
      success: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: (error as any).message || "Database error: Cannot create new user!",
    };
  }

  redirect(DASHBOARD);
};

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
      message: "Database error: Cannot login to user!",
    };
  }

  redirect(DASHBOARD);
};

export const logout = async () => {
  await deleteSession();
  redirect(LOGIN);
};
