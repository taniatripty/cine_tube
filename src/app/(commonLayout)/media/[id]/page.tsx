import { Suspense } from "react"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Film,
  Heart,
  MessageCircle,
  Star,
  Tv,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { getMediaById } from "@/services/media.services"
import type { ContentReactionType } from "@/types/reaction.types"
import MediaCheckoutButtons from "./MediaCheckoutButtons"
import MediaTrailerPlayer from "./MediaTrailerPlayer"
import ReactionPicker from "./ReactionPicker"
import ReviewSpoilerContent from "./ReviewSpoilerContent"
import WatchlistButton from "./WatchlistButton"

type MediaGenre = {
  id: string
  name: string
  createdAt?: string
  updatedAt?: string
  isDeleted?: boolean
}

type MediaPerson = {
  id: string
  name: string
  photo: string | null
  biography: string | null
  createdAt?: string
  updatedAt?: string
  isDeleted?: boolean
}

type MediaCredit = {
  id: string
  mediaId?: string
  personId?: string
  role: string
  characterName: string | null
  displayOrder?: number
  person: MediaPerson
}

type MediaAvailability = {
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

type MediaEpisode = {
  id: string
  episodeNumber: number
  title: string
  synopsis: string | null
  runtime: number | null
  thumbnail: string | null
  videoUrl: string | null
}

type MediaSeason = {
  id: string
  seasonNumber: number
  title: string | null
  episodes: MediaEpisode[]
}

type MediaUser = {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null
  username?: string | null
  emailVerified?: boolean
  status?: string
}

type MediaReactionItem = {
  userId?: string
  reviewId?: string
  commentId?: string
  type: ContentReactionType
  createdAt?: string
}

type MediaComment = {
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

type MediaReview = {
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

type MediaDetails = {
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

const formatRuntime = (
  runtime: number | null | undefined,
): string | null => {
  if (runtime === null || runtime === undefined || runtime <= 0) return null

  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60

  if (hours === 0) return `${minutes}m`
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}

const formatDate = (date: string | null | undefined): string | null => {
  if (!date) return null

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return null

  return parsedDate.toLocaleDateString("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

const formatPrice = (price: string | null | undefined): string | null => {
  if (!price) return null

  const parsedPrice = Number(price)
  if (!Number.isFinite(parsedPrice)) return null

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }).format(parsedPrice)
}

const formatRoleName = (role: string): string => {
  if (!role) return ""
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function UserAvatar({
  name,
  image,
  className = "size-8",
}: {
  name: string
  image?: string | null
  className?: string
}) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        className={`${className} shrink-0 rounded-full border border-border object-cover`}
      />
    )
  }

  return (
    <div
      className={`${className} shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-rose-700 text-white text-xs font-semibold select-none shadow-sm`}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

const getCommentReplies = (
  comment: MediaComment,
  allComments: MediaComment[],
): MediaComment[] => {
  const replies = [
    ...(comment.replies ?? []),
    ...allComments.filter((item) => item.parentId === comment.id),
  ]
  const uniqueReplies = new Map<string, MediaComment>()
  for (const reply of replies) {
    uniqueReplies.set(reply.id, reply)
  }
  return [...uniqueReplies.values()]
}

const countComments = (comments: MediaComment[]): number => {
  const visited = new Set<string>()
  const visit = (comment: MediaComment) => {
    if (visited.has(comment.id)) return
    visited.add(comment.id)
    getCommentReplies(comment, comments).forEach(visit)
  }
  comments.forEach(visit)
  return visited.size
}

function CommentThread({
  comment,
  allComments,
  mediaId,
  reviewId,
  currentUserId,
  ancestorIds = [],
}: {
  comment: MediaComment
  allComments: MediaComment[]
  mediaId: string
  reviewId: string
  currentUserId?: string
  ancestorIds?: string[]
}) {
  const commenter =
    comment.user?.name ?? comment.user?.username ?? "Viewer"
  const commentDate = formatDate(comment.createdAt)
  const currentAncestorIds = [...ancestorIds, comment.id]
  const replies = getCommentReplies(comment, allComments).filter(
    (reply) => !currentAncestorIds.includes(reply.id),
  )
  const replyHref = `/comment?mediaId=${encodeURIComponent(mediaId)}&reviewId=${encodeURIComponent(reviewId)}&parentId=${encodeURIComponent(comment.id)}`

  const userActiveReaction = comment.commentLikes?.find(
    (item) => item.userId === currentUserId,
  )?.type

  return (
    <li className="rounded-xl border bg-card/60 p-4 transition hover:bg-card">
      <div className="flex items-start gap-3">
        <UserAvatar name={commenter} image={comment.user?.image} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-semibold text-foreground">{commenter}</span>
            {comment.user?.role && (
              <span className="rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                {comment.user.role}
              </span>
            )}
            {commentDate && (
              <time className="text-xs text-muted-foreground">
                · {commentDate}
              </time>
            )}
          </div>

          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground/90">
            {comment.content}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ReactionPicker
              targetId={comment.id}
              targetType="comment"
              reactions={comment.commentLikes ?? []}
              initialActiveReaction={userActiveReaction}
            />
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={replyHref} />}
              className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="size-3.5" aria-hidden="true" />
              Reply
            </Button>
          </div>
        </div>
      </div>

      {replies.length > 0 && (
        <ul className="mt-4 space-y-3 border-l-2 border-border/60 pl-3 sm:pl-4">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              allComments={allComments}
              mediaId={mediaId}
              reviewId={reviewId}
              currentUserId={currentUserId}
              ancestorIds={currentAncestorIds}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function MediaDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense
      fallback={
        <main className="flex-1">
          <div className="min-h-[32rem] animate-pulse bg-muted" />
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)] lg:px-8">
            <div className="h-64 animate-pulse rounded-2xl bg-muted" />
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
          </div>
        </main>
      }
    >
      <MediaDetailsContent params={params} />
    </Suspense>
  )
}

async function MediaDetailsContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let media: MediaDetails | null = null
  let currentUserId: string | undefined

  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value
    if (accessToken) {
      try {
        const decoded = jwt.decode(accessToken)
        if (decoded && typeof decoded === "object") {
          const rec = decoded as Record<string, unknown>
          currentUserId = (rec.userId ?? rec.id ?? rec.sub) as
            | string
            | undefined
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }

  try {
    const response = await getMediaById<MediaDetails>(id)
    if (response.success) {
      media = response.data
    }
  } catch (error) {
    console.error(`Failed to load media ${id}:`, error)

    return (
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold">Media could not be loaded</h1>
          <p className="mt-2 text-muted-foreground">Please try again later.</p>
          <Button
            className="mt-6"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <ArrowLeft aria-hidden="true" />
            Back to titles
          </Button>
        </div>
      </main>
    )
  }

  if (!media) {
    notFound()
  }

  const runtime = formatRuntime(media.runtime)
  const releaseDate = formatDate(media.releaseDate)
  const purchasePriceValue = media.purchasePrice ?? media.price
  const purchasePrice = formatPrice(purchasePriceValue)
  const monthlyRentPrice = formatPrice(media.monthlyRentPrice ?? null)
  const yearlyRentPrice = formatPrice(media.yearlyRentPrice ?? null)
  const genres = media.genres ?? []
  const credits = media.credits ?? []
  const availabilities = media.mediaAvailabilities ?? []
  const reviews = media.reviews ?? []
  const seasons = media.seasons ?? []

  // Extract first availability streamingUrl for trailer preview if available
  const primaryStreamingUrl = availabilities[0]?.streamingUrl

  return (
    <main className="flex-1">
      {/* Hero Header Section */}
      <section
        className="relative isolate min-h-[34rem] overflow-hidden bg-slate-950 bg-cover bg-center text-white"
        style={
          media.backdrop
            ? { backgroundImage: `url("${media.backdrop}")` }
            : undefined
        }
        aria-label={`${media.title} details`}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/85 to-black/40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/30 to-black/30" />

        <div className="mx-auto flex min-h-[34rem] max-w-7xl items-end gap-8 px-4 py-12 sm:px-6 lg:px-8">
          {media.poster && (
            <div
              className="hidden aspect-[2/3] w-52 shrink-0 rounded-2xl border border-white/10 bg-cover bg-center shadow-2xl md:block"
              style={{ backgroundImage: `url("${media.poster}")` }}
              role="img"
              aria-label={`${media.title} poster`}
            />
          )}

          <div className="max-w-3xl flex-1">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm text-white/80 transition hover:text-white"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to titles
            </Link>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/25 bg-black/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                {media.type}
              </span>
              {media.isPremium && (
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold tracking-wide text-white shadow-sm">
                  Premium
                </span>
              )}
              {media.status && (
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium capitalize">
                  {media.status.toLowerCase()}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {media.title}
            </h1>

            {/* Key Stats Row */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/80">
              {media.releaseYear && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {media.releaseYear}
                </span>
              )}
              {runtime && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-4" aria-hidden="true" />
                  {runtime}
                </span>
              )}
              {media.averageRating > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Star
                    className="size-4 fill-yellow-400 text-yellow-400"
                    aria-hidden="true"
                  />
                  <strong className="font-semibold text-white">
                    {media.averageRating.toFixed(1)}
                  </strong>
                  {media.ratingCount > 0 && (
                    <span className="text-white/70">
                      ({media.ratingCount}{" "}
                      {media.ratingCount === 1 ? "rating" : "ratings"})
                    </span>
                  )}
                </span>
              )}
              {media.reviewCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="size-4 text-white/70" aria-hidden="true" />
                  {media.reviewCount}{" "}
                  {media.reviewCount === 1 ? "review" : "reviews"}
                </span>
              )}
              {typeof media.reactionCount === "number" &&
                media.reactionCount > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Heart
                      className="size-4 fill-red-500 text-red-500"
                      aria-hidden="true"
                    />
                    {media.reactionCount}{" "}
                    {media.reactionCount === 1 ? "reaction" : "reactions"}
                  </span>
                )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              {media.synopsis}
            </p>

            {/* CTA Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <MediaTrailerPlayer
                title={media.title}
                streamingUrl={primaryStreamingUrl}
              />
              <WatchlistButton mediaId={media.id} />
              {media.isPremium && (
                <MediaCheckoutButtons
                  mediaId={media.id}
                  purchasePrice={purchasePrice}
                  monthlyRentPrice={monthlyRentPrice}
                  yearlyRentPrice={yearlyRentPrice}
                />
              )}
            </div>

            {/* Streaming Platform Watch Link */}
            {availabilities.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {availabilities.map((availability) => (
                  <a
                    key={availability.id}
                    href={availability.streamingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-red-500"
                  >
                    {availability.Platform.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={availability.Platform.logo}
                        alt=""
                        className="size-5 rounded object-contain"
                      />
                    ) : (
                      <Tv className="size-4" aria-hidden="true" />
                    )}
                    Watch on {availability.Platform.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:px-8">
        <section className="space-y-8">
          {/* About / Synopsis */}
          <div className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="text-xl font-bold">About {media.title}</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
              {media.synopsis}
            </p>
          </div>

          {/* Series Seasons and Episodes */}
          {media.type === "SERIES" && (
            <section className="rounded-2xl border bg-card p-6 sm:p-8">
              <h2 className="text-xl font-bold">Seasons and episodes</h2>
              {seasons.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {seasons.map((season, seasonIndex) => (
                    <details
                      key={season.id}
                      open={seasonIndex === 0}
                      className="overflow-hidden rounded-xl border"
                    >
                      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-3 font-medium marker:text-red-600">
                        <span>
                          Season {season.seasonNumber}
                          {season.title ? ` · ${season.title}` : ""}
                        </span>
                        <span className="text-sm font-normal text-muted-foreground">
                          {season.episodes.length}{" "}
                          {season.episodes.length === 1 ? "episode" : "episodes"}
                        </span>
                      </summary>

                      {season.episodes.length > 0 ? (
                        <div className="divide-y border-t">
                          {season.episodes.map((episode) => {
                            const episodeRuntime = formatRuntime(episode.runtime)

                            return (
                              <article
                                key={episode.id}
                                className="flex flex-col gap-4 p-4 sm:flex-row"
                              >
                                <div
                                  className="relative flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted bg-cover bg-center text-muted-foreground sm:w-56"
                                  style={
                                    episode.thumbnail
                                      ? {
                                          backgroundImage: `url("${episode.thumbnail}")`,
                                        }
                                      : undefined
                                  }
                                  role={episode.thumbnail ? "img" : undefined}
                                  aria-label={
                                    episode.thumbnail
                                      ? `${episode.title} thumbnail`
                                      : undefined
                                  }
                                >
                                  {!episode.thumbnail && (
                                    <Film
                                      className="size-8"
                                      aria-hidden="true"
                                    />
                                  )}
                                </div>

                                <div className="flex min-w-0 flex-1 flex-col items-start">
                                  <div className="flex w-full flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                                    <h3 className="font-semibold">
                                      {episode.episodeNumber}. {episode.title}
                                    </h3>
                                    {episodeRuntime && (
                                      <span className="text-sm text-muted-foreground">
                                        {episodeRuntime}
                                      </span>
                                    )}
                                  </div>
                                  {episode.synopsis && (
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                      {episode.synopsis}
                                    </p>
                                  )}
                                  {episode.videoUrl && (
                                    <a
                                      href={episode.videoUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-3 inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                                    >
                                      Watch episode
                                    </a>
                                  )}
                                </div>
                              </article>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="border-t px-4 py-4 text-sm text-muted-foreground">
                          No episodes are available for this season yet.
                        </p>
                      )}
                    </details>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No seasons or episodes are available yet.
                </p>
              )}
            </section>
          )}

          {/* Cast and Crew */}
          {credits.length > 0 && (
            <section className="rounded-2xl border bg-card p-6 sm:p-8">
              <h2 className="text-xl font-bold">Cast & Crew</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {credits.map((credit) => (
                  <article
                    key={credit.id}
                    className="flex items-start gap-4 rounded-xl border bg-card/60 p-4 transition hover:bg-card"
                  >
                    <UserAvatar
                      name={credit.person.name}
                      image={credit.person.photo}
                      className="size-14"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-foreground">
                          {credit.person.name}
                        </h3>
                        <span className="rounded-md border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {formatRoleName(credit.role)}
                        </span>
                      </div>
                      {credit.characterName && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          as{" "}
                          <span className="font-medium text-foreground">
                            {credit.characterName}
                          </span>
                        </p>
                      )}
                      {credit.person.biography && (
                        <p className="mt-2 text-xs leading-5 text-muted-foreground line-clamp-3">
                          {credit.person.biography}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Reviews & Community Section */}
          <section
            id="reviews"
            className="scroll-mt-24 rounded-2xl border bg-card p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Reviews & Discussions</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {media.averageRating > 0
                    ? `${media.averageRating.toFixed(1)} out of 5 · `
                    : ""}
                  {media.reviewCount}{" "}
                  {media.reviewCount === 1 ? "review" : "reviews"}
                  {typeof media.reactionCount === "number" &&
                    media.reactionCount > 0 &&
                    ` · ${media.reactionCount} reactions`}
                </p>
              </div>
              <Button
                nativeButton={false}
                render={
                  <Link
                    href={`/review?mediaId=${encodeURIComponent(media.id)}`}
                  />
                }
              >
                <Star className="size-4" aria-hidden="true" />
                Write a review
              </Button>
            </div>

            {reviews.length > 0 ? (
              <div className="mt-6 space-y-6">
                {reviews.map((review) => {
                  const comments = review.comments ?? []
                  const commentCount =
                    review._count?.comments ??
                    review.commentCount ??
                    countComments(comments)
                  const topLevelComments = comments.filter(
                    (comment) => !comment.parentId,
                  )
                  const reviewer =
                    review.user?.name ?? review.user?.username ?? "Viewer"
                  const reviewDate = formatDate(review.createdAt)

                  const userReviewReaction = review.reviewLikes?.find(
                    (like) => like.userId === currentUserId,
                  )?.type

                  return (
                    <article
                      key={review.id}
                      className="rounded-2xl border bg-card/60 p-5 sm:p-6 transition hover:bg-card"
                    >
                      {/* Reviewer Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={reviewer}
                            image={review.user?.image}
                            className="size-10"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {reviewer}
                              </span>
                              {review.user?.role && (
                                <span className="rounded-md border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                                  {review.user.role}
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                              {reviewDate && <time>{reviewDate}</time>}
                              {review.status && (
                                <span className="capitalize">
                                  · {review.status.toLowerCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Rating stars & spoiler tag */}
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1 rounded-lg border bg-background px-2 py-1 text-sm font-semibold shadow-xs">
                            <Star
                              className="size-4 fill-yellow-400 text-yellow-400"
                              aria-hidden="true"
                            />
                            <span>{review.rating}/5</span>
                          </div>
                          {review.isSpoiler && (
                            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                              Spoiler
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Review Content with Spoiler Guard */}
                      <ReviewSpoilerContent
                        content={review.content}
                        isSpoiler={review.isSpoiler}
                      />

                      {/* Review Reactions */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                        <ReactionPicker
                          targetId={review.id}
                          targetType="review"
                          reactions={review.reviewLikes ?? []}
                          initialActiveReaction={userReviewReaction}
                        />

                        <Button
                          variant="ghost"
                          size="sm"
                          nativeButton={false}
                          render={
                            <Link
                              href={`/comment?mediaId=${encodeURIComponent(media.id)}&reviewId=${encodeURIComponent(review.id)}`}
                            />
                          }
                          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <MessageCircle className="size-3.5" aria-hidden="true" />
                          Comment ({commentCount})
                        </Button>
                      </div>

                      {/* Comments Thread Section */}
                      <div
                        id={`comments-${review.id}`}
                        className="mt-4 rounded-xl border border-border/50 bg-muted/20 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Comments ({commentCount})
                          </h3>
                          <Button
                            variant="outline"
                            size="xs"
                            nativeButton={false}
                            render={
                              <Link
                                href={`/comment?mediaId=${encodeURIComponent(media.id)}&reviewId=${encodeURIComponent(review.id)}`}
                              />
                            }
                            className="text-xs"
                          >
                            <MessageCircle className="size-3 mr-1" aria-hidden="true" />
                            Add comment
                          </Button>
                        </div>

                        {topLevelComments.length > 0 ? (
                          <ul className="mt-3 space-y-3">
                            {topLevelComments.map((comment) => (
                              <CommentThread
                                key={comment.id}
                                comment={comment}
                                allComments={comments}
                                mediaId={media.id}
                                reviewId={review.id}
                                currentUserId={currentUserId}
                              />
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">
                            No comments yet. Start the conversation!
                          </p>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                No reviews yet. Be the first to share your thoughts about{" "}
                {media.title}.
              </p>
            )}
          </section>
        </section>

        {/* Sidebar Details */}
        <aside className="space-y-6">
          <section className="rounded-2xl border bg-card p-6 shadow-xs">
            <h2 className="text-lg font-bold">Title Details</h2>
            <dl className="mt-5 space-y-4 text-sm divide-y divide-border/60">
              <div className="flex justify-between gap-4 pt-3 first:pt-0">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="text-right font-medium">{media.type}</dd>
              </div>

              {releaseDate && (
                <div className="flex justify-between gap-4 pt-3">
                  <dt className="text-muted-foreground">Release date</dt>
                  <dd className="text-right font-medium">{releaseDate}</dd>
                </div>
              )}

              {runtime && (
                <div className="flex justify-between gap-4 pt-3">
                  <dt className="text-muted-foreground">Runtime</dt>
                  <dd className="text-right font-medium">{runtime}</dd>
                </div>
              )}

              <div className="flex justify-between gap-4 pt-3">
                <dt className="text-muted-foreground">Access</dt>
                <dd className="text-right font-medium">
                  {media.isPremium ? (
                    <span className="text-red-500 font-semibold">Premium</span>
                  ) : (
                    "Free"
                  )}
                </dd>
              </div>

              {purchasePrice && (
                <div className="flex justify-between gap-4 pt-3">
                  <dt className="text-muted-foreground">Purchase price</dt>
                  <dd className="text-right font-semibold text-foreground">
                    {purchasePrice}
                  </dd>
                </div>
              )}

              {monthlyRentPrice && (
                <div className="flex justify-between gap-4 pt-3">
                  <dt className="text-muted-foreground">Monthly rent</dt>
                  <dd className="text-right font-medium text-foreground">
                    {monthlyRentPrice}
                  </dd>
                </div>
              )}

              {yearlyRentPrice && (
                <div className="flex justify-between gap-4 pt-3">
                  <dt className="text-muted-foreground">Yearly rent</dt>
                  <dd className="text-right font-medium text-foreground">
                    {yearlyRentPrice}
                  </dd>
                </div>
              )}

              {media.status && (
                <div className="flex justify-between gap-4 pt-3">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="text-right font-medium capitalize">
                    {media.status.toLowerCase()}
                  </dd>
                </div>
              )}

              {media.averageRating > 0 && (
                <div className="flex justify-between gap-4 pt-3">
                  <dt className="text-muted-foreground">Average rating</dt>
                  <dd className="text-right font-medium">
                    {media.averageRating.toFixed(1)} / 5 ({media.ratingCount})
                  </dd>
                </div>
              )}

              {typeof media.reactionCount === "number" && (
                <div className="flex justify-between gap-4 pt-3">
                  <dt className="text-muted-foreground">Total reactions</dt>
                  <dd className="text-right font-medium">
                    {media.reactionCount}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Streaming Platforms Sidebar */}
          {availabilities.length > 0 && (
            <section className="rounded-2xl border bg-card p-6 shadow-xs">
              <h2 className="text-lg font-bold">Available Platforms</h2>
              <ul className="mt-4 space-y-4">
                {availabilities.map((availability) => (
                  <li
                    key={availability.id}
                    className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3"
                  >
                    {availability.Platform.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={availability.Platform.logo}
                        alt=""
                        className="size-11 rounded-lg border bg-background object-contain p-1 shadow-xs"
                      />
                    ) : (
                      <div className="flex size-11 items-center justify-center rounded-lg border bg-muted">
                        <Tv className="size-5" aria-hidden="true" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <a
                        href={availability.streamingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-foreground hover:text-red-600 transition"
                      >
                        {availability.Platform.name}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        Region: {availability.region}
                        {formatDate(availability.availableFrom) &&
                          ` · From ${formatDate(availability.availableFrom)}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </main>
  )
}
