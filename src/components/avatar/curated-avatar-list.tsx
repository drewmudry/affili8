"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EditablePrompt } from "@/components/avatar/editable-prompt";
import { Button } from "@/components/ui/button";
import { generateAvatarFromPrompt } from "@/actions/generate-avatar";
import { useRouter } from "next/navigation";
import { X, Sparkles } from "lucide-react";

interface CuratedAvatar {
  id: string;
  imageUrl: string | null;
  prompt: any;
  createdAt: Date;
  updatedAt: Date;
}

export function CuratedAvatarList({ avatars: initialAvatars }: { avatars: CuratedAvatar[] }) {
  const [selectedAvatar, setSelectedAvatar] = useState<CuratedAvatar | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<any>(null);
  const [showRemix, setShowRemix] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const router = useRouter();

  async function handleAvatarClick(avatar: CuratedAvatar) {
    setSelectedAvatar(avatar);
    setEditedPrompt(avatar.prompt);
    setShowRemix(false);
  }

  function handleRemixClick() {
    setShowRemix(true);
  }

  async function handleGenerateRemix() {
    if (!editedPrompt) return;

    setIsRemixing(true);
    try {
      const promptString = typeof editedPrompt === "string" 
        ? editedPrompt 
        : JSON.stringify(editedPrompt);
      
      await generateAvatarFromPrompt(promptString);
      // Close modal and refresh
      setSelectedAvatar(null);
      setShowRemix(false);
      router.refresh();
    } catch (error) {
      console.error("Error generating remix:", error);
      alert(error instanceof Error ? error.message : "Failed to generate remix");
    } finally {
      setIsRemixing(false);
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

      <Dialog
        open={!!selectedAvatar}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAvatar(null);
            setShowRemix(false);
          }
        }}
      >
        <DialogContent
          className="max-w-6xl p-0 max-h-[90vh] overflow-hidden flex flex-col"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Avatar Details</DialogTitle>
          {selectedAvatar && (
            <div className="flex h-full overflow-hidden">
              {/* Image Section - 2/3 width */}
              <div className="w-2/3 flex-shrink-0 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-6 overflow-auto relative">
                {selectedAvatar.imageUrl ? (
                  <img
                    src={selectedAvatar.imageUrl}
                    alt={`Avatar ${selectedAvatar.id}`}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-zinc-500">No image available</p>
                  </div>
                )}
                {/* X button and Remix button positioned on top of the image */}
                {!showRemix && (
                  <div className="absolute top-6 right-6 flex flex-col items-end gap-3 z-10">
                    <Button
                      onClick={() => {
                        setSelectedAvatar(null);
                        setShowRemix(false);
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleRemixClick}
                      className="flex items-center gap-2 bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-800"
                    >
                      <Sparkles className="h-4 w-4" />
                      Remix
                    </Button>
                  </div>
                )}
              </div>

              {/* Prompt Section - 1/3 width */}
              {showRemix && (
                <div className="w-1/3 flex-shrink-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-auto p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      Edit Prompt
                    </h3>
                    <Button
                      onClick={handleGenerateRemix}
                      disabled={isRemixing}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      {isRemixing ? "Generating..." : "Generate Remix"}
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {editedPrompt && (
                      <EditablePrompt
                        prompt={editedPrompt}
                        onChange={setEditedPrompt}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

