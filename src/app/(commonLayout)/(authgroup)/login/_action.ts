"use server"

import axios from "axios"
import { redirect } from "next/navigation"

import { httpClient } from "@/lib/axios/httpClient"
import { setCookie } from "@/lib/cookieUtils"
import type { ApiErrorResponse, ApiResponse } from "@/types/api.types"
import type { LoginResponse } from "@/types/auth.types"

const ONE_DAY_IN_SECONDS = 24 * 60 * 60
const SEVEN_DAYS_IN_SECONDS = 7 * ONE_DAY_IN_SECONDS

type LoginPayload = {
  email: string
  password: string
}

const isLoginPayload = (payload: unknown): payload is LoginPayload => {
  if (typeof payload !== "object" || payload === null) {
    return false
  }

  return (
    "email" in payload &&
    typeof payload.email === "string" &&
    "password" in payload &&
    typeof payload.password === "string"
  )
}

const getSafeRedirectPath = (path?: string): string => {
  if (path?.startsWith("/") && !path.startsWith("//") && !path.includes("\\")) {
    return path
  }

  return "/"
}

export const logInactions = async (
  payload: LoginPayload,
  redirectPath?: string
): Promise<LoginResponse | ApiErrorResponse> => {
  if (!isLoginPayload(payload) || !payload.email.trim() || !payload.password) {
    return {
      success: false,
      message: "A valid email and password are required.",
    }
  }

  let response: ApiResponse<LoginResponse["data"]>

  try {
    response = await httpClient.post<LoginResponse["data"]>("/auth/login", {
      email: payload.email.trim(),
      password: payload.password,
    })
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      const message = error.response?.data?.message

      if (message === "Email not verified") {
        redirect(`/verifyEmail?email=${encodeURIComponent(payload.email.trim())}`)
      }

      return {
        success: false,
        message: message ?? `Login failed: ${error.message}`,
      }
    }

    console.error("Login failed:", error)
    return {
      success: false,
      message: "Login failed due to an unexpected error.",
    }
  }

  if (!response.success) {
    if (response.message === "Email not verified") {
      redirect(`/verifyEmail?email=${encodeURIComponent(payload.email.trim())}`)
    }

    return {
      success: false,
      message: response.message,
    }
  }

  const { accessToken, refreshToken, token, user } = response.data
   const {emailVerified,role,needpasswordChange,email}=user

 

  try {
    await setCookie("accessToken", accessToken, ONE_DAY_IN_SECONDS)
    await setCookie("refreshToken", refreshToken, SEVEN_DAYS_IN_SECONDS)
    await setCookie("better-auth.session_token", token, ONE_DAY_IN_SECONDS)
  } catch (error) {
    console.error("Failed to save login cookies:", error)
    return {
      success: false,
      message: "Login failed while saving your session.",
    }
  }

  if (user.needpasswordChange) {
    redirect(`/resetPass?email=${encodeURIComponent(user.email)}`)
  }

  redirect(getSafeRedirectPath(redirectPath))
}