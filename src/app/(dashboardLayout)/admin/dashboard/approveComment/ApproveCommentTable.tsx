"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CornerDownRight,
  Film,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Star,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  AdminComment,
  CommentStatus,
} from "@/services/comment.services"
import { moderateCommentAction } from "./actions"

const COMMENT_STATUS_OPTIONS: { value: CommentStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "HIDDEN", label: "Hidden" },
]

const STATUS_BADGE_STYLES: Record<string, string> = {
  APPROVED:
    "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  PENDING:
    "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300",
  REJECTED:
    "border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-400",
  HIDDEN:
    "border-slate-500/30 bg-slate-500/15 text-slate-700 dark:text-slate-300",
}

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })

function StatusBadge({ status }: { status: string }) {
  const cls =
    STATUS_BADGE_STYLES[status] ??
    "border-border bg-muted text-muted-foreground"
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}
    >
      {status.toLowerCase()}
    </span>
  )
}

function ModerateCommentSheet({ comment }: { comment: AdminComment }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<CommentStatus>(
    (COMMENT_STATUS_OPTIONS.some((o) => o.value === comment.status)
      ? comment.status
      : "PENDING") as CommentStatus,
  )

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setSelectedStatus(
        (COMMENT_STATUS_OPTIONS.some((o) => o.value === comment.status)
          ? comment.status
          : "PENDING") as CommentStatus,
      )
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    const loadingId = toast.loading("Updating comment status...")

    try {
      const result = await moderateCommentAction(comment.id, {
        status: selectedStatus,
      })
      toast.dismiss(loadingId)

      if (result.success) {
        toast.success("Comment status updated", {
          description: `Comment marked as ${selectedStatus.toLowerCase()}.`,
        })
        setOpen(false)
        router.refresh()
      } else {
        toast.error("Could not update status", {
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

  const mediaTitle = comment.review?.media?.title ?? "Media review"

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={`Update status for comment on ${mediaTitle}`}
          />
        }
      >
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        Update status
      </SheetTrigger>

      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Moderate comment</SheetTitle>
          <SheetDescription className="line-clamp-1">
            {mediaTitle} — by {comment.user?.name ?? "Viewer"}
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-col gap-5 px-4 py-2"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2 rounded-xl border bg-muted/30 p-3.5 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MessageSquare className="size-3.5" aria-hidden="true" />
                {comment.parentId ? "Reply" : "Comment"}
              </span>
              <StatusBadge status={comment.status} />
            </div>
            <p className="whitespace-pre-line text-foreground">
              {comment.content}
            </p>
            {comment.parent && (
              <p className="border-t pt-2 text-xs text-muted-foreground">
                Replying to: &ldquo;{comment.parent.content}&rdquo;
              </p>
            )}
          </div>

          <fieldset className="flex flex-col gap-4" disabled={isPending}>
            <div className="space-y-1.5">
              <Label htmlFor={`moderate-comment-status-${comment.id}`}>
                Comment status
              </Label>
              <select
                id={`moderate-comment-status-${comment.id}`}
                name="status"
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as CommentStatus)
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {COMMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Updating...
                </>
              ) : (
                "Save status"
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

export function ApproveCommentTable({
  comments,
}: {
  comments: AdminComment[]
}) {
  const [statusFilter, setStatusFilter] = useState<"ALL" | CommentStatus>(
    "ALL",
  )

  const filteredComments =
    statusFilter === "ALL"
      ? comments
      : comments.filter((comment) => comment.status === statusFilter)

  const counts = comments.reduce<Record<string, number>>((acc, comment) => {
    acc[comment.status] = (acc[comment.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Status filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={statusFilter === "ALL" ? "default" : "outline"}
          onClick={() => setStatusFilter("ALL")}
        >
          All ({comments.length})
        </Button>
        {COMMENT_STATUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={statusFilter === option.value ? "default" : "outline"}
            onClick={() => setStatusFilter(option.value)}
          >
            {option.label} ({counts[option.value] ?? 0})
          </Button>
        ))}
      </div>

      {filteredComments.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No comments found for the selected filter.
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Media / Review</TableHead>
                <TableHead>Commenter</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComments.map((comment) => {
                const media = comment.review?.media
                const poster = media?.poster
                const replyCount =
                  comment._count?.replies ?? comment.replyCount ?? 0

                return (
                  <TableRow key={comment.id}>
                    {/* Media / Review */}
                    <TableCell className="max-w-[220px]">
                      {media ? (
                        <Link
                          href={`/media/${encodeURIComponent(media.id)}`}
                          className="group flex items-center gap-3"
                        >
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                            {poster ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={poster}
                                alt={media.title}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center">
                                <Film
                                  className="size-4 text-muted-foreground"
                                  aria-hidden="true"
                                />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium transition-colors group-hover:text-red-600">
                              {media.title}
                            </p>
                            {comment.review && (
                              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Star
                                  className="size-3 fill-amber-400 text-amber-400"
                                  aria-hidden="true"
                                />
                                {comment.review.rating}/5 review
                              </p>
                            )}
                          </div>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Review #{comment.reviewId.slice(0, 8)}
                        </span>
                      )}
                    </TableCell>

                    {/* Commenter */}
                    <TableCell className="max-w-[180px]">
                      <p className="truncate font-medium">
                        {comment.user?.name ?? "Viewer"}
                      </p>
                      {comment.user?.email && (
                        <p className="truncate text-xs text-muted-foreground">
                          {comment.user.email}
                        </p>
                      )}
                    </TableCell>

                    {/* Comment Content */}
                    <TableCell className="max-w-[320px] whitespace-normal">
                      <div className="space-y-1">
                        {comment.parentId && (
                          <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            <CornerDownRight
                              className="size-2.5"
                              aria-hidden="true"
                            />
                            Reply
                          </span>
                        )}
                        <p className="line-clamp-2 text-xs text-foreground">
                          {comment.content}
                        </p>
                        {replyCount > 0 && (
                          <p className="text-[11px] text-muted-foreground">
                            {replyCount}{" "}
                            {replyCount === 1 ? "reply" : "replies"}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={comment.status} />
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right">
                      <ModerateCommentSheet comment={comment} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
