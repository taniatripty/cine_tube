"use server"

import axios from "axios"

import { httpClient } from "@/lib/axios/httpClient"
import type { ApiErrorResponse, ApiResponse } from "@/types/api.types"

export interface CreatePersonInput {
  name: string
  biography?: string | null
}

export type CreatePersonActionResult = Pick<
  ApiErrorResponse,
  "success" | "message"
>

export async function createPerson<TData = unknown>(
  payload: CreatePersonInput,
  file: File | null,
): Promise<ApiResponse<TData>> {
  const formData = new FormData()
  formData.append("name", payload.name)

  if (payload.biography) {
    formData.append("biography", payload.biography)
  }
  if (file) {
    formData.append("file", file, file.name)
  }

  return httpClient.post<TData>("/person", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export async function createPersonAction(
  payload: CreatePersonInput,
  file: File | null,
): Promise<CreatePersonActionResult> {
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.name !== "string" ||
    (payload.biography !== undefined &&
      payload.biography !== null &&
      typeof payload.biography !== "string") ||
    (file !== null &&
      (typeof file !== "object" ||
        typeof file.name !== "string" ||
        typeof file.size !== "number" ||
        typeof file.arrayBuffer !== "function"))
  ) {
    return {
      success: false,
      message: "Invalid person details.",
    }
  }

  const name = payload.name.trim()
  if (!name) {
    return {
      success: false,
      message: "Name is required.",
    }
  }

  const biography =
    typeof payload.biography === "string"
      ? payload.biography.trim()
      : payload.biography
  const person: CreatePersonInput = {
    name,
    ...(biography ? { biography } : {}),
  }

  try {
    const response = await createPerson(person, file)
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
          `Person creation failed: ${error.message}`,
      }
    }

    console.error("Person creation failed:", error)
    return {
      success: false,
      message: "Person creation failed due to an unexpected error.",
    }
  }
}