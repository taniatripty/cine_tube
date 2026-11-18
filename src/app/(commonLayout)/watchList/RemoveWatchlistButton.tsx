"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { deleteWatchListItem } from "@/services/watchList.services"

export default function RemoveWatchlistButton({
  mediaId,
}: {
  mediaId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const removeFromWatchlist = () => {
    setErrorMessage(null)
    startTransition(async () => {
      const result = await deleteWatchListItem(mediaId)

      if (!result.success) {
        setErrorMessage(result.message)
        return
      }

      router.refresh()
    })
  }

  return (
    <div>
      <Button
        type="button"
        variant="destructive"
        disabled={isPending}
        onClick={removeFromWatchlist}
      >
        <Trash2 aria-hidden="true" />
        {isPending ? "Removing..." : "Remove"}
      </Button>
      {errorMessage && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
