import { type Metadata } from "next";
import SignInForm from "./form";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function AdminSignInPage() {
  return (
    <section className="mx-auto flex h-dvh max-w-96 flex-col items-center justify-center">
      <h1 className="w-full text-left text-4xl font-bold">Login</h1>
      <SignInForm />
    </section>
  );
}
