import { Clock3, Film, Star } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getUserInfo } from "@/services/auth.services"
import { getAllMedia } from "@/services/media.services"

type MediaGenre = {
  id: string
  name: string
}

type MediaItem = {
  id: string
  title: string
  synopsis: string
  poster: string | null
  type: string
  releaseYear: number | null
  runtime: number | null
  isPremium: boolean
  averageRating: number
  reviewCount: number
  genres: MediaGenre[]
}

const formatRuntime = (runtime: number | null): string | null => {
  if (runtime === null || runtime <= 0) return null

  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60

  if (hours === 0) return `${minutes}m`
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}

export default async function Media() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value
  const sessionToken = cookieStore.get("better-auth.session_token")?.value

  if (
    !accessToken ||
    !sessionToken ||
    !(await getUserInfo(accessToken, sessionToken))
  ) {
    redirect("/login")
  }

  let media: MediaItem[]

  try {
    const response = await getAllMedia<MediaItem[]>()
    media = response.data ?? []
  } catch (error) {
    console.error("Failed to load media:", error)

    return (
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold tracking-tight">Explore titles</h2>
          <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Media could not be loaded. Please try again later.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
            Your next favorite
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Explore titles
          </h2>
        </div>

        {media.length === 0 ? (
          <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            No titles are available right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {media.map((item) => {
              const runtime = formatRuntime(item.runtime)

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className="relative aspect-[16/10] bg-slate-900 bg-cover bg-center"
                    style={
                      item.poster
                        ? { backgroundImage: `url("${item.poster}")` }
                        : undefined
                    }
                    role={item.poster ? "img" : undefined}
                    aria-label={item.poster ? `${item.title} poster` : undefined}
                  >
                    {!item.poster && (
                      <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-red-950">
                        <Film
                          className="size-12 text-white/40"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                          {item.type}
                        </span>
                        {item.isPremium && (
                          <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
                            Premium
                          </span>
                        )}
                      </div>
                      {item.averageRating > 0 && (
                        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-white">
                          <Star
                            className="size-4 fill-yellow-400 text-yellow-400"
                            aria-hidden="true"
                          />
                          {item.averageRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="text-lg font-semibold leading-tight">
                        {item.title}
                      </h3>
                      {item.releaseYear && (
                        <span className="text-sm text-muted-foreground">
                          {item.releaseYear}
                        </span>
                      )}
                    </div>

                    <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
                      {item.synopsis}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      {runtime && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="size-3.5" aria-hidden="true" />
                          {runtime}
                        </span>
                      )}
                      {item.reviewCount > 0 && (
                        <span>
                          {item.reviewCount}{" "}
                          {item.reviewCount === 1 ? "review" : "reviews"}
                        </span>
                      )}
                    </div>

                    {item.genres.length > 0 && (
                      <div className="flex flex-wrap gap-2 border-t pt-3">
                        {item.genres.map((genre) => (
                          <span
                            key={genre.id}
                            className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}