import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, Clock3, Film, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  getMyPayments,
  type PaymentMediaAccess,
  type PaymentRecord,
} from "@/services/payment.services"

const formatRuntime = (runtime: number | null): string | null => {
  if (runtime === null || runtime <= 0) return null

  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60

  if (hours === 0) return `${minutes}m`
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}

const formatDate = (date: string | null): string | null => {
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

const getUniqueAccesses = (
  accesses: PaymentMediaAccess[],
): PaymentMediaAccess[] => {
  const seen = new Set<string>()
  return accesses.filter((access) => {
    const key = `${access.mediaId}:${access.type}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default function MyPurchasePage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold tracking-tight">My Purchases</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Loading your payments...
            </p>
          </div>
        </main>
      }
    >
      <MyPurchaseContent />
    </Suspense>
  )
}

async function MyPurchaseContent() {
  let payments: PaymentRecord[] = []
  let errorMessage: string | null = null

  try {
    const response = await getMyPayments<PaymentRecord[]>()
    if (!response.success) {
      errorMessage = response.message
    } else {
      payments = response.data ?? []
    }
  } catch (error) {
    console.error("Failed to load payments:", error)
    errorMessage = "Please sign in or try again later."
  }

  if (errorMessage) {
    return (
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold">Payments could not be loaded</h1>
          <p className="mt-2 text-muted-foreground">{errorMessage}</p>
          <Button
            className="mt-6"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Sign in
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
            Your library
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            My Purchases
          </h1>
          <p className="mt-2 text-muted-foreground">
            View the movies and shows you purchased or rented.
          </p>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <Film
              className="mx-auto size-10 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-xl font-semibold">No payments yet</h2>
            <p className="mt-2 text-muted-foreground">
              Your purchases and rentals will appear here.
            </p>
            <Button
              className="mt-6"
              nativeButton={false}
              render={<Link href="/media" />}
            >
              <ArrowLeft aria-hidden="true" />
              Explore titles
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {payments.flatMap((payment) => {
              const accesses = getUniqueAccesses(payment.mediaAccesses ?? [])
              const paymentAmount = `${payment.currency} ${payment.amount}`
              if (accesses.length === 0) {
                return [
                  <article
                    key={payment.id}
                    className="rounded-2xl border bg-card p-5 shadow-sm"
                  >
                    <h2 className="text-lg font-semibold">Media details unavailable</h2>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {payment.status}
                      {payment.amount ? ` · ${paymentAmount}` : ""}
                    </p>
                  </article>,
                ]
              }

              return accesses.map((access) => {
                const { media } = access
                const runtime = formatRuntime(media.runtime)
                const paidDate = formatDate(payment.paidAt ?? payment.createdAt)
                const expiryDate = formatDate(access.expiresAt)
                const poster = media.poster ?? media.backdrop

                return (
                  <article
                    key={`${payment.id}:${access.mediaId}:${access.type}`}
                    className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                  >
                    <Link
                      href={`/media/${encodeURIComponent(media.id)}`}
                      className="group block"
                    >
                      <div
                        className="relative aspect-[16/10] bg-slate-900 bg-cover bg-center"
                        style={
                          poster
                            ? { backgroundImage: `url("${poster}")` }
                            : undefined
                        }
                        role={poster ? "img" : undefined}
                        aria-label={poster ? `${media.title} poster` : undefined}
                      >
                        {!poster && (
                          <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-red-950">
                            <Film
                              className="size-12 text-white/40"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h2 className="text-lg font-semibold group-hover:text-red-600">
                            {media.title}
                          </h2>
                          {media.releaseYear && (
                            <span className="text-sm text-muted-foreground">
                              {media.releaseYear}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {media.synopsis}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                            {media.type.replaceAll("_", " ")}
                          </span>
                          {runtime && (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Clock3 className="size-3.5" aria-hidden="true" />
                              {runtime}
                            </span>
                          )}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                            {access.type.replaceAll("_", " ")}
                          </span>
                          <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                            {payment.status}
                          </span>
                        </div>
                        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                          {payment.amount && <p>Paid {paymentAmount}</p>}
                          {paidDate && <p>Paid on {paidDate}</p>}
                          {expiryDate && <p>Access until {expiryDate}</p>}
                        </div>
                      </div>
                    </Link>
                    <div className="px-5 pb-5">
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={
                          <Link
                            href={`/review?mediaId=${encodeURIComponent(media.id)}`}
                          />
                        }
                      >
                        <Star aria-hidden="true" />
                        Review
                      </Button>
                    </div>
                  </article>
                )
              })
            })}
          </div>
        )}
      </div>
    </main>
  )
}