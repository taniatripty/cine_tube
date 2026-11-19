"use server"

import axios from "axios"

import { httpClient } from "@/lib/axios/httpClient"
import type { ApiErrorResponse } from "@/types/api.types"

export type MediaCheckoutAccessType =
  | "PURCHASE"
  | "RENT_MONTH"
  | "RENT_YEAR"

export type MediaCheckoutActionResult = {
  success: boolean
  message: string
  url?: string
}

const getStripeCheckoutUrl = (data: unknown): string | undefined => {
  if (typeof data === "string") {
    return data.trim() || undefined
  }

  if (typeof data === "object" && data !== null) {
    const url = "url" in data ? data.url : undefined
    const checkoutUrl = "checkoutUrl" in data ? data.checkoutUrl : undefined

    for (const candidate of [url, checkoutUrl]) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim()
      }
    }
  }

  return undefined
}

export async function createMediaCheckout(
  mediaId: string,
  accessType: MediaCheckoutAccessType,
): Promise<MediaCheckoutActionResult> {
  const normalizedMediaId = mediaId.trim()
  if (!normalizedMediaId) {
    return { success: false, message: "A media ID is required." }
  }

  try {
    const response = await httpClient.post<unknown>(
      "/payments/media/checkout",
      { mediaId: normalizedMediaId, accessType },
    )

    if (!response.success) {
      return { success: false, message: response.message }
    }

    const url = getStripeCheckoutUrl(response.data)
    if (!url) {
      const dataKeys =
        typeof response.data === "object" && response.data !== null
          ? Object.keys(response.data)
          : []
      console.error("Media checkout response did not include a Stripe URL.", {
        dataType: typeof response.data,
        dataKeys,
      })
      return {
        success: false,
        message: "Could not open Stripe Checkout. Please try again.",
      }
    }

    return {
      success: true,
      message: response.message,
      url,
    }
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message ??
          `Could not create checkout: ${error.message}`,
      }
    }

    console.error("Failed to create media checkout:", error)
    return {
      success: false,
      message: "Could not create checkout. Please try again.",
    }
  }
}
