import { Badge } from "@/components/ui/badge";
import { cn, STATUS_COLORS } from "@/lib/utils";

type StatusKey = keyof typeof STATUS_COLORS;

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active", PLANNING: "Planning", PAUSED: "Paused", COMPLETED: "Completed", ARCHIVED: "Archived",
  BACKLOG: "Backlog", TODO: "Todo", IN_PROGRESS: "In Progress", BLOCKED: "Blocked", REVIEW: "Review", DONE: "Done",
  PENDING: "Pending", MISSED: "Missed",
};

export function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status as StatusKey] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", colorClass)}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
