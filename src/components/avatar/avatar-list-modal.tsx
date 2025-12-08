"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Zap, Copy, Check, Wand2, Loader2, Sparkles } from "lucide-react"
import { EditablePrompt } from "./editable-prompt"

interface Avatar {
  id: string
  imageUrl: string | null
  prompt: any
  createdAt: Date
  updatedAt: Date
}

interface AvatarListModalProps {
  avatar: Avatar
  onClose: () => void
  onGenerateNew: (prompt: any) => Promise<void>
  isGenerating?: boolean
}

export function AvatarListModal({ avatar, onClose, onGenerateNew, isGenerating = false }: AvatarListModalProps) {
  const [isRemixing, setIsRemixing] = useState(false)
  const [editedPrompt, setEditedPrompt] = useState<any>(avatar.prompt)
  const [hasCopied, setHasCopied] = useState(false)

  const handleSubmit = async () => {
    await onGenerateNew(editedPrompt)
    setIsRemixing(false)
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(JSON.stringify(editedPrompt))
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className={`relative pointer-events-auto transition-all duration-500 ease-out ${
            isRemixing ? "w-[900px]" : "w-[280px]"
          }`}
        >
          <div className="flex gap-4">
            {/* Main Modal */}
            <div className="flex-shrink-0">
              <div
                className={`bg-card rounded-lg overflow-hidden shadow-2xl transition-all duration-500 border border-zinc-200 dark:border-zinc-800 ${
                  isRemixing ? "w-48" : "w-64"
                }`}
              >
                {avatar.imageUrl ? (
                  <img
                    src={avatar.imageUrl || "/placeholder.svg"}
                    alt="Avatar"
                    className="w-full h-auto aspect-[9/16] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[9/16] flex flex-col items-center justify-center gap-3 text-zinc-500">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm">Generating...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Remix Panel */}
            {isRemixing && (
              <div className="flex-1 bg-card rounded-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4 overflow-y-auto max-h-96 animate-in slide-in-from-left-1/2 flex flex-col">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Edit & Remix</h3>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                  {editedPrompt ? (
                    <EditablePrompt prompt={editedPrompt} onChange={setEditedPrompt} />
                  ) : (
                    <div className="text-zinc-500 text-center mt-10">No prompt data found.</div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <Button onClick={handleSubmit} disabled={isGenerating} className="w-full gap-2">
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Generate New Avatar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="absolute -right-16 top-0 flex flex-col gap-2">
              <button
                onClick={onClose}
                className="p-2 bg-card hover:bg-muted rounded-full text-foreground transition-colors shadow-lg border border-zinc-200 dark:border-zinc-800"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <button
                onClick={handleCopyPrompt}
                className="p-2 bg-card hover:bg-muted rounded-full text-foreground transition-colors shadow-lg border border-zinc-200 dark:border-zinc-800"
                aria-label="Copy prompt"
                title="Copy Prompt"
              >
                {hasCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>

              <button
                onClick={() => setIsRemixing(!isRemixing)}
                className={`p-2 rounded-full transition-all shadow-lg font-semibold flex items-center justify-center gap-2 px-3 border ${
                  isRemixing
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                    : "bg-card text-foreground hover:bg-muted border-zinc-200 dark:border-zinc-800"
                }`}
                aria-label="Remix content"
              >
                <Zap size={18} />
                <span className="text-xs hidden sm:inline">{isRemixing ? "Done" : "Remix"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
