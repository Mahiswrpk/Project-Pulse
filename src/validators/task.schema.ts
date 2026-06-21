import { z } from "zod";

const validDateString = z
  .string()
  .refine(
    (value) => {
      if (!value.trim()) return true;

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      const year = date.getFullYear();

      return year >= 2000 && year <= 2100;
    },
    {
      message: "Date must be between years 2000 and 2100",
    }
  );

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title too long"),
  description: z.string().max(5000, "Description too long").optional().nullable(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "BLOCKED", "REVIEW", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  estimatedHours: z.number().min(0).max(10000).optional().nullable(),
  actualHours: z.number().min(0).max(10000).optional().nullable(),

  dueDate: validDateString.optional().nullable(),
  completedDate: validDateString.optional().nullable(),
  
  customFields: z.record(z.unknown()).optional().nullable(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
