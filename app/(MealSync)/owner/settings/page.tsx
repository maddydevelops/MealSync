"use client"
import { useState } from "react";
import { 
  User, 
  Palette, 
  Languages, 
  Info, 
  MessageSquare, 
  UtensilsCrossed,
  Users,
  Clock,
  Bell,
  Shield,
  CreditCard,
  Search
} from "lucide-react";
import SettingCard from "@/components/SettingCard";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const settingsCategories = [
    {
      title: "Profile",
      description: "Edit restaurant profile, logo, and details",
      icon: User,
      category: "profile"
    },
    {
      title: "Menu Management",
      description: "Update dishes, prices, and categories",
      icon: UtensilsCrossed,
      category: "menu"
    },
    {
      title: "Appearance",
      description: "Theme, colors, and display settings",
      icon: Palette,
      category: "appearance"
    },
    {
      title: "Language",
      description: "Select your preferred language",
      icon: Languages,
      category: "language"
    },
    {
      title: "Staff & Permissions",
      description: "Manage team members and roles",
      icon: Users,
      category: "staff"
    },
    {
      title: "Business Hours",
      description: "Set operating hours and holidays",
      icon: Clock,
      category: "hours"
    },
    {
      title: "Notifications",
      description: "Configure alerts and reminders",
      icon: Bell,
      category: "notifications"
    },
    {
      title: "Privacy & Security",
      description: "Data protection and access control",
      icon: Shield,
      category: "privacy"
    },
    {
      title: "Payment & Billing",
      description: "Payment methods and invoices",
      icon: CreditCard,
      category: "billing"
    },
    {
      title: "About",
      description: "App version, terms, and policies",
      icon: Info,
      category: "about"
    },
    {
      title: "Contact Support",
      description: "Get help and report issues",
      icon: MessageSquare,
      category: "support"
    }
  ];

  const filteredSettings = settingsCategories.filter(setting =>
    setting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    setting.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSettingClick = (category: string, title: string) => {
    toast({
      title: `Opening ${title}`,
      description: `Navigating to ${category} settings...`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Restaurant Settings</h1>
          <p className="text-muted-foreground">Manage your restaurant and menu preferences</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Find a setting"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base border-2 focus-visible:ring-primary"
          />
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSettings.map((setting) => (
            <SettingCard
              key={setting.category}
              title={setting.title}
              description={setting.description}
              icon={setting.icon}
              onClick={() => handleSettingClick(setting.category, setting.title)}
            />
          ))}
        </div>

        {filteredSettings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No settings found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
