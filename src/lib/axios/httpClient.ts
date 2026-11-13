import axios, { type AxiosInstance } from "axios"
import { cookies, headers } from "next/headers"
import { connection } from "next/server"

import { getNewTokensWithRefreshToken } from "@/services/auth.services"
import type { ApiResponse } from "@/types/api.types"
import { getRawSessionToken } from "../sessionTokenUtils"
import { isTokenExpiringSoon } from "../tokenUtils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in environment variables")
}

async function tryRefreshToken(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await connection()

  if (!isTokenExpiringSoon(accessToken)) {
    return
  }

  const requestHeaders = await headers()
  if (requestHeaders.get("x-token-refreshed") === "1") {
    return
  }

  try {
    const refreshed = await getNewTokensWithRefreshToken(refreshToken)
    if (!refreshed) {
      console.error("Failed to refresh the access token")
    }
  } catch (error) {
    console.error("Failed to refresh the access token:", error)
  }
}

const createAxiosInstance = async (): Promise<AxiosInstance> => {
  const initialCookieStore = await cookies()
  const accessToken = initialCookieStore.get("accessToken")?.value
  const refreshToken = initialCookieStore.get("refreshToken")?.value

  if (accessToken && refreshToken) {
    await tryRefreshToken(accessToken, refreshToken)
  }

  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) =>
      name === "better-auth.session_token"
        ? `${name}=${getRawSessionToken(value)}`
        : `${name}=${value}`
    )
    .join("; ")

  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 30_000,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  })
}

export interface ApiRequestOptions {
  params?: Record<string, unknown>
  headers?: Record<string, string>
}

const httpGet = async <TData>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await createAxiosInstance()
    const response = await instance.get<ApiResponse<TData>>(endpoint, {
      params: options?.params,
      headers: options?.headers,
    })
    return response.data
  } catch (error) {
    console.error(`GET request to ${endpoint} failed:`, error)
    throw error
  }
}

const httpPost = async <TData>(
  endpoint: string,
  data: unknown,
  options?: ApiRequestOptions
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await createAxiosInstance()
    const response = await instance.post<ApiResponse<TData>>(endpoint, data, {
      params: options?.params,
      headers: options?.headers,
    })
    return response.data
  } catch (error) {
    console.error(`POST request to ${endpoint} failed:`, error)
    throw error
  }
}

const httpPut = async <TData>(
  endpoint: string,
  data: unknown,
  options?: ApiRequestOptions
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await createAxiosInstance()
    const response = await instance.put<ApiResponse<TData>>(endpoint, data, {
      params: options?.params,
      headers: options?.headers,
    })
    return response.data
  } catch (error) {
    console.error(`PUT request to ${endpoint} failed:`, error)
    throw error
  }
}

const httpPatch = async <TData>(
  endpoint: string,
  data: unknown,
  options?: ApiRequestOptions
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await createAxiosInstance()
    const response = await instance.patch<ApiResponse<TData>>(
      endpoint,
      data,
      {
        params: options?.params,
        headers: options?.headers,
      }
    )
    return response.data
  } catch (error) {
    console.error(`PATCH request to ${endpoint} failed:`, error)
    throw error
  }
}

const httpDelete = async <TData>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await createAxiosInstance()
    const response = await instance.delete<ApiResponse<TData>>(endpoint, {
      params: options?.params,
      headers: options?.headers,
    })
    return response.data
  } catch (error) {
    console.error(`DELETE request to ${endpoint} failed:`, error)
    throw error
  }
}

const httpClient = {
  get: httpGet,
  post: httpPost,
  put: httpPut,
  patch: httpPatch,
  delete: httpDelete,
}

export { httpClient, httpDelete, httpGet, httpPatch, httpPost, httpPut }
