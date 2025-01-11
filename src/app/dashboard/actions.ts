"use server";

import { verifySession } from "@/lib/sessions";
import { db } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as jose from "jose";
import { alg, secret } from "@/constants/jwt";
import { DASHBOARD } from "@/constants/route";

const newCardsFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Please name your card" }),
  anime: z.string().trim().min(1, { message: "Please enter the anime name" }),
});

export const newCardsFormAction = async (_: unknown, formData: FormData) => {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = newCardsFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing fields. Failed to create a new card",
      data: rawFormData,
    };
  }

  const { name, anime } = validatedFields.data;
  const { accessToken } = await verifySession();
  try {
    if (!accessToken) {
      throw Error("No user_id provided!");
    }
    const decodedToken = await jose.jwtVerify(accessToken, secret, {
      algorithms: [alg],
    });
    const { id } = decodedToken.payload;

    const client = await db.connect();
    const dbLimiter = await client.sql`SELECT COUNT(*) from cards`;
    const totalAllowedCards = Number(dbLimiter.rows[0].count);
    if (totalAllowedCards > 10) {
      throw Error("Database error: Cards limit reached in this public DB");
    }

    await client.sql`INSERT INTO cards (name, anime, user_id) VALUES (${name}, ${anime}, ${id as string})`;
    client.release();
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: "Database error: Cannot add new card!",
      data: rawFormData,
    };
  }

  revalidatePath(DASHBOARD);
};
