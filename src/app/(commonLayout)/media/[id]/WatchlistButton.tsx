"use client"

import { useState, useTransition } from "react"
import { BookmarkPlus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createWatchList } from "@/services/watchList.services"

export default function WatchlistButton({ mediaId }: { mediaId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const addToWatchlist = () => {
    setErrorMessage(null)
    startTransition(async () => {
      const result = await createWatchList(mediaId)

      if (!result.success) {
        setErrorMessage(result.message)
        return
      }

      router.push("/watchList")
    })
  }

  return (
    <div>
      <Button
        className="min-h-10 border-white/25 bg-black/40 px-4 text-white hover:bg-white/15"
        variant="outline"
        type="button"
        disabled={isPending}
        onClick={addToWatchlist}
      >
        <BookmarkPlus aria-hidden="true" />
        {isPending ? "Adding..." : "Add to Watchlist"}
      </Button>
      {errorMessage && (
        <p className="mt-2 max-w-sm text-sm text-red-200" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
