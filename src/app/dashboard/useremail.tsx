import { verifySession } from "@/lib/sessions";
import { db } from "@vercel/postgres";

const fetchUserEmail = async () => {
  const { isLoggedIn, email } = await verifySession();
  if (!isLoggedIn) {
    throw Error("Unauthorized!");
  }
  // decode the accessToken
  // use the decoded value of id, email
  const client = await db.connect();
  const dbData = await client.sql<{
    email: string;
  }>`SELECT email FROM users WHERE email=${email}`;

  const user = dbData.rows[0];
  client.release();

  return user.email;
};

export default async function UserEmail() {
  const userEmail = await fetchUserEmail();

  return <div>User email: {userEmail}</div>;
}
