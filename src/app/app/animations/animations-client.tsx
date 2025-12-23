"use client";

import { AnimationList } from "@/components/animations/animation-list";

interface Animation {
  id: string;
  videoUrl: string | null;
  prompt: string;
  avatarId: string;
  createdAt: Date;
  updatedAt: Date;
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
