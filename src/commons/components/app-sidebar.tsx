"use client"

import * as React from "react"
import { Frame, PieChart } from "lucide-react"

import { useSession } from "@/commons/context/session-context"
import { NavMain } from "@/commons/components/nav-main"
import { NavUser } from "@/commons/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/commons/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, hasPermission } = useSession()

  const navMain = []

  if (hasPermission("dashboard.view")) {
    navMain.push({
      title: "Dashboard",
      url: "/dashboard",
      icon: PieChart,
    })
  }

  const applicationItems = []
  if (hasPermission("applications.create")) {
    applicationItems.push({
      title: "Create Application",
      url: "/applications/create",
    })
  }
  if (hasPermission("applications.view")) {
    applicationItems.push({
      title: "View Applications",
      url: "/applications",
    })
  }

  if (applicationItems.length > 0) {
    navMain.push({
      title: "Applications",
      icon: Frame,
      items: applicationItems,
    })
  }

  console.log("navMain:", navMain) // Add this line to inspect the navMain array

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
{/*          <img src="/src/assets/abcd.png" alt="Logo" className="h-8 w-8" />*/}
          <span className="text-lg font-semibold opacity-100 transition-opacity duration-300 group-data-[state=collapsed]:opacity-0">
            Prepaid360
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
