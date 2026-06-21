import { getNotes } from "@/actions/note.actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Notes" };

interface PageProps {
  searchParams: { q?: string; page?: string };
}

export default async function NotesPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? 1);
  const { notes, total, totalPages } = await getNotes({ search: searchParams.q, page, perPage: 20 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notes</h1>
        <p className="text-muted-foreground text-sm">{total} note{total !== 1 ? "s" : ""}</p>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No notes yet. Add notes from inside your projects.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Card key={note.id} className="p-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{note.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{note.project.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-3">{formatDate(note.updatedAt)}</p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t">
                  <Button asChild variant="ghost" size="sm" className="h-7 text-xs w-full">
                    <Link href={`/projects/${note.projectId}`}>
                      View Project <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} total={total} perPage={20} />
        </>
      )}
    </div>
  );
}
