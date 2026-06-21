"use server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import type { SearchResult } from "@/types";

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  const user = await requireAuthUser();
  const q = query.trim();

  const [projects, tasks, milestones, notes] = await Promise.all([
    prisma.project.findMany({
      where: { userId: user.id, OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
      select: { id: true, title: true, description: true, status: true, priority: true },
      take: 5,
    }),
    prisma.task.findMany({
      where: { userId: user.id, OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
      select: { id: true, title: true, description: true, status: true, priority: true, project: { select: { title: true } }, projectId: true },
      take: 5,
    }),
    prisma.milestone.findMany({
      where: { userId: user.id, OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
      select: { id: true, title: true, description: true, status: true, project: { select: { title: true } }, projectId: true },
      take: 5,
    }),
    prisma.note.findMany({
      where: { userId: user.id, OR: [{ title: { contains: q, mode: "insensitive" } }, { content: { contains: q, mode: "insensitive" } }] },
      select: { id: true, title: true, content: true, project: { select: { title: true } }, projectId: true },
      take: 5,
    }),
  ]);

  const results: SearchResult[] = [
    ...projects.map((p) => ({ id: p.id, type: "project" as const, title: p.title, description: p.description ?? undefined, status: p.status, priority: p.priority, href: `/projects/${p.id}` })),
    ...tasks.map((t) => ({ id: t.id, type: "task" as const, title: t.title, description: t.description ?? undefined, projectTitle: t.project.title, status: t.status, priority: t.priority, href: `/projects/${t.projectId}` })),
    ...milestones.map((m) => ({ id: m.id, type: "milestone" as const, title: m.title, description: m.description ?? undefined, projectTitle: m.project.title, status: m.status, href: `/projects/${m.projectId}` })),
    ...notes.map((n) => ({ id: n.id, type: "note" as const, title: n.title, description: n.content.slice(0, 120), projectTitle: n.project.title, href: `/projects/${n.projectId}` })),
  ];

  return results;
}
