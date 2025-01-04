import { verifySession } from "@/lib/sessions";
import { db } from "@vercel/postgres";

const fetchUsername = async () => {
  const { isLoggedIn, email } = await verifySession();
  if (!isLoggedIn) {
    throw Error("Unauthorized!");
  }
  // decode the accessToken
  // use the decoded value of id, email
  const client = await db.connect();
  const dbData = await client.sql<{
    name: string;
  }>`SELECT name FROM users WHERE email=${email}`;

  const user = dbData.rows[0];
  client.release();

  return user.name;
};

export default async function Username() {
  const username = await fetchUsername();

  return <div>Username: {username}</div>;
}
