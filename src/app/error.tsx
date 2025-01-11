"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-dvh flex-col items-center justify-center">
      <h2 className="text-center text-4xl">{error.message}</h2>
      <button
        className="mt-4 rounded bg-gray-950 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800"
        onClick={() => reset()}
      >
        Try again!
      </button>
    </main>
  );
}
