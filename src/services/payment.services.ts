import { httpClient } from "@/lib/axios/httpClient"
import type { ApiResponse } from "@/types/api.types"

export type PaymentMedia = {
  id: string
  title: string
  synopsis: string
  poster: string | null
  backdrop: string | null
  type: string
  releaseDate: string | null
  releaseYear: number | null
  runtime: number | null
}

export type PaymentMediaAccess = {
  id: string
  mediaId: string
  type: string
  expiresAt: string | null
  revokedAt: string | null
  media: PaymentMedia
}

export type PaymentRecord = {
  id: string
  purpose: string
  currency: string
  amount: string
  status: string
  transactionId: string
  invoiceUrl: string | null
  paidAt: string | null
  createdAt: string
  mediaAccesses: PaymentMediaAccess[]
}

export async function getMyPayments<TData = unknown>(): Promise<
  ApiResponse<TData>
> {
  return httpClient.get<TData>("/payments")
}
