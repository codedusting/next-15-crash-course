import Link from "next/link";

export default function SignUpPage() {
  return (
    <section className="mx-auto flex h-dvh max-w-96 flex-col items-center justify-center">
      <h1 className="w-full text-left text-4xl font-bold">Register</h1>
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
        <fieldset className="flex w-full flex-col items-start justify-start gap-1">
          <label htmlFor="confirmPassword">Password</label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Enter your password again"
            className="w-full rounded"
          />
        </fieldset>
        <button className="rounded bg-gray-950 p-2 px-4 uppercase text-white hover:bg-gray-800">
          Register
        </button>
      </form>
      <footer className="mt-6 w-full">
        <span>Already have an account?</span>{" "}
        <Link href="/auth/sign-in" className="font-bold underline">
          Login here
        </Link>
      </footer>
    </section>
  );
}
