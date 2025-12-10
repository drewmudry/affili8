"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUpload, deleteUpload } from "@/actions/uploads";
import { Trash2, Edit, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UploadDetailModalProps {
  upload: {
    id: string;
    url: string;
    title: string | null;
    type: "demo" | "video" | "image";
    filename: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDetailModal({ upload, open, onOpenChange }: UploadDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(upload.title || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const justSavedRef = useRef(false);
  const router = useRouter();

  // Update title when upload changes (only if not currently editing and we didn't just save)
  useEffect(() => {
    if (upload && !isEditing && !justSavedRef.current) {
      setTitle(upload.title || "");
    }
    // Reset the flag after checking
    if (justSavedRef.current) {
      justSavedRef.current = false;
    }
  }, [upload, isEditing]);

  // Reset edit mode when modal closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setTitle(upload.title || "");
      justSavedRef.current = false;
    }
  }, [open, upload]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUpload(upload.id, title);
      justSavedRef.current = true; // Mark that we just saved
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to update upload:", error);
      alert("Failed to update title. Check console.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUpload(upload.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete upload:", error);
      alert("Failed to delete. Check console.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setTitle(upload.title || "");
    setIsEditing(false);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => onOpenChange(false)} />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="relative pointer-events-auto transition-all duration-500 ease-out w-auto max-w-4xl">
          <div className="flex gap-4">
            {/* Main Modal */}
            <div className="flex-shrink-0">
              <div className="bg-card rounded-lg overflow-hidden shadow-2xl transition-all duration-500 border border-zinc-200 dark:border-zinc-800">
                {/* Title inside modal */}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                  {isEditing ? (
                    <div className="flex items-center gap-2 justify-center">
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="max-w-md"
                        placeholder="Enter title"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 text-center">
                      {title || upload.filename}
                    </h3>
                  )}
                </div>

                {/* Image/Video content */}
                <div>
                  {upload.type === "image" ? (
                    <img
                      src={upload.url}
                      alt={upload.title || upload.filename}
                      className="w-full h-auto max-h-[80vh] object-contain"
                    />
                  ) : (
                    <video
                      src={upload.url}
                      controls
                      className="w-full h-auto max-h-[80vh] object-contain"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="absolute -right-20 top-0 flex flex-col gap-2">
              <button
                onClick={() => onOpenChange(false)}
                className="h-10 w-10 flex items-center justify-center bg-card hover:bg-muted rounded-full text-foreground transition-colors shadow-lg border border-zinc-200 dark:border-zinc-800"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`h-10 w-10 flex items-center justify-center bg-card hover:bg-muted rounded-full text-foreground transition-colors shadow-lg border border-zinc-200 dark:border-zinc-800 ${
                  isEditing ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary" : ""
                }`}
                aria-label="Edit title"
                title="Edit Title"
              >
                <Edit size={18} />
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="h-10 w-10 flex items-center justify-center bg-card hover:bg-muted rounded-full text-destructive transition-colors shadow-lg border border-zinc-200 dark:border-zinc-800 hover:border-destructive"
                aria-label="Delete upload"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the upload
              and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
