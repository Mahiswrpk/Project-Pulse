import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({ value, showLabel = true, size = "md", className }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const heightClass = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  const color = clampedValue === 100 ? "bg-green-500" : clampedValue >= 60 ? "bg-blue-500" : clampedValue >= 30 ? "bg-yellow-500" : "bg-red-400";

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-medium">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-secondary rounded-full overflow-hidden", heightClass)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
