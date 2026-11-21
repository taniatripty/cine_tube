import { Suspense } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"



async function AdminAuthGuard() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value

  if (!accessToken) {
    redirect("/login?redirect=/admin/dashboard")
  }

  let role: string | undefined
  try {
    const decoded = jwt.decode(accessToken)
    if (
      decoded &&
      typeof decoded === "object" &&
      typeof (decoded as Record<string, unknown>).role === "string"
    ) {
      role = (decoded as Record<string, unknown>).role as string
    }
  } catch (error) {
    console.error("Token decoding error in admin auth guard:", error)
  }

  // If user is not an admin, forbid access and redirect to user dashboard
  if (role?.toUpperCase() !== "ADMIN") {
    redirect("/user/dashboard")
  }

  return null
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Suspense fallback={null}>
        <AdminAuthGuard />
      </Suspense>
      {children}
    </>
  )
}
