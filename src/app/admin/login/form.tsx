"use client";

import { useActionState, useEffect, useState } from "react";
import { signInAction } from "../actions";

export default function SignInForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [state, formAction, isPending] = useActionState(signInAction, undefined);

  useEffect(() => {
    if (state?.message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [state?.message]);

  return (
    <>
      <form
        action={formAction}
        className="mt-6 flex w-full flex-col items-start justify-start gap-4"
      >
        <fieldset className="flex w-full flex-col items-start justify-start gap-1">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            className="w-full rounded"
            defaultValue={(state?.data?.email as string) || ""}
          />
          <div id="custom-name-error" aria-live="polite" aria-atomic="true">
            {state?.errors?.email &&
              state.errors.email.map((error: string) => (
                <p key={error} className="mt-2 text-sm text-red-500">
                  {error}
                </p>
              ))}
          </div>
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
          <div id="custom-name-error" aria-live="polite" aria-atomic="true">
            {state?.errors?.password &&
              state.errors.password.map((error: string) => (
                <p key={error} className="mt-2 text-sm text-red-500">
                  {error}
                </p>
              ))}
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={isPending}
          className={`rounded bg-gray-950 p-2 px-4 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div
        id="form-message"
        aria-live="polite"
        aria-atomic="true"
        className={`my-2 w-full rounded px-4 py-3 transition-opacity duration-500 ${state?.success === false ? "bg-red-100" : "bg-green-500"} ${isVisible ? "opacity-100" : "opacity-0"}`}
      >
        {state?.message && (
          <p
            className={`text-sm font-medium ${state.success === false ? "text-red-800" : "text-green-800"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </>
  );
}

// kBkxRr0IdkYm&
