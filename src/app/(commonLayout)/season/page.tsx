"use client"

import { useState, type FormEvent } from "react"
import { Clapperboard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  createSeasonAction,
  type CreateSeasonActionResult,
} from "@/services/season.services"

export default function CreateSeasonPage() {
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<CreateSeasonActionResult | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const mediaId = String(formData.get("mediaId") ?? "").trim()
    const seasonNumberValue = String(formData.get("seasonNumber") ?? "").trim()
    const seasonNumber = Number(seasonNumberValue)
    const title = String(formData.get("title") ?? "").trim()

    if (!mediaId) {
      setResult({ success: false, message: "Series ID is required." })
      return
    }

    if (
      !seasonNumberValue ||
      !Number.isInteger(seasonNumber) ||
      seasonNumber <= 0
    ) {
      setResult({
        success: false,
        message: "Season number must be a positive whole number.",
      })
      return
    }

    setIsPending(true)
    try {
      const actionResult = await createSeasonAction({
        mediaId,
        seasonNumber,
        ...(title ? { title } : {}),
      })
      setResult(actionResult)

      if (actionResult.success) {
        form.reset()
      }
    } catch (error) {
      console.error("Create season form submission failed:", error)
      setResult({
        success: false,
        message:
          error instanceof Error
            ? `Unable to submit the season details: ${error.message}`
            : "Unable to submit the season details. Please try again.",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-600/20 bg-red-600/10 px-3 py-1.5 text-sm font-medium text-red-600">
            <Clapperboard className="size-4" aria-hidden="true" />
            Season management
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Create season
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Add a season to an existing series using its media ID.
          </p>
        </header>

        <form
          className="space-y-6 rounded-2xl border bg-card p-5 sm:p-7"
          onSubmit={handleSubmit}
        >
          {result && (
            <p
              className={
                result.success
                  ? "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
                  : "rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              }
              role={result.success ? "status" : "alert"}
            >
              {result.message}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="season-media-id">Series media ID</Label>
            <Input
              id="season-media-id"
              name="mediaId"
              placeholder="Enter the series media ID"
              required
            />
            <p className="text-sm text-muted-foreground">
              The ID must belong to an existing series.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="season-number">Season number</Label>
            <Input
              id="season-number"
              name="seasonNumber"
              type="number"
              min="1"
              step="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="season-title">Title</Label>
            <Input
              id="season-title"
              name="title"
              placeholder="Optional season title"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating season..." : "Create season"}
          </Button>
        </form>
      </div>
    </main>
  )
}