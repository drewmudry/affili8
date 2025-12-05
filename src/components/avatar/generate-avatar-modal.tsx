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
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function GenerateAvatarModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Close modal and refresh when generation completes
  const handleGenerationComplete = () => {
    setIsOpen(false);
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
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate New Avatar</DialogTitle>
          </DialogHeader>
          <GenerateFromPromptButton onComplete={handleGenerationComplete} />
        </DialogContent>
      </Dialog>
    </>
  );
}

