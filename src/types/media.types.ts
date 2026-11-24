import { ContentReactionType } from "./reaction.types"

export type MediaGenre = {
  id: string
  name: string
  createdAt?: string
  updatedAt?: string
  isDeleted?: boolean
}

export type MediaPerson = {
  id: string
  name: string
  photo: string | null
  biography: string | null
  createdAt?: string
  updatedAt?: string
  isDeleted?: boolean
}

export type MediaCredit = {
  id: string
  mediaId?: string
  personId?: string
  role: string
  characterName: string | null
  displayOrder?: number
  person: MediaPerson
}

export type MediaAvailability = {
  id: string
  mediaId?: string
  platformId?: string
  streamingUrl: string
  region: string
  availableFrom: string | null
  availableUntil: string | null
  Platform: {
    id: string
    name: string
    logo: string | null
    website: string | null
    createdAt?: string
    updatedAt?: string
  }
}

export type MediaEpisode = {
  id: string
  episodeNumber: number
  title: string
  synopsis: string | null
  runtime: number | null
  thumbnail: string | null
  videoUrl: string | null
}

export type MediaSeason = {
  id: string
  seasonNumber: number
  title: string | null
  episodes: MediaEpisode[]
}

export type MediaUser = {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null
  username?: string | null
  emailVerified?: boolean
  status?: string
}

 export type MediaReactionItem = {
  userId?: string
  reviewId?: string
  commentId?: string
  type: ContentReactionType
  createdAt?: string
}

 export type MediaComment = {
  id: string
  userId?: string
  reviewId?: string
  parentId?: string | null
  content: string
  likeCount?: number
  dislikeCount?: number
  loveCount?: number
  laughCount?: number
  wowCount?: number
  sadCount?: number
  angryCount?: number
  reactionCount?: number
  replyCount?: number
  status?: string
  createdAt?: string | null
  updatedAt?: string | null
  commentLikes?: MediaReactionItem[] | null
  user?: MediaUser | null
  replies?: MediaComment[] | null
  _count?: {
    commentLikes?: number
    replies?: number
  } | null
}

export type MediaReview = {
  id: string
  userId?: string
  mediaId?: string
  rating: number
  content: string
  isSpoiler?: boolean
  likeCount?: number
  dislikeCount?: number
  loveCount?: number
  laughCount?: number
  wowCount?: number
  sadCount?: number
  angryCount?: number
  reactionCount?: number
  commentCount?: number
  status?: string
  createdAt?: string | null
  updatedAt?: string | null
  reviewLikes?: MediaReactionItem[] | null
  user?: MediaUser | null
  comments?: MediaComment[] | null
  _count?: {
    reviewLikes?: number
    comments?: number
  } | null
}

 export type MediaDetails = {
  id: string
  title: string
  synopsis: string
  poster: string | null
  backdrop: string | null
  type: string
  releaseDate: string | null
  releaseYear: number | null
  runtime: number | null
  isPremium: boolean
  price: string | null
  purchasePrice?: string | null
  monthlyRentPrice?: string | null
  yearlyRentPrice?: string | null
  averageRating: number
  ratingCount: number
  reviewCount: number
  reactionCount?: number
  status: string
  createdAt?: string
  updatedAt?: string
  genres: MediaGenre[]
  credits: MediaCredit[]
  mediaAvailabilities: MediaAvailability[]
  reviews?: MediaReview[] | null
  seasons?: MediaSeason[] | null
}
