"use server"

import axios from "axios"

import { httpClient } from "@/lib/axios/httpClient"
import type { ApiErrorResponse, ApiResponse } from "@/types/api.types"

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

export async function createReview<TData = unknown>(
  payload: CreateReviewInput,
): Promise<ApiResponse<TData>> {
  return httpClient.post<TData>("/reviews", payload)
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