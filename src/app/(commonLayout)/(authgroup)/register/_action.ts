"use server"

import axios from "axios"
import { redirect } from "next/navigation"

import { httpClient } from "@/lib/axios/httpClient"
import { setCookie } from "@/lib/cookieUtils"
import type { ApiErrorResponse, ApiResponse } from "@/types/api.types"
import type { RegisterResponse } from "@/types/auth.types"

const ONE_DAY_IN_SECONDS = 24 * 60 * 60
const SEVEN_DAYS_IN_SECONDS = 7 * ONE_DAY_IN_SECONDS

type RegisterPayload = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type RegisterActionResult = Pick<ApiErrorResponse, "success" | "message">

const isRegisterPayload = (payload: unknown): payload is RegisterPayload => {
  if (typeof payload !== "object" || payload === null) {
    return false
  }

  return (
    "name" in payload &&
    typeof payload.name === "string" &&
    "email" in payload &&
    typeof payload.email === "string" &&
    "password" in payload &&
    typeof payload.password === "string" &&
    "confirmPassword" in payload &&
    typeof payload.confirmPassword === "string"
  )
}

export const registerActions = async (
  payload: RegisterPayload
): Promise<RegisterActionResult> => {
  if (!isRegisterPayload(payload)) {
    return {
      success: false,
      message: "Invalid registration details.",
    }
  }

  const name = payload.name.trim()
  const email = payload.email.trim()

  if (!name) {
    return { success: false, message: "Name is required." }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Enter a valid email address." }
  }

  if (payload.password.length < 8) {
    return {
      success: false,
      message: "Password must be at least 8 characters.",
    }
  }

  if (payload.password !== payload.confirmPassword) {
    return { success: false, message: "Passwords do not match." }
  }

  let response: ApiResponse<RegisterResponse["data"]>

  try {
    response = await httpClient.post<RegisterResponse["data"]>(
      "/auth/register",
      {
        name,
        email,
        password: payload.password,
      }
    )
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message ?? `Registration failed: ${error.message}`,
      }
    }

    console.error("Registration failed:", error)
    return {
      success: false,
      message: "Registration failed due to an unexpected error.",
    }
  }

  if (!response.success) {
    return {
      success: false,
      message: response.message,
    }
  }

  const { accessToken, refreshToken, token, user } = response.data

  if (!user.emailVerified) {
    return {
      success: true,
      message: "Account created. Check your email for a verification link.",
    }
  }

  try {
    await setCookie("accessToken", accessToken, ONE_DAY_IN_SECONDS)
    await setCookie("refreshToken", refreshToken, SEVEN_DAYS_IN_SECONDS)
    await setCookie("better-auth.session_token", token, ONE_DAY_IN_SECONDS)
  } catch (error) {
    console.error("Failed to save registration cookies:", error)
    return {
      success: false,
      message: "Registration completed, but the session could not be saved.",
    }
  }

  redirect("/")
}