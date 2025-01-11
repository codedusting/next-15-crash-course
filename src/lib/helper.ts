import { db } from "@vercel/postgres";
import * as jose from "jose";
import { alg, secret } from "@/constants/jwt";

export const getBaseDomain = (subdomain: string) => {
  if (subdomain === "") return undefined;
  const match = subdomain.match(/([a-zA-Z0-9-]+\.[a-zA-z]+)$/);
  return match ? `.${match[0]}` : undefined;
};

interface CardsDataInterface {
  id: string;
  name: string;
  anime: string;
}

const ITEMS_PER_PAGE = 3;

export const fetchCardsData = async (
  currentPage: number,
  query: string,
  accessToken: string | undefined,
) => {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const client = await db.connect();
  try {
    if (!accessToken) {
      throw Error("No user_id provided!");
    }
    const decodedToken = await jose.jwtVerify(accessToken, secret, {
      algorithms: [alg],
    });
    const { id } = decodedToken.payload;

    if (!id) {
      throw Error("No user_id provided!");
    }
    const data =
      await client.sql<CardsDataInterface>`SELECT id, name, anime FROM cards WHERE (name ILIKE ${`%${query}%`} OR anime ILIKE ${`%${query}%`}) AND user_id=${id as string} ORDER BY created_at DESC LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`;
    const latestCards = data.rows.map((card) => ({
      ...card,
    }));
    return latestCards;
  } catch (error) {
    console.error("Database error: ", error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error((error as any).message || "Failed to fetch anime cards");
  } finally {
    client.release();
  }
};

export const fetchCardsPages = async (query: string, accessToken: string | undefined) => {
  const client = await db.connect();

  try {
    if (!accessToken) {
      throw Error("No user_id provided!");
    }
    const decodedToken = await jose.jwtVerify(accessToken, secret, {
      algorithms: [alg],
    });
    const { id } = decodedToken.payload;

    if (!id) {
      throw Error("No user_id provided!");
    }

    const data =
      await client.sql`SELECT COUNT(*) FROM cards WHERE (name ILIKE ${`%${query}%`} OR anime ILIKE ${`%${query}%`}) AND user_id=${id as string}`;

    const totalPages = Math.ceil(Number(data.rows[0].count) / ITEMS_PER_PAGE);

    return totalPages;
  } catch (error) {
    console.error("Database error: ", error);
    throw new Error("Failed to fetch number of anime cards");
  } finally {
    client.release();
  }
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

export const doesAllPermissionsExist = (
  permission: string,
  permissionsassignedtoeachrole: string,
) => {
  // Normalize and convert strings to sets
  const permissionSet = new Set(permission.split(",").map((str) => str.trim()));
  const assignedPermissionsSet = new Set(
    permissionsassignedtoeachrole.split(",").map((str) => str.trim()),
  );

  // Check if every assigned permission exists in the permission set
  const allPermissionsExist = [...assignedPermissionsSet].every((p) => permissionSet.has(p));

  return allPermissionsExist; // true or false
};
