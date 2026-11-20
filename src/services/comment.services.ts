"use server"

import axios from "axios"

import { httpClient } from "@/lib/axios/httpClient"
import type { ApiErrorResponse, ApiResponse } from "@/types/api.types"

export type CreateCommentInput = {
  reviewId: string
  parentId?: string | null
  content: string
}

export type CreateCommentActionResult = Pick<
  ApiErrorResponse,
  "success" | "message"
>

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