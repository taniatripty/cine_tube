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

export type ReviewTag = {
  id: string
  name: string
  slug?: string
}

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "UNPUBLISHED"

export type AdminReviewUser = {
  id: string
  name: string
  email: string
  image: string | null
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
  tags?: ReviewTag[]
  reviewLikes: ReviewLike[]
  comments: ReviewComment[]
}

export type AdminReview = MyReview & {
  user?: AdminReviewUser | null
}

export async function getAllTags(): Promise<ApiResponse<ReviewTag[]>> {
  return httpClient.get<ReviewTag[]>("/tags/all")
}

export async function getAllReviews(): Promise<ApiResponse<AdminReview[]>> {
  return httpClient.get<AdminReview[]>("/reviews/all")
}

export async function getMyReviews(): Promise<ApiResponse<MyReview[]>> {
  return httpClient.get<MyReview[]>("/reviews")
}

export type CreateReviewInput = {
  mediaId: string
  rating: number
  content: string
  isSpoiler?: boolean
  tagIds?: string[]
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

// ── Update / Delete ───────────────────────────────────────────────────────────

export type UpdateReviewInput = {
  rating?: number
  content?: string
  isSpoiler?: boolean
  tagIds?: string[]
}

export type UpdateReviewActionResult = Pick<ApiErrorResponse, "success" | "message">
export type DeleteReviewActionResult = Pick<ApiErrorResponse, "success" | "message">

const normalizeTagIds = (tagIds?: string[]): string[] | undefined => {
  if (tagIds === undefined) return undefined
  return Array.from(
    new Set(tagIds.map((id) => id.trim()).filter((id) => id.length > 0)),
  )
}

export async function updateReviewAction(
  reviewId: string,
  payload: UpdateReviewInput,
): Promise<UpdateReviewActionResult> {
  if (!reviewId?.trim()) {
    return { success: false, message: "Review ID is required." }
  }
  if (
    payload.rating !== undefined &&
    (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5)
  ) {
    return { success: false, message: "Rating must be between 1 and 5." }
  }
  if (payload.content !== undefined && !payload.content.trim()) {
    return { success: false, message: "Review content cannot be empty." }
  }
  if (
    payload.tagIds !== undefined &&
    (!Array.isArray(payload.tagIds) ||
      payload.tagIds.some((id) => typeof id !== "string" || !id.trim()))
  ) {
    return { success: false, message: "Selected tags are invalid." }
  }

  const normalizedTagIds = normalizeTagIds(payload.tagIds)

  try {
    const response = await httpClient.patch<unknown>(
      `/reviews/${encodeURIComponent(reviewId.trim())}`,
      {
        ...payload,
        ...(normalizedTagIds !== undefined ? { tagIds: normalizedTagIds } : {}),
      },
    )
    return { success: response.success, message: response.message }
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message ?? `Update failed: ${error.message}`,
      }
    }
    console.error("Review update failed:", error)
    return { success: false, message: "Update failed due to an unexpected error." }
  }
}

export async function deleteReviewAction(
  reviewId: string,
): Promise<DeleteReviewActionResult> {
  if (!reviewId?.trim()) {
    return { success: false, message: "Review ID is required." }
  }

  try {
    const response = await httpClient.delete<unknown>(
      `/reviews/${encodeURIComponent(reviewId.trim())}`,
    )
    return { success: response.success, message: response.message }
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message ?? `Delete failed: ${error.message}`,
      }
    }
    console.error("Review delete failed:", error)
    return { success: false, message: "Delete failed due to an unexpected error." }
  }
}

export type ModerateReviewInput = {
  status: ReviewStatus
  moderationNote?: string
}

export type ModerateReviewActionResult = Pick<ApiErrorResponse, "success" | "message">

const VALID_REVIEW_STATUSES: readonly ReviewStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "UNPUBLISHED",
]

export async function moderateReviewAction(
  reviewId: string,
  payload: ModerateReviewInput,
): Promise<ModerateReviewActionResult> {
  if (!reviewId?.trim()) {
    return { success: false, message: "Review ID is required." }
  }
  if (!VALID_REVIEW_STATUSES.includes(payload.status)) {
    return { success: false, message: "Please select a valid review status." }
  }

  try {
    const response = await httpClient.patch<unknown>(
      `/reviews/${encodeURIComponent(reviewId.trim())}/moderate`,
      {
        status: payload.status,
        ...(payload.moderationNote !== undefined
          ? { moderationNote: payload.moderationNote.trim() }
          : {}),
      },
    )
    return { success: response.success, message: response.message }
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message ??
          `Moderation failed: ${error.message}`,
      }
    }
    console.error("Review moderation failed:", error)
    return {
      success: false,
      message: "Moderation failed due to an unexpected error.",
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
      typeof payload.isSpoiler !== "boolean") ||
    (payload.tagIds !== undefined &&
      (!Array.isArray(payload.tagIds) ||
        payload.tagIds.some((id) => typeof id !== "string" || !id.trim())))
  ) {
    return {
      success: false,
      message: "Please provide a valid rating and review.",
    }
  }

  const mediaId = payload.mediaId.trim()
  const content = payload.content.trim()
  const tagIds = normalizeTagIds(payload.tagIds)
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
      ...(tagIds && tagIds.length > 0 ? { tagIds } : {}),
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