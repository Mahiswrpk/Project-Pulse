import { z } from "zod";

export const importedProjectSchema = z.object({
  title: z.string().min(1, "Project title is required").max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(["ACTIVE", "PLANNING", "PAUSED", "COMPLETED", "ARCHIVED"]).optional().default("PLANNING"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional().default("MEDIUM"),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const importedTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(300),
  description: z.string().max(5000).optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "BLOCKED", "REVIEW", "DONE"]).optional().default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional().default("MEDIUM"),
  estimatedHours: z.number().min(0).max(10000).optional(),
  dueDate: z.string().optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const importedMilestoneSchema = z.object({
  title: z.string().min(1, "Milestone title is required").max(300),
  description: z.string().max(5000).optional(),
  targetDate: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "MISSED"]).optional().default("PENDING"),
  completionPercentage: z.number().min(0).max(100).optional().default(0),
});

export const importedNoteSchema = z.object({
  title: z.string().min(1, "Note title is required").max(300),
  content: z.string().min(1, "Note content is required").max(100000),
});

export const parseImportSchema = z.object({
  text: z.string().min(1, "Import text is required").max(500000, "Import text too large"),
});
