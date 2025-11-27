"use client";

import * as React from "react";
import {
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  Command,
  FileText,
  Frame,
  Home,
  House,
  LayoutDashboard,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings,
  Settings2,
  SquareTerminal,
  UserRound,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useGetAuthUserQuery } from "@/state/api";


const navItems = [
  { title: "Dashboard", icon: Home, url: "/" },
  { title: "Properties", icon: Building2, url: "/properties", isActive: true },
  { title: "users", icon: Users, url: "/users" },
  { title: "Reports", icon: FileText, url: "/reports" },
  { title: "Analytics", icon: BarChart3, url: "/analytics" },
  { title: "Settings", icon: Settings, url: "/settings" },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: authUser } = useGetAuthUserQuery();

  console.log("authUser in AppSidebar:", authUser);

  const user = {
    name: authUser?.user.firstName + " " + authUser?.user.lastName,
    email: authUser?.user.email,
    avatar: authUser?.user.avatarUrl,
  };

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-white text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow">
                  <Image src={"/favicon.png"} alt="" height={18} width={18} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Ungarn Immo</span>
                  <span className="truncate text-xs">Administration</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        {/* <NavProjects projects={data.projects} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
