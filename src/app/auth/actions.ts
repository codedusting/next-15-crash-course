"use server";

import { z } from "zod";
import argon2 from "argon2";
import { db } from "@vercel/postgres";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/sessions";
import { LOGIN } from "@/constants/route";

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
    const hashPassword = await argon2.hash(password);
    const client = await db.connect();
    await client.sql`INSERT INTO users (name, email, password) VALUES (${name}, ${email}, ${hashPassword})`;
    client.release();
    console.log("Registration success...");
    await createSession({ name, email });
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Database error: Cannot create new user!",
    };
  }

  redirect("/dashboard");
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
      name: string;
      email: string;
      password: string;
    }>`SELECT name, email, password FROM users WHERE email=${email}`;

    const user = dbData.rows[0];

    if (await argon2.verify(user.password, password)) {
      client.release();
      console.log("Login success...");
      await createSession({ name: user.name, email: user.email });
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

  redirect("/dashboard");
};

export const logout = async () => {
  await deleteSession();
  redirect(LOGIN);
};
