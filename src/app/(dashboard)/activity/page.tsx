import { getActivityLogs } from "@/actions/activity.actions";
import { Pagination } from "@/components/shared/pagination";
import { formatDateTime } from "@/lib/utils";
import { Activity } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activity Log" };

const ACTION_DESCRIPTIONS: Record<string, { icon: string; color: string }> = {
  PROJECT_CREATED: { icon: "🗂️", color: "text-blue-600" },
  PROJECT_UPDATED: { icon: "✏️", color: "text-blue-500" },
  PROJECT_COMPLETED: { icon: "🎉", color: "text-green-600" },
  PROJECT_DELETED: { icon: "🗑️", color: "text-red-500" },
  TASK_CREATED: { icon: "✅", color: "text-green-600" },
  TASK_UPDATED: { icon: "📝", color: "text-yellow-600" },
  TASK_COMPLETED: { icon: "✔️", color: "text-green-500" },
  TASK_DELETED: { icon: "❌", color: "text-red-400" },
  MILESTONE_CREATED: { icon: "🎯", color: "text-purple-600" },
  MILESTONE_COMPLETED: { icon: "🏆", color: "text-purple-500" },
  MILESTONE_UPDATED: { icon: "🔄", color: "text-purple-400" },
  MILESTONE_DELETED: { icon: "🗑️", color: "text-red-500" },
  NOTE_CREATED: { icon: "📄", color: "text-orange-600" },
  NOTE_UPDATED: { icon: "📝", color: "text-orange-500" },
  NOTE_DELETED: { icon: "🗑️", color: "text-red-500" },
  IMPORT_COMPLETED: { icon: "📥", color: "text-indigo-600" },
};

interface PageProps { searchParams: { page?: string } }

export default async function ActivityPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? 1);
  const { logs, total, totalPages } = await getActivityLogs(page, 25);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Activity Log
        </h1>
        <p className="text-muted-foreground text-sm">{total} events recorded</p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No activity yet. Start by creating a project!</p>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {logs.map((log, i) => {
              const meta = ACTION_DESCRIPTIONS[log.action] ?? { icon: "📋", color: "text-gray-600" };
              return (
                <div key={log.id} className="flex items-start gap-3 py-3 border-b last:border-0">
                  <span className="text-lg shrink-0">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.description}</p>
                    {log.project && <p className="text-xs text-muted-foreground">Project: {log.project.title}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">{formatDateTime(log.createdAt)}</span>
                </div>
              );
            })}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} total={total} perPage={25} />
        </>
      )}
    </div>
  );
}
