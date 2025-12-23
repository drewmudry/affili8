"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/index";
import { animations } from "@/db/schema";
import { eq, isNull, desc } from "drizzle-orm";

export async function getAnimations() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Not authenticated");
  }

  const userAnimations = await db
    .select()
    .from(animations)
    .where(eq(animations.userId, session.user.id))
    .orderBy(desc(animations.createdAt));

  return userAnimations.map((animation) => ({
    id: animation.id,
    videoUrl: animation.videoUrl,
    prompt: animation.prompt,
    avatarId: animation.avatarId,
    createdAt: animation.createdAt,
    updatedAt: animation.updatedAt,
  }));
}

export async function getAnimationById(animationId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Not authenticated");
  }

  const [animation] = await db
    .select()
    .from(animations)
    .where(eq(animations.id, animationId))
    .limit(1);

  if (!animation) {
    throw new Error("Animation not found");
  }

  // Check if animation belongs to user
  if (animation.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  return {
    id: animation.id,
    videoUrl: animation.videoUrl,
    prompt: animation.prompt,
    avatarId: animation.avatarId,
    createdAt: animation.createdAt,
    updatedAt: animation.updatedAt,
  };
}
