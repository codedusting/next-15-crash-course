import Link from "next/link";
import SignInForm from "./form";

export default function SignInPage() {
  return (
    <section className="mx-auto flex h-dvh max-w-96 flex-col items-center justify-center">
      <h1 className="w-full text-left text-4xl font-bold">Login</h1>
      <SignInForm />
      <footer className="mt-6 w-full">
        <span>Don&apos;t have an account?</span>{" "}
        <Link href="/auth/sign-up" className="font-bold underline">
          Register here
        </Link>
      </footer>
    </section>
  );
}
