"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquare, Network } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Header() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Canvas",
      href: "/canvas",
      icon: Network,
    },
    {
      name: "Chatbot",
      href: "/chatbot",
      icon: MessageSquare,
    },
  ]

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Link href="/" className="flex items-center gap-2">
          <Network className="h-6 w-6" />
          <span className="font-bold">AgentFlow</span>
        </Link>
      </div>
      <nav className="ml-auto flex items-center gap-4 md:ml-0 md:gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80",
              pathname === item.href ? "text-foreground" : "text-foreground/60",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden md:block">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}

