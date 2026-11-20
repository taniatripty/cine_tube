import { Suspense } from "react"
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Film,
  MessageCircle,
  Star,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { getMediaById } from "@/services/media.services"
import type { ReactionSummary } from "@/types/reaction.types"
import MediaCheckoutButtons from "./MediaCheckoutButtons"
import ReactionPicker from "./ReactionPicker"
import WatchlistButton from "./WatchlistButton"

type MediaGenre = {
  id: string
  name: string
}

type MediaCredit = {
  id: string
  role: string
  characterName: string | null
  person: {
    id: string
    name: string
    photo: string | null
    biography: string | null
  }
}

type MediaAvailability = {
  id: string
  streamingUrl: string
  region: string
  availableFrom: string | null
  availableUntil: string | null
  Platform: {
    id: string
    name: string
    logo: string | null
    website: string | null
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

type MediaComment = {
  id: string
  content: string
  createdAt?: string | null
  parentId?: string | null
  commentLikes?: ReactionSummary[] | null
  replies?: MediaComment[] | null
  user?: {
    name?: string | null
    username?: string | null
  } | null
}

type MediaReview = {
  id: string
  rating: number
  content: string
  isSpoiler?: boolean
  createdAt?: string | null
  reviewLikes?: ReactionSummary[] | null
  user?: {
    name?: string | null
    username?: string | null
  } | null
  comments?: MediaComment[] | null
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
  status: string
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
  ancestorIds = [],
}: {
  comment: MediaComment
  allComments: MediaComment[]
  mediaId: string
  reviewId: string
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

  return (
    <li className="rounded-lg bg-muted/50 px-3 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="font-medium">{commenter}</span>
        {commentDate && (
          <time className="text-muted-foreground">{commentDate}</time>
        )}
      </div>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
        {comment.content}
      </p>
      <ReactionPicker
        targetId={comment.id}
        targetType="comment"
        reactions={comment.commentLikes ?? []}
      />
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href={replyHref} />}
        className="mt-2"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        Reply
      </Button>
      {replies.length > 0 && (
        <ul className="mt-3 space-y-3 border-l-2 pl-4">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              allComments={allComments}
              mediaId={mediaId}
              reviewId={reviewId}
              ancestorIds={currentAncestorIds}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

const formatPrice = (price: string | null): string | null => {
  if (!price) return null

  const parsedPrice = Number(price)
  if (!Number.isFinite(parsedPrice)) return null

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }).format(parsedPrice)
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
          <p className="mt-2 text-muted-foreground">
            Please try again later.
          </p>
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

  return (
    <main className="flex-1">
      <section
        className="relative isolate min-h-[32rem] overflow-hidden bg-slate-950 bg-cover bg-center text-white"
        style={
          media.backdrop
            ? { backgroundImage: `url("${media.backdrop}")` }
            : undefined
        }
        aria-label={`${media.title} details`}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-black/35" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        <div className="mx-auto flex min-h-[32rem] max-w-7xl items-end gap-8 px-4 py-12 sm:px-6 lg:px-8">
          {media.poster && (
            <div
              className="hidden aspect-[2/3] w-48 shrink-0 rounded-xl bg-cover bg-center shadow-2xl md:block"
              style={{ backgroundImage: `url("${media.poster}")` }}
              role="img"
              aria-label={`${media.title} poster`}
            />
          )}
          <div className="max-w-3xl flex-1">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-white/80 transition hover:text-white"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to titles
            </Link>

            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/25 bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                {media.type}
              </span>
              {media.isPremium && (
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold">
                  Premium
                </span>
              )}
              {media.status && (
                <span className="rounded-full border border-white/25 bg-black/40 px-3 py-1 text-xs font-semibold">
                  {media.status}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {media.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/80">
              {media.releaseYear && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {media.releaseYear}
                </span>
              )}
              {runtime && (
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4" aria-hidden="true" />
                  {runtime}
                </span>
              )}
              {media.averageRating > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Star
                    className="size-4 fill-yellow-400 text-yellow-400"
                    aria-hidden="true"
                  />
                  {media.averageRating.toFixed(1)}
                  {media.ratingCount > 0 && (
                    <span>({media.ratingCount} ratings)</span>
                  )}
                </span>
              )}
              {media.reviewCount > 0 && (
                <span>
                  {media.reviewCount}{" "}
                  {media.reviewCount === 1 ? "review" : "reviews"}
                </span>
              )}
            </div>

            {genres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              {media.synopsis}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
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

            {availabilities.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-3">
                {availabilities.map((availability) => (
                  <a
                    key={availability.id}
                    href={availability.streamingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                  >
                    {availability.Platform.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={availability.Platform.logo}
                        alt=""
                        className="size-5 rounded object-contain"
                      />
                    ) : (
                      <Film className="size-4" aria-hidden="true" />
                    )}
                    Watch on {availability.Platform.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)] lg:px-8">
        <section className="space-y-8">
          <div className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="text-xl font-semibold">About this title</h2>
            <p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">
              {media.synopsis}
            </p>
          </div>

          {media.type === "SERIES" && (
            <section className="rounded-2xl border bg-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold">Seasons and episodes</h2>
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

          {credits.length > 0 && (
            <section className="rounded-2xl border bg-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold">Cast and crew</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {credits.map((credit) => (
                  <article
                    key={credit.id}
                    className="flex items-start gap-4 rounded-xl border p-4"
                  >
                    {credit.person.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={credit.person.photo}
                        alt=""
                        className="size-12 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Film className="size-5" aria-hidden="true" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-medium">{credit.person.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {credit.role}
                        {credit.characterName
                          ? ` · ${credit.characterName}`
                          : ""}
                      </p>
                      {credit.person.biography && (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {credit.person.biography}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section
            id="reviews"
            className="scroll-mt-24 rounded-2xl border bg-card p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Reviews</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {media.averageRating > 0
                    ? `${media.averageRating.toFixed(1)} out of 5 · `
                    : ""}
                  {media.reviewCount}{" "}
                  {media.reviewCount === 1 ? "review" : "reviews"}
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
                Add a review
              </Button>
            </div>

            {reviews.length > 0 ? (
              <div className="mt-6 space-y-4">
                {reviews.map((review) => {
                  const comments = review.comments ?? []
                  const commentCount = countComments(comments)
                  const topLevelComments = comments.filter(
                    (comment) => !comment.parentId,
                  )
                  const reviewer =
                    review.user?.name ?? review.user?.username ?? "Viewer"
                  const reviewDate = formatDate(review.createdAt)

                  return (
                    <article
                      key={review.id}
                      className="rounded-xl border p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-medium">{reviewer}</span>
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Star
                              className="size-4 fill-yellow-400 text-yellow-400"
                              aria-hidden="true"
                            />
                            {review.rating}/5
                          </span>
                          {reviewDate && (
                            <time className="text-sm text-muted-foreground">
                              {reviewDate}
                            </time>
                          )}
                        </div>
                        {review.isSpoiler && (
                          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                            Spoiler
                          </span>
                        )}
                      </div>

                      <p className="mt-3 whitespace-pre-line text-sm leading-6">
                        {review.content}
                      </p>

                      <ReactionPicker
                        targetId={review.id}
                        targetType="review"
                        reactions={review.reviewLikes ?? []}
                      />

                      <div
                        id={`comments-${review.id}`}
                        className="mt-4 border-t pt-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold">
                            Comments ({commentCount})
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            nativeButton={false}
                            render={
                              <Link
                                href={`/comment?mediaId=${encodeURIComponent(media.id)}&reviewId=${encodeURIComponent(review.id)}`}
                              />
                            }
                          >
                            <MessageCircle
                              className="size-4"
                              aria-hidden="true"
                            />
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
                              />
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-sm text-muted-foreground">
                            No comments yet.
                          </p>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                No reviews yet. Be the first to share your thoughts.
              </p>
            )}
          </section>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Details</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="text-right font-medium">{media.type}</dd>
              </div>
              {releaseDate && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Release date</dt>
                  <dd className="text-right font-medium">{releaseDate}</dd>
                </div>
              )}
              {runtime && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Runtime</dt>
                  <dd className="text-right font-medium">{runtime}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Access</dt>
                <dd className="text-right font-medium">
                  {media.isPremium ? "Premium" : "Free"}
                </dd>
              </div>
            </dl>
          </section>

          {availabilities.length > 0 && (
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="text-lg font-semibold">Streaming availability</h2>
              <ul className="mt-4 space-y-4">
                {availabilities.map((availability) => (
                  <li key={availability.id} className="flex gap-3">
                    {availability.Platform.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={availability.Platform.logo}
                        alt=""
                        className="size-10 rounded-lg border object-contain p-1"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                        <Film className="size-4" aria-hidden="true" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <a
                        href={availability.streamingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:text-red-600"
                      >
                        {availability.Platform.name}
                      </a>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {availability.region}
                        {formatDate(availability.availableFrom) &&
                          ` · From ${formatDate(availability.availableFrom)}`}
                        {formatDate(availability.availableUntil) &&
                          ` · Until ${formatDate(availability.availableUntil)}`}
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