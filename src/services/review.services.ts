"use server"

import axios from "axios"

import { httpClient } from "@/lib/axios/httpClient"
import type { ApiErrorResponse, ApiResponse } from "@/types/api.types"
import {
  CONTENT_REACTION_TYPES,
  mapReactionCounts,
  type ContentReactionType,
  type ReactionActionResult,
  type ReactionCountGroup,
} from "@/types/reaction.types"

// ── My Reviews types ──────────────────────────────────────────────────────────

export type ReviewMedia = {
  id: string
  title: string
  synopsis: string
  poster: string | null
  backdrop: string | null
  type: string
  releaseYear: number | null
  averageRating: number | null
  reviewCount: number
}

export type ReviewLike = {
  userId: string
  reviewId: string
  type: ContentReactionType
  createdAt: string
}

export type CommentLike = {
  userId: string
  commentId: string
  type: ContentReactionType
  createdAt: string
}

export type ReviewComment = {
  id: string
  userId: string
  reviewId: string
  parentId: string | null
  content: string
  status: string
  moderatedById: string | null
  moderatedAt: string | null
  createdAt: string
  updatedAt: string
  commentLikes: CommentLike[]
}

export type MyReview = {
  id: string
  userId: string
  mediaId: string
  rating: number
  content: string
  isSpoiler: boolean
  status: string
  moderatedById: string | null
  moderatedAt: string | null
  moderationNote: string | null
  createdAt: string
  updatedAt: string
  media: ReviewMedia
  reviewLikes: ReviewLike[]
  comments: ReviewComment[]
}

export async function getMyReviews(): Promise<ApiResponse<MyReview[]>> {
  return httpClient.get<MyReview[]>("/reviews")
}

export type CreateReviewInput = {
  mediaId: string
  rating: number
  content: string
  isSpoiler?: boolean
}

export type CreateReviewActionResult = Pick<
  ApiErrorResponse,
  "success" | "message"
>

export type ReviewReactionActionResult = ReactionActionResult

type ReviewReactionApiData = {
  reaction: { type: ContentReactionType } | null
  reactionCounts: ReactionCountGroup[]
}

export async function createReview<TData = unknown>(
  payload: CreateReviewInput,
): Promise<ApiResponse<TData>> {
  return httpClient.post<TData>("/reviews", payload)
}

export async function setReviewReactionAction(payload: {
  reviewId: string
  type: ContentReactionType
}): Promise<ReviewReactionActionResult> {
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.reviewId !== "string" ||
    !CONTENT_REACTION_TYPES.includes(payload.type)
  ) {
    return {
      success: false,
      message: "Please choose a valid reaction.",
    }
  }

  const reviewId = payload.reviewId.trim()
  if (!reviewId) {
    return {
      success: false,
      message: "A review ID is required to react.",
    }
  }

  try {
    const response = await httpClient.put<ReviewReactionApiData>(
      `/reviews/${encodeURIComponent(reviewId)}/reaction`,
      { type: payload.type },
    )

    return {
      success: response.success,
      message: response.message,
      counts: response.data
        ? mapReactionCounts(response.data.reactionCounts)
        : undefined,
    }
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message ??
          `Reaction failed: ${error.message}`,
      }
    }

    console.error("Review reaction failed:", error)
    return {
      success: false,
      message: "Reaction failed due to an unexpected error.",
    }
  }
}

export async function removeReviewReactionAction(
  reviewId: string,
): Promise<ReviewReactionActionResult> {
  if (typeof reviewId !== "string" || !reviewId.trim()) {
    return {
      success: false,
      message: "A review ID is required to remove a reaction.",
    }
  }

  try {
    const response = await httpClient.delete<ReviewReactionApiData>(
      `/reviews/${encodeURIComponent(reviewId.trim())}/reaction`,
    )

    return {
      success: response.success,
      message: response.message,
      counts: response.data
        ? mapReactionCounts(response.data.reactionCounts)
        : undefined,
    }
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message ??
          `Removing reaction failed: ${error.message}`,
      }
    }

    console.error("Removing review reaction failed:", error)
    return {
      success: false,
      message: "Removing reaction failed due to an unexpected error.",
    }
  }
}

export async function createReviewAction(
  payload: CreateReviewInput,
): Promise<CreateReviewActionResult> {
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.mediaId !== "string" ||
    typeof payload.rating !== "number" ||
    !Number.isInteger(payload.rating) ||
    payload.rating < 1 ||
    payload.rating > 5 ||
    typeof payload.content !== "string" ||
    (payload.isSpoiler !== undefined &&
      typeof payload.isSpoiler !== "boolean")
  ) {
    return {
      success: false,
      message: "Please provide a valid rating and review.",
    }
  }

  const mediaId = payload.mediaId.trim()
  const content = payload.content.trim()
  if (!mediaId || !content) {
    return {
      success: false,
      message: "A media ID, rating, and review are required.",
    }
  }

  try {
    const response = await createReview({
      mediaId,
      rating: payload.rating,
      content,
      isSpoiler: payload.isSpoiler ?? false,
    })

    return {
      success: response.success,
      message: response.message,
    }
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message ??
          `Review submission failed: ${error.message}`,
      }
    }

    console.error("Review submission failed:", error)
    return {
      success: false,
      message: "Review submission failed due to an unexpected error.",
    }
  }
}