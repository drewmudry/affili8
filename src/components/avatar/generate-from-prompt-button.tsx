"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { generateAvatarFromPrompt, getAvatarStatus } from "@/actions/generate-avatar";

export function GenerateFromPromptButton({ onComplete }: { onComplete?: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for avatar completion
  useEffect(() => {
    if (!avatarId || !isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await getAvatarStatus(avatarId);
        
        if (status.isComplete && status.imageUrl) {
          setImageUrl(status.imageUrl);
          setIsPolling(false);
          clearInterval(pollInterval);
          if (onComplete) {
            setTimeout(() => onComplete(), 1000); // Small delay to show success
          }
        }
      } catch (err) {
        console.error("Error polling avatar status:", err);
        setError(err instanceof Error ? err.message : "Failed to check status");
        setIsPolling(false);
        clearInterval(pollInterval);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [avatarId, isPolling]);

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setImageUrl(null);
    
    try {
      const result = await generateAvatarFromPrompt(prompt);
      setAvatarId(result.avatarId);
      setIsPolling(true);
      setIsGenerating(false);
      // Don't clear prompt - let user see what they generated
    } catch (err) {
      console.error("Error generating avatar:", err);
      setError(err instanceof Error ? err.message : "Failed to generate avatar");
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2">
          Paste your prompt (JSON or plain text):
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Paste your prompt here... (e.g., {"prompt": "A beautiful portrait..."} or just plain text)'
          className="w-full min-h-[200px] px-4 py-3 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 font-mono resize-y"
          disabled={isGenerating || isPolling}
        />
      </div>
      <Button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating || isPolling}
      >
        {isGenerating 
          ? "Starting generation..." 
          : isPolling 
          ? "Generating avatar..." 
          : "Generate Avatar"}
      </Button>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
          Error: {error}
        </div>
      )}

      {isPolling && !imageUrl && (
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          Avatar generation in progress... This may take a minute.
        </div>
      )}

      {imageUrl && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Avatar generated successfully!
          </p>
          <div className="rounded-lg border border-zinc-200 overflow-hidden dark:border-zinc-800">
            <img 
              src={imageUrl} 
              alt="Generated avatar" 
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}

