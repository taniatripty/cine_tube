"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  createPersonAction,
  type CreatePersonActionResult,
} from "@/services/person.services"

export default function CreatePersonForm() {
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<CreatePersonActionResult | null>(null)

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

    const fileValue = formData.get("file")
    const photoFile =
      fileValue instanceof File && fileValue.size > 0 ? fileValue : null
    const biography = String(formData.get("biography") ?? "").trim()

    setIsPending(true)
    try {
      const actionResult = await createPersonAction(
        {
          name,
          ...(biography ? { biography } : {}),
        },
        photoFile,
      )
      setResult(actionResult)

      if (actionResult.success) {
        form.reset()
      }
    } catch (error) {
      console.error("Create person form submission failed:", error)
      setResult({
        success: false,
        message: "Unable to submit the person details. Please try again.",
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
        <Label htmlFor="person-name">Name</Label>
        <Input
          id="person-name"
          name="name"
          autoComplete="name"
          placeholder="Person's full name"
          required
          maxLength={120}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="person-photo">Photo</Label>
        <Input
          id="person-photo"
          name="file"
          type="file"
          accept="image/*"
        />
        <p className="text-sm text-muted-foreground">
          Optional. Choose an image file to upload.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="person-biography">Biography</Label>
        <Textarea
          id="person-biography"
          name="biography"
          className="min-h-36"
          placeholder="Add a short biography"
          maxLength={5000}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating person..." : "Create person"}
      </Button>
    </form>
  )
}
