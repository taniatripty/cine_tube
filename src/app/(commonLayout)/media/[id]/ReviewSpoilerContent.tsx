"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ReviewSpoilerContent({
  content,
  isSpoiler,
}: {
  content: string
  isSpoiler?: boolean
}) {
  const [revealed, setRevealed] = useState(!isSpoiler)

  if (!isSpoiler) {
    return (
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-foreground/90">
        {content}
      </p>
    )
  }

  return (
    <div className="mt-3 space-y-2">
      {revealed ? (
        <div className="space-y-2">
          <p className="whitespace-pre-line text-sm leading-6 text-foreground/90">
            {content}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setRevealed(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <EyeOff className="size-3 mr-1" aria-hidden="true" />
            Hide spoiler
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
          <div className="flex items-center gap-2">
            <span className="text-sm" aria-hidden="true">
              ⚠️
            </span>
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
              This review contains spoilers.
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setRevealed(true)}
            className="border-amber-500/30 bg-background text-xs font-medium hover:bg-amber-500/20"
          >
            <Eye className="size-3 mr-1" aria-hidden="true" />
            Reveal spoiler
          </Button>
        </div>
      )}
    </div>
  )
}
