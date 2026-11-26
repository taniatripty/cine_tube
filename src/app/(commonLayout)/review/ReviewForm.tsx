"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, Star, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  createReviewAction,
  type CreateReviewActionResult,
  type ReviewTag,
} from "@/services/review.services"

type ReviewFormProps = {
  mediaId: string
  tags?: ReviewTag[]
  tagLoadError?: string
}

export default function ReviewForm({
  mediaId,
  tags = [],
  tagLoadError,
}: ReviewFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<CreateReviewActionResult | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult(null)

    if (!mediaId) {
      setResult({
        success: false,
        message: "A media ID is required to submit a review.",
      })
      return
    }

    const formData = new FormData(event.currentTarget)
    const rating = Number(formData.get("rating"))
    const content = String(formData.get("content") ?? "").trim()

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setResult({
        success: false,
        message: "Choose a rating from 1 to 5.",
      })
      return
    }

    if (!content) {
      setResult({
        success: false,
        message: "Write a review before submitting.",
      })
      return
    }

    setIsPending(true)
    try {
      const actionResult = await createReviewAction({
        mediaId,
        rating,
        content,
        isSpoiler: formData.get("isSpoiler") === "on",
        ...(selectedTagIds.length > 0 ? { tagIds: selectedTagIds } : {}),
      })
      setResult(actionResult)
    } catch (error) {
      console.error("Review form submission failed:", error)
      setResult({
        success: false,
        message: "Unable to submit your review. Please try again.",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <Link
          href={mediaId ? `/media/${encodeURIComponent(mediaId)}` : "/media"}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to title
        </Link>

        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-600/20 bg-red-600/10 px-3 py-1.5 text-sm font-medium text-red-600">
            <Star className="size-4" aria-hidden="true" />
            Your opinion matters
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Write a review
          </h1>
          <p className="mt-3 text-muted-foreground">
            Rate this title and share your thoughts with other viewers.
          </p>
        </header>

        {!mediaId ? (
          <div
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            A media ID is missing. Open this page from a title&apos;s Review
            button.
          </div>
        ) : (
          <form
            className="space-y-6 rounded-2xl border bg-card p-5 sm:p-7"
            onSubmit={handleSubmit}
          >
            {result && (
              <p
                className={
                  result.success
                    ? "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
                    : "rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                }
                role={result.success ? "status" : "alert"}
              >
                {result.message}
              </p>
            )}

            <fieldset
              className="space-y-6"
              disabled={isPending || result?.success === true}
            >
              <div className="space-y-2">
                <Label htmlFor="review-rating">Rating</Label>
                <select
                  id="review-rating"
                  name="rating"
                  defaultValue="5"
                  required
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-content">Your review</Label>
                <Textarea
                  id="review-content"
                  name="content"
                  className="min-h-36"
                  placeholder="What did you think of this title?"
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="inline-flex items-center gap-1.5">
                    <Tag className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    Tags (optional)
                  </Label>
                  {selectedTagIds.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {selectedTagIds.length} selected
                    </span>
                  )}
                </div>

                {tagLoadError ? (
                  <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                    {tagLoadError}
                  </p>
                ) : tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id)
                      return (
                        <label
                          key={tag.id}
                          className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            isSelected
                              ? "border-red-600 bg-red-600/10 text-red-600 dark:text-red-400"
                              : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                          }`}
                        >
                          <input
                            type="checkbox"
                            name="tagIds"
                            value={tag.id}
                            checked={isSelected}
                            onChange={() => toggleTag(tag.id)}
                            className="size-3.5 accent-red-600"
                          />
                          {tag.name}
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No tags available.
                  </p>
                )}
              </div>

              <label
                htmlFor="review-is-spoiler"
                className="flex items-center gap-3 text-sm"
              >
                <input
                  id="review-is-spoiler"
                  name="isSpoiler"
                  type="checkbox"
                  className="size-4 accent-red-600"
                />
                This review contains spoilers
              </label>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Submitting review..." : "Submit review"}
              </Button>
            </fieldset>

            {result?.success && (
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <Link href={`/media/${encodeURIComponent(mediaId)}`} />
                }
                className="w-full"
              >
                Back to title
              </Button>
            )}
          </form>
        )}
      </div>
    </main>
  )
}
