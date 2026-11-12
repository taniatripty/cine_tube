import { CalendarDays, Clock3, Infinity, Sparkles } from "lucide-react"

const plans = [
  {
    name: "15-Day Plan",
    duration: "15",
    unit: "days",
    description: "A short pass for your next movie marathon.",
    icon: Clock3,
  },
  {
    name: "30-Day Plan",
    duration: "30",
    unit: "days",
    description: "A full month to explore CineTube.",
    icon: CalendarDays,
  },
  {
    name: "Lifetime Plan",
    duration: "Lifetime",
    unit: "access",
    description: "Choose lifetime access to CineTube.",
    icon: Infinity,
  },
]

export default function SubscriptionPlan() {
  return (
    <section
      aria-labelledby="subscription-plans-heading"
      className="relative isolate w-full overflow-hidden bg-slate-950 px-4 py-20 text-white sm:px-6 lg:py-28"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-36 -top-40 size-120 rounded-full bg-red-600/15 blur-3xl motion-safe:animate-pulse" />
        <div className="absolute -bottom-48 -right-24 size-120 rounded-full bg-red-600/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300">
            <Sparkles className="size-4" aria-hidden="true" />
            CineTube plans
          </div>
          <h2
            id="subscription-plans-heading"
            className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"
          >
            Stay for the story.
            <span className="block text-red-500">Choose your time.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-400">
            From a quick watchlist refresh to a lifetime of discoveries, pick
            the access duration that fits you.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {plans.map(({ name, duration, unit, description, icon: Icon }, index) => (
            <article
              key={name}
              className="group relative isolate flex min-h-80 flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-2 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-950/30 motion-reduce:transform-none motion-reduce:transition-none sm:p-8"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-linear-to-br from-white/5 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-20 -z-10 size-56 rounded-full bg-red-600/0 blur-3xl transition-colors duration-500 group-hover:bg-red-600/15"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                  PLAN 0{index + 1}
                </span>
                <div className="grid size-12 place-items-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 transition duration-300 group-hover:scale-110 group-hover:border-red-500/40 group-hover:bg-red-500/20 motion-reduce:transform-none">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </div>

              <h3 className="mt-9 text-xl font-semibold text-white">{name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {description}
              </p>

              <div className="mt-auto border-t border-white/10 pt-7">
                <div className="flex items-end gap-3">
                  <p
                    className={
                      duration === "Lifetime"
                        ? "text-4xl font-black tracking-tight text-white sm:text-5xl"
                        : "text-6xl font-black tracking-tight text-white"
                    }
                  >
                    {duration}
                  </p>
                  {duration !== "Lifetime" && (
                    <span className="pb-2 text-sm font-medium uppercase tracking-[0.18em] text-red-300">
                      {unit}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                  Access duration
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Choose from 15 days, 30 days, or lifetime access.
        </p>
      </div>
    </section>
  )
}