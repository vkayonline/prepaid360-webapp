import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSession } from "@/commons/context/session-context"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/commons/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/commons/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/commons/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    "full-name": string
    email: string
  }
}) {
  const { isMobile } = useSidebar()
  const { setUser } = useSession()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          device: {
            deviceId: "",
            deviceType: "",
            manufacturer: "",
            os: "",
            osVersion: "",
            appVersion: "",
            ipAddress: "",
            channel: "WEB",
          },
          payload: {},
        }),
      })

      if (response.ok) {
        setUser(null)
        navigate("/login")
      } else {
        alert("Logout failed. Please try again.")
      }
    } catch (error) {
      console.error("Logout error:", error)
      alert("An unexpected error occurred during logout.")
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {user["full-name"]
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user["full-name"]}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {user["full-name"]
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user["full-name"]}
                  </span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
