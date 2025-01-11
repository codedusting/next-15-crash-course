import Link from "next/link";
import { logout } from "../auth/actions";
import { Suspense } from "react";
import { type Metadata } from "next";
import UserCardsTable from "./user-table";
import Search from "./search";
import UserCardsTableSkeleton from "./user-table-skeleton";
import UserCardsForm from "./user-cards-form";
import { fetchCardsPages } from "@/lib/helper";
import Pagination from "./pagination";
import { cookies } from "next/headers";
import { ACCESS_COOKIE_KEY } from "@/constants/cookie";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_KEY)?.value;
  const query = (await searchParams).query || "";
  const currentPage = Number((await searchParams).page) || 1;
  const totalPages = await fetchCardsPages(query, accessToken);

  return (
    <section className="flex flex-col items-center justify-center py-6">
      <h1 className="text-5xl">Dashboard Page: Private Route</h1>

      <section className="my-8 flex w-full max-w-screen-sm flex-col items-center justify-center">
        <Search placeholder={"Search cards..."} />
        <Suspense fallback={<UserCardsTableSkeleton />}>
          <UserCardsTable accessToken={accessToken} currentPage={currentPage} query={query} />
        </Suspense>
        <div className="my-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
        <UserCardsForm />
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
