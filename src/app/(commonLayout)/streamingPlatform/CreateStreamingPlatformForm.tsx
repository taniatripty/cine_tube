"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  createStreamingPlatformAction,
  type CreateStreamingPlatformActionResult,
} from "@/services/streamingPlatform.services"

export default function CreateStreamingPlatformForm() {
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] =
    useState<CreateStreamingPlatformActionResult | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get("name") ?? "").trim()

    if (!name) {
      setResult({ success: false, message: "Name is required." })
      return
    }

    setIsPending(true)
    try {
      formData.set("name", name)
      const actionResult = await createStreamingPlatformAction(formData)
      setResult(actionResult)

      if (actionResult.success) {
        form.reset()
      }
    } catch (error) {
      console.error("Create streaming platform form submission failed:", error)
      setResult({
        success: false,
        message:
          error instanceof Error
            ? `Unable to submit the streaming platform details: ${error.message}`
            : "Unable to submit the streaming platform details. Please try again.",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
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
        <Label htmlFor="streaming-platform-name">Name</Label>
        <Input
          id="streaming-platform-name"
          name="name"
          placeholder="Streaming platform name"
          required
          maxLength={120}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="streaming-platform-logo">Logo</Label>
        <Input
          id="streaming-platform-logo"
          name="file"
          type="file"
          accept="image/*"
        />
        <p className="text-sm text-muted-foreground">
          Optional. Choose an image file to upload.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="streaming-platform-website">Website</Label>
        <Input
          id="streaming-platform-website"
          name="website"
          type="url"
          placeholder="https://example.com"
        />
        <p className="text-sm text-muted-foreground">
          Optional. Enter the platform&apos;s website.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating platform..." : "Create platform"}
      </Button>
    </form>
  )
}
