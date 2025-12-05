"use client";

import { useState, useEffect } from "react";
import { getAvatars, getAvatarById, deleteAvatar, updateAvatarPrompt, regenerateAvatar } from "@/actions/get-avatars";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Save, RefreshCw, Copy, Sparkles, X } from "lucide-react";
import { EditablePrompt } from "./editable-prompt";

interface Avatar {
  id: string;
  imageUrl: string | null;
  prompt: any;
  createdAt: Date;
  updatedAt: Date;
}

export function AvatarList() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<any>(null);
  const [isRemixing, setIsRemixing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    async function fetchAvatars() {
      try {
        const data = await getAvatars();
        // Filter to only show avatars with images
        setAvatars(data.filter((avatar) => avatar.imageUrl));
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching avatars:", err);
        setError(err instanceof Error ? err.message : "Failed to load avatars");
        setIsLoading(false);
      }
    }

    fetchAvatars();
  }, []);

  async function handleAvatarClick(avatar: Avatar) {
    try {
      // Fetch full avatar data to ensure we have the latest prompt
      const fullAvatar = await getAvatarById(avatar.id);
      setSelectedAvatar(fullAvatar);
      setEditedPrompt(fullAvatar.prompt);
    } catch (err) {
      console.error("Error fetching avatar details:", err);
      // Fallback to the avatar we already have
      setSelectedAvatar(avatar);
      setEditedPrompt(avatar.prompt);
    }
  }

  async function handleSave() {
    if (!selectedAvatar || !editedPrompt) return;

    setIsSaving(true);
    try {
      await updateAvatarPrompt(selectedAvatar.id, editedPrompt);
      // Update the avatar in the list
      setAvatars(
        avatars.map((a) =>
          a.id === selectedAvatar.id ? { ...a, prompt: editedPrompt } : a
        )
      );
      // Update selected avatar
      setSelectedAvatar({ ...selectedAvatar, prompt: editedPrompt });
    } catch (err) {
      console.error("Error saving prompt:", err);
      setError(err instanceof Error ? err.message : "Failed to save prompt");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRegenerate() {
    if (!selectedAvatar) return;

    setIsRegenerating(true);
    try {
      const result = await regenerateAvatar(selectedAvatar.id);
      // Refresh the avatars list to show the new avatar
      const data = await getAvatars();
      setAvatars(data.filter((avatar) => avatar.imageUrl));
      // Close the modal
      setSelectedAvatar(null);
      setEditedPrompt(null);
      setIsRemixing(false);
    } catch (err) {
      console.error("Error regenerating avatar:", err);
      setError(err instanceof Error ? err.message : "Failed to regenerate avatar");
    } finally {
      setIsRegenerating(false);
    }
  }

  async function handleDelete() {
    if (!selectedAvatar) return;

    if (!confirm("Are you sure you want to delete this avatar? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAvatar(selectedAvatar.id);
      // Remove from list
      setAvatars(avatars.filter((a) => a.id !== selectedAvatar.id));
      // Close modal
      setSelectedAvatar(null);
      setIsRemixing(false);
    } catch (err) {
      console.error("Error deleting avatar:", err);
      setError(err instanceof Error ? err.message : "Failed to delete avatar");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">Loading avatars...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
        Error: {error}
      </div>
    );
  }

  if (avatars.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">No avatars found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {avatars.map((avatar) => (
          <div
            key={avatar.id}
            className="group relative overflow-hidden rounded-lg aspect-[9/16]"
          >
            {avatar.imageUrl ? (
              <img
                src={avatar.imageUrl}
                alt={`Avatar ${avatar.id}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800">
                <p className="text-xs text-zinc-500">No image</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ))}
      </div>

      <Dialog
        open={!!selectedAvatar}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAvatar(null);
            setIsRemixing(false);
          }
        }}
      >
        <DialogContent
          className="bg-transparent border-none shadow-none max-w-none w-auto h-auto p-0 overflow-visible outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {selectedAvatar && (
            <div
              className={`relative pointer-events-auto transition-all duration-500 ease-out ${isRemixing ? "w-[900px]" : "w-[280px]"
                }`}
            >
              <div className="flex gap-4">
                {/* Main Modal */}
                <div className="flex-shrink-0">
                  <div
                    className={`bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-500 border border-zinc-200 dark:border-zinc-800 ${isRemixing ? "w-48" : "w-64"
                      }`}
                  >
                    <img
                      src={selectedAvatar.imageUrl || "/placeholder.svg"}
                      alt={`Avatar ${selectedAvatar.id}`}
                      className="w-full h-auto aspect-[9/16] object-cover"
                    />
                  </div>
                </div>

                {/* Remix Panel */}
                {isRemixing && (
                  <div className="flex-1 bg-white dark:bg-zinc-900 rounded-lg shadow-2xl p-4 overflow-hidden animate-in slide-in-from-left-1/2 border border-zinc-200 dark:border-zinc-800 flex flex-col h-[500px]">
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Edit & Remix</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 -mr-2 customize-scrollbar">
                      {editedPrompt && (
                        <EditablePrompt
                          prompt={editedPrompt}
                          onChange={setEditedPrompt}
                        />
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-red-500 hover:text-red-600 h-8 px-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving || !editedPrompt || JSON.stringify(editedPrompt) === JSON.stringify(selectedAvatar.prompt)}
                          className="h-8"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleRegenerate}
                          disabled={isRegenerating}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 h-8"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                          Regen
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Control Buttons */}
                <div className="absolute -right-16 top-0 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedAvatar(null);
                      setIsRemixing(false);
                    }}
                    className="p-2 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-900 dark:text-zinc-50 transition-colors shadow-lg border border-zinc-200 dark:border-zinc-800"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedAvatar.prompt, null, 2));
                    }}
                    className="p-2 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-900 dark:text-zinc-50 transition-colors shadow-lg border border-zinc-200 dark:border-zinc-800"
                    aria-label="Copy Prompt"
                  >
                    <Copy size={20} />
                  </button>
                  <button
                    onClick={() => setIsRemixing(!isRemixing)}
                    className={`p-2 rounded-full transition-all duration-300 shadow-lg font-semibold flex items-center justify-center gap-2 px-3 border ${isRemixing
                      ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-50"
                      : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800"
                      }`}
                    aria-label="Remix content"
                  >
                    <Sparkles size={18} />
                    <span className={`text-xs overflow-hidden transition-all duration-300 ${isRemixing ? "w-8 opacity-100" : "w-0 opacity-0"}`}>
                      Done
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

