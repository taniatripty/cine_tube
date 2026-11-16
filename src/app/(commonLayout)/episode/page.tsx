"use client"

import { useState, type FormEvent } from "react"
import { Clapperboard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  createEpisodeAction,
  type CreateEpisodeActionResult,
} from "@/services/episode.services"

export default function CreateEpisodePage() {
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<CreateEpisodeActionResult | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const seasonId = String(formData.get("seasonId") ?? "").trim()
    const episodeNumberValue = String(
      formData.get("episodeNumber") ?? "",
    ).trim()
    const episodeNumber = Number(episodeNumberValue)
    const title = String(formData.get("title") ?? "").trim()
    const synopsis = String(formData.get("synopsis") ?? "").trim()
    const runtimeValue = String(formData.get("runtime") ?? "").trim()
    const runtime = runtimeValue ? Number(runtimeValue) : undefined
    const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim()
    const videoUrl = String(formData.get("videoUrl") ?? "").trim()
    const thumbnailValue = formData.get("thumbnailFile")
    const thumbnailFile =
      thumbnailValue instanceof File && thumbnailValue.size > 0
        ? thumbnailValue
        : null

    if (!seasonId || !title) {
      setResult({
        success: false,
        message: "Season ID and episode title are required.",
      })
      return
    }

    if (
      !episodeNumberValue ||
      !Number.isInteger(episodeNumber) ||
      episodeNumber <= 0
    ) {
      setResult({
        success: false,
        message: "Episode number must be a positive whole number.",
      })
      return
    }

    if (
      runtime !== undefined &&
      (!Number.isInteger(runtime) || runtime <= 0)
    ) {
      setResult({
        success: false,
        message: "Runtime must be a positive whole number.",
      })
      return
    }

    setIsPending(true)
    try {
      const actionResult = await createEpisodeAction(
        {
          seasonId,
          episodeNumber,
          title,
          ...(synopsis ? { synopsis } : {}),
          ...(runtime !== undefined ? { runtime } : {}),
          ...(!thumbnailFile && thumbnailUrl
            ? { thumbnail: thumbnailUrl }
            : {}),
          ...(videoUrl ? { videoUrl } : {}),
        },
        thumbnailFile,
      )
      setResult(actionResult)

      if (actionResult.success) {
        form.reset()
      }
    } catch (error) {
      console.error("Create episode form submission failed:", error)
      setResult({
        success: false,
        message:
          error instanceof Error
            ? `Unable to submit the episode details: ${error.message}`
            : "Unable to submit the episode details. Please try again.",
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
            Episode management
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Create episode
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Add an episode to an existing season.
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
            <Label htmlFor="episode-season-id">Season ID</Label>
            <Input
              id="episode-season-id"
              name="seasonId"
              placeholder="Enter the season ID"
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="episode-number">Episode number</Label>
              <Input
                id="episode-number"
                name="episodeNumber"
                type="number"
                min="1"
                step="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="episode-runtime">Runtime (minutes)</Label>
              <Input
                id="episode-runtime"
                name="runtime"
                type="number"
                min="1"
                step="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="episode-title">Title</Label>
            <Input
              id="episode-title"
              name="title"
              placeholder="Episode title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="episode-synopsis">Synopsis</Label>
            <Textarea
              id="episode-synopsis"
              name="synopsis"
              className="min-h-28"
              placeholder="Optional episode synopsis"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="episode-thumbnail-file">Thumbnail image</Label>
            <Input
              id="episode-thumbnail-file"
              name="thumbnailFile"
              type="file"
              accept="image/*"
            />
            <Label htmlFor="episode-thumbnail-url">Or use a thumbnail URL</Label>
            <Input
              id="episode-thumbnail-url"
              name="thumbnailUrl"
              type="url"
              placeholder="https://"
            />
            <p className="text-sm text-muted-foreground">
              If both are provided, the uploaded image is used.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="episode-video-url">Video URL</Label>
            <Input
              id="episode-video-url"
              name="videoUrl"
              type="url"
              placeholder="https://"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating episode..." : "Create episode"}
          </Button>
        </form>
      </div>
    </main>
  )
}