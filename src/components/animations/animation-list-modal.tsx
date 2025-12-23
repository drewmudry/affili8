"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface Animation {
  id: string;
  videoUrl: string | null;
  prompt: string;
  avatarId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AnimationListModalProps {
  animation: Animation;
  onClose: () => void;
}

export function AnimationListModal({ animation, onClose }: AnimationListModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="relative pointer-events-auto transition-all duration-500 ease-out w-[420px]">
          <div className="bg-card rounded-lg overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
            {animation.videoUrl ? (
              <video
                src={animation.videoUrl}
                className="w-full h-auto aspect-[9/16] object-cover"
                controls
                autoPlay
                loop
                playsInline
              />
            ) : (
              <div className="w-full aspect-[9/16] flex flex-col items-center justify-center gap-3 text-zinc-500">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Generating animation...</p>
                <p className="text-xs text-zinc-400">This may take a few minutes</p>
              </div>
            )}
            {animation.prompt && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">Prompt:</span> {animation.prompt}
                </p>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="absolute -right-20 top-0 flex flex-col gap-2">
            <button
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center bg-card hover:bg-muted rounded-full text-foreground transition-colors shadow-lg border border-zinc-200 dark:border-zinc-800"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
