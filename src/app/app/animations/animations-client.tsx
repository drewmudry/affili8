"use client";

import { AnimationList } from "@/components/animations/animation-list";

interface Animation {
  id: string;
  videoUrl: string | null;
  prompt: string;
  avatarId: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  avatar: {
    id: string;
    imageUrl: string | null;
    prompt: any;
  } | null;
}

export function AnimationsPageClient({
  animations,
}: {
  animations: Animation[];
}) {
  return (
    <AnimationList initialAnimations={animations} />
  );
}
