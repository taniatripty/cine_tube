import Link from "next/link"
import { ArrowRight, Bookmark, Clapperboard, Compass, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Compass,
    number: "01",
    title: "Discover",
    description:
      "Explore featured movies and shows to find your next great watch.",
  },
  {
    icon: Bookmark,
    number: "02",
    title: "Save",
    description:
      "Keep the titles you love close and come back to them whenever you like.",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "Make it yours",
    description:
      "Create an account and bring your CineTube experience together.",
  },
]

export default function AboutUs() {
  return (
    <section
      aria-labelledby="about-heading"
      className="relative isolate w-full overflow-hidden bg-slate-950 px-4 py-20 text-white sm:px-6 lg:py-28"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-0 size-104 rounded-full bg-red-600/15 blur-3xl" />
        <div className="absolute -right-36 bottom-0 size-120 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-950/20 to-slate-950" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-300">
              <Clapperboard className="size-4" aria-hidden="true" />
              About CineTube
            </div>
            <h2
              id="about-heading"
              className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Every great watch starts with a
              <span className="text-red-500"> discovery.</span>
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-slate-300 lg:pb-1">
            CineTube brings discovery and your watchlist together, making it
            easier to find movies and shows you will want to come back to.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, number, title, description }) => (
            <article
              key={number}
              className="group rounded-2xl border border-white/10 bg-white/4 p-5 transition-colors hover:border-red-500/40 hover:bg-white/7 sm:p-6"
            >
              <div className="flex items-start justify-between">
                <div className="grid size-11 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition-colors group-hover:bg-red-500/20">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold tracking-[0.15em] text-slate-500">
                  {number}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-5 rounded-2xl border border-white/10 bg-linear-to-r from-red-950/60 via-slate-900/80 to-slate-900/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-lg font-semibold">Your next story is waiting.</p>
            <p className="mt-1 text-sm text-slate-400">
              Start exploring CineTube today.
            </p>
          </div>
          <Button
            size="lg"
            className="shrink-0 bg-red-600 text-white hover:bg-red-500"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            Get started
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  )
}