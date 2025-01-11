"use client";

import { generatePagination } from "@/lib/helper";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageUrl = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <>
      <div className="inline-flex">
        <PaginationArrow
          direction="left"
          href={createPageUrl(currentPage - 1)}
          isDisabled={currentPage <= 1}
        />
        <div className="flex -space-x-px">
          {allPages.map((page: number | string, index: number) => {
            let position: "first" | "last" | "single" | "middle" | undefined;
            if (index === 0) position = "first";
            if (index === allPages.length - 1) position = "last";
            if (allPages.length === 1) position = "single";
            if (page === "...") position = "middle";

            return (
              <PaginationNumber
                key={page}
                href={createPageUrl(page)}
                page={page}
                position={position}
                isActive={currentPage === page}
              />
            );
          })}
        </div>
        <PaginationArrow
          direction="right"
          href={createPageUrl(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
        />
      </div>
    </>
  );
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: "left" | "right";
  isDisabled: boolean;
}) {
  const className = `flex h-10 w-10 items-center justify-center rounded border ${isDisabled && "pointer-events-none text-gray-300"} ${!isDisabled && "hover:bg-gray-100"} ${direction === "left" && "mr-2 md:mr-4"} ${direction === "right" && "ml-2 md:ml-4"}`;

  const icon =
    direction === "left" ? <ArrowLeftIcon className="w-4" /> : <ArrowRightIcon className="w-4" />;

  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <Link href={href} className={className}>
      {icon}
    </Link>
  );
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  isActive: boolean;
  position: "first" | "last" | "single" | "middle" | undefined;
}) {
  const className = `flex h-10 w-10 items-center justify-center text-sm border ${position === "first" || (position === "single" && "rounded-l")} ${position === "last" || (position === "single" && "rounded-r")} ${isActive && "z-10 bg-red-600 border-red-600 text-white"} ${!isActive && position !== "middle" && "hover:bg-gray-100"} ${position === "middle" && "text-gray-300"}`;

  return isActive || position === "middle" ? (
    <div className={className}>{page}</div>
  ) : (
    <Link href={href} className={className}>
      {page}
    </Link>
  );
}
