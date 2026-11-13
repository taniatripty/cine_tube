import { Clapperboard } from "lucide-react"

import CreateMediaForm from "./CreateMediaForm"

export default function CreateMediaPage() {
  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-600/20 bg-red-600/10 px-3 py-1.5 text-sm font-medium text-red-600">
            <Clapperboard className="size-4" aria-hidden="true" />
            Media management
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Create media
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Add a movie or show, then optionally connect genres, credits, and
            streaming availability.
          </p>
        </header>
        <CreateMediaForm />
      </div>
    </main>
  )
}