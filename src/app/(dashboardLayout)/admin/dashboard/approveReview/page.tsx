import { Suspense } from "react"
import { AlertCircle, ShieldCheck } from "lucide-react"

import { getAllReviews, type AdminReview } from "@/services/review.services"
import { ApproveReviewTable } from "./ApproveReviewTable"

async function ApproveReviewContent() {
  let reviews: AdminReview[] = []
  let errorMessage: string | null = null

  try {
    const response = await getAllReviews()
    reviews = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error("Failed to fetch reviews for moderation:", error)
    errorMessage = "Could not load reviews. Please try again later."
  }

  if (errorMessage) {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive"
        role="alert"
      >
        <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
        <p>{errorMessage}</p>
      </div>
    )
  }

  return <ApproveReviewTable reviews={reviews} />
}

export default function ApproveReviewPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-600/20 bg-red-600/10 px-3 py-1 text-xs font-medium text-red-600">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Review Moderation
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Approve &amp; Moderate Reviews
        </h1>
        <p className="text-sm text-muted-foreground">
          Inspect submitted user reviews and update their moderation status.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
            Loading reviews...
          </div>
        }
      >
        <ApproveReviewContent />
      </Suspense>
    </div>
  )
}
