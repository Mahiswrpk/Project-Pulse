"use client";
import { useRef, useTransition } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export function SearchInput({ placeholder = "Search...", className }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const timerRef = useRef<NodeJS.Timeout>();

  const handleSearch = (term: string) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      if (term) { params.set("q", term); } else { params.delete("q"); }
      startTransition(() => router.replace(`${pathname}?${params.toString()}`));
    }, 300);
  };

  const currentQ = searchParams.get("q") ?? "";

  return (
    <div className={`relative flex items-center ${className ?? ""}`}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={placeholder}
        defaultValue={currentQ}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-9 pr-8"
      />
      {currentQ && (
        <Button variant="ghost" size="icon" className="absolute right-1 h-7 w-7"
          onClick={() => { handleSearch(""); }}>
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
