import { getMilestones } from "@/actions/milestone.actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Pagination } from "@/components/shared/pagination";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, isOverdue, isDueSoon } from "@/lib/utils";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import type { MilestoneStatus } from "@/types";

export const metadata: Metadata = { title: "Milestones" };

interface PageProps {
  searchParams: { status?: string; page?: string };
}

export default async function MilestonesPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? 1);
  const { milestones, total, totalPages } = await getMilestones({
    status: searchParams.status as MilestoneStatus,
    page,
    perPage: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Milestones</h1>
        <p className="text-muted-foreground text-sm">{total} milestone{total !== 1 ? "s" : ""}</p>
      </div>

      <form method="GET" className="flex gap-2">
        <input type="hidden" name="page" value="1" />
        <Select name="status" defaultValue={searchParams.status ?? ""}>
          <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {[["PENDING","Pending"],["IN_PROGRESS","In Progress"],["COMPLETED","Completed"],["MISSED","Missed"]].map(([v,l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm" variant="secondary" className="h-9">Filter</Button>
      </form>

      {milestones.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No milestones found. Create milestones inside your projects.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {milestones.map((ms) => {
              const overdue = ms.status !== "COMPLETED" && isOverdue(ms.targetDate);
              const soon = !overdue && isDueSoon(ms.targetDate);
              return (
                <Card key={ms.id} className={`p-4 hover:shadow-sm transition-shadow ${overdue ? "border-destructive/50" : soon ? "border-orange-300/70" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{ms.title}</h3>
                        <StatusBadge status={ms.status} />
                        {overdue && <span className="text-xs text-destructive font-medium">Overdue</span>}
                        {soon && <span className="text-xs text-orange-600 font-medium">Due soon</span>}
                      </div>
                      {ms.description && <p className="text-sm text-muted-foreground mt-0.5">{ms.description}</p>}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        {ms.targetDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{formatDate(ms.targetDate)}
                          </span>
                        )}
                        <span>Project: {ms.project.title}</span>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="shrink-0">
                      <Link href={`/projects/${ms.projectId}`}><ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} total={total} perPage={20} />
        </>
      )}
    </div>
  );
}
