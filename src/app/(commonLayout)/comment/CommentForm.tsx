"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  createCommentAction,
  type CreateCommentActionResult,
} from "@/services/comment.services"

type CommentFormProps = {
  mediaId: string
  reviewId: string
  parentId?: string
}

export default function CommentForm({
  mediaId,
  reviewId,
  parentId,
}: CommentFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<CreateCommentActionResult | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult(null)

    if (!reviewId) {
      setResult({
        success: false,
        message: "A review ID is required to submit a comment.",
      })
      return
    }

    const formData = new FormData(event.currentTarget)
    const content = String(formData.get("content") ?? "").trim()

    if (!content) {
      setResult({
        success: false,
        message: "Write a comment before submitting.",
      })
      return
    }

    setIsPending(true)
    try {
      const actionResult = await createCommentAction({
        reviewId,
        parentId,
        content,
      })
      setResult(actionResult)
    } catch (error) {
      console.error("Comment form submission failed:", error)
      setResult({
        success: false,
        message: "Unable to submit your comment. Please try again.",
      })
    } finally {
      setIsPending(false)
    }
  }

  const returnHref = mediaId
    ? `/media/${encodeURIComponent(mediaId)}#comments-${encodeURIComponent(reviewId)}`
    : "/"

  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <Link
          href={returnHref}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to discussion
        </Link>

        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-600/20 bg-red-600/10 px-3 py-1.5 text-sm font-medium text-red-600">
            <MessageCircle className="size-4" aria-hidden="true" />
            Join the discussion
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {parentId ? "Reply to a comment" : "Add a comment"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            Share a thoughtful response to this review.
          </p>
        </header>

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
            className="space-y-4"
            disabled={isPending || result?.success === true}
          >
            <div className="space-y-2">
              <Label htmlFor="comment-content">Your comment</Label>
              <Textarea
                id="comment-content"
                name="content"
                className="min-h-36"
                placeholder="Write your comment..."
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Submitting comment..." : "Submit comment"}
            </Button>
          </fieldset>

          {result?.success && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={returnHref} />}
              className="w-full"
            >
              Back to discussion
            </Button>
          )}
        </form>
      </div>
    </main>
  )
}
