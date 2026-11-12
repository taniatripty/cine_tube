import Link from "next/link"
import { Clock3, Play, Plus, Sparkles, Star } from "lucide-react"

import { Button } from "@/components/ui/button"

type BannerProps = {
  title?: string
  subtitle?: string
  description?: string
  imageUrl?: string
  rating?: string
  year?: string
  duration?: string
  genres?: string[]
  primaryHref?: string
  secondaryHref?: string
}

export default function Banner({
  title = "The Last Horizon",
  subtitle = "New season • Trending now",
  description = "A rogue pilot and a gifted scientist race across a fractured galaxy to stop a weapon that could rewrite the fate of humanity.",
  imageUrl = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
  rating = "9.4",
  year = "2026",
  duration = "2h 18m",
  genres = ["Sci‑Fi", "Adventure", "Drama"],
  primaryHref = "/movies/the-last-horizon",
  secondaryHref = "/my-list",
}: BannerProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl shadow-slate-950/40">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.28),transparent_35%),linear-gradient(90deg,rgba(2,6,23,0.9),rgba(2,6,23,0.32),rgba(2,6,23,0.8))]" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-75"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      </div>

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-red-200">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {subtitle}
          </div>

          <h1 className="max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-200/90">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              <Star className="size-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              {rating}
            </span>
            <span>{year}</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" aria-hidden="true" />
              {duration}
            </span>
          </div>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200/85 sm:text-lg">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-white/10 bg-slate-900/40 px-3 py-1 text-xs font-medium text-slate-200/90 backdrop-blur-sm"
              >
                {genre}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-red-600 text-white hover:bg-red-500"
              nativeButton={false}
              render={<Link href={primaryHref} />}
            >
              <Play className="size-4 fill-current" aria-hidden="true" />
              Watch now
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-white/15 bg-slate-900/35 text-white hover:bg-slate-800/70"
              nativeButton={false}
              render={<Link href={secondaryHref} />}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add to list
            </Button>
          </div>
        </div>

        <div className="flex items-end justify-end">
          <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-300">
              <span>Featured</span>
              <span className="text-red-400">Hot</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-sm text-slate-300">IMDb</span>
                <span className="flex items-center gap-1 text-sm font-semibold text-white">
                  <Star className="size-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                  {rating}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-sm text-slate-300">Status</span>
                <span className="text-sm font-medium text-emerald-400">Streaming</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-sm text-slate-300">Language</span>
                <span className="text-sm font-medium text-white">English</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
