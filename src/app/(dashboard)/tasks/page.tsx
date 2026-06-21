import { getTasks } from "@/actions/task.actions";
import { TaskCard } from "@/components/tasks/task-card";
import { Pagination } from "@/components/shared/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";
import type { TaskStatus, Priority } from "@/types";

export const metadata: Metadata = { title: "Tasks" };

interface PageProps {
  searchParams: { status?: string; priority?: string; q?: string; page?: string };
}

export default async function TasksPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? 1);
  const { tasks, total, totalPages } = await getTasks({
    status: searchParams.status as TaskStatus,
    priority: searchParams.priority as Priority,
    search: searchParams.q,
    page,
    perPage: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Tasks</h1>
        <p className="text-muted-foreground text-sm">{total} task{total !== 1 ? "s" : ""}</p>
      </div>

      <form method="GET" className="flex gap-2 flex-wrap">
        <input type="hidden" name="page" value="1" />
        <Select name="status" defaultValue={searchParams.status ?? ""}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {[["BACKLOG","Backlog"],["TODO","Todo"],["IN_PROGRESS","In Progress"],["BLOCKED","Blocked"],["REVIEW","Review"],["DONE","Done"]].map(([v,l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select name="priority" defaultValue={searchParams.priority ?? ""}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="All Priorities" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            {["LOW","MEDIUM","HIGH","CRITICAL"].map((p) => (
              <SelectItem key={p} value={p}>{p.charAt(0)+p.slice(1).toLowerCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm" variant="secondary" className="h-9">Filter</Button>
        {(searchParams.status || searchParams.priority) && (
          <Button asChild size="sm" variant="ghost" className="h-9"><Link href="/tasks">Clear</Link></Button>
        )}
      </form>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No tasks found. Create tasks inside your projects.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {tasks.map((task) => <TaskCard key={task.id} task={task} showProject />)}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} total={total} perPage={20} />
        </>
      )}
    </div>
  );
}
