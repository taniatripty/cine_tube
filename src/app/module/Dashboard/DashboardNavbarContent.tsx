"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Clapperboard,
  Search,
  Bell,
  LogOut,
  ExternalLink,
  LayoutDashboard,
  ShieldCheck,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  CheckCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getIconComponent } from "@/lib/iconMapper"
import { getNavSectionsByRole } from "@/lib/navItems"
import { logOutAction } from "@/services/auth.services"
import type { NavSection } from "@/types/dashboard.types"

export type DashboardNavbarUser = {
  name: string
  email: string
  role?: string
}

interface DashboardNavbarContentProps {
  user: DashboardNavbarUser | null
  navItems?: NavSection[]
}

export function DashboardNavbarSkeleton() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center border-b bg-background/95 px-4 md:px-6">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clapperboard className="size-6 text-red-600" />
            <span className="text-lg font-bold">
              Cine<span className="text-red-600">Tube</span>
            </span>
          </div>
          <Skeleton className="hidden sm:block h-5 w-24 rounded-full" />
        </div>

        <div className="hidden flex-1 max-w-md mx-4 md:block">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="hidden sm:flex flex-col gap-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function DashboardNavbarContent({
  user,
  navItems,
}: DashboardNavbarContentProps) {
  const pathname = usePathname()
  const router = useRouter()

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(2)

  // React-recommended way to reset state on route transition without triggering effect warnings
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setIsMobileMenuOpen(false)
    setIsProfileOpen(false)
    setIsNotificationsOpen(false)
  }

  const profileRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const isAdmin = user?.role?.toUpperCase() === "ADMIN" || pathname.startsWith("/admin")
  const activeNavSections =
    navItems && navItems.length > 0
      ? navItems
      : getNavSectionsByRole(user?.role || (isAdmin ? "ADMIN" : "USER"))

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false)
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogOut = async () => {
    try {
      setIsLoggingOut(true)
      await logOutAction()
      router.replace("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ")
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return name.slice(0, 2).toUpperCase()
    }
    if (email && email.trim()) {
      return email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 md:px-6">
      <div className="flex w-full items-center justify-between gap-4">
        {/* Left Section: Brand & Dashboard Indicator */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>

          <Link
            href={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
            className="flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-90"
            aria-label="CineTube dashboard home"
          >
            <Clapperboard className="size-6 text-red-600" aria-hidden="true" />
            <span className="text-lg font-bold">
              Cine<span className="text-red-600">Tube</span>
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-muted-foreground text-sm">/</span>
            <Link
              href={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:opacity-80 transition-opacity"
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="size-3.5" />
                  Admin Portal
                </>
              ) : (
                <>
                  <LayoutDashboard className="size-3.5" />
                  Dashboard
                </>
              )}
            </Link>
          </div>
        </div>

        {/* Center Section: Search Bar */}
        <div className="hidden flex-1 max-w-md mx-4 md:block">
          <form
            action="/search"
            role="search"
            className="relative flex items-center"
          >
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              name="q"
              type="search"
              placeholder={
                isAdmin
                  ? "Search media, users, logs..."
                  : "Search movies, shows..."
              }
              className="h-9 w-full bg-muted/40 pl-9 pr-14 text-sm transition-colors focus-visible:bg-background"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
              ⌘K
            </kbd>
          </form>
        </div>

        {/* Right Section: Actions & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Main Website Link */}
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/" />}
            className="hidden lg:inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-medium"
          >
            <ExternalLink className="size-3.5" />
            <span>Main Site</span>
          </Button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9"
              aria-label="View notifications"
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
            >
              <Bell className="size-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-red-600" />
                </span>
              )}
            </Button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-popover p-3 text-popover-foreground shadow-lg ring-1 ring-foreground/10 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b">
                  <h4 className="text-sm font-semibold">Notifications</h4>
                  {unreadNotifications > 0 && (
                    <button
                      type="button"
                      onClick={() => setUnreadNotifications(0)}
                      className="text-xs text-red-600 hover:text-red-500 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="size-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-2 text-xs">
                  {unreadNotifications > 0 ? (
                    <>
                      <div className="rounded-lg bg-muted/60 p-2.5 transition-colors hover:bg-muted">
                        <p className="font-medium text-foreground">
                          🎬 New Content Available
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          New trending episodes were added to CineTube today.
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/60 p-2.5 transition-colors hover:bg-muted">
                        <p className="font-medium text-foreground">
                          🔔 System Update
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          Dashboard features and security checks are updated.
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="py-4 text-center text-muted-foreground">
                      No unread notifications
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Dropdown */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full p-0.5 ring-offset-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 to-rose-400 font-medium text-white shadow-sm text-xs">
                  {getInitials(user.name, user.email)}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="max-w-[120px] truncate text-xs font-semibold leading-none">
                    {user.name}
                  </p>
                  <p className="max-w-[120px] truncate text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {user.role || "User"}
                  </p>
                </div>
                <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border bg-popover p-2 text-popover-foreground shadow-xl ring-1 ring-foreground/10 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
                  {/* User Profile Card */}
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 mb-1">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 to-rose-400 font-semibold text-white text-sm">
                      {getInitials(user.name, user.email)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {user.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {user.email}
                      </p>
                      <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded bg-red-500/15 text-red-600 dark:text-red-400">
                        {user.role || "MEMBER"}
                      </span>
                    </div>
                  </div>

                 

                  <div className="my-1 border-t border-border" />

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={handleLogOut}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 cursor-pointer disabled:opacity-50"
                  >
                    <LogOut className="size-4" />
                    <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href="/register" />}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer/Dropdown Panel with navItems */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 border-b bg-background p-4 shadow-lg md:hidden animate-in slide-in-from-top-2 duration-150 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <form action="/search" role="search" className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                name="q"
                type="search"
                placeholder="Search..."
                className="pl-9 text-sm"
              />
            </div>
          </form>

          {/* Dynamic Navigation Items grouped by section */}
          <div className="flex flex-col gap-4 text-sm">
            {activeNavSections.map((section, sectionId) => (
              <div key={sectionId} className="space-y-1">
                {section.title && (
                  <h4 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h4>
                )}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = getIconComponent(item.icon)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                          isActive
                            ? "bg-red-500/10 text-red-600 font-semibold dark:bg-red-950/40 dark:text-red-400"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="size-4 text-muted-foreground" />
                        <span>{item.title}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="border-t pt-2">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
              >
                <ExternalLink className="size-4 text-muted-foreground" />
                Back to Main Website
              </Link>
            </div>
          </div>

          {user && (
            <div className="mt-4 border-t pt-3">
              <div className="mb-2 flex items-center gap-2 px-1">
                <UserIcon className="size-4 text-muted-foreground" />
                <span className="text-xs font-semibold">{user.email}</span>
              </div>
              <Button
                variant="destructive"
                className="w-full justify-center text-xs"
                onClick={handleLogOut}
                disabled={isLoggingOut}
              >
                <LogOut className="size-3.5 mr-1" />
                {isLoggingOut ? "Logging out..." : "Log out"}
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
