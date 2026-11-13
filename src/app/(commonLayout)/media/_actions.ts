"use server"

import axios from "axios"

import { createMedia } from "@/services/media.services"
import type { CreateMediaInput } from "@/services/media.services"

type CreateMediaActionResult = {
  success: boolean
  message: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const getValidationMessages = (data: unknown): string[] => {
  if (!isRecord(data)) {
    return []
  }

  const nestedError = isRecord(data.error) ? data.error : undefined
  const nestedDetails = isRecord(data.details) ? data.details : undefined
  const records = [data, nestedError, nestedDetails].filter(
    (value): value is Record<string, unknown> => value !== undefined,
  )

  const messages: string[] = []

  for (const record of records) {
    for (const key of ["issues", "errors", "errorSources", "error"]) {
      const entries = record[key]
      if (!Array.isArray(entries)) {
        continue
      }

      for (const entry of entries) {
        if (typeof entry === "string") {
          messages.push(entry)
          continue
        }

        if (!isRecord(entry) || typeof entry.message !== "string") {
          continue
        }

        const path = Array.isArray(entry.path)
          ? entry.path.map(String).join(".")
          : typeof entry.path === "string"
            ? entry.path
            : ""
        messages.push(path ? `${path}: ${entry.message}` : entry.message)
      }
    }

    const fieldErrors = isRecord(record.fieldErrors)
      ? record.fieldErrors
      : undefined
    if (fieldErrors) {
      for (const [field, errors] of Object.entries(fieldErrors)) {
        if (Array.isArray(errors)) {
          for (const message of errors) {
            if (typeof message === "string") {
              messages.push(`${field}: ${message}`)
            }
          }
        }
      }
    }

    if (Array.isArray(record.formErrors)) {
      messages.push(
        ...record.formErrors.filter(
          (message): message is string => typeof message === "string",
        ),
      )
    }
  }

  return [...new Set(messages)]
}

const getApiErrorMessage = (data: unknown, fallback: string): string => {
  if (typeof data === "string" && data.trim()) {
    return data.trim()
  }

  if (!isRecord(data)) {
    return fallback
  }

  const messages = [
    ...(typeof data.message === "string" ? [data.message] : []),
    ...(typeof data.error === "string" ? [data.error] : []),
    ...getValidationMessages(data),
  ].filter(Boolean)

  return [...new Set(messages)].join("\n") || fallback
}

export async function createMediaAction(
  payload: CreateMediaInput
): Promise<CreateMediaActionResult> {
  try {
    const response = await createMedia(payload)

    return {
      success: response.success,
      message: response.success
        ? response.message
        : getApiErrorMessage(response, response.message),
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: getApiErrorMessage(
          error.response?.data,
          `Media creation failed: ${error.message}`,
        ),
      }
    }

    console.error("Media creation failed:", error)
    return {
      success: false,
      message: "Media creation failed due to an unexpected error.",
    }
  }
}
