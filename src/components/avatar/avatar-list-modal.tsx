"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X, Zap, Copy, Check, Wand2, Loader2, Sparkles, Video } from "lucide-react"
import { generateAnimationFromAvatar } from "@/actions/generate-animation"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  onRemix: (avatarId: string, instructions: string) => Promise<void>
  isGenerating?: boolean
}

export function AvatarListModal({ avatar, onClose, onRemix, isGenerating = false }: AvatarListModalProps) {
  const router = useRouter()
  const [isRemixing, setIsRemixing] = useState(false)
  const [remixInstructions, setRemixInstructions] = useState("")
  const [hasCopied, setHasCopied] = useState(false)
  const [isAnimeModalOpen, setIsAnimeModalOpen] = useState(false)
  const [animePrompt, setAnimePrompt] = useState("")
  const [isGeneratingAnimation, setIsGeneratingAnimation] = useState(false)

  const handleRemixSubmit = async () => {
    if (!remixInstructions.trim()) {
      return
    }
    await onRemix(avatar.id, remixInstructions.trim())
    setIsRemixing(false)
    setRemixInstructions("")
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(JSON.stringify(avatar.prompt))
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  const handleAnimeClick = () => {
    setIsAnimeModalOpen(true)
  }

  const handleGenerateAnimation = async () => {
    if (!animePrompt.trim()) {
      return
    }

    setIsGeneratingAnimation(true)
    try {
      await generateAnimationFromAvatar(avatar.id, animePrompt)
      // Close modals and navigate to animations page
      setIsAnimeModalOpen(false)
      onClose() // Close the avatar modal too
      setAnimePrompt("")
      router.push("/app/animations")
    } catch (error) {
      console.error("Failed to generate animation:", error)
      alert("Failed to generate animation. Please try again.")
      setIsGeneratingAnimation(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className={`relative pointer-events-auto transition-all duration-500 ease-out ${
            isRemixing ? "w-[1350px]" : "w-[420px]"
          }`}
        >
          <div className="flex gap-4">
            {/* Main Modal */}
            <div className="flex-shrink-0">
              <div
                className={`bg-card rounded-lg overflow-hidden shadow-2xl transition-all duration-500 border border-zinc-200 dark:border-zinc-800 ${
                  isRemixing ? "w-72" : "w-96"
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
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Remix Avatar</h3>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      What would you like to change?
                    </label>
                    <textarea
                      value={remixInstructions}
                      onChange={(e) => setRemixInstructions(e.target.value)}
                      placeholder="e.g., change her shirt to a black spaghetti strap tank top, make her hair blonde, add sunglasses..."
                      className="w-full min-h-[120px] px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 resize-none"
                      disabled={isGenerating}
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Describe the changes you want to make to this avatar. The image will be used as a reference.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <Button 
                    onClick={handleRemixSubmit} 
                    disabled={isGenerating || !remixInstructions.trim()} 
                    className="w-full gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Generate Remix
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="absolute -right-20 top-0 flex flex-col gap-2">
              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center bg-card hover:bg-muted rounded-full text-foreground transition-colors shadow-lg border border-zinc-200 dark:border-zinc-800"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <button
                onClick={handleCopyPrompt}
                className="h-10 w-10 flex items-center justify-center bg-card hover:bg-muted rounded-full text-foreground transition-colors shadow-lg border border-zinc-200 dark:border-zinc-800"
                aria-label="Copy prompt"
                title="Copy Prompt"
              >
                {hasCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>

              <button
                onClick={() => setIsRemixing(!isRemixing)}
                disabled={!avatar.imageUrl}
                className={`h-10 rounded-full transition-all shadow-lg font-semibold flex items-center justify-center gap-2 px-3 border ${
                  isRemixing
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                    : !avatar.imageUrl
                    ? "bg-card text-foreground/50 border-zinc-200 dark:border-zinc-800 cursor-not-allowed opacity-50"
                    : "bg-card text-foreground hover:bg-muted border-zinc-200 dark:border-zinc-800"
                }`}
                aria-label="Remix content"
                title={!avatar.imageUrl ? "Avatar must have an image to remix" : "Remix this avatar"}
              >
                <Zap size={18} />
                <span className="text-xs hidden sm:inline">{isRemixing ? "Done" : "Remix"}</span>
              </button>

              <button
                onClick={handleAnimeClick}
                className="h-10 rounded-full transition-all shadow-lg font-semibold flex items-center justify-center gap-2 px-3 border bg-card text-foreground hover:bg-muted border-zinc-200 dark:border-zinc-800"
                aria-label="Animate avatar"
                title="Animate this avatar"
              >
                <Video size={18} />
                <span className="text-xs hidden sm:inline">Animate</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Generation Modal */}
      <Dialog open={isAnimeModalOpen} onOpenChange={setIsAnimeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Animate Avatar</DialogTitle>
            <DialogDescription>
              Enter a prompt describing how you want to animate this avatar. The animation will be generated using the avatar image and your prompt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="e.g., A gentle swaying motion, walking forward, waving hello..."
              value={animePrompt}
              onChange={(e) => setAnimePrompt(e.target.value)}
              disabled={isGeneratingAnimation}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAnimeModalOpen(false)
                setAnimePrompt("")
              }}
              disabled={isGeneratingAnimation}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateAnimation}
              disabled={!animePrompt.trim() || isGeneratingAnimation}
            >
              {isGeneratingAnimation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Generate Animation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
