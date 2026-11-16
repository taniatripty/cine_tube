"use server"

import axios from "axios"

import { httpClient } from "@/lib/axios/httpClient"
import type { ApiErrorResponse, ApiResponse } from "@/types/api.types"

export interface CreateEpisodeInput {
  seasonId: string
  episodeNumber: number
  title: string
  synopsis?: string | null
  runtime?: number | null
  thumbnail?: string | null
  videoUrl?: string | null
}

export type CreateEpisodeActionResult = Pick<
  ApiErrorResponse,
  "success" | "message"
>

export async function createEpisode<TData = unknown>(
  payload: CreateEpisodeInput,
  thumbnailFile: File | null,
): Promise<ApiResponse<TData>> {
  const formData = new FormData()
  formData.append("seasonId", payload.seasonId)
  formData.append("episodeNumber", String(payload.episodeNumber))
  formData.append("title", payload.title)

  if (payload.synopsis) {
    formData.append("synopsis", payload.synopsis)
  }
  if (payload.runtime !== undefined && payload.runtime !== null) {
    formData.append("runtime", String(payload.runtime))
  }
  if (!thumbnailFile && payload.thumbnail) {
    formData.append("thumbnail", payload.thumbnail)
  }
  if (payload.videoUrl) {
    formData.append("videoUrl", payload.videoUrl)
  }
  if (thumbnailFile) {
    formData.append("thumbnail", thumbnailFile, thumbnailFile.name)
  }

  return httpClient.post<TData>("/episodes", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export async function createEpisodeAction(
  payload: CreateEpisodeInput,
  thumbnailFile: File | null,
): Promise<CreateEpisodeActionResult> {
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.seasonId !== "string" ||
    typeof payload.episodeNumber !== "number" ||
    !Number.isInteger(payload.episodeNumber) ||
    payload.episodeNumber <= 0 ||
    typeof payload.title !== "string" ||
    (payload.synopsis !== undefined &&
      payload.synopsis !== null &&
      typeof payload.synopsis !== "string") ||
    (payload.runtime !== undefined &&
      payload.runtime !== null &&
      (typeof payload.runtime !== "number" ||
        !Number.isInteger(payload.runtime) ||
        payload.runtime <= 0)) ||
    (payload.thumbnail !== undefined &&
      payload.thumbnail !== null &&
      typeof payload.thumbnail !== "string") ||
    (payload.videoUrl !== undefined &&
      payload.videoUrl !== null &&
      typeof payload.videoUrl !== "string") ||
    (thumbnailFile !== null &&
      (typeof thumbnailFile !== "object" ||
        typeof thumbnailFile.name !== "string" ||
        typeof thumbnailFile.size !== "number" ||
        typeof thumbnailFile.arrayBuffer !== "function"))
  ) {
    return {
      success: false,
      message: "Enter a season, valid episode number, title, and episode details.",
    }
  }

  const seasonId = payload.seasonId.trim()
  const title = payload.title.trim()
  const synopsis = payload.synopsis?.trim()
  const thumbnail = payload.thumbnail?.trim()
  const videoUrl = payload.videoUrl?.trim()

  if (!seasonId || !title) {
    return {
      success: false,
      message: "Season ID and episode title are required.",
    }
  }

  try {
    const response = await createEpisode(
      {
        seasonId,
        episodeNumber: payload.episodeNumber,
        title,
        ...(synopsis ? { synopsis } : {}),
        ...(payload.runtime !== undefined && payload.runtime !== null
          ? { runtime: payload.runtime }
          : {}),
        ...(thumbnail ? { thumbnail } : {}),
        ...(videoUrl ? { videoUrl } : {}),
      },
      thumbnailFile,
    )

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
          `Episode creation failed: ${error.message}`,
      }
    }

    console.error("Episode creation failed:", error)
    return {
      success: false,
      message: `Episode creation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    }
  }
}