import type { NavItem, NavSection, UserRole } from "@/types/dashboard.types"

/**
 * Admin navigation items for CineTube management portal
 */
export const adminNavSections: NavSection[] = [
  {
    title: "Overview",
    roles: ["ADMIN"],
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: "LayoutDashboard",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "Media Catalog",
    roles: ["ADMIN"],
    items: [
      {
        title: "Media (Movies & Series)",
        href: "/media",
        icon: "Clapperboard",
        roles: ["ADMIN"],
      },
      {
        title: "Seasons",
        href: "/season",
        icon: "Layers",
        roles: ["ADMIN"],
      },
      {
        title: "Episodes",
        href: "/episode",
        icon: "PlaySquare",
        roles: ["ADMIN"],
      },
      {
        title: "Cast & Crew",
        href: "/person",
        icon: "UserRoundPlus",
        roles: ["ADMIN"],
      },
      {
        title: "Streaming Platforms",
        href: "/streamingPlatform",
        icon: "Tv",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "Community & Feedback",
    roles: ["ADMIN"],
    items: [
      {
        title: "Reviews",
        href: "/review",
        icon: "Star",
        roles: ["ADMIN"],
      },
      {
        title: "Comments",
        href: "/comment",
        icon: "MessageSquare",
        roles: ["ADMIN"],
      },
    ],
  },
]

/**
 * Regular user navigation items for CineTube subscriber dashboard
 */
export const userNavSections: NavSection[] = [
  {
    title: "My Activity",
    roles: ["USER"],
    items: [
      {
        title: "Dashboard",
        href: "/user/dashboard",
        icon: "LayoutDashboard",
        roles: ["USER"],
      },
      {
        title: "My Watchlist",
        href: "/user/dashboard/watchList",
        icon: "BookmarkCheck",
        roles: ["USER"],
      },
      {
        title: "My Purchases",
        href: "/user/dashboard/myPurchase",
        icon: "ShoppingBag",
        roles: ["USER"],
      },
      {
        title: "My Reviews",
        href: "/user/dashboard/review",
        icon: "Star",
        roles: ["USER"],
      },
      {
        title: "My Comments",
        href: "/user/dashboard/comment",
        icon: "MessageSquare",
        roles: ["USER"],
      },
    ],
  },
]

/**
 * Common links displayed at the bottom of the dashboard sidebar
 */
export const commonNavItems: NavItem[] = [
  {
    title: "Explore CineTube",
    href: "/",
    icon: "Compass",
    external: false,
  },
]

/**
 * All dashboard sections grouped together
 */
export const allNavSections: NavSection[] = [
  ...adminNavSections,
  ...userNavSections,
]

/**
 * Flat list of all admin navigation items
 */
export const adminNavItems: NavItem[] = adminNavSections.flatMap(
  (section) => section.items
)

/**
 * Flat list of all user navigation items
 */
export const userNavItems: NavItem[] = userNavSections.flatMap(
  (section) => section.items
)

/**
 * Helper function to retrieve navigation sections filtered by role
 *
 * @param role - "ADMIN" | "USER" | undefined
 * @returns Array of NavSection corresponding to the given role
 */
export function getNavSectionsByRole(role?: string): NavSection[] {
  const normalizedRole = role?.toUpperCase() as UserRole | undefined

  if (normalizedRole === "ADMIN") {
    return adminNavSections
  }

  if (normalizedRole === "USER") {
    return userNavSections
  }

  return userNavSections
}

/**
 * Helper function to retrieve a flat list of navigation items filtered by role
 *
 * @param role - "ADMIN" | "USER" | undefined
 * @returns Array of NavItem corresponding to the given role
 */
export function getNavItemsByRole(role?: string): NavItem[] {
  const normalizedRole = role?.toUpperCase() as UserRole | undefined

  if (normalizedRole === "ADMIN") {
    return adminNavItems
  }

  if (normalizedRole === "USER") {
    return userNavItems
  }

  return userNavItems
}
