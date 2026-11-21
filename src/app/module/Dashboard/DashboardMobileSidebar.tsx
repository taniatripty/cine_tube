"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Clapperboard, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { NavSection } from "@/types/dashboard.types"
import type { userInfo } from "@/types/user.types"
import { getIconComponent } from "@/lib/iconMapper"

interface DashboardMobileSidebarProps {
  userInfo?: userInfo | null
  navItems: NavSection[]
  dashboardHome: string;
}

export default function DashboardMobileSidebar({
  userInfo,
  navItems,
  dashboardHome,
}: DashboardMobileSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open sidebar"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        {/* Logo / Brand */}
        <SheetHeader className="h-16 flex items-center justify-start border-b px-6">
          <SheetTitle >
            <Link
              href={dashboardHome}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <Clapperboard className="size-6 text-red-600" aria-hidden="true" />
              <span className="text-xl font-bold">
                Cine<span className="text-red-600">Tube</span>
              </span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <nav className="space-y-6 py-4">
              {navItems.map((section, sectionId) => (
                <div key={sectionId} className="space-y-2">
                  {section.title && (
                    <h4 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.title}
                    </h4>
                  )}

                  <div className="space-y-1 px-3">
                    {section.items.map((item, id) => {
                      const isActive = pathname === item.href
                      const Icon = getIconComponent(item.icon)

                      return (
                        <Link
                          key={id}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                            isActive
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      )
                    })}
                  </div>

                  {sectionId < navItems.length - 1 && (
                    <Separator className="mx-4 my-3" />
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>
        </div>

        {/* User Info At Bottom */}
        {userInfo && (
          <div className="border-t px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{userInfo.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userInfo.role
                    ? userInfo.role.toLocaleLowerCase().replace("_", " ")
                    : "User"}
                </p>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
