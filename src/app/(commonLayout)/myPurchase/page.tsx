import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, Film } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getMyPayments } from "@/services/payment.services"

type PaymentMedia = {
  id?: string
  title?: string
  poster?: string | null
}

type PaymentRecord = {
  id: string
  mediaId?: string | null
  accessType?: string | null
  status?: string | null
  createdAt?: string | null
  media?: PaymentMedia | null
  Media?: PaymentMedia | null
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
            {payments.map((payment) => {
              const media = payment.media ?? payment.Media
              const mediaId = media?.id ?? payment.mediaId
              const title = media?.title ?? "Purchased media"
              const poster = media?.poster ?? null
              const content = (
                <>
                  <div
                    className="relative aspect-[16/10] bg-slate-900 bg-cover bg-center"
                    style={
                      poster
                        ? { backgroundImage: `url("${poster}")` }
                        : undefined
                    }
                    role={poster ? "img" : undefined}
                    aria-label={poster ? `${title} poster` : undefined}
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
                    <h2 className="text-lg font-semibold group-hover:text-red-600">
                      {title}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      {payment.accessType && (
                        <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                          {payment.accessType.replaceAll("_", " ")}
                        </span>
                      )}
                      {payment.status && (
                        <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                          {payment.status}
                        </span>
                      )}
                    </div>
                    {payment.createdAt && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </>
              )

              return (
                <article
                  key={payment.id}
                  className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                >
                  {mediaId ? (
                    <Link
                      href={`/media/${encodeURIComponent(mediaId)}`}
                      className="group block"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div>{content}</div>
                  )}
                  {!mediaId && (
                    <p className="px-5 pb-5 text-sm text-muted-foreground">
                      Media details are unavailable.
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}