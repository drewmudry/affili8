"use client";

import { useState } from "react";
import { MediaModal } from "@/components/ui/media-modal";
import { Image as ImageIcon, Copy, Check } from "lucide-react";

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

interface AnimationListModalProps {
  animation: Animation;
  onClose: () => void;
}

export function AnimationListModal({ animation, onClose }: AnimationListModalProps) {
  const [showBaseImage, setShowBaseImage] = useState(false);
  const [hasCopiedPrompt, setHasCopiedPrompt] = useState(false);

  const handleCopyPrompt = () => {
    if (!animation.prompt) return;
    navigator.clipboard.writeText(animation.prompt);
    setHasCopiedPrompt(true);
    setTimeout(() => setHasCopiedPrompt(false), 2000);
  };

  const handleToggleBaseImage = () => {
    setShowBaseImage(!showBaseImage);
  };

  // Determine which media to show
  const currentMediaType = showBaseImage ? "image" : "video";
  const currentMediaUrl = showBaseImage
    ? animation.avatar?.imageUrl ?? null
    : animation.videoUrl;

  const controlButtons = (
    <>
      {/* Base Image Button */}
      {animation.avatar?.imageUrl && (
        <button
          onClick={handleToggleBaseImage}
          className={`h-10 rounded-full transition-all shadow-lg font-semibold flex items-center justify-center gap-2 px-3 border ${showBaseImage
              ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
              : "bg-card text-foreground hover:bg-muted border-zinc-200 dark:border-zinc-800"
            }`}
          aria-label="Toggle base image"
          title="View base avatar image"
        >
          <ImageIcon size={18} />
          <span className="text-xs hidden sm:inline">
            {showBaseImage ? "Video" : "Base Image"}
          </span>
        </button>
      )}

      {/* Copy Motion Prompt Button */}
      <button
        onClick={handleCopyPrompt}
        className="h-10 rounded-full transition-all shadow-lg font-semibold flex items-center justify-center gap-2 px-3 border bg-card text-foreground hover:bg-muted border-zinc-200 dark:border-zinc-800"
        aria-label="Copy motion prompt"
        title="Copy animation prompt"
      >
        {hasCopiedPrompt ? (
          <Check size={18} className="text-green-500" />
        ) : (
          <Copy size={18} />
        )}
        <span className="text-xs hidden sm:inline">
          {hasCopiedPrompt ? "Copied!" : "Copy Prompt"}
        </span>
      </button>
    </>
  );

  return (
    <MediaModal
      mediaType={currentMediaType}
      mediaUrl={currentMediaUrl}
      isLoading={!animation.videoUrl}
      loadingText="Generating animation..."
      loadingSubtext="This may take a few minutes"
      onClose={onClose}
      showCopyButtons={false}
      showDownloadButton={!showBaseImage}
      controlButtons={controlButtons}
    />
  );
}
