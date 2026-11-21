"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { NavSection } from "@/types/dashboard.types";
import type { userInfo } from "@/types/user.types";
import { getIconComponent } from "@/lib/iconMapper";

interface DashboardSidebarContentProps {
  userInfo: userInfo;
  navItems: NavSection[];
  dashboardHome: string;
}

export default function DashboardSidebarContent({
  userInfo,
  navItems,
  dashboardHome,
}: DashboardSidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex h-full w-64 flex-col border-r bg-card">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href={dashboardHome}
          className="flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-90"
          aria-label="CineTube dashboard home"
        >
          <Clapperboard className="size-6 text-red-600" aria-hidden="true" />
          <span className="text-xl font-bold">
            Cine<span className="text-red-600">Tube</span>
          </span>
        </Link>
      </div>

      {/* Navigation Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <nav className="space-y-6 py-3">
            {navItems.map((section, sectionId) => (
              <div key={sectionId} className="space-y-2">
                {section.title && (
                  <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h4>
                )}

                <div className="space-y-1 px-3">
                  {section.items.map((item, id) => {
                    const isActive = pathname === item.href;
                    const Icon = getIconComponent(item.icon);

                    return (
                      <Link
                        href={item.href}
                        key={id}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>

                {sectionId < navItems.length - 1 && (
                  <Separator className="mx-3 my-4" />
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </div>

      {/* User Info At Bottom */}
      <div className="border-t px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-primary">
              {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{userInfo?.name || "User"}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {userInfo?.role
                ? userInfo.role.toLocaleLowerCase().replace("_", " ")
                : "User"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
