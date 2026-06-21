"use client";
import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { Search, FolderKanban, CheckSquare, Milestone, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { globalSearch } from "@/actions/search.actions";
import type { SearchResult } from "@/types";

const TYPE_ICONS = {
  project: { icon: FolderKanban, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  task: { icon: CheckSquare, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
  milestone: { icon: Milestone, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  note: { icon: FileText, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (q.trim().length < 2) { setResults([]); setSearched(false); return; }
    startTransition(async () => {
      const res = await globalSearch(q);
      setResults(res);
      setSearched(true);
    });
  }, []);

  const grouped = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Search</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          autoFocus
          placeholder="Search projects, tasks, milestones, notes..."
          className="pl-9 h-12 text-base"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {isPending && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {searched && results.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <Search className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No results found for &quot;<strong>{query}</strong>&quot;</p>
        </div>
      )}

      {Object.entries(grouped).map(([type, items]) => {
        const { icon: Icon, color, bg } = TYPE_ICONS[type as keyof typeof TYPE_ICONS];
        return (
          <div key={type}>
            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md mb-2 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
              <span className={`text-sm font-semibold capitalize ${color}`}>{type}s</span>
            </div>
            <div className="space-y-1">
              {items.map((result) => (
                <Link key={result.id} href={result.href}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{result.title}</p>
                    {result.projectTitle && <p className="text-xs text-muted-foreground">{result.projectTitle}</p>}
                    {result.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{result.description}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {result.status && <StatusBadge status={result.status} />}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {!searched && (
        <div className="text-center py-10 text-muted-foreground">
          <Search className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>Search across all your projects, tasks, milestones, and notes</p>
        </div>
      )}
    </div>
  );
}
