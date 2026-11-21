import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { getCurrentUserAction } from "@/services/auth.services"
import DashboardNavbarContent, {
  DashboardNavbarSkeleton,
  type DashboardNavbarUser,
} from "./DashboardNavbarContent"

export default async function DashboardNavbar() {
  let user: DashboardNavbarUser | null = null

  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    const currentUser = await getCurrentUserAction()

    if (currentUser) {
      let role: string | undefined

      if (accessToken) {
        const decoded = jwt.decode(accessToken)
        if (
          decoded &&
          typeof decoded === "object" &&
          typeof (decoded as Record<string, unknown>).role === "string"
        ) {
          role = (decoded as Record<string, unknown>).role as string
        }
      }

      user = {
        name: currentUser.name,
        email: currentUser.email,
        role,
      }
    }
  } catch (error) {
    console.error("Failed to load dashboard navbar user:", error)
  }

  return <DashboardNavbarContent user={user} />
}

export { DashboardNavbar, DashboardNavbarSkeleton }
