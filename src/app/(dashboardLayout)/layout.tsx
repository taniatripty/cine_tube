import React, { Suspense } from "react"
import DashboardNavbar, {
  DashboardNavbarSkeleton,
} from "@/app/module/Dashboard/DahboardNavbar"
import DashboardSidebar from "@/app/module/Dashboard/DashboardSidebar"

export default function RootDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Dashboard Sidebar */}
      <Suspense
        fallback={
          <div className="hidden md:flex h-full w-64 border-r bg-card animate-pulse" />
        }
      >
        <DashboardSidebar />
      </Suspense>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* DashboardNavbar wrapped in Suspense to enable streaming and prevent blocking prerender */}
        <Suspense fallback={<DashboardNavbarSkeleton />}>
          <DashboardNavbar />
        </Suspense>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
          <div>{children}</div>
        </main>
      </div>
    </div>
  )
}
