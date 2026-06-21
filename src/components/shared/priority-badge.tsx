import { cn, PRIORITY_COLORS } from "@/lib/utils";

type PriorityKey = keyof typeof PRIORITY_COLORS;

const PRIORITY_ICONS: Record<string, string> = { LOW: "↓", MEDIUM: "→", HIGH: "↑", CRITICAL: "⚠" };

export function PriorityBadge({ priority }: { priority: string }) {
  const colorClass = PRIORITY_COLORS[priority as PriorityKey] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", colorClass)}>
      <span>{PRIORITY_ICONS[priority]}</span>
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}
