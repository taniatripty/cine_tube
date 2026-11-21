"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  deleteReviewAction,
  updateReviewAction,
  type MyReview,
} from "@/services/review.services"

// ── Edit sheet ────────────────────────────────────────────────────────────────

function EditReviewSheet({ review }: { review: MyReview }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    const fd = new FormData(e.currentTarget)
    const rating = Number(fd.get("rating"))
    const content = String(fd.get("content") ?? "").trim()
    const isSpoiler = fd.get("isSpoiler") === "on"

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setMessage({ ok: false, text: "Choose a rating from 1 to 5." })
      return
    }
    if (!content) {
      setMessage({ ok: false, text: "Review content cannot be empty." })
      return
    }

    setIsPending(true)
    try {
      const result = await updateReviewAction(review.id, {
        rating,
        content,
        isSpoiler,
      })
      setMessage({ ok: result.success, text: result.message })
      if (result.success) {
        router.refresh()
        setTimeout(() => setOpen(false), 900)
      }
    } catch {
      setMessage({ ok: false, text: "Something went wrong. Please try again." })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={`Edit review for ${review.media.title}`}
          />
        }
      >
        <Pencil className="size-3.5" aria-hidden="true" />
        Edit
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit review</SheetTitle>
          <SheetDescription className="line-clamp-1">
            {review.media.title}
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-col gap-5 px-4 py-2"
          onSubmit={handleSubmit}
        >
          {message && (
            <p
              className={
                message.ok
                  ? "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
                  : "rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              }
              role={message.ok ? "status" : "alert"}
            >
              {message.text}
            </p>
          )}

          <fieldset
            className="flex flex-col gap-5"
            disabled={isPending || message?.ok === true}
          >
            {/* Rating */}
            <div className="space-y-1.5">
              <Label htmlFor={`edit-rating-${review.id}`}>Rating</Label>
              <select
                id={`edit-rating-${review.id}`}
                name="rating"
                defaultValue={review.rating}
                required
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="5">5 — Excellent</option>
                <option value="4">4 — Very good</option>
                <option value="3">3 — Good</option>
                <option value="2">2 — Fair</option>
                <option value="1">1 — Poor</option>
              </select>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <Label htmlFor={`edit-content-${review.id}`}>Your review</Label>
              <Textarea
                id={`edit-content-${review.id}`}
                name="content"
                defaultValue={review.content}
                className="min-h-36"
                placeholder="What did you think of this title?"
                required
              />
            </div>

            {/* Spoiler toggle */}
            <label
              htmlFor={`edit-spoiler-${review.id}`}
              className="flex items-center gap-3 text-sm"
            >
              <input
                id={`edit-spoiler-${review.id}`}
                name="isSpoiler"
                type="checkbox"
                defaultChecked={review.isSpoiler}
                className="size-4 accent-red-600"
              />
              This review contains spoilers
            </label>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </fieldset>
        </form>

        <SheetFooter>
          <SheetClose
            render={<Button variant="outline" className="w-full" />}
          >
            Cancel
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ── Delete with Sonner confirmation toast ─────────────────────────────────────

function DeleteReviewButton({ review }: { review: MyReview }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const confirmDelete = async () => {
    setIsPending(true)
    const loadingId = toast.loading("Deleting review…")

    try {
      const result = await deleteReviewAction(review.id)
      toast.dismiss(loadingId)

      if (result.success) {
        toast.success("Review deleted", {
          description: `Your review for "${review.media.title}" has been removed.`,
        })
        router.refresh()
      } else {
        toast.error("Could not delete review", {
          description: result.message,
        })
      }
    } catch {
      toast.dismiss(loadingId)
      toast.error("Something went wrong", {
        description: "Please try again.",
      })
    } finally {
      setIsPending(false)
    }
  }

  const handleClick = () => {
    toast("Remove this review?", {
      description: `"${review.media.title}" — this action cannot be undone.`,
      duration: 8000,
      action: {
        label: "Yes, delete",
        onClick: confirmDelete,
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    })
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={handleClick}
      aria-label={`Delete review for ${review.media.title}`}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="size-3.5" aria-hidden="true" />
      )}
      Delete
    </Button>
  )
}

// ── Exported composite ────────────────────────────────────────────────────────

export function ReviewActions({ review }: { review: MyReview }) {
  // Only PENDING reviews can be edited or deleted (backend enforces this too)
  if (review.status !== "PENDING") return null

  return (
    <div className="flex gap-2 border-t px-4 py-3">
      <EditReviewSheet review={review} />
      <DeleteReviewButton review={review} />
    </div>
  )
}
