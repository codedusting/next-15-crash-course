import Link from "next/link";

export default function DashboardPage() {
  return (
    <section className="flex h-dvh flex-col items-center justify-center">
      <h1 className="text-5xl">Dashboard Page: Private Route</h1>

      <div className="mt-6 flex items-center justify-center gap-x-2">
        <Link
          href="/"
          className="flex min-w-[154px] items-center justify-center rounded bg-gray-950 p-4 text-white hover:bg-gray-800"
        >
          Go to home
        </Link>
        <Link
          href="/dashboard"
          className="flex min-w-[154px] items-center justify-center rounded bg-blue-700 p-4 text-white hover:bg-blue-600"
        >
          Logout
        </Link>
      </div>
    </section>
  );
}
