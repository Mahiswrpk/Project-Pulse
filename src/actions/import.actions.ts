"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { logActivity } from "./activity.actions";
import type { ParsedImport, ImportPreview, ImportValidationError } from "@/types";
import type { ProjectStatus, Priority, TaskStatus, MilestoneStatus } from "@prisma/client";

function normalizeStatus<T extends string>(value: string, validValues: T[], defaultValue: T): T {
  const upper = value.toUpperCase().replace(/\s+/g, "_") as T;
  return validValues.includes(upper) ? upper : defaultValue;
}

function parseKeyValue(line: string): [string, string] | null {
  const colonIdx = line.indexOf(":");
  if (colonIdx === -1) return null;
  return [line.slice(0, colonIdx).trim().toLowerCase(), line.slice(colonIdx + 1).trim()];
}

export async function parseImportText(text: string): Promise<ImportPreview> {
  const errors: ImportValidationError[] = [];
  const warnings: string[] = [];

  const lines = text.split("\n");
  let currentSection: "project" | "task" | "milestone" | "note" | null = null;
  let currentBlock: Record<string, string> = {};
  const blocks: Array<{ type: "project" | "task" | "milestone" | "note"; data: Record<string, string>; startLine: number }> = [];
  let sectionStartLine = 0;

  const flush = () => {
    if (currentSection && Object.keys(currentBlock).length > 0) {
      blocks.push({ type: currentSection, data: { ...currentBlock }, startLine: sectionStartLine });
    }
    currentBlock = {};
  };

  lines.forEach((rawLine, lineNum) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;

    const upper = line.toUpperCase();
    if (upper === "PROJECT") { flush(); currentSection = "project"; sectionStartLine = lineNum + 1; return; }
    if (upper === "TASK") { flush(); currentSection = "task"; sectionStartLine = lineNum + 1; return; }
    if (upper === "MILESTONE") { flush(); currentSection = "milestone"; sectionStartLine = lineNum + 1; return; }
    if (upper === "NOTE") { flush(); currentSection = "note"; sectionStartLine = lineNum + 1; return; }

    if (currentSection) {
      const kv = parseKeyValue(line);
      if (kv) {
        const [k, v] = kv;
        if (currentBlock[k]) {
          currentBlock[k] += "\n" + v;
        } else {
          currentBlock[k] = v;
        }
      }
    }
  });
  flush();

  const projectBlocks = blocks.filter((b) => b.type === "project");
  const taskBlocks = blocks.filter((b) => b.type === "task");
  const milestoneBlocks = blocks.filter((b) => b.type === "milestone");
  const noteBlocks = blocks.filter((b) => b.type === "note");

  if (projectBlocks.length === 0) {
    errors.push({ field: "project", message: "At least one PROJECT block is required" });
  }
  if (projectBlocks.length > 1) {
    warnings.push("Multiple PROJECT blocks found — only the first will be used");
  }

  const projectData = projectBlocks[0]?.data ?? {};
  if (!projectData.title) {
    errors.push({ field: "project.title", message: "Project Title is required", line: projectBlocks[0]?.startLine });
  }

  const validProjectStatuses: ProjectStatus[] = ["ACTIVE", "PLANNING", "PAUSED", "COMPLETED", "ARCHIVED"];
  const validPriorities: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const validTaskStatuses: TaskStatus[] = ["BACKLOG", "TODO", "IN_PROGRESS", "BLOCKED", "REVIEW", "DONE"];
  const validMilestoneStatuses: MilestoneStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "MISSED"];

  const parsed: ParsedImport = {
    project: {
      title: projectData.title || "Untitled Project",
      description: projectData.description,
      status: normalizeStatus(projectData.status ?? "PLANNING", validProjectStatuses, "PLANNING"),
      priority: normalizeStatus(projectData.priority ?? "MEDIUM", validPriorities, "MEDIUM"),
      startDate: projectData.startdate || projectData["start date"] || projectData.startDate,
      dueDate: projectData.duedate || projectData["due date"] || projectData.dueDate,
    },
    tasks: taskBlocks.map((block, i) => {
      const d = block.data;
      if (!d.title) errors.push({ field: `task[${i}].title`, message: `Task ${i + 1}: Title is required`, line: block.startLine });
      const hours = parseFloat(d.estimatedhours || d["estimated hours"] || d.estimatedHours || "");
      return {
        title: d.title || `Task ${i + 1}`,
        description: d.description,
        status: normalizeStatus(d.status ?? "TODO", validTaskStatuses, "TODO"),
        priority: normalizeStatus(d.priority ?? "MEDIUM", validPriorities, "MEDIUM"),
        estimatedHours: isNaN(hours) ? undefined : hours,
        dueDate: d.duedate || d["due date"] || d.dueDate,
      };
    }),
    milestones: milestoneBlocks.map((block, i) => {
      const d = block.data;
      if (!d.title) errors.push({ field: `milestone[${i}].title`, message: `Milestone ${i + 1}: Title is required`, line: block.startLine });
      return {
        title: d.title || `Milestone ${i + 1}`,
        description: d.description,
        targetDate: d.targetdate || d["target date"] || d.targetDate,
        status: normalizeStatus(d.status ?? "PENDING", validMilestoneStatuses, "PENDING"),
      };
    }),
    notes: noteBlocks.map((block, i) => {
      const d = block.data;
      if (!d.title) errors.push({ field: `note[${i}].title`, message: `Note ${i + 1}: Title is required`, line: block.startLine });
      if (!d.content) errors.push({ field: `note[${i}].content`, message: `Note ${i + 1}: Content is required`, line: block.startLine });
      return {
        title: d.title || `Note ${i + 1}`,
        content: d.content || "",
      };
    }),
  };

  return { parsed, errors, warnings, isValid: errors.length === 0 };
}

export async function executeImport(parsed: ParsedImport) {
  const user = await requireAuthUser();

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      title: parsed.project.title,
      description: parsed.project.description ?? null,
      status: parsed.project.status ?? "PLANNING",
      priority: parsed.project.priority ?? "MEDIUM",
      startDate: parsed.project.startDate ? new Date(parsed.project.startDate) : null,
      dueDate: parsed.project.dueDate ? new Date(parsed.project.dueDate) : null,
      //customFields: parsed.project.customFields ?? undefined,
      customFields: parsed.project.customFields,
    },
  });

  await prisma.task.createMany({
    data: parsed.tasks.map((t) => ({
      projectId: project.id,
      userId: user.id,
      title: t.title,
      description: t.description ?? null,
      status: t.status ?? "TODO",
      priority: t.priority ?? "MEDIUM",
      estimatedHours: t.estimatedHours ?? null,
      dueDate: t.dueDate ? new Date(t.dueDate) : null,
      customFields: t.customFields,// ?? null,
    })),
  });

  await prisma.milestone.createMany({
    data: parsed.milestones.map((m) => ({
      projectId: project.id,
      userId: user.id,
      title: m.title,
      description: m.description ?? null,
      targetDate: m.targetDate ? new Date(m.targetDate) : null,
      status: m.status ?? "PENDING",
      completionPercentage: m.completionPercentage ?? 0,
    })),
  });

  await prisma.note.createMany({
    data: parsed.notes.map((n) => ({
      projectId: project.id,
      userId: user.id,
      title: n.title,
      content: n.content,
    })),
  });

  await logActivity({
    action: "IMPORT_COMPLETED",
    description: `Imported project "${project.title}" with ${parsed.tasks.length} tasks, ${parsed.milestones.length} milestones, ${parsed.notes.length} notes`,
    projectId: project.id,
    metadata: { tasksCount: parsed.tasks.length, milestonesCount: parsed.milestones.length, notesCount: parsed.notes.length },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  return { success: true, data: { project, tasksCreated: parsed.tasks.length, milestonesCreated: parsed.milestones.length, notesCreated: parsed.notes.length } };
}
