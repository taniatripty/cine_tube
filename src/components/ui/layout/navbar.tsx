"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Clapperboard, Menu, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  getCurrentUserAction,
  logOutAction,
} from "@/services/auth.services"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "TV Shows", href: "/tv-shows" },
  { label: "My List", href: "/watchList" },
]

type NavbarUser = {
  name: string
  email: string
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<NavbarUser | null>(null)
  const [authPending, setAuthPending] = useState(true)

  useEffect(() => {
    let active = true

    getCurrentUserAction()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser)
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to load navbar user:", error)
        if (active) {
          setUser(null)
        }
      })
      .finally(() => {
        if (active) {
          setAuthPending(false)
        }
      })

    return () => {
      active = false
    }
  }, [pathname])

  const handleLogOut = async () => {
    await logOutAction()
    setUser(null)
    router.replace("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
          aria-label="CineTube home"
        >
          <Clapperboard className="size-6 text-red-600" aria-hidden="true" />
          <span className="text-lg">
            Cine<span className="text-red-600">Tube</span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {navigationLinks.map((link) => (
            <Button
              key={link.label}
              variant="ghost"
              nativeButton={false}
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form
            action="/search"
            role="search"
            className="hidden w-56 items-center gap-2 sm:flex lg:w-72"
          >
            <label htmlFor="navbar-search" className="sr-only">
              Search movies and shows
            </label>
            <Input
              id="navbar-search"
              name="q"
              type="search"
              placeholder="Search movies and shows"
              className="h-9"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label="Search"
            >
              <Search aria-hidden="true" />
            </Button>
          </form>

          {authPending ? (
            <div
              className="hidden h-9 w-40 animate-pulse rounded-md bg-muted sm:block"
              aria-hidden="true"
            />
          ) : user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <div className="max-w-40 text-right">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <form action={handleLogOut}>
                <Button type="submit" variant="outline">
                  Log out
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Sign in
              </Button>
              <Button nativeButton={false} render={<Link href="/register" />}>
                Register
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation menu"
                />
              }
            >
              <Menu aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 max-w-[85vw]">
              <SheetHeader>
                <SheetTitle>Explore CineTube</SheetTitle>
              </SheetHeader>
              <nav
                aria-label="Mobile navigation"
                className="flex flex-col gap-1 px-4"
              >
                {navigationLinks.map((link) => (
                  <Button
                    key={link.label}
                    variant="ghost"
                    className="justify-start"
                    nativeButton={false}
                    render={<Link href={link.href} />}
                  >
                    {link.label}
                  </Button>
                ))}
                <form action="/search" role="search" className="mt-3 flex gap-2">
                  <label htmlFor="mobile-navbar-search" className="sr-only">
                    Search movies and shows
                  </label>
                  <Input
                    id="mobile-navbar-search"
                    name="q"
                    type="search"
                    placeholder="Search movies and shows"
                  />
                  <Button type="submit" size="icon" aria-label="Search">
                    <Search aria-hidden="true" />
                  </Button>
                </form>
                {authPending ? null : user ? (
                  <div className="mt-3 space-y-3 rounded-md border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <form action={handleLogOut}>
                      <Button type="submit" variant="outline" className="w-full">
                        Log out
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      nativeButton={false}
                      render={<Link href="/login" />}
                    >
                      Sign in
                    </Button>
                    <Button
                      nativeButton={false}
                      render={<Link href="/register" />}
                    >
                      Register
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}