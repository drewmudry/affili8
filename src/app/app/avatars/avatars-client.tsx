"use client";

import { useRef } from "react";
import { AvatarListWithTabs, AvatarListWithTabsRef } from "@/components/avatar/avatar-list-with-tabs";
import { GenerateAvatarModal } from "@/components/avatar/generate-avatar-modal";

interface Avatar {
  id: string;
  imageUrl: string | null;
  prompt: any;
  createdAt: Date;
  updatedAt: Date;
}

export function AvatarsPageClient({
  curatedAvatars,
  userAvatars,
}: {
  curatedAvatars: Avatar[];
  userAvatars: Avatar[];
}) {
  const tabsRef = useRef<AvatarListWithTabsRef>(null);

  const handleSwitchToMyAvatars = () => {
    tabsRef.current?.switchToMyAvatars();
  };

  return (
    <AvatarListWithTabs 
      ref={tabsRef}
      curatedAvatars={curatedAvatars} 
      userAvatars={userAvatars}
      generateButton={<GenerateAvatarModal onSwitchToMyAvatars={handleSwitchToMyAvatars} />}
    />
  );
}
