"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Film, Loader2, ShieldCheck, Star, Tag } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  moderateReviewAction,
  type AdminReview,
  type ReviewStatus,
} from "@/services/review.services"

const REVIEW_STATUS_OPTIONS: { value: ReviewStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "UNPUBLISHED", label: "Unpublished" },
]

const STATUS_BADGE_STYLES: Record<string, string> = {
  APPROVED:
    "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  PENDING:
    "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300",
  REJECTED:
    "border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-400",
  UNPUBLISHED:
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

function ModerateReviewSheet({ review }: { review: AdminReview }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus>(
    (REVIEW_STATUS_OPTIONS.some((o) => o.value === review.status)
      ? review.status
      : "PENDING") as ReviewStatus,
  )
  const [moderationNote, setModerationNote] = useState(
    review.moderationNote ?? "",
  )

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setSelectedStatus(
        (REVIEW_STATUS_OPTIONS.some((o) => o.value === review.status)
          ? review.status
          : "PENDING") as ReviewStatus,
      )
      setModerationNote(review.moderationNote ?? "")
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    const loadingId = toast.loading("Updating review status...")

    try {
      const trimmedNote = moderationNote.trim()
      const result = await moderateReviewAction(review.id, {
        status: selectedStatus,
        ...(trimmedNote ? { moderationNote: trimmedNote } : {}),
      })
      toast.dismiss(loadingId)

      if (result.success) {
        toast.success("Review status updated", {
          description: `"${review.media.title}" review marked as ${selectedStatus.toLowerCase()}.`,
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

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={`Update status for review on ${review.media.title}`}
          />
        }
      >
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        Update status
      </SheetTrigger>

      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Moderate review</SheetTitle>
          <SheetDescription className="line-clamp-1">
            {review.media.title} — by {review.user?.name ?? "Viewer"}
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-col gap-5 px-4 py-2"
          onSubmit={handleSubmit}
        >
          <div className="rounded-xl border bg-muted/30 p-3.5 text-sm space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Star
                  className="size-3.5 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
                {review.rating}/5
              </span>
              <StatusBadge status={review.status} />
            </div>
            <p className="text-muted-foreground whitespace-pre-line">
              {review.content}
            </p>
          </div>

          <fieldset className="flex flex-col gap-4" disabled={isPending}>
            <div className="space-y-1.5">
              <Label htmlFor={`moderate-status-${review.id}`}>
                Review status
              </Label>
              <select
                id={`moderate-status-${review.id}`}
                name="status"
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as ReviewStatus)
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {REVIEW_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`moderate-note-${review.id}`}>
                Moderation note (optional)
              </Label>
              <Textarea
                id={`moderate-note-${review.id}`}
                name="moderationNote"
                value={moderationNote}
                onChange={(e) => setModerationNote(e.target.value)}
                placeholder="Add a note explaining why this review was approved, rejected, or unpublished..."
                className="min-h-28"
              />
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

export function ApproveReviewTable({ reviews }: { reviews: AdminReview[] }) {
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReviewStatus>("ALL")

  const filteredReviews =
    statusFilter === "ALL"
      ? reviews
      : reviews.filter((review) => review.status === statusFilter)

  const counts = reviews.reduce<Record<string, number>>((acc, review) => {
    acc[review.status] = (acc[review.status] ?? 0) + 1
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
          All ({reviews.length})
        </Button>
        {REVIEW_STATUS_OPTIONS.map((option) => (
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

      {filteredReviews.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No reviews found for the selected filter.
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Media</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => {
                const poster = review.media.poster ?? review.media.backdrop
                return (
                  <TableRow key={review.id}>
                    {/* Media */}
                    <TableCell className="max-w-[200px]">
                      <Link
                        href={`/media/${encodeURIComponent(review.media.id)}`}
                        className="group flex items-center gap-3"
                      >
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                          {poster ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={poster}
                              alt={review.media.title}
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
                          <p className="truncate font-medium group-hover:text-red-600 transition-colors">
                            {review.media.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {review.media.type}
                            {review.media.releaseYear
                              ? ` · ${review.media.releaseYear}`
                              : ""}
                          </p>
                        </div>
                      </Link>
                    </TableCell>

                    {/* Reviewer */}
                    <TableCell className="max-w-[180px]">
                      <p className="truncate font-medium">
                        {review.user?.name ?? "Viewer"}
                      </p>
                      {review.user?.email && (
                        <p className="truncate text-xs text-muted-foreground">
                          {review.user.email}
                        </p>
                      )}
                    </TableCell>

                    {/* Rating + Content + Tags */}
                    <TableCell className="max-w-[320px] whitespace-normal">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold">
                            <Star
                              className="size-3.5 fill-amber-400 text-amber-400"
                              aria-hidden="true"
                            />
                            {review.rating}/5
                          </span>
                          {review.isSpoiler && (
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                              Spoiler
                            </span>
                          )}
                        </div>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {review.content}
                        </p>
                        {review.tags && review.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {review.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center gap-1 rounded-full border border-red-600/20 bg-red-600/10 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400"
                              >
                                <Tag className="size-2.5" aria-hidden="true" />
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className="space-y-1">
                        <StatusBadge status={review.status} />
                        {review.moderationNote && (
                          <p
                            className="max-w-[160px] truncate text-[11px] text-muted-foreground"
                            title={review.moderationNote}
                          >
                            {review.moderationNote}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right">
                      <ModerateReviewSheet review={review} />
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
