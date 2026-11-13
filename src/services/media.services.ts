import { httpClient } from "@/lib/axios/httpClient"
import type { ApiResponse } from "@/types/api.types"

export interface MediaLookupOption {
  id: string
  name: string
}

export interface CreateMediaCredit {
  personId: string
  role: string
  characterName?: string | null
  displayOrder?: number
}

export interface CreateMediaAvailability {
  platformId: string
  streamingUrl: string
  region?: string
  availableFrom?: string | null
  availableUntil?: string | null
}

export interface CreateMediaInput {
  title: string
  synopsis: string
  poster?: string | null
  backdrop?: string | null
  type: string
  releaseDate?: string | null
  releaseYear?: number | null
  runtime?: number | null
  isPremium?: boolean
  price?: number | null
  status?: string
  genreIds?: string[]
  credits?: CreateMediaCredit[]
  availabilities?: CreateMediaAvailability[]
}

export const getMediaGenres = (): Promise<ApiResponse<MediaLookupOption[]>> =>
  httpClient.get<MediaLookupOption[]>("/genres")

export const getMediaPeople = (): Promise<ApiResponse<MediaLookupOption[]>> =>
  httpClient.get<MediaLookupOption[]>("/person/all")

export const getStreamingPlatforms = (): Promise<
  ApiResponse<MediaLookupOption[]>
> => httpClient.get<MediaLookupOption[]>("/streaming-platforms/all")

export const createMedia = <TData = unknown>(
  payload: CreateMediaInput
): Promise<ApiResponse<TData>> =>
  httpClient.post<TData>("/media", payload)

export const getAllMedia = <TData = unknown>(): Promise<ApiResponse<TData>> =>
  httpClient.get<TData>("/media/all")

export const getMediaById = <TData = unknown>(
  id: string
): Promise<ApiResponse<TData>> =>
  httpClient.get<TData>(`/media/${encodeURIComponent(id)}`)