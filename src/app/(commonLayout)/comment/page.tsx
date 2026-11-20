import { Suspense } from "react"

import CommentForm from "./CommentForm"

type CommentPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}

export default function CommentPage({ searchParams }: CommentPageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm text-muted-foreground">
              Loading comment form...
            </p>
          </div>
        </main>
      }
    >
      <CommentPageContent searchParams={searchParams} />
    </Suspense>
  )
}

async function CommentPageContent({ searchParams }: CommentPageProps) {
  const { mediaId, reviewId, parentId } = await searchParams

  return (
    <CommentForm
      mediaId={typeof mediaId === "string" ? mediaId.trim() : ""}
      reviewId={typeof reviewId === "string" ? reviewId.trim() : ""}
      parentId={typeof parentId === "string" ? parentId.trim() : undefined}
    />
  )
}