import Link from "next/link";
import SignUpForm from "./form";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
};

export default function SignUpPage() {
  return (
    <section className="mx-auto mt-12 flex max-w-96 flex-col items-center justify-start">
      <h1 className="w-full text-left text-4xl font-bold">Register</h1>
      <SignUpForm />
      <footer className="mt-6 w-full">
        <span>Already have an account?</span>{" "}
        <Link href="/auth/sign-in" className="font-bold underline">
          Login here
        </Link>
      </footer>
    </section>
  );
}
