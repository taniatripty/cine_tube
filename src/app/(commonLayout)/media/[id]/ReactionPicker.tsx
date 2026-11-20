"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"

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

const REACTION_PICKER_DELAY_MS = 2000

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
    counts[reaction.type] += 1
  }

  return counts
}

export default function ReactionPicker({
  targetId,
  targetType,
  reactions,
}: {
  targetId: string
  targetType: "review" | "comment"
  reactions: ReactionSummary[]
}) {
  const [counts, setCounts] = useState(() => getInitialCounts(reactions))
  const [activeReaction, setActiveReaction] =
    useState<ContentReactionType | null>(null)
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
      }, 400)
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
  if (activeReaction && !baseReactions.includes(activeReaction)) {
    baseReactions.push(activeReaction)
  }
  const pickerReactions = CONTENT_REACTION_TYPES.filter(
    (type) => !baseReactions.includes(type),
  )

  return (
    <div className="mt-4">
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
          className="flex flex-wrap gap-2"
        >
          {baseReactions.map((type) => {
            return (
              <Button
                key={type}
                type="button"
                size="icon"
                variant={activeReaction === type ? "secondary" : "outline"}
                aria-label={`${reactionLabels[type]} (${counts[type]})`}
                aria-pressed={activeReaction === type}
                disabled={isPending}
                className="transition-transform hover:scale-125 focus-visible:scale-125"
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
                  className="text-xl leading-none transition-transform"
                >
                  {reactionEmojis[type]}
                </span>
                <span className="sr-only">{counts[type]}</span>
              </Button>
            )
          })}
          {activeReaction !== null && hasReactions && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Remove my reaction"
              disabled={isPending}
              onClick={handleRemoveReaction}
            >
              <X aria-hidden="true" />
            </Button>
          )}
        </div>
        {isPickerOpen && pickerReactions.length > 0 && (
          <div
            role="group"
            aria-label="More reactions"
            className="absolute bottom-full left-0 z-30 mb-2 flex w-max max-w-[calc(100vw-2rem)] flex-nowrap gap-1 overflow-x-auto overscroll-x-contain rounded-full border bg-card p-1.5 shadow-xl"
            onMouseEnter={handlePickerMouseEnter}
          >
            {pickerReactions.map((type) => {
              return (
                <Button
                  key={type}
                  type="button"
                  size="sm"
                  variant={activeReaction === type ? "secondary" : "ghost"}
                  aria-label={`${reactionLabels[type]} (${counts[type]})`}
                  aria-pressed={activeReaction === type}
                  disabled={isPending}
                  className="h-auto min-w-12 flex-col gap-1 px-1.5 py-1.5 text-[10px] leading-none transition-transform hover:scale-110 focus-visible:scale-110"
                  onClick={() => {
                    void handleReaction(type)
                    setIsPickerOpen(false)
                    setIsPickerPinned(false)
                  }}
                >
                  <span aria-hidden="true" className="text-xl leading-none">
                    {reactionEmojis[type]}
                  </span>
                  <span>{reactionLabels[type]}</span>
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
