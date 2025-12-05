"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CuratedAvatarList } from "@/components/avatar/curated-avatar-list";

interface Avatar {
  id: string;
  imageUrl: string | null;
  prompt: any;
  createdAt: Date;
  updatedAt: Date;
}

export function AvatarListWithTabs({
  curatedAvatars,
  userAvatars,
}: {
  curatedAvatars: Avatar[];
  userAvatars: Avatar[];
}) {
  const [viewMode, setViewMode] = useState<"curated" | "mine" | "all">("all");

  const allAvatars = [...curatedAvatars, ...userAvatars];

  return (
    <Tabs defaultValue="all" onValueChange={(value) => setViewMode(value as typeof viewMode)}>
      <TabsList>
        <TabsTrigger value="all">All ({allAvatars.length})</TabsTrigger>
        <TabsTrigger value="curated">Curated ({curatedAvatars.length})</TabsTrigger>
        <TabsTrigger value="mine">My Avatars ({userAvatars.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="mt-6">
        <CuratedAvatarList avatars={allAvatars} />
      </TabsContent>
      <TabsContent value="curated" className="mt-6">
        <CuratedAvatarList avatars={curatedAvatars} />
      </TabsContent>
      <TabsContent value="mine" className="mt-6">
        <CuratedAvatarList avatars={userAvatars} />
      </TabsContent>
    </Tabs>
  );
}

