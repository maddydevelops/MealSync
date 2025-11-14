"use client";

import {
  Calendar,
  Home,
  Utensils,
  SubscriptIcon,
  Settings,
  DollarSign,
  User2,
  LogOut,
  Bell,
  Moon,
  Sun,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const menuItems = {
  superadmin: [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Users", url: "/users", icon: User2 },
    { title: "Restaurants", url: "/restaurants", icon: Utensils },
    { title: "Announcement", url: "/announcement", icon: Calendar },
    { title: "chats", url: "/chats", icon: DollarSign },
    { title: "Subscriptions", url: "/subscriptions", icon: SubscriptIcon },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
  owner: [
    { title: "Dashboard", url: "/owner/dashboard", icon: Home },
    { title: "Products", url: "/owner/products", icon: Calendar },
    { title: "Categories", url: "/owner/categories", icon: Settings },

    { title: "Profile", url: "/owner/profile", icon: User2 },
    { title: "chats", url: "/owner/chats", icon: DollarSign },
    { title: "Settings", url: "/owner/settings", icon: Settings },
  ],
};

export function AppSidebar() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [openNotifModal, setOpenNotifModal] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const prevCount = useRef(0); // Track previous notification count

  // 🔔 Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/superadmin/notifications/get");
      const newNotifications = res.data;

      // Play sound if new notifications appear
      if (prevCount.current && newNotifications.length > prevCount.current) {
        const audio = new Audio("/notification.mp3");
        audio.play().catch((err) => console.error("Audio play failed:", err));
      }

      prevCount.current = newNotifications.length;
      setNotifications(newNotifications);

      // Update unread indicator
      setHasUnread(newNotifications.some((n: { read: any; }) => !n.read));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Polling every 15s (or use WebSocket for real-time)
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  if (status === "loading") return null;
  if (!session) {
    router.push("/login");
    return null;
  }

  const role = session?.user?.role;
  const items = menuItems[role as keyof typeof menuItems] || [];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <Sidebar className="h-screen w-64 fixed top-0 left-0 bg-card border-r border-border flex flex-col justify-between">
      <SidebarContent className="flex flex-col h-full justify-between">
        {/* Logo / Brand + Notification + Theme */}
        <div className="px-4 py-6 flex items-center justify-between">
          <SidebarGroupLabel className="flex items-center gap-2 font-bold text-xl text-transparent bg-clip-text text-gradient">
            MealSync
          </SidebarGroupLabel>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <Dialog open={openNotifModal} onOpenChange={setOpenNotifModal}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  {hasUnread && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-card text-card-foreground border border-border shadow-lg">
                <DialogHeader>
                  <DialogTitle>Notifications</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={async () => {
                          try {
                            await axios.post(
                              "/api/superadmin/notifications/read",
                              { id: n.id },
                              { headers: { "Content-Type": "application/json" } }
                            );
                            setNotifications((prev) =>
                              prev.map((item) =>
                                item.id === n.id ? { ...item, read: true } : item
                              )
                            );
                            setHasUnread(
                              notifications.some(
                                (item) => item.id !== n.id && !item.read
                              )
                            );
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className={`p-2 rounded cursor-pointer ${
                          !n.read ? "bg-primary/10" : ""
                        }`}
                      >
                        <p className="text-sm font-semibold">{n.title}</p>
                        <p className="text-xs">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await axios.post("/api/superadmin/notifications/read");
                        setNotifications((prev) =>
                          prev.map((n) => ({ ...n, read: true }))
                        );
                        setHasUnread(false);
                        setOpenNotifModal(false);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                  >
                    Mark All as Read
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setOpenNotifModal(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`rounded-full transition-all duration-500 ${
                scrolled ? "h-8 w-8" : "h-10 w-10"
              }`}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </div>

        {/* Logout Button */}
        <div className="px-4 py-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card text-card-foreground border border-border shadow-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to logout?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You will need to login again to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive border border-muted-foreground hover:bg-destructive/90"
                  onClick={handleLogout}
                >
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
