"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

export function Pagination({ currentPage, totalPages, total, perPage }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, total);

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-muted-foreground">
        Showing <strong>{start}–{end}</strong> of <strong>{total}</strong>
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">Page {currentPage} of {totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
