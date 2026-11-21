import React, { Suspense } from "react"
import Footer from "@/components/ui/layout/Footer"
import Navbar, { NavbarSkeleton } from "@/components/ui/layout/navbar"

export default function CommonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      {children}
      <Footer />
    </>
  )
}
