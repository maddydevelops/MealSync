"use client";
import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? "w-[95%] lg:w-[90%] mt-4 rounded-full shadow-glow"
          : "w-full mt-0 rounded-none"
      }`}
    >
      <div
        className={`backdrop-blur-md bg-background/80 border border-border/50 transition-all duration-500 ${
          scrolled ? "rounded-full" : "rounded-none"
        }`}
      >
        <div
          className={`container mx-auto flex items-center justify-between transition-all duration-500 ${
            scrolled ? "py-2 px-6" : "py-4 px-4"
          }`}
        >
          {/* Logo */}
          <div
            className={`font-display font-bold text-gradient transition-all duration-500 ${
              scrolled ? "text-xl" : "text-2xl"
            }`}
          >
           MealSync
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("popular")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Menu
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Contact Us
            </button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
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

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              <Button
                onClick={() => router.push("/login")}
                variant="ghost"
                className={`transition-all duration-500 ${
                  scrolled ? "text-xs px-3 h-8" : "text-sm px-4 h-10"
                }`}
              >
                Login
              </Button>
              <Button
                onClick={() => router.push("/signup")}
                className={`transition-all duration-500 ${
                  scrolled ? "text-xs px-3 h-8" : "text-sm px-4 h-10"
                }`}
              >
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 backdrop-blur-md bg-background/95">
            <div className="container mx-auto py-4 px-4 space-y-3">
              <button
                onClick={() => scrollToSection("hero")}
                className="block w-full text-left py-2 text-sm font-medium hover:text-primary transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="block w-full text-left py-2 text-sm font-medium hover:text-primary transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("popular")}
                className="block w-full text-left py-2 text-sm font-medium hover:text-primary transition-colors"
              >
                Menu
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block w-full text-left py-2 text-sm font-medium hover:text-primary transition-colors"
              >
                Contact Us
              </button>
              <div className="pt-3 space-y-2 border-t border-border/50">
                <Button variant="ghost" className="w-full">
                  Login
                </Button>
                <Button className="w-full">Sign Up</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
