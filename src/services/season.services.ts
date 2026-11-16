"use server"

import axios from "axios"

import { httpClient } from "@/lib/axios/httpClient"
import type { ApiErrorResponse, ApiResponse } from "@/types/api.types"

export interface CreateSeasonInput {
  mediaId: string
  seasonNumber: number
  title?: string
}

export type CreateSeasonActionResult = Pick<
  ApiErrorResponse,
  "success" | "message"
>

export async function createSeason<TData = unknown>(
  payload: CreateSeasonInput,
): Promise<ApiResponse<TData>> {
  return httpClient.post<TData>("/seasons", payload)
}

export async function createSeasonAction(
  payload: CreateSeasonInput,
): Promise<CreateSeasonActionResult> {
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.mediaId !== "string" ||
    typeof payload.seasonNumber !== "number" ||
    !Number.isInteger(payload.seasonNumber) ||
    payload.seasonNumber <= 0 ||
    (payload.title !== undefined && typeof payload.title !== "string")
  ) {
    return {
      success: false,
      message: "Enter a series, a positive whole season number, and a valid title.",
    }
  }

  const mediaId = payload.mediaId.trim()
  const title = payload.title?.trim()

  if (!mediaId) {
    return {
      success: false,
      message: "Series ID is required.",
    }
  }

  try {
    const response = await createSeason({
      mediaId,
      seasonNumber: payload.seasonNumber,
      ...(title ? { title } : {}),
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
          `Season creation failed: ${error.message}`,
      }
    }

    console.error("Season creation failed:", error)
    return {
      success: false,
      message: `Season creation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    }
  }
}