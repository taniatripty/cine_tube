import { httpClient } from "@/lib/axios/httpClient"
import type { ApiResponse } from "@/types/api.types"

export async function getMyPayments<TData = unknown>(): Promise<
  ApiResponse<TData>
> {
  return httpClient.get<TData>("/payments")
}
