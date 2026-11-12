"use server"

import { cookies } from "next/headers"

import type { ApiResponse } from "@/types/api.types"

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

if (!BASE_API_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined")
}

type RefreshedTokens = {
  accessToken?: string
  refreshToken?: string
  token?: string
}

async function setTokenInCookies(
  name: string,
  value: string,
  maxAge?: number
): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  })
}

export async function getNewTokensWithRefreshToken(
  refreshToken: string
): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
    })

    if (!response.ok) {
      return false
    }

    const { data } = (await response.json()) as ApiResponse<RefreshedTokens>
    const {
      accessToken,
      refreshToken: newRefreshToken,
      token,
    } = data ?? {}

    if (accessToken) {
      await setTokenInCookies("accessToken", accessToken)
    }

    if (newRefreshToken) {
      await setTokenInCookies("refreshToken", newRefreshToken)
    }

    if (token) {
      await setTokenInCookies(
        "better-auth.session_token",
        token,
        24 * 60 * 60
      )
    }

    return true
  } catch (error) {
    console.error("Error refreshing token:", error)
    return false
  }
}

export async function getUserInfo(): Promise<unknown | null> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value
    const sessionToken = cookieStore.get("better-auth.session_token")?.value

    if (!accessToken) {
      return null
    }

    const authCookies = [
      `accessToken=${accessToken}`,
      sessionToken ? `better-auth.session_token=${sessionToken}` : undefined,
    ]
      .filter(Boolean)
      .join("; ")

    const response = await fetch(`${BASE_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookies,
      },
    })

    if (!response.ok) {
      console.error(
        "Failed to fetch user info:",
        response.status,
        response.statusText
      )
      return null
    }

    const { data } = (await response.json()) as ApiResponse<unknown>
    return data
  } catch (error) {
    console.error("Error fetching user info:", error)
    return null
  }
}