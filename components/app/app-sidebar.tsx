import { Calendar, Home, Utensils, Settings, DollarSign , User2 } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
    {
    title: "Users",
    url: "/users",
    icon: User2,
  },
  {
    title: "Resturants",
    url: "/Resturants",
    icon: Utensils,
  },
  {
    title: "Announcements",
    url: "/Announcements",
    icon: Calendar,
  },
  {
    title: "Payments",
    url: "/Payments",
    icon: DollarSign,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel
            className="
  flex items-center justify-center w-full py-3 px-4 rounded-lg backdrop-blur-md bg-background/80 border border-border/50 font-display font-bold  text-xl  text-center  bg-clip-text  text-transparent  text-gradient shadow-sm transition-colors hover:bg-background/90"
          >
            MealSync
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
