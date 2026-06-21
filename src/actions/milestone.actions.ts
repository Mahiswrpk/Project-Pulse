"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { milestoneSchema } from "@/validators/milestone.schema";
import { logActivity } from "./activity.actions";
import { recalculateProjectProgress } from "./project.actions";
import type { MilestoneStatus } from "@prisma/client";

export async function getMilestones(params?: {
  projectId?: string;
  status?: MilestoneStatus;
  page?: number;
  perPage?: number;
}) {
  const user = await requireAuthUser();
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 20;
  const skip = (page - 1) * perPage;

  const where = {
    userId: user.id,
    ...(params?.projectId ? { projectId: params.projectId } : {}),
    ...(params?.status ? { status: params.status } : {}),
  };

  const [milestones, total] = await Promise.all([
    prisma.milestone.findMany({
      where,
      orderBy: [{ targetDate: "asc" }],
      skip,
      take: perPage,
      include: { project: { select: { title: true, id: true } } },
    }),
    prisma.milestone.count({ where }),
  ]);

  return { milestones, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createMilestone(projectId: string, data: unknown) {
  const user = await requireAuthUser();
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) throw new Error("Project not found");

  const validated = milestoneSchema.parse(data);
  const milestone = await prisma.milestone.create({
    data: {
      projectId,
      userId: user.id,
      title: validated.title,
      description: validated.description ?? null,
      targetDate: validated.targetDate ? new Date(validated.targetDate) : null,
      status: validated.status,
      completionPercentage: validated.completionPercentage,
    },
  });

  await logActivity({ action: "MILESTONE_CREATED", description: `Created milestone "${milestone.title}"`, projectId, milestoneId: milestone.id });
  await recalculateProjectProgress(projectId, user.id);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/milestones");
  revalidatePath("/");
  return { success: true, data: milestone };
}

export async function updateMilestone(id: string, data: unknown) {
  const user = await requireAuthUser();
  const existing = await prisma.milestone.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Milestone not found");

  const validated = milestoneSchema.parse(data);
  const isBeingCompleted = validated.status === "COMPLETED" && existing.status !== "COMPLETED";

  const milestone = await prisma.milestone.update({
    where: { id },
    data: {
      title: validated.title,
      description: validated.description ?? null,
      targetDate: validated.targetDate ? new Date(validated.targetDate) : null,
      status: validated.status,
      completionPercentage: isBeingCompleted ? 100 : validated.completionPercentage,
    },
  });

  await logActivity({
    action: isBeingCompleted ? "MILESTONE_COMPLETED" : "MILESTONE_UPDATED",
    description: `${isBeingCompleted ? "Completed" : "Updated"} milestone "${milestone.title}"`,
    projectId: milestone.projectId,
    milestoneId: milestone.id,
  });
  await recalculateProjectProgress(milestone.projectId, user.id);

  revalidatePath(`/projects/${milestone.projectId}`);
  revalidatePath("/milestones");
  revalidatePath("/");
  return { success: true, data: milestone };
}

export async function deleteMilestone(id: string) {
  const user = await requireAuthUser();
  const milestone = await prisma.milestone.findFirst({ where: { id, userId: user.id } });
  if (!milestone) throw new Error("Milestone not found");

  await logActivity({ action: "MILESTONE_DELETED", description: `Deleted milestone "${milestone.title}"`, projectId: milestone.projectId });
  await prisma.milestone.delete({ where: { id } });
  await recalculateProjectProgress(milestone.projectId, user.id);

  revalidatePath(`/projects/${milestone.projectId}`);
  revalidatePath("/milestones");
  revalidatePath("/");
  return { success: true };
}
