"use server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import type { ActivityAction, Prisma } from "@prisma/client";

export async function logActivity(params: {
  action: ActivityAction;
  description: string;
  projectId?: string;
  taskId?: string;
  milestoneId?: string;
  noteId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    const user = await requireAuthUser();
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: params.action,
        description: params.description,
        projectId: params.projectId ?? null,
        taskId: params.taskId ?? null,
        milestoneId: params.milestoneId ?? null,
        noteId: params.noteId ?? null,
        metadata: params.metadata,
      },
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

export async function getActivityLogs(page = 1, perPage = 20, projectId?: string) {
  const user = await requireAuthUser();
  const skip = (page - 1) * perPage;

  const where = {
    userId: user.id,
    ...(projectId ? { projectId } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
      include: { project: { select: { title: true } }, task: { select: { title: true } }, milestone: { select: { title: true } }, note: { select: { title: true } } },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { logs, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}
