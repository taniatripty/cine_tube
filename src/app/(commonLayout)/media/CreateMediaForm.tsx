"use client"

import { useState, type FormEvent } from "react"
import { Plus, Trash2 } from "lucide-react"

import { createMediaAction } from "./_actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type {
  CreateMediaAvailability,
  CreateMediaCredit,
  CreateMediaInput,
  MediaLookupOption,
} from "@/services/media.services"

type CreditFormRow = {
  personId: string
  role: string
  characterName: string
  displayOrder: string
}

type AvailabilityFormRow = {
  platformId: string
  streamingUrl: string
  region: string
  availableFrom: string
  availableUntil: string
}

type FormResult = {
  success: boolean
  message: string
}

const CREDIT_ROLES = [
  "DIRECTOR",
  "WRITER",
  "ACTOR",
  "PRODUCER",
  "CINEMATOGRAPHER",
] as const

const MEDIA_TYPES = ["MOVIE", "SERIES"] as const

const emptyCredit: CreditFormRow = {
  personId: "",
  role: "",
  characterName: "",
  displayOrder: "0",
}

const emptyAvailability: AvailabilityFormRow = {
  platformId: "",
  streamingUrl: "",
  region: "GLOBAL",
  availableFrom: "",
  availableUntil: "",
}

type CreateMediaFormProps = {
  genres: MediaLookupOption[]
  people: MediaLookupOption[]
  platforms: MediaLookupOption[]
  lookupError?: string
}

export default function CreateMediaForm({
  genres,
  people,
  platforms,
  lookupError,
}: CreateMediaFormProps) {
  const [credits, setCredits] = useState<CreditFormRow[]>([])
  const [availabilities, setAvailabilities] = useState<
    AvailabilityFormRow[]
  >([])
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<FormResult | null>(null)

  const updateCredit = (
    index: number,
    field: keyof CreditFormRow,
    value: string
  ) => {
    setCredits((rows) =>
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    )
  }

  const updateAvailability = (
    index: number,
    field: keyof AvailabilityFormRow,
    value: string
  ) => {
    setAvailabilities((rows) =>
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const enteredCredits = credits.filter((row) =>
      Object.values(row).some((value) => value.trim())
    )
    const enteredAvailabilities = availabilities.filter((row) =>
      Object.values(row).some((value) => value.trim())
    )

    if (enteredCredits.some((row) => !row.personId.trim() || !row.role.trim())) {
      setResult({
        success: false,
        message: "Each credit needs a person and role.",
      })
      return
    }

    if (
      enteredAvailabilities.some(
        (row) => !row.platformId.trim() || !row.streamingUrl.trim()
      )
    ) {
      setResult({
        success: false,
        message: "Each availability needs a platform and streaming URL.",
      })
      return
    }

    const numberFromForm = (name: string): number | undefined => {
      const value = String(formData.get(name) ?? "").trim()
      return value ? Number(value) : undefined
    }
    const stringFromForm = (name: string): string =>
      String(formData.get(name) ?? "").trim()

    const creditPayload: CreateMediaCredit[] = enteredCredits.map((row) => ({
      personId: row.personId.trim(),
      role: row.role.trim(),
      ...(row.characterName.trim()
        ? { characterName: row.characterName.trim() }
        : {}),
      displayOrder: Number(row.displayOrder) || 0,
    }))

    const availabilityPayload: CreateMediaAvailability[] =
      enteredAvailabilities.map((row) => ({
        platformId: row.platformId.trim(),
        streamingUrl: row.streamingUrl.trim(),
        region: row.region.trim() || "GLOBAL",
        ...(row.availableFrom ? { availableFrom: row.availableFrom } : {}),
        ...(row.availableUntil ? { availableUntil: row.availableUntil } : {}),
      }))

    const genreIds = formData.getAll("genreIds").map(String)

    const payload: CreateMediaInput = {
      title: stringFromForm("title"),
      synopsis: stringFromForm("synopsis"),
      type: stringFromForm("type"),
      isPremium: formData.has("isPremium"),
      ...(stringFromForm("poster")
        ? { poster: stringFromForm("poster") }
        : {}),
      ...(stringFromForm("backdrop")
        ? { backdrop: stringFromForm("backdrop") }
        : {}),
      ...(stringFromForm("releaseDate")
        ? { releaseDate: stringFromForm("releaseDate") }
        : {}),
      ...(numberFromForm("releaseYear") !== undefined
        ? { releaseYear: numberFromForm("releaseYear") }
        : {}),
      ...(numberFromForm("runtime") !== undefined
        ? { runtime: numberFromForm("runtime") }
        : {}),
      ...(numberFromForm("price") !== undefined
        ? { price: numberFromForm("price") }
        : {}),
      ...(stringFromForm("status")
        ? { status: stringFromForm("status") }
        : {}),
      ...(genreIds.length ? { genreIds } : {}),
      ...(creditPayload.length ? { credits: creditPayload } : {}),
      ...(availabilityPayload.length
        ? { availabilities: availabilityPayload }
        : {}),
    }

    setIsPending(true)
    try {
      const actionResult = await createMediaAction(payload)
      setResult(actionResult)

      if (actionResult.success) {
        form.reset()
        setCredits([])
        setAvailabilities([])
      }
    } catch (error) {
      console.error("Create media form submission failed:", error)
      setResult({
        success: false,
        message: "Unable to submit the media details. Please try again.",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {result && (
        <p
          className={
            result.success
              ? "whitespace-pre-line rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
              : "whitespace-pre-line rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
          role={result.success ? "status" : "alert"}
        >
          {result.message}
        </p>
      )}

      {lookupError && (
        <p
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {lookupError}
        </p>
      )}

      <section className="rounded-2xl border bg-card p-5 sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Media details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add the core information and presentation details.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Media type</Label>
            <select
              id="type"
              name="type"
              required
              defaultValue=""
              className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Select a media type</option>
              {MEDIA_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="synopsis">Synopsis</Label>
            <Textarea
              id="synopsis"
              name="synopsis"
              className="min-h-28"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="poster">Poster URL</Label>
            <Input id="poster" name="poster" placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="backdrop">Backdrop URL</Label>
            <Input id="backdrop" name="backdrop" placeholder="https://" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Release and access</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set release information and premium availability.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="releaseDate">Release date</Label>
            <Input id="releaseDate" name="releaseDate" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="releaseYear">Release year</Label>
            <Input
              id="releaseYear"
              name="releaseYear"
              type="number"
              step="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="runtime">Runtime (minutes)</Label>
            <Input id="runtime" name="runtime" type="number" min="1" step="1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" type="number" min="0" step="0.01" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="status">Status</Label>
            <Input
              id="status"
              name="status"
              placeholder="Optional; use a valid status"
            />
          </div>
          <label className="flex items-center gap-3 self-end rounded-xl border px-4 py-3 text-sm sm:col-span-2">
            <input
              name="isPremium"
              type="checkbox"
              className="size-4 accent-red-600"
            />
            Premium media
          </label>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 sm:p-7">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Genres</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select all genres that apply.
          </p>
        </div>
        {genres.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {genres.map((genre) => (
              <label
                key={genre.id}
                className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  name="genreIds"
                  value={genre.id}
                  className="size-4 accent-red-600"
                />
                {genre.name}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {lookupError ? "Genres are unavailable." : "No genres found."}
          </p>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Credits</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Optionally connect people and their roles.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setCredits((rows) => [...rows, { ...emptyCredit }])}
          >
            <Plus aria-hidden="true" />
            Add credit
          </Button>
        </div>

        <div className="space-y-4">
          {credits.map((credit, index) => (
            <fieldset
              key={index}
              className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <legend className="px-1 text-xs font-medium text-muted-foreground">
                Credit {index + 1}
              </legend>
              <div className="space-y-2">
                <Label htmlFor={`credit-person-${index}`}>Person</Label>
                <select
                  id={`credit-person-${index}`}
                  value={credit.personId}
                  onChange={(event) =>
                    updateCredit(index, "personId", event.target.value)
                  }
                  required
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Select a person</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`credit-role-${index}`}>Role</Label>
                <select
                  id={`credit-role-${index}`}
                  value={credit.role}
                  onChange={(event) =>
                    updateCredit(index, "role", event.target.value)
                  }
                  required
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Select a role</option>
                  {CREDIT_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`credit-character-${index}`}>
                  Character name
                </Label>
                <Input
                  id={`credit-character-${index}`}
                  value={credit.characterName}
                  onChange={(event) =>
                    updateCredit(index, "characterName", event.target.value)
                  }
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`credit-order-${index}`}>Display order</Label>
                  <Input
                    id={`credit-order-${index}`}
                    type="number"
                    min="0"
                    step="1"
                    value={credit.displayOrder}
                    onChange={(event) =>
                      updateCredit(index, "displayOrder", event.target.value)
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Remove credit ${index + 1}`}
                  onClick={() =>
                    setCredits((rows) =>
                      rows.filter((_, rowIndex) => rowIndex !== index)
                    )
                  }
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Streaming availability</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Optionally add platforms and availability windows.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setAvailabilities((rows) => [
                ...rows,
                { ...emptyAvailability },
              ])
            }
          >
            <Plus aria-hidden="true" />
            Add platform
          </Button>
        </div>

        <div className="space-y-4">
          {availabilities.map((availability, index) => (
            <fieldset
              key={index}
              className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <legend className="px-1 text-xs font-medium text-muted-foreground">
                Platform {index + 1}
              </legend>
              <div className="space-y-2">
                <Label htmlFor={`platform-id-${index}`}>Platform</Label>
                <select
                  id={`platform-id-${index}`}
                  value={availability.platformId}
                  onChange={(event) =>
                    updateAvailability(index, "platformId", event.target.value)
                  }
                  required
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Select a platform</option>
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`streaming-url-${index}`}>Streaming URL</Label>
                <Input
                  id={`streaming-url-${index}`}
                  type="url"
                  value={availability.streamingUrl}
                  onChange={(event) =>
                    updateAvailability(index, "streamingUrl", event.target.value)
                  }
                  required
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`region-${index}`}>Region</Label>
                  <Input
                    id={`region-${index}`}
                    value={availability.region}
                    onChange={(event) =>
                      updateAvailability(index, "region", event.target.value)
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Remove platform ${index + 1}`}
                  onClick={() =>
                    setAvailabilities((rows) =>
                      rows.filter((_, rowIndex) => rowIndex !== index)
                    )
                  }
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`available-from-${index}`}>Available from</Label>
                <Input
                  id={`available-from-${index}`}
                  type="date"
                  value={availability.availableFrom}
                  onChange={(event) =>
                    updateAvailability(index, "availableFrom", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`available-until-${index}`}>Available until</Label>
                <Input
                  id={`available-until-${index}`}
                  type="date"
                  value={availability.availableUntil}
                  onChange={(event) =>
                    updateAvailability(index, "availableUntil", event.target.value)
                  }
                />
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Creating media..." : "Create media"}
        </Button>
      </div>
    </form>
  )
}
