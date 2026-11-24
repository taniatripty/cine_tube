"use client"

import { useEffect, useRef, useState } from "react"
import { SmilePlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  CONTENT_REACTION_TYPES,
  type ContentReactionType,
  type ReactionActionResult,
  type ReactionCounts,
  type ReactionSummary,
} from "@/types/reaction.types"
import {
  removeCommentReactionAction,
  setCommentReactionAction,
} from "@/services/comment.services"
import {
  removeReviewReactionAction,
  setReviewReactionAction,
} from "@/services/review.services"

const REACTION_PICKER_DELAY_MS = 400

const reactionLabels: Record<ContentReactionType, string> = {
  LIKE: "Like",
  DISLIKE: "Dislike",
  LOVE: "Love",
  LAUGH: "Laugh",
  WOW: "Wow",
  SAD: "Sad",
  ANGRY: "Angry",
}

const reactionEmojis: Record<ContentReactionType, string> = {
  LIKE: "👍",
  DISLIKE: "👎",
  LOVE: "❤️",
  LAUGH: "😂",
  WOW: "😮",
  SAD: "😢",
  ANGRY: "😡",
}

const getInitialCounts = (
  reactions: ReactionSummary[],
): ReactionCounts => {
  const counts: ReactionCounts = {
    LIKE: 0,
    DISLIKE: 0,
    LOVE: 0,
    LAUGH: 0,
    WOW: 0,
    SAD: 0,
    ANGRY: 0,
  }

  for (const reaction of reactions) {
    if (reaction?.type && counts[reaction.type] !== undefined) {
      counts[reaction.type] += 1
    }
  }

  return counts
}

export default function ReactionPicker({
  targetId,
  targetType,
  reactions,
  initialActiveReaction,
}: {
  targetId: string
  targetType: "review" | "comment"
  reactions: ReactionSummary[]
  initialActiveReaction?: ContentReactionType | null
}) {
  const [counts, setCounts] = useState(() => getInitialCounts(reactions))
  const [activeReaction, setActiveReaction] =
    useState<ContentReactionType | null>(() => initialActiveReaction ?? null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isPickerPinned, setIsPickerPinned] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<ReactionActionResult | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suppressNextClick = useRef(false)

  useEffect(
    () => () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
      if (closeTimer.current) clearTimeout(closeTimer.current)
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
    },
    [],
  )

  const clearHoverTimer = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = null
  }

  const clearCloseTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
  }

  const clearLongPressTimer = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    longPressTimer.current = null
  }

  const handleMouseEnter = () => {
    clearCloseTimer()
    if (isPickerOpen) return

    clearHoverTimer()
    hoverTimer.current = setTimeout(() => {
      setIsPickerOpen(true)
      hoverTimer.current = null
    }, REACTION_PICKER_DELAY_MS)
  }

  const handleMouseLeave = () => {
    clearHoverTimer()
    if (!isPickerPinned && isPickerOpen) {
      clearCloseTimer()
      closeTimer.current = setTimeout(() => {
        setIsPickerOpen(false)
        closeTimer.current = null
      }, 300)
    }
  }

  const handlePickerMouseEnter = () => {
    clearCloseTimer()
  }

  const handleTouchStart = (pointerType: string) => {
    if (pointerType !== "touch") return

    clearLongPressTimer()
    longPressTimer.current = setTimeout(() => {
      setIsPickerOpen(true)
      setIsPickerPinned(true)
      suppressNextClick.current = true
      longPressTimer.current = null
    }, REACTION_PICKER_DELAY_MS)
  }

  const applyActionResult = (
    actionResult: ReactionActionResult,
    nextActiveReaction: ContentReactionType | null,
  ) => {
    setResult(actionResult)
    if (!actionResult.success) return

    if (actionResult.counts) {
      setCounts(actionResult.counts)
    }
    setActiveReaction(nextActiveReaction)
  }

  const submitReaction = (type: ContentReactionType) =>
    targetType === "review"
      ? setReviewReactionAction({ reviewId: targetId, type })
      : setCommentReactionAction({ commentId: targetId, type })

  const clearReaction = () =>
    targetType === "review"
      ? removeReviewReactionAction(targetId)
      : removeCommentReactionAction(targetId)

  const handleReaction = async (type: ContentReactionType) => {
    setIsPending(true)
    setResult(null)
    try {
      if (activeReaction === type) {
        applyActionResult(await clearReaction(), null)
      } else {
        applyActionResult(await submitReaction(type), type)
      }
    } catch (error) {
      console.error(`${targetType} reaction request failed:`, error)
      setResult({
        success: false,
        message: `Unable to save your ${targetType} reaction. Please try again.`,
      })
    } finally {
      setIsPending(false)
    }
  }

  const handleRemoveReaction = async () => {
    setIsPending(true)
    setResult(null)
    try {
      applyActionResult(await clearReaction(), null)
    } catch (error) {
      console.error(`Removing ${targetType} reaction failed:`, error)
      setResult({
        success: false,
        message: `Unable to remove your ${targetType} reaction. Please try again.`,
      })
    } finally {
      setIsPending(false)
    }
  }

  const hasReactions = CONTENT_REACTION_TYPES.some((type) => counts[type] > 0)
  const baseReactions: ContentReactionType[] = ["LIKE", "DISLIKE"]
  for (const type of CONTENT_REACTION_TYPES) {
    if (counts[type] > 0 && !baseReactions.includes(type)) {
      baseReactions.push(type)
    }
  }
  if (activeReaction && !baseReactions.includes(activeReaction)) {
    baseReactions.push(activeReaction)
  }
  const pickerReactions = CONTENT_REACTION_TYPES.filter(
    (type) => !baseReactions.includes(type),
  )

  return (
    <div className="mt-3">
      <div
        className="relative w-fit"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerUp={clearLongPressTimer}
        onPointerCancel={clearLongPressTimer}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsPickerOpen(false)
            setIsPickerPinned(false)
          }
        }}
      >
        <div
          role="group"
          aria-label={`${targetType === "review" ? "Review" : "Comment"} reactions`}
          className="flex flex-wrap items-center gap-1.5"
        >
          {baseReactions.map((type) => {
            const isSelected = activeReaction === type
            const count = counts[type]

            return (
              <Button
                key={type}
                type="button"
                variant={isSelected ? "secondary" : "outline"}
                aria-label={`${reactionLabels[type]} (${count})`}
                aria-pressed={isSelected}
                disabled={isPending}
                className={`h-8 gap-1.5 px-2.5 text-xs transition-all hover:scale-105 ${
                  isSelected
                    ? "border-primary/50 bg-primary/10 font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onPointerDown={(event) => handleTouchStart(event.pointerType)}
                onClick={() => {
                  if (suppressNextClick.current) {
                    suppressNextClick.current = false
                    return
                  }
                  void handleReaction(type)
                  if (isPickerPinned) {
                    setIsPickerOpen(false)
                    setIsPickerPinned(false)
                  }
                }}
              >
                <span
                  aria-hidden="true"
                  className="text-base leading-none transition-transform"
                >
                  {reactionEmojis[type]}
                </span>
                {count > 0 && (
                  <span className="font-semibold text-foreground">{count}</span>
                )}
                <span className="sr-only">{counts[type]}</span>
              </Button>
            )
          })}

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Add reaction"
            title="Add reaction"
            disabled={isPending}
            onClick={() => {
              setIsPickerOpen((prev) => !prev)
              setIsPickerPinned((prev) => !prev)
            }}
          >
            <SmilePlus className="size-4" aria-hidden="true" />
          </Button>

          {activeReaction !== null && hasReactions && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Remove my reaction"
              title="Remove my reaction"
              disabled={isPending}
              onClick={handleRemoveReaction}
            >
              <X className="size-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>

        {isPickerOpen && pickerReactions.length > 0 && (
          <div
            role="group"
            aria-label="More reactions"
            className="absolute bottom-full left-0 z-30 mb-2 flex w-max max-w-[calc(100vw-2rem)] flex-nowrap gap-1 overflow-x-auto overscroll-x-contain rounded-full border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95"
            onMouseEnter={handlePickerMouseEnter}
          >
            {pickerReactions.map((type) => {
              const isSelected = activeReaction === type
              return (
                <Button
                  key={type}
                  type="button"
                  size="sm"
                  variant={isSelected ? "secondary" : "ghost"}
                  aria-label={`${reactionLabels[type]} (${counts[type]})`}
                  aria-pressed={isSelected}
                  disabled={isPending}
                  className="h-auto min-w-11 flex-col gap-0.5 px-2 py-1 text-[10px] leading-none transition-transform hover:scale-115 focus-visible:scale-115"
                  onClick={() => {
                    void handleReaction(type)
                    setIsPickerOpen(false)
                    setIsPickerPinned(false)
                  }}
                >
                  <span aria-hidden="true" className="text-xl leading-none">
                    {reactionEmojis[type]}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {reactionLabels[type]}
                  </span>
                  <span className="sr-only">{counts[type]}</span>
                </Button>
              )
            })}
          </div>
        )}
      </div>
      {result && (
        <p
          className={`mt-2 text-sm ${
            result.success ? "text-muted-foreground" : "text-destructive"
          }`}
          role={result.success ? "status" : "alert"}
        >
          {result.message}
        </p>
      )}
    </div>
  )
}
