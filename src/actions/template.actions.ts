"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { logActivity } from "./activity.actions";

export async function getTemplates() {
  const user = await requireAuthUser();
  return prisma.projectTemplate.findMany({
    where: { OR: [{ userId: user.id }, { isDefault: true }] },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

export async function createProjectFromTemplate(templateId: string) {
  const user = await requireAuthUser();
  const template = await prisma.projectTemplate.findFirst({
    where: { id: templateId, OR: [{ userId: user.id }, { isDefault: true }] },
  });
  if (!template) throw new Error("Template not found");

  const content = template.content as {
    project?: { title?: string; description?: string; status?: string; priority?: string };
    tasks?: Array<{ title?: string; status?: string; priority?: string; estimatedHours?: number }>;
    milestones?: Array<{ title?: string; description?: string }>;
  };

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      title: content.project?.title ?? template.name,
      description: content.project?.description ?? null,
      status: (content.project?.status as "PLANNING") ?? "PLANNING",
      priority: (content.project?.priority as "MEDIUM") ?? "MEDIUM",
    },
  });

  if (content.tasks?.length) {
    await prisma.task.createMany({
      data: content.tasks.map((t) => ({
        projectId: project.id,
        userId: user.id,
        title: t.title ?? "Task",
        status: (t.status as "TODO") ?? "TODO",
        priority: (t.priority as "MEDIUM") ?? "MEDIUM",
        estimatedHours: t.estimatedHours ?? null,
      })),
    });
  }

  if (content.milestones?.length) {
    await prisma.milestone.createMany({
      data: content.milestones.map((m) => ({
        projectId: project.id,
        userId: user.id,
        title: m.title ?? "Milestone",
        description: m.description ?? null,
        status: "PENDING" as const,
      })),
    });
  }

  await logActivity({ action: "PROJECT_CREATED", description: `Created project "${project.title}" from template "${template.name}"`, projectId: project.id });
  revalidatePath("/");
  revalidatePath("/projects");
  return { success: true, data: project };
}
