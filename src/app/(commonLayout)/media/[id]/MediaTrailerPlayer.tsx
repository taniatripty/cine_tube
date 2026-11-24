"use client"

import { useState } from "react"
import { Film, Play, X } from "lucide-react"

import { Button } from "@/components/ui/button"

export function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1).split("?")[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v")
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
  } catch {
    return null
  }
  return null
}

export default function MediaTrailerPlayer({
  title,
  streamingUrl,
}: {
  title: string
  streamingUrl?: string | null
}) {
  const [isOpen, setIsOpen] = useState(false)
  const embedUrl = getYouTubeEmbedUrl(streamingUrl)

  if (!embedUrl) return null

  return (
    <>
      <Button
        type="button"
        className="min-h-10 bg-white font-semibold text-black hover:bg-white/90"
        onClick={() => setIsOpen(true)}
      >
        <Play className="size-4 fill-black" aria-hidden="true" />
        Watch Trailer
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} trailer`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <Film className="size-4 text-red-600" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-white sm:text-base">
                  {title} — Official Trailer & Preview
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
                onClick={() => setIsOpen(false)}
                aria-label="Close trailer"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`${embedUrl}?autoplay=1`}
                title={`${title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
