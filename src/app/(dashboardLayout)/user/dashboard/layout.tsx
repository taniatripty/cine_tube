import { Suspense } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

async function UserAuthGuard() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value

  if (!accessToken) {
    redirect("/login?redirect=/user/dashboard")
  }

  return null
}

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Suspense fallback={null}>
        <UserAuthGuard />
      </Suspense>
      {children}
    </>
  )
}
