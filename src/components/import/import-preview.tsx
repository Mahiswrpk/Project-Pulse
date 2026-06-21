"use client";
import { AlertCircle, CheckCircle2, FolderKanban, CheckSquare, Milestone, FileText, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import type { ImportPreview as ImportPreviewType } from "@/types";

interface ImportPreviewProps {
  preview: ImportPreviewType;
}

export function ImportPreview({ preview }: ImportPreviewProps) {
  const { parsed, errors, warnings, isValid } = preview;

  return (
    <div className="space-y-4">
      {/* Validation Status */}
      <div className={`rounded-md p-3 border flex items-start gap-2 ${isValid ? "bg-green-50 border-green-200 dark:bg-green-900/20" : "bg-red-50 border-red-200 dark:bg-red-900/20"}`}>
        {isValid
          ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          : <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
        <div>
          <p className={`font-medium text-sm ${isValid ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}>
            {isValid ? "Ready to import" : `${errors.length} error${errors.length !== 1 ? "s" : ""} found`}
          </p>
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-red-700 dark:text-red-400 mt-0.5">{e.message}</p>
          ))}
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">⚠ {w}</p>
          ))}
        </div>
      </div>

      {/* Summary counts */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: FolderKanban, label: "Project", count: 1, color: "text-blue-600" },
          { icon: CheckSquare, label: "Tasks", count: parsed.tasks.length, color: "text-green-600" },
          { icon: Milestone, label: "Milestones", count: parsed.milestones.length, color: "text-purple-600" },
          { icon: FileText, label: "Notes", count: parsed.notes.length, color: "text-orange-600" },
        ].map(({ icon: Icon, label, count, color }) => (
          <div key={label} className="rounded-lg border p-2 text-center">
            <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
            <p className="text-lg font-bold">{count}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Project Preview */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <FolderKanban className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Project</span>
        </div>
        <h3 className="font-semibold text-lg">{parsed.project.title}</h3>
        {parsed.project.description && <p className="text-sm text-muted-foreground">{parsed.project.description}</p>}
        <div className="flex flex-wrap gap-2 pt-1">
          {parsed.project.status && <StatusBadge status={parsed.project.status} />}
          {parsed.project.priority && <PriorityBadge priority={parsed.project.priority} />}
          {parsed.project.dueDate && <span className="text-xs text-muted-foreground">Due: {parsed.project.dueDate}</span>}
        </div>
      </div>

      {/* Tasks Preview */}
      {parsed.tasks.length > 0 && (
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tasks ({parsed.tasks.length})</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {parsed.tasks.map((task, i) => (
              <div key={i} className="flex items-start justify-between gap-2 py-1.5 border-b last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  {task.estimatedHours && <p className="text-xs text-muted-foreground">{task.estimatedHours}h estimated</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  {task.status && <StatusBadge status={task.status} />}
                  {task.priority && <PriorityBadge priority={task.priority} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones Preview */}
      {parsed.milestones.length > 0 && (
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Milestone className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Milestones ({parsed.milestones.length})</span>
          </div>
          {parsed.milestones.map((ms, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b last:border-0">
              <p className="text-sm font-medium">{ms.title}</p>
              <div className="flex items-center gap-2">
                {ms.targetDate && <span className="text-xs text-muted-foreground">{ms.targetDate}</span>}
                {ms.status && <StatusBadge status={ms.status} />}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes Preview */}
      {parsed.notes.length > 0 && (
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Notes ({parsed.notes.length})</span>
          </div>
          {parsed.notes.map((note, i) => (
            <div key={i} className="py-1 border-b last:border-0">
              <p className="text-sm font-medium">{note.title}</p>
              <p className="text-xs text-muted-foreground truncate">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
