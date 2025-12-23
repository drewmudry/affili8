"use client";

import { useState, useEffect } from "react";
import { getAnimations } from "@/actions/get-animations";
import { Loader2, Play, Video } from "lucide-react";
import { AnimationListModal } from "./animation-list-modal";

interface Animation {
  id: string;
  videoUrl: string | null;
  prompt: string;
  avatarId: string;
  createdAt: Date;
  updatedAt: Date;
}

export function AnimationList({ initialAnimations }: { initialAnimations: Animation[] }) {
  const [animations, setAnimations] = useState<Animation[]>(initialAnimations);
  const [selectedAnimation, setSelectedAnimation] = useState<Animation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Poll for updates on animations that are still generating
    const interval = setInterval(async () => {
      const incompleteAnimations = animations.filter(a => !a.videoUrl);
      if (incompleteAnimations.length > 0) {
        try {
          const updated = await getAnimations();
          setAnimations(updated);
        } catch (err) {
          // Silently fail polling
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [animations]);

  function handleAnimationClick(animation: Animation) {
    setSelectedAnimation(animation);
  }

  function handleClose() {
    setSelectedAnimation(null);
  }

  if (animations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Video className="h-12 w-12 text-zinc-400 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
          No animations yet
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md">
          Create your first animation by clicking on an avatar and using the "Anime" button.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {animations.map((animation) => (
          <div
            key={animation.id}
            onClick={() => handleAnimationClick(animation)}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 aspect-[9/16] transition-transform hover:scale-[1.02] border border-zinc-200 dark:border-zinc-800"
          >
            {animation.videoUrl ? (
              <>
                {/* Video preview - plays on hover, muted, no audio */}
                <video
                  src={animation.videoUrl}
                  className="h-full w-full object-cover"
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onMouseEnter={(e) => {
                    const video = e.currentTarget;
                    video.play().catch(() => {
                      // Silently handle autoplay restrictions
                    });
                  }}
                  onMouseLeave={(e) => {
                    const video = e.currentTarget;
                    video.pause();
                    video.currentTime = 0;
                  }}
                />
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs font-medium">Generating...</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedAnimation && (
        <AnimationListModal
          animation={selectedAnimation}
          onClose={handleClose}
        />
      )}
    </>
  );
}
