import { db } from "@vercel/postgres";

const client = await db.connect();

async function createUserTable() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await client.sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `;
}

export async function GET() {
  try {
    await client.sql`BEGIN`;
    await createUserTable();
    await client.sql`COMMIT`;
    return Response.json({ message: "Database seeded successfully!" });
  } catch (error) {
    await client.sql`ROLLBACK`;
    return Response.json({ error }, { status: 500 });
  }
}
