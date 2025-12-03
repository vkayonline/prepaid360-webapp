import { AppSidebar } from "@/commons/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/commons/components/ui/breadcrumb"
import { Separator } from "@/commons/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/commons/components/ui/sidebar"
import { Toaster } from "@/commons/components/ui/toaster"
import React from "react"
import { Link, useLocation } from "react-router-dom"

const breadcrumbNameMap: { [key: string]: string } = {
  "/dashboard": "Dashboard",
  "/applications": "Applications",
  "/applications/create": "Create Application",
}

function DynamicBreadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split("/").filter((x) => x)

  if (pathnames.length === 0) {
    return null // Don't render anything for the root path
  }

  return (
    <BreadcrumbList>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`
        const isLast = index === pathnames.length - 1
        const name = breadcrumbNameMap[to] || value

        return (
          <React.Fragment key={to}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage>{name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={to}>{name}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator />}
          </React.Fragment>
        )
      })}
    </BreadcrumbList>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <DynamicBreadcrumb />
            </Breadcrumb>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  )
}
