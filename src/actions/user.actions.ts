"use server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser, requireAuthUser } from "@/lib/auth";

export async function ensureUserExists() {
  return getOrCreateUser();
}

export async function getUserProfile() {
  const user = await requireAuthUser();
  return prisma.user.findUnique({
    where: { id: user.id },
    include: { notificationPreference: true },
  });
}

export async function updateUserProfile(data: { name?: string }) {
  const user = await requireAuthUser();
  return prisma.user.update({
    where: { id: user.id },
    data: { name: data.name },
  });
}
