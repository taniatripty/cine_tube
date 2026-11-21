import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  Film,
  MessageCircle,
  Star,
  ThumbsUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { getMyReviews, type MyReview } from "@/services/review.services"

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  REJECTED: "bg-red-500/15 text-red-500",
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}
    >
      {status.toLowerCase()}
    </span>
  )
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
          }`}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}

// ── Review card ──────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: MyReview }) {
  const { media, reviewLikes, comments } = review
  const poster = media.poster ?? media.backdrop
  const topComments = comments.filter((c) => c.parentId === null)
  const totalReplies = comments.filter((c) => c.parentId !== null).length

  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Poster + header */}
      <Link
        href={`/media/${encodeURIComponent(media.id)}`}
        className="group flex gap-4 p-4 hover:bg-muted/40 transition-colors"
      >
        <div className="relative shrink-0 overflow-hidden rounded-lg bg-slate-900 w-20 aspect-[2/3]">
          {poster ? (
            <Image
              src={poster}
              alt={`${media.title} poster`}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-red-950">
              <Film className="size-8 text-white/40" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="truncate text-base font-semibold group-hover:text-red-600 transition-colors">
              {media.title}
            </h2>
            {media.releaseYear && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {media.releaseYear}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StarRow rating={review.rating} />
            <StatusBadge status={review.status} />
            {review.isSpoiler && (
              <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
                Spoiler
              </span>
            )}
          </div>

          <span className="text-xs text-muted-foreground">
            {media.type.replace("_", " ")} · {formatDate(review.createdAt)}
          </span>
        </div>
      </Link>

      {/* Review content */}
      <div className="px-4 pb-3">
        <p className="text-sm leading-6 text-foreground/80 line-clamp-4">
          {review.content}
        </p>
      </div>

      {/* Stats footer */}
      <div className="flex flex-wrap items-center gap-4 border-t px-4 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ThumbsUp className="size-3.5" aria-hidden="true" />
          {reviewLikes.length} reaction{reviewLikes.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="size-3.5" aria-hidden="true" />
          {topComments.length} comment{topComments.length !== 1 ? "s" : ""}
          {totalReplies > 0 && `, ${totalReplies} repl${totalReplies !== 1 ? "ies" : "y"}`}
        </span>

        {/* Reaction chips */}
        {reviewLikes.length > 0 && (
          <span className="ml-auto flex flex-wrap gap-1">
            {Object.entries(
              reviewLikes.reduce<Record<string, number>>((acc, l) => {
                acc[l.type] = (acc[l.type] ?? 0) + 1
                return acc
              }, {}),
            ).map(([type, count]) => (
              <span
                key={type}
                className="rounded-full bg-muted px-2 py-0.5 font-medium"
              >
                {type} {count > 1 ? `×${count}` : ""}
              </span>
            ))}
          </span>
        )}
      </div>

      {/* Comments preview */}
      {topComments.length > 0 && (
        <ul className="divide-y border-t">
          {topComments.slice(0, 2).map((comment) => {
            const replies = comments.filter((c) => c.parentId === comment.id)
            return (
              <li key={comment.id} className="px-4 py-3">
                <p className="text-sm text-foreground/80 line-clamp-2">
                  {comment.content}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatDate(comment.createdAt)}</span>
                  {comment.commentLikes.length > 0 && (
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="size-3" aria-hidden="true" />
                      {comment.commentLikes.length}
                    </span>
                  )}
                  {replies.length > 0 && (
                    <span>
                      {replies.length} repl{replies.length !== 1 ? "ies" : "y"}
                    </span>
                  )}
                  <StatusBadge status={comment.status} />
                </div>
              </li>
            )
          })}
          {topComments.length > 2 && (
            <li className="px-4 py-2 text-xs text-muted-foreground">
              +{topComments.length - 2} more comment
              {topComments.length - 2 !== 1 ? "s" : ""}
            </li>
          )}
        </ul>
      )}
    </article>
  )
}

// ── Page shell ───────────────────────────────────────────────────────────────

export default function MyReviewsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Loading your reviews…
            </p>
          </div>
        </main>
      }
    >
      <MyReviewsContent />
    </Suspense>
  )
}

// ── Async content ─────────────────────────────────────────────────────────────

async function MyReviewsContent() {
  let reviews: MyReview[] = []
  let errorMessage: string | null = null

  try {
    const response = await getMyReviews()
    if (!response.success) {
      errorMessage = response.message
    } else {
      reviews = response.data ?? []
    }
  } catch (err) {
    console.error("Failed to load reviews:", err)
    errorMessage = "Please sign in or try again later."
  }

  if (errorMessage) {
    return (
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center">
          <AlertCircle
            className="mx-auto size-10 text-muted-foreground"
            aria-hidden="true"
          />
          <h1 className="mt-4 text-xl font-bold">Reviews could not be loaded</h1>
          <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
          <Button
            className="mt-6"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Sign in
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
            Your activity
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            My Reviews
          </h1>
          <p className="mt-2 text-muted-foreground">
            All the reviews you have written, with their likes and comments.
          </p>
        </div>

        {/* Summary chips */}
        {reviews.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="rounded-full bg-muted px-3 py-1">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
            <span className="rounded-full bg-muted px-3 py-1">
              {reviews.reduce((s, r) => s + r.reviewLikes.length, 0)} reactions
            </span>
            <span className="rounded-full bg-muted px-3 py-1">
              {reviews.reduce((s, r) => s + r.comments.length, 0)} comments
            </span>
          </div>
        )}

        {/* Empty state */}
        {reviews.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center">
            <Star
              className="mx-auto size-10 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-xl font-semibold">No reviews yet</h2>
            <p className="mt-2 text-muted-foreground">
              Start watching and share your thoughts with the community.
            </p>
            <Button
              className="mt-6"
              nativeButton={false}
              render={<Link href="/media" />}
            >
              Explore titles
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
