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

export type CreateCommentInput = {
  reviewId: string
  parentId?: string | null
  content: string
}

export type CreateCommentActionResult = Pick<
  ApiErrorResponse,
  "success" | "message"
>

export type CommentReactionActionResult = ReactionActionResult

type CommentReactionApiData = {
  reaction: { type: ContentReactionType } | null
  reactionCounts: ReactionCountGroup[]
}

export async function createComment<TData = unknown>(
  payload: CreateCommentInput,
): Promise<ApiResponse<TData>> {
  return httpClient.post<TData>("/comments", payload)
}

export async function createCommentAction(
  payload: CreateCommentInput,
): Promise<CreateCommentActionResult> {
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.reviewId !== "string" ||
    typeof payload.content !== "string" ||
    (payload.parentId !== undefined &&
      payload.parentId !== null &&
      typeof payload.parentId !== "string")
  ) {
    return {
      success: false,
      message: "Please provide a valid comment.",
    }
  }

  const reviewId = payload.reviewId.trim()
  const content = payload.content.trim()
  const parentId =
    typeof payload.parentId === "string"
      ? payload.parentId.trim()
      : payload.parentId

  if (!reviewId || !content || parentId === "") {
    return {
      success: false,
      message: "A review ID and comment are required.",
    }
  }

  try {
    const response = await createComment({
      reviewId,
      parentId,
      content,
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
          `Comment submission failed: ${error.message}`,
      }
    }

    console.error("Comment submission failed:", error)
    return {
      success: false,
      message: "Comment submission failed due to an unexpected error.",
    }
  }
}

export async function setCommentReactionAction(payload: {
  commentId: string
  type: ContentReactionType
}): Promise<CommentReactionActionResult> {
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.commentId !== "string" ||
    !CONTENT_REACTION_TYPES.includes(payload.type)
  ) {
    return {
      success: false,
      message: "Please choose a valid reaction.",
    }
  }

  const commentId = payload.commentId.trim()
  if (!commentId) {
    return {
      success: false,
      message: "A comment ID is required to react.",
    }
  }

  try {
    const response = await httpClient.put<CommentReactionApiData>(
      `/comments/${encodeURIComponent(commentId)}/reaction`,
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
          `Comment reaction failed: ${error.message}`,
      }
    }

    console.error("Comment reaction failed:", error)
    return {
      success: false,
      message: "Comment reaction failed due to an unexpected error.",
    }
  }
}

export async function removeCommentReactionAction(
  commentId: string,
): Promise<CommentReactionActionResult> {
  if (typeof commentId !== "string" || !commentId.trim()) {
    return {
      success: false,
      message: "A comment ID is required to remove a reaction.",
    }
  }

  try {
    const response = await httpClient.delete<CommentReactionApiData>(
      `/comments/${encodeURIComponent(commentId.trim())}/reaction`,
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
          `Removing comment reaction failed: ${error.message}`,
      }
    }

    console.error("Removing comment reaction failed:", error)
    return {
      success: false,
      message: "Removing comment reaction failed due to an unexpected error.",
    }
  }
}
