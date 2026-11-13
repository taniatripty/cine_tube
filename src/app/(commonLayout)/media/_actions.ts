"use server"

import axios from "axios"

import { createMedia } from "@/services/media.services"
import type { ApiErrorResponse } from "@/types/api.types"
import type { CreateMediaInput } from "@/services/media.services"

type CreateMediaActionResult = {
  success: boolean
  message: string
}

export async function createMediaAction(
  payload: CreateMediaInput
): Promise<CreateMediaActionResult> {
  try {
    const response = await createMedia(payload)

    return {
      success: response.success,
      message: response.message,
    }
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message ?? `Media creation failed: ${error.message}`,
      }
    }

    console.error("Media creation failed:", error)
    return {
      success: false,
      message: "Media creation failed due to an unexpected error.",
    }
  }
}
