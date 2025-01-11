"use client";

import { useActionState, useEffect, useState } from "react";
import { newCardsFormAction } from "./actions";

export default function UserCardsForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [state, formAction, isPending] = useActionState(newCardsFormAction, undefined);

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
        className="mt-6 flex w-full max-w-screen-sm flex-col items-start justify-center gap-4"
      >
        <h2 className="text-2xl font-bold">Create a new card</h2>
        <fieldset className="flex w-full flex-col items-start justify-center gap-1">
          <label htmlFor="name" className="font-bold">
            Character Name
          </label>
          <input
            autoFocus
            type="text"
            name="name"
            id="name"
            placeholder="Enter your character name..."
            className="w-full"
            defaultValue={(state?.data?.name as string) || ""}
          />
          <div id="custom-name-error" aria-live="polite" aria-atomic="true">
            {state?.errors?.name &&
              state.errors.name.map((error: string) => (
                <p key={error} className="mt-2 text-sm text-red-500">
                  {error}
                </p>
              ))}
          </div>
        </fieldset>
        <fieldset className="flex w-full flex-col items-start justify-center gap-1">
          <label htmlFor="anime" className="font-bold">
            Anime
          </label>
          <input
            type="text"
            name="anime"
            id="anime"
            placeholder="Enter anime the character belongs to..."
            className="w-full"
            defaultValue={(state?.data?.anime as string) || ""}
          />
          <div id="custom-name-error" aria-live="polite" aria-atomic="true">
            {state?.errors?.anime &&
              state.errors.anime.map((error: string) => (
                <p key={error} className="mt-2 text-sm text-red-500">
                  {error}
                </p>
              ))}
          </div>
        </fieldset>
        <button
          type="submit"
          className="rounded bg-gray-950 px-4 py-2 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? "Creating new card..." : "Create Card"}
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
