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

export const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title too long"),
  description: z.string().max(5000, "Description too long").optional().nullable(),
  targetDate: validDateString.optional().nullable(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "MISSED"]).default("PENDING"),
  completionPercentage: z.number().min(0).max(100).default(0),
});

export type MilestoneFormData = z.infer<typeof milestoneSchema>;
