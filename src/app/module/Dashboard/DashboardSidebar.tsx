import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { getCurrentUserAction } from "@/services/auth.services"
import { getNavSectionsByRole } from "@/lib/navItems"
import type { userInfo } from "@/types/user.types"
import DashboardSidebarContent from "./DashboardSidebarContent"

export default async function DashboardSidebar() {
  let userInfo: userInfo = {
    name: "User",
    email: "",
    role: "USER",
  }

  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value
    const currentUser = await getCurrentUserAction()

    let role = "USER"
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

    if (currentUser) {
      userInfo = {
        name: currentUser.name || "User",
        email: currentUser.email || "",
        role: role || "USER",
      }
    }
  } catch (error) {
    console.error("Failed to load dashboard sidebar user:", error)
  }

  const navItems = getNavSectionsByRole(userInfo.role)
  const dashboardHome =
    userInfo.role?.toUpperCase() === "ADMIN"
      ? "/admin/dashboard"
      : "/user/dashboard"

  return (
    <DashboardSidebarContent
      userInfo={userInfo}
      navItems={navItems}
      dashboardHome={dashboardHome}
    />
  )
}
