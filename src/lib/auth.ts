import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

export async function getAuthUser(): Promise<User | null> {
  const { userId: clerkId } = auth();
  if (!clerkId) return null;
  return prisma.user.findUnique({ where: { clerkId } });
}

export async function requireAuthUser(): Promise<User> {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized: please sign in");
  return user;
}

export async function getOrCreateUser(): Promise<User> {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Not authenticated");

  const clerkId = clerkUser.id;
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
  const imageUrl = clerkUser.imageUrl ?? null;

  // Try to find existing user
  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  // Create new user with default notification preferences
  return prisma.user.create({
    data: {
      clerkId,
      email,
      name,
      imageUrl,
      notificationPreference: { create: {} },
    },
  });
}
