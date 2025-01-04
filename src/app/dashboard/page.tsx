import Link from "next/link";
import { logout } from "../auth/actions";
import Username from "./username";
import UserEmail from "./useremail";

export default function DashboardPage() {
  return (
    <section className="flex h-dvh flex-col items-center justify-center">
      <h1 className="text-5xl">Dashboard Page: Private Route</h1>

      <section className="my-8">
        <Username />
        <UserEmail />
      </section>

      <div className="mt-6 flex items-center justify-center gap-x-2">
        <Link
          href="/"
          className="flex min-w-[154px] items-center justify-center rounded bg-gray-950 p-4 text-white hover:bg-gray-800"
        >
          Go to home
        </Link>
        <form action={logout}>
          <button
            className={`flex min-w-[154px] items-center justify-center rounded bg-blue-700 p-4 text-white hover:bg-blue-600`}
          >
            Logout
          </button>
        </form>
      </div>
    </section>
  );
}
