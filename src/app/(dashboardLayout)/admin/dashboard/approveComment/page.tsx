import { Suspense } from "react"
import { AlertCircle, MessageSquare } from "lucide-react"

import { httpClient } from "@/lib/axios/httpClient"
import type { AdminComment } from "@/services/comment.services"
import { ApproveCommentTable } from "./ApproveCommentTable"

async function ApproveCommentContent() {
  let comments: AdminComment[] = []
  let errorMessage: string | null = null

  try {
    const response = await httpClient.get<AdminComment[]>("/comments/all")
    comments = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error("Failed to fetch comments for moderation:", error)
    errorMessage = "Could not load comments. Please try again later."
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

  return <ApproveCommentTable comments={comments} />
}

export default function ApproveCommentPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-600/20 bg-red-600/10 px-3 py-1 text-xs font-medium text-red-600">
          <MessageSquare className="size-3.5" aria-hidden="true" />
          Comment Moderation
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Approve &amp; Moderate Comments
        </h1>
        <p className="text-sm text-muted-foreground">
          Inspect submitted user comments and update their moderation status.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
            Loading comments...
          </div>
        }
      >
        <ApproveCommentContent />
      </Suspense>
    </div>
  )
}
