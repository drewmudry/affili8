"use client";

import { useState } from "react";
import { generateAvatarFromPrompt } from "@/actions/generate-avatar";
import { useRouter } from "next/navigation";
import { AvatarListModal } from "./avatar-list-modal";

interface CuratedAvatar {
  id: string;
  imageUrl: string | null;
  prompt: any;
  createdAt: Date;
  updatedAt: Date;
}

export function CuratedAvatarList({ avatars: initialAvatars }: { avatars: CuratedAvatar[] }) {
  const [selectedAvatar, setSelectedAvatar] = useState<CuratedAvatar | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  async function handleAvatarClick(avatar: CuratedAvatar) {
    setSelectedAvatar(avatar);
  }

  async function handleGenerateNew(prompt: any) {
    if (!prompt) return;

    setIsGenerating(true);
    try {
      const promptString = typeof prompt === "string" 
        ? prompt 
        : JSON.stringify(prompt);
      
      await generateAvatarFromPrompt(promptString);
      // Close modal and refresh
      setSelectedAvatar(null);
      router.refresh();
    } catch (error) {
      console.error("Error generating remix:", error);
      alert(error instanceof Error ? error.message : "Failed to generate remix");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-5 gap-4">
        {initialAvatars.map((avatar) => (
          <div
            key={avatar.id}
            className="cursor-pointer group"
            onClick={() => handleAvatarClick(avatar)}
          >
            <div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 transition-transform group-hover:scale-[1.02]">
              {avatar.imageUrl ? (
                <img
                  src={avatar.imageUrl}
                  alt={`Avatar ${avatar.id}`}
                  className="w-full h-auto aspect-[3/4] object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="aspect-[3/4] flex items-center justify-center bg-zinc-200 dark:bg-zinc-800">
                  <p className="text-sm text-zinc-500">No image</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {selectedAvatar && (
        <AvatarListModal
          avatar={selectedAvatar}
          onClose={() => setSelectedAvatar(null)}
          onGenerateNew={handleGenerateNew}
          isGenerating={isGenerating}
        />
      )}
    </>
  );
}

