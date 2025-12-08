"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import type React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CuratedAvatarList } from "@/components/avatar/curated-avatar-list";

interface Avatar {
  id: string;
  imageUrl: string | null;
  prompt: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvatarListWithTabsRef {
  switchToMyAvatars: () => void;
}

export const AvatarListWithTabs = forwardRef<
  AvatarListWithTabsRef,
  {
    curatedAvatars: Avatar[];
    userAvatars: Avatar[];
    generateButton?: React.ReactNode;
  }
>(({ curatedAvatars, userAvatars, generateButton }, ref) => {
  const [viewMode, setViewMode] = useState<"curated" | "mine" | "all">("all");

  useImperativeHandle(ref, () => ({
    switchToMyAvatars: () => {
      setViewMode("mine");
    },
  }));

  const allAvatars = [...curatedAvatars, ...userAvatars];

  return (
    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as typeof viewMode)}>
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="all">All ({allAvatars.length})</TabsTrigger>
          <TabsTrigger value="curated">Curated ({curatedAvatars.length})</TabsTrigger>
          <TabsTrigger value="mine">My Avatars ({userAvatars.length})</TabsTrigger>
        </TabsList>
        {generateButton && <div className="ml-auto">{generateButton}</div>}
      </div>
      <TabsContent value="all" className="mt-6">
        <CuratedAvatarList avatars={allAvatars} onSwitchToAllTab={() => setViewMode("all")} />
      </TabsContent>
      <TabsContent value="curated" className="mt-6">
        <CuratedAvatarList avatars={curatedAvatars} onSwitchToAllTab={() => setViewMode("all")} />
      </TabsContent>
      <TabsContent value="mine" className="mt-6">
        <CuratedAvatarList avatars={userAvatars} onSwitchToAllTab={() => setViewMode("all")} />
      </TabsContent>
    </Tabs>
  );
});

AvatarListWithTabs.displayName = "AvatarListWithTabs";

