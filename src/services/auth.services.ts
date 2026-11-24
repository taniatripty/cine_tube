"use server"

import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

import { getRawSessionToken } from "@/lib/sessionTokenUtils"
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

export type UserInfo = {
  name: string
  email: string
  emailVerified: boolean
  needPasswordChange: boolean
  role?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

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

export async function getUserInfo(
  accessToken: string,
  sessionToken?: string
): Promise<UserInfo | null> {
  try {
    const authCookies = [
      `accessToken=${accessToken}`,
      ...(sessionToken
        ? [`better-auth.session_token=${getRawSessionToken(sessionToken)}`]
        : []),
    ].join("; ")

    const response = await fetch(`${BASE_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookies,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(
        "Failed to fetch user info:",
        response.status,
        response.statusText
      )
      return null
    }

    const payload: unknown = await response.json()
    if (!isRecord(payload) || !isRecord(payload.data)) {
      console.error("Invalid user info response")
      return null
    }

    const data = payload.data
    const needPasswordChange =
      data.needPasswordChange ?? data.needpasswordChange
    const tokenPayload = jwt.decode(accessToken)
    const tokenName =
      typeof tokenPayload === "object" &&
      tokenPayload !== null &&
      typeof tokenPayload.name === "string"
        ? tokenPayload.name
        : undefined

    const tokenRole =
      typeof tokenPayload === "object" &&
      tokenPayload !== null &&
      typeof (tokenPayload as Record<string, unknown>).role === "string"
        ? ((tokenPayload as Record<string, unknown>).role as string)
        : undefined

    if (
      typeof data.email !== "string" ||
      typeof data.emailVerified !== "boolean" ||
      typeof needPasswordChange !== "boolean"
    ) {
      console.error("User info response is missing required fields")
      return null
    }

    const userRole =
      typeof data.role === "string" && data.role.trim()
        ? data.role
        : tokenRole

    return {
      name:
        typeof data.name === "string" && data.name.trim()
          ? data.name
          : tokenName ?? data.email,
      email: data.email,
      emailVerified: data.emailVerified,
      needPasswordChange,
      role: userRole,
    }
  } catch (error) {
    console.error("Error fetching user info:", error)
    return null
  }
}

export async function getCurrentUserAction(): Promise<
  Pick<UserInfo, "name" | "email" | "role"> | null
> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value

  if (!accessToken) {
    return null
  }

  let roleFromToken: string | undefined
  let nameFromToken: string | undefined
  let emailFromToken: string | undefined

  try {
    const decoded = jwt.decode(accessToken)
    if (decoded && typeof decoded === "object") {
      const rec = decoded as Record<string, unknown>
      if (typeof rec.role === "string") roleFromToken = rec.role
      if (typeof rec.name === "string") nameFromToken = rec.name
      if (typeof rec.email === "string") emailFromToken = rec.email
    }
  } catch {
    // ignore
  }

  const user = await getUserInfo(
    accessToken,
    cookieStore.get("better-auth.session_token")?.value
  )

  if (user) {
    return {
      name: user.name,
      email: user.email,
      role: user.role || roleFromToken,
    }
  }

  if (emailFromToken || nameFromToken) {
    return {
      name: nameFromToken || emailFromToken || "User",
      email: emailFromToken || "",
      role: roleFromToken || "USER",
    }
  }

  return null
}

export async function logOutAction(): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.delete("accessToken")
  cookieStore.delete("refreshToken")
  cookieStore.delete("better-auth.session_token")
}