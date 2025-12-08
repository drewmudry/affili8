"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GenerateFromPromptButton } from "@/components/avatar/generate-from-prompt-button";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface GenerateAvatarModalProps {
  onAvatarCreated?: () => void;
  onSwitchToMyAvatars?: () => void;
}

export function GenerateAvatarModal({ 
  onAvatarCreated,
  onSwitchToMyAvatars,
}: GenerateAvatarModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const router = useRouter();

  // Handle when generation starts
  const handleGenerationStart = (newAvatarId: string) => {
    setAvatarId(newAvatarId);
    setIsGenerating(true);
    // Close the input modal and show generating modal
    setIsOpen(false);
    // Refresh to show the new avatar in the list
    router.refresh();
    // Switch to My Avatars tab
    if (onSwitchToMyAvatars) {
      onSwitchToMyAvatars();
    }
    if (onAvatarCreated) {
      onAvatarCreated();
    }
  };

  // Close generating modal and refresh when generation completes
  const handleGenerationComplete = () => {
    setIsGenerating(false);
    setAvatarId(null);
    router.refresh();
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Avatar
      </Button>
      
      {/* Input Modal */}
      <Dialog open={isOpen && !isGenerating} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate New Avatar</DialogTitle>
          </DialogHeader>
          <GenerateFromPromptButton 
            onComplete={handleGenerationComplete}
            onGenerationStart={handleGenerationStart}
          />
        </DialogContent>
      </Dialog>

      {/* Generating Modal */}
      <Dialog open={isGenerating} onOpenChange={(open) => {
        if (!open) {
          // Allow closing the modal, but keep generation state
          // The avatar will still appear in the list when ready
          setIsGenerating(false);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generating Avatar</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
              Your avatar is being generated... This may take a minute.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center">
              The avatar will appear in your list when ready.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

