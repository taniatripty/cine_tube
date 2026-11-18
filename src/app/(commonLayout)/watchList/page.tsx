import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, Film } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  getMyWatchList,
  type WatchListEntry,
} from "@/services/watchList.services"
import RemoveWatchlistButton from "./RemoveWatchlistButton"

export default function WatchListPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold tracking-tight">My Watchlist</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Loading your watchlist...
            </p>
          </div>
        </main>
      }
    >
      <WatchListContent />
    </Suspense>
  )
}

async function WatchListContent() {
  let watchList: WatchListEntry[] = []
  let errorMessage: string | null = null
  let errorHref = "/"
  let errorAction = "Back to titles"

  try {
    const response = await getMyWatchList()
    if (!response.success) {
      errorMessage = response.message
    } else {
      watchList = response.data ?? []
    }
  } catch (error) {
    console.error("Failed to load watchlist:", error)
    errorMessage = "Please sign in or try again later."
    errorHref = "/login"
    errorAction = "Sign in"
  }

  if (errorMessage) {
    return (
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold">
            Watchlist could not be loaded
          </h1>
          <p className="mt-2 text-muted-foreground">{errorMessage}</p>
          <Button
            className="mt-6"
            nativeButton={false}
            render={<Link href={errorHref} />}
          >
            {errorHref === "/" && <ArrowLeft aria-hidden="true" />}
            {errorAction}
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
            Saved for later
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            My Watchlist
          </h1>
        </div>

        {watchList.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <Film
              className="mx-auto size-10 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-xl font-semibold">Your watchlist is empty</h2>
            <p className="mt-2 text-muted-foreground">
              Add movies and shows to keep them all in one place.
            </p>
            <Button
              className="mt-6"
              nativeButton={false}
              render={<Link href="/media" />}
            >
              Explore titles
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {watchList.map(({ media }) => (
              <article
                key={media.id}
                className="overflow-hidden rounded-2xl border bg-card shadow-sm"
              >
                <Link
                  href={`/media/${encodeURIComponent(media.id)}`}
                  className="group block"
                >
                  <div
                    className="relative aspect-[16/10] bg-slate-900 bg-cover bg-center"
                    style={
                      media.poster
                        ? { backgroundImage: `url("${media.poster}")` }
                        : undefined
                    }
                    role={media.poster ? "img" : undefined}
                    aria-label={
                      media.poster ? `${media.title} poster` : undefined
                    }
                  >
                    {!media.poster && (
                      <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-red-950">
                        <Film
                          className="size-12 text-white/40"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="text-lg font-semibold group-hover:text-red-600">
                        {media.title}
                      </h2>
                      {media.releaseYear && (
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {media.releaseYear}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {media.synopsis}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                        {media.type}
                      </span>
                      {media.isPremium && (
                        <span className="rounded-full bg-red-600 px-2.5 py-1 font-semibold text-white">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="px-5 pb-5">
                  <RemoveWatchlistButton mediaId={media.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}