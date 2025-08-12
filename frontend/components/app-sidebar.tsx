"use client"

import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Network,
  MessageSquare,
  Settings,
  User,
  FileText,
  Workflow,
  Zap,
  Database,
  Save,
  FolderOpen,
  Plus,
  Store,
  ChevronDown,
  ChevronUp,
  SparkleIcon,
  DrumIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { WorkflowTemplateDialog } from "@/components/workflow-template-dialog"

export function AppSidebar() {
  const pathname = usePathname()
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [isTaskExpanded, setIsTaskExpanded] = useState(false) // State to track Task expansion

  const mainNavItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      title: "Canvas",
      icon: Network,
      href: "/canvas",
    },
    {
      title: "Chatbot",
      icon: MessageSquare,
      href: "/chatbot",
    },
    {
      title: "Creator",
      icon: SparkleIcon,
      href: "/creator",
    },
    {
      title: "Orchestra",
      icon: DrumIcon,
      href: "/orchestra",
    },
    {
      title: "Marketplace",
      icon: Store,
      href: "/marketplace",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ]


  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Network className="h-6 w-6" />
            <span className="font-bold">AI Workflow Designer</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {pathname === "/canvas" && (
            <>
            </>
          )}
        </SidebarContent>
        <SidebarFooter>
          <div className="p-4 text-xs text-muted-foreground">AI Workflow Designer</div>
        </SidebarFooter>
      </Sidebar>

      <WorkflowTemplateDialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen} />
    </>
  )
}