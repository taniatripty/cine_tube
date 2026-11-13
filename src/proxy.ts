import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { isTokenExpiringSoon } from "@/lib/tokenUtils"
import {
  requestRefreshedTokens,
  type RefreshedAuthTokens,
} from "@/services/refreshToken.service"

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value
  const refreshToken = request.cookies.get("refreshToken")?.value
  const requestHeaders = new Headers(request.headers)
  let refreshedTokens: RefreshedAuthTokens | null = null

  if (refreshToken && (!accessToken || isTokenExpiringSoon(accessToken))) {
    try {
      refreshedTokens = await requestRefreshedTokens(refreshToken)

      const requestCookies = new Map<string, string>()
      for (const { name, value } of request.cookies.getAll()) {
        requestCookies.set(name, value)
      }

      requestCookies.set("accessToken", refreshedTokens.accessToken)
      requestCookies.set(
        "refreshToken",
        refreshedTokens.refreshToken ?? refreshToken
      )
      if (refreshedTokens.sessionToken) {
        requestCookies.set(
          "better-auth.session_token",
          refreshedTokens.sessionToken
        )
      }

      requestHeaders.set(
        "cookie",
        Array.from(requestCookies, ([name, value]) => `${name}=${value}`).join(
          "; "
        )
      )
    } catch (error) {
      console.error("Error refreshing token in proxy:", error)
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  if (refreshedTokens) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
    }

    response.cookies.set(
      "accessToken",
      refreshedTokens.accessToken,
      cookieOptions
    )

    if (refreshedTokens.refreshToken) {
      response.cookies.set(
        "refreshToken",
        refreshedTokens.refreshToken,
        cookieOptions
      )
    }

    if (refreshedTokens.sessionToken) {
      response.cookies.set(
        "better-auth.session_token",
        refreshedTokens.sessionToken,
        cookieOptions
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|\\.well-known).*)",
  ],
}