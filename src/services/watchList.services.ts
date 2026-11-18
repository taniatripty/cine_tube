"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import { httpClient } from "@/lib/axios/httpClient"
import type { ApiErrorResponse, ApiResponse } from "@/types/api.types"

export type WatchListMedia = {
  id: string
  title: string
  synopsis: string
  poster: string | null
  type: string
  releaseYear: number | null
  runtime: number | null
  isPremium: boolean
  price: string | null
}

export type WatchListEntry = {
  id: string
  createdAt: string
  media: WatchListMedia
}

export type WatchListActionResult = {
  success: boolean
  message: string
}

export async function createWatchList(
  mediaId: string,
): Promise<WatchListActionResult> {
  const normalizedMediaId = mediaId.trim()
  if (!normalizedMediaId) {
    return { success: false, message: "A media ID is required." }
  }

  try {
    const response = await httpClient.post<WatchListEntry>("/watchlists", {
      mediaId: normalizedMediaId,
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
          `Could not add this title to your watchlist: ${error.message}`,
      }
    }

    console.error("Failed to add media to watchlist:", error)
    return {
      success: false,
      message: "Could not add this title to your watchlist. Please try again.",
    }
  }
}

export async function getMyWatchList(): Promise<
  ApiResponse<WatchListEntry[]>
> {
  return httpClient.get<WatchListEntry[]>("/watchlists")
}

export async function deleteWatchListItem(
  mediaId: string,
): Promise<WatchListActionResult> {
  const normalizedMediaId = mediaId.trim()
  if (!normalizedMediaId) {
    return { success: false, message: "A media ID is required." }
  }

  let response: ApiResponse<{ mediaId: string }>
  try {
    response = await httpClient.delete<{ mediaId: string }>(
      `/watchlists/${encodeURIComponent(normalizedMediaId)}`,
    )
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message ??
          `Could not remove this title from your watchlist: ${error.message}`,
      }
    }

    console.error("Failed to remove media from watchlist:", error)
    return {
      success: false,
      message: "Could not remove this title. Please try again.",
    }
  }

  if (response.success) {
    revalidatePath("/watchList")
  }

  return {
    success: response.success,
    message: response.message,
  }
}