import Link from "next/link";

export default function SignInPage() {
  return (
    <section className="mx-auto flex h-dvh max-w-96 flex-col items-center justify-center">
      <h1 className="w-full text-left text-4xl font-bold">Login</h1>
      <form className="mt-6 flex w-full flex-col items-start justify-start gap-4">
        <fieldset className="flex w-full flex-col items-start justify-start gap-1">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            className="w-full rounded"
          />
        </fieldset>
        <fieldset className="flex w-full flex-col items-start justify-start gap-1">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            className="w-full rounded"
          />
        </fieldset>
        <button className="rounded bg-gray-950 p-2 px-4 uppercase text-white hover:bg-gray-800">
          Login
        </button>
      </form>
      <footer className="mt-6 w-full">
        <span>Don&apos;t have an account?</span>{" "}
        <Link href="/auth/sign-up" className="font-bold underline">
          Register here
        </Link>
      </footer>
    </section>
  );
}
