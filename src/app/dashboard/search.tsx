"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = useDebouncedCallback((searchTerm: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (searchTerm) {
      params.set("query", searchTerm);
    } else {
      params.delete("query");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative mb-4 flex w-full max-w-screen-sm">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
        className="w-full"
      />
    </div>
  );
}
