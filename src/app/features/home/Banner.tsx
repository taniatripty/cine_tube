// import Link from "next/link"
// import { Clock3, Play, Plus, Sparkles, Star } from "lucide-react"

// import { Button } from "@/components/ui/button"

// type BannerProps = {
//   title?: string
//   subtitle?: string
//   description?: string
//   imageUrl?: string
//   rating?: string
//   year?: string
//   duration?: string
//   genres?: string[]
//   primaryHref?: string
//   secondaryHref?: string
// }

// export default function Banner({
//   title = "The Last Horizon",
//   subtitle = "New season • Trending now",
//   description = "A rogue pilot and a gifted scientist race across a fractured galaxy to stop a weapon that could rewrite the fate of humanity.",
//   imageUrl = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
//   rating = "9.4",
//   year = "2026",
//   duration = "2h 18m",
//   genres = ["Sci‑Fi", "Adventure", "Drama"],
//   primaryHref = "/movies/the-last-horizon",
//   secondaryHref = "/watchList",
// }: BannerProps) {
//   return (
//     <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl shadow-slate-950/40">
//       <div className="absolute inset-0">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.28),transparent_35%),linear-gradient(90deg,rgba(2,6,23,0.9),rgba(2,6,23,0.32),rgba(2,6,23,0.8))]" />
//         <div
//           className="absolute inset-0 bg-cover bg-center opacity-75"
//           style={{ backgroundImage: `url(${imageUrl})` }}
//         />
//       </div>

//       <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
//         <div className="max-w-2xl">
//           <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-red-200">
//             <Sparkles className="size-3.5" aria-hidden="true" />
//             {subtitle}
//           </div>

//           <h1 className="max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
//             {title}
//           </h1>

//           <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-200/90">
//             <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
//               <Star className="size-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
//               {rating}
//             </span>
//             <span>{year}</span>
//             <span className="inline-flex items-center gap-1">
//               <Clock3 className="size-3.5" aria-hidden="true" />
//               {duration}
//             </span>
//           </div>

//           <p className="mt-5 max-w-xl text-base leading-7 text-slate-200/85 sm:text-lg">
//             {description}
//           </p>

//           <div className="mt-6 flex flex-wrap gap-2">
//             {genres.map((genre) => (
//               <span
//                 key={genre}
//                 className="rounded-full border border-white/10 bg-slate-900/40 px-3 py-1 text-xs font-medium text-slate-200/90 backdrop-blur-sm"
//               >
//                 {genre}
//               </span>
//             ))}
//           </div>

//           <div className="mt-8 flex flex-wrap gap-3">
//             <Button
//               size="lg"
//               className="bg-red-600 text-white hover:bg-red-500"
//               nativeButton={false}
//               render={<Link href={primaryHref} />}
//             >
//               <Play className="size-4 fill-current" aria-hidden="true" />
//               Watch now
//             </Button>

//             <Button
//               variant="outline"
//               size="lg"
//               className="border-white/15 bg-slate-900/35 text-white hover:bg-slate-800/70"
//               nativeButton={false}
//               render={<Link href={secondaryHref} />}
//             >
//               <Plus className="size-4" aria-hidden="true" />
//               Add to list
//             </Button>
//           </div>
//         </div>

//         <div className="flex items-end justify-end">
//           <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-md">
//             <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-300">
//               <span>Featured</span>
//               <span className="text-red-400">Hot</span>
//             </div>

//             <div className="mt-4 space-y-3">
//               <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
//                 <span className="text-sm text-slate-300">IMDb</span>
//                 <span className="flex items-center gap-1 text-sm font-semibold text-white">
//                   <Star className="size-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
//                   {rating}
//                 </span>
//               </div>

//               <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
//                 <span className="text-sm text-slate-300">Status</span>
//                 <span className="text-sm font-medium text-emerald-400">Streaming</span>
//               </div>

//               <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
//                 <span className="text-sm text-slate-300">Language</span>
//                 <span className="text-sm font-medium text-white">English</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

import Link from "next/link"
import {
  Clock3,
  Play,
  Plus,
  Sparkles,
  Star,
  ChevronRight,
} from "lucide-react"

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
  subtitle = "Featured Premiere",
  description = "A rogue pilot and a gifted scientist race across a fractured galaxy to stop a weapon that could rewrite the fate of humanity.",
  imageUrl = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=2000&q=90",
  rating = "9.4",
  year = "2026",
  duration = "2h 18m",
  genres = ["Sci-Fi", "Adventure", "Drama"],
  primaryHref = "/movies/the-last-horizon",
  secondaryHref = "/watchList",
}: BannerProps) {
  return (
    <section className="group relative isolate min-h-[580px] w-full overflow-hidden rounded-2xl bg-[#08090d] sm:min-h-[620px] lg:min-h-[660px]">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[1500ms] ease-out group-hover:scale-105"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Cinematic gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#08090d] via-[#08090d]/85 to-transparent" />

      <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-[#08090d]/20" />

      <div className="absolute inset-0 bg-black/10" />

      {/* Main content */}
      <div className="relative z-10 flex min-h-[580px] flex-col justify-center px-6 py-16 sm:min-h-[620px] sm:px-10 lg:min-h-[660px] lg:px-16">

        <div className="max-w-2xl">

          {/* Featured label */}
          <div className="mb-7 flex items-center gap-3">
            <span className="h-[2px] w-8 bg-red-500" />

            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-red-400">
              <Sparkles className="size-4" />
              {subtitle}
            </span>
          </div>

          {/* Movie title */}
          <h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
            {title}
            <span className="mt-2 block text-red-500">.</span>
          </h1>

          {/* Movie information */}
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/70">

            <span className="flex items-center gap-1.5 font-bold text-yellow-400">
              <Star className="size-4 fill-current" />
              {rating}
            </span>

            <span>{year}</span>

            <span className="flex items-center gap-2">
              <Clock3 className="size-4" />
              {duration}
            </span>

            <span className="rounded border border-white/20 px-2 py-0.5 text-xs">
              HD
            </span>

          </div>

          {/* Description */}
          <p className="mt-6 max-w-lg text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
            {description}
          </p>

          {/* Genres */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {genres.map((genre) => (
              <span
                key={genre}
                className="border-l-2 border-red-500 pl-3 text-xs font-medium text-white/75"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Buttons */}
          <div className="mt-9 flex flex-wrap items-center gap-4">

            <Button
              size="lg"
              className="h-12 gap-3 rounded-lg bg-red-600 px-7 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all duration-300 hover:scale-105 hover:bg-red-500"
              nativeButton={false}
              render={<Link href={primaryHref} />}
            >
              <Play className="size-4 fill-current" />
              Watch Now
              <ChevronRight className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-12 gap-3 rounded-lg border-white/20 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/15 hover:text-white"
              nativeButton={false}
              render={<Link href={secondaryHref} />}
            >
              <Plus className="size-4" />
              Add to Watchlist
            </Button>

          </div>

          {/* Streaming status */}
          <div className="mt-10 flex items-center gap-3">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-red-500" />
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
              Now streaming on Cine Tube
            </span>
          </div>

        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/10">
          <div className="h-full w-1/4 bg-gradient-to-r from-red-600 to-red-400" />
        </div>

      </div>
    </section>
  )
}
