"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/index";
import { animations, avatars } from "@/db/schema";
import { eq, isNull, desc, or } from "drizzle-orm";

export async function getAnimations() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Not authenticated");
  }

  // Fetch animations that are either curated (user = null) or personal (user's own)
  const allAnimations = await db
    .select({
      id: animations.id,
      videoUrl: animations.videoUrl,
      prompt: animations.prompt,
      avatarId: animations.avatarId,
      userId: animations.userId,
      createdAt: animations.createdAt,
      updatedAt: animations.updatedAt,
      avatar: {
        id: avatars.id,
        imageUrl: avatars.imageUrl,
        prompt: avatars.prompt,
      },
    })
    .from(animations)
    .leftJoin(avatars, eq(animations.avatarId, avatars.id))
    .where(
      or(
        eq(animations.userId, session.user.id),
        isNull(animations.userId)
      )
    )
    .orderBy(desc(animations.createdAt));

  return allAnimations.map((animation) => ({
    id: animation.id,
    videoUrl: animation.videoUrl,
    prompt: animation.prompt,
    avatarId: animation.avatarId,
    userId: animation.userId,
    createdAt: animation.createdAt,
    updatedAt: animation.updatedAt,
    avatar: animation.avatar ? {
      id: animation.avatar.id,
      imageUrl: animation.avatar.imageUrl,
      prompt: animation.avatar.prompt,
    } : null,
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
