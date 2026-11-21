import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

import { isTokenExpiringSoon } from "@/lib/tokenUtils"
import {
  requestRefreshedTokens,
  type RefreshedAuthTokens,
} from "@/services/refreshToken.service"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const rawAccessToken = request.cookies.get("accessToken")?.value
  const refreshToken = request.cookies.get("refreshToken")?.value
  const requestHeaders = new Headers(request.headers)
  let refreshedTokens: RefreshedAuthTokens | null = null

  if (refreshToken && (!rawAccessToken || isTokenExpiringSoon(rawAccessToken))) {
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

  const effectiveAccessToken = refreshedTokens?.accessToken ?? rawAccessToken

  // Extract user role from JWT token
  let role: string | undefined
  if (effectiveAccessToken) {
    try {
      const decoded = jwt.decode(effectiveAccessToken)
      if (
        decoded &&
        typeof decoded === "object" &&
        typeof (decoded as Record<string, unknown>).role === "string"
      ) {
        role = (decoded as Record<string, unknown>).role as string
      }
    } catch {
      role = undefined
    }
  }

  // Handle direct /admin root hit -> redirect to /admin/dashboard
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  // Handle direct /user root hit -> redirect to /user/dashboard
  if (pathname === "/user") {
    return NextResponse.redirect(new URL("/user/dashboard", request.url))
  }

  // Access control for Admin routes (/admin or /admin/*)
  if (pathname.startsWith("/admin")) {
    if (!effectiveAccessToken) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (role?.toUpperCase() !== "ADMIN") {
      // Non-admin user cannot access admin dashboard -> redirect to user dashboard
      return NextResponse.redirect(new URL("/user/dashboard", request.url))
    }
  }

  // Access control for User routes (/user or /user/*)
  if (pathname.startsWith("/user")) {
    if (!effectiveAccessToken) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
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
