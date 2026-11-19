"use client"

import { useState, useTransition } from "react"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  createMediaCheckout,
  type MediaCheckoutAccessType,
} from "@/services/payment.actions"

type MediaCheckoutButtonsProps = {
  mediaId: string
  purchasePrice: string | null
  monthlyRentPrice: string | null
  yearlyRentPrice: string | null
}

export default function MediaCheckoutButtons({
  mediaId,
  purchasePrice,
  monthlyRentPrice,
  yearlyRentPrice,
}: MediaCheckoutButtonsProps) {
  const [pendingAccessType, setPendingAccessType] =
    useState<MediaCheckoutAccessType | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const startCheckout = (accessType: MediaCheckoutAccessType) => {
    setErrorMessage(null)
    setPendingAccessType(accessType)

    startTransition(async () => {
      const result = await createMediaCheckout(mediaId, accessType)

      if (!result.success || !result.url) {
        setErrorMessage(result.message)
        setPendingAccessType(null)
        return
      }

      window.location.assign(result.url)
    })
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Button
          className="min-h-10 bg-red-600 px-4 text-white hover:bg-red-500"
          type="button"
          disabled={isPending}
          onClick={() => startCheckout("PURCHASE")}
        >
          <ShoppingCart aria-hidden="true" />
          {pendingAccessType === "PURCHASE"
            ? "Opening checkout..."
            : purchasePrice
              ? `Purchase · ${purchasePrice}`
              : "Purchase"}
        </Button>
        {monthlyRentPrice && (
          <Button
            variant="outline"
            className="min-h-10 border-white/30 bg-black/30 px-4 text-white hover:bg-white/10 hover:text-white"
            type="button"
            disabled={isPending}
            onClick={() => startCheckout("RENT_MONTH")}
          >
            {pendingAccessType === "RENT_MONTH"
              ? "Opening checkout..."
              : `Rent · 1 month · ${monthlyRentPrice}`}
          </Button>
        )}
        {yearlyRentPrice && (
          <Button
            variant="outline"
            className="min-h-10 border-white/30 bg-black/30 px-4 text-white hover:bg-white/10 hover:text-white"
            type="button"
            disabled={isPending}
            onClick={() => startCheckout("RENT_YEAR")}
          >
            {pendingAccessType === "RENT_YEAR"
              ? "Opening checkout..."
              : `Rent · 1 year · ${yearlyRentPrice}`}
          </Button>
        )}
      </div>
      {errorMessage && (
        <p className="mt-2 text-sm text-red-200" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
