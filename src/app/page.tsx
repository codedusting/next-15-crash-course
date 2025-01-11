import Link from "next/link";

export default function HomePage() {
  return (
    <section aria-labelledby="heading" className="flex h-dvh flex-col items-center justify-center">
      <h1 id="heading" className="text-5xl">
        Home Page: Public Route
      </h1>

      <div className="mt-6 flex items-center justify-center gap-x-2">
        <Link
          href="/dashboard"
          className="flex min-w-[154px] items-center justify-center rounded bg-gray-950 p-4 text-white hover:bg-gray-800"
        >
          Go to dashboard
        </Link>
        <Link
          href="/auth/sign-in"
          className="flex min-w-[154px] items-center justify-center rounded bg-blue-700 p-4 text-white hover:bg-blue-600"
        >
          Login
        </Link>
      </div>

      <Link
        href={"https://github.com/codedusting/next-15-crash-course"}
        target="_blank"
        className="mt-8 rounded bg-black px-4 py-3 text-white"
      >
        Find GitHub Repo Here
      </Link>
    </section>
  );
}
