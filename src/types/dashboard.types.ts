export type UserRole = "ADMIN" | "USER"

export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  disabled?: boolean
  external?: boolean
  roles?: UserRole[]
  children?: NavItem[]
}

export interface NavSection {
  title?: string
  roles?: UserRole[]
  items: NavItem[]
}

export interface DashboardUser {
  id?: string
  name: string
  email: string
  role?: UserRole | string
  image?: string | null
}
