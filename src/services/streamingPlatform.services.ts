"use server"

import axios from "axios"

import { httpClient } from "@/lib/axios/httpClient"
import type { ApiErrorResponse, ApiResponse } from "@/types/api.types"

export type CreateStreamingPlatformActionResult = Pick<
  ApiErrorResponse,
  "success" | "message"
>

export async function createStreamingPlatform<TData = unknown>(
  formData: FormData,
): Promise<ApiResponse<TData>> {
  return httpClient.post<TData>("/streaming-platforms", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export async function createStreamingPlatformAction(
  formData: FormData,
): Promise<CreateStreamingPlatformActionResult> {
  if (!(formData instanceof FormData)) {
    return {
      success: false,
      message: "Invalid streaming platform details.",
    }
  }

  const nameValue = formData.get("name")
  const websiteValue = formData.get("website")
  const fileValue = formData.get("file")

  if (
    typeof nameValue !== "string" ||
    (websiteValue !== null && typeof websiteValue !== "string") ||
    (fileValue !== null && typeof fileValue === "string")
  ) {
    return {
      success: false,
      message: "Invalid streaming platform details.",
    }
  }

  const name = nameValue.trim()
  if (!name) {
    return {
      success: false,
      message: "Name is required.",
    }
  }

  const website = typeof websiteValue === "string" ? websiteValue.trim() : ""
  if (website) {
    try {
      new URL(website)
    } catch {
      return {
        success: false,
        message: "Enter a valid website URL.",
      }
    }
  }

  formData.set("name", name)
  if (website) {
    formData.set("website", website)
  } else {
    formData.delete("website")
  }
  if (
    fileValue === null ||
    typeof fileValue === "string" ||
    typeof fileValue.arrayBuffer !== "function" ||
    fileValue.size === 0
  ) {
    formData.delete("file")
  }

  try {
    const response = await createStreamingPlatform(formData)
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
          `Streaming platform creation failed: ${error.message}`,
      }
    }

    console.error("Streaming platform creation failed:", error)
    return {
      success: false,
      message: `Streaming platform creation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    }
  }
}