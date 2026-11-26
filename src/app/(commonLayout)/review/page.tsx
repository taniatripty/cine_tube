import { Suspense } from "react"

import { getAllTags, type ReviewTag } from "@/services/review.services"
import ReviewForm from "./ReviewForm"

type ReviewPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}

export default function ReviewPage({ searchParams }: ReviewPageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm text-muted-foreground">
              Loading review form...
            </p>
          </div>
        </main>
      }
    >
      <ReviewContent searchParams={searchParams} />
    </Suspense>
  )
}

async function ReviewContent({ searchParams }: ReviewPageProps) {
  const { mediaId } = await searchParams
  const normalizedMediaId =
    typeof mediaId === "string" ? mediaId.trim() : ""

  let tags: ReviewTag[] = []
  let tagLoadError: string | undefined

  if (normalizedMediaId) {
    try {
      const response = await getAllTags()
      tags = Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error("Failed to load tags for review creation:", error)
      tagLoadError =
        "Could not load tags right now. You can still submit your review without tags."
    }
  }

  return (
    <ReviewForm
      mediaId={normalizedMediaId}
      tags={tags}
      tagLoadError={tagLoadError}
    />
  )
}
