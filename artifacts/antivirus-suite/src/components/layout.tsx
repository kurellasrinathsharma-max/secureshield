import { Link, useLocation } from "wouter";
import {
  Shield,
  Search,
  MessageSquareWarning,
  Lock,
  Disc,
  EyeOff,
  Zap,
  Wrench,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "./theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Shield },
  { href: "/scan", label: "Smart Scan", icon: Search },
  { href: "/scam-guardian", label: "Scam Guardian", icon: MessageSquareWarning },
  { href: "/shields", label: "Core Shields", icon: Lock },
  { href: "/rescue-disk", label: "Rescue Disk", icon: Disc },
  { href: "/privacy", label: "Privacy", icon: EyeOff },
  { href: "/performance", label: "Performance", icon: Zap },
  { href: "/security", label: "Security Tools", icon: Wrench },
];

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-border flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border bg-sidebar/50">
          <Shield className="w-8 h-8 text-primary mr-3 shrink-0" />
          <span className="text-xl font-bold tracking-tight">SecureShield</span>
          <Button variant="ghost" size="icon" className="md:hidden ml-auto" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`relative flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200 ${isActive ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  <item.icon className="w-5 h-5 mr-3 shrink-0" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 w-1 h-8 bg-primary-foreground/60 rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-3">
          {/* User avatar */}
          {user && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-secondary/30">
              <Link href="/settings" className="flex items-center gap-3 flex-1 min-w-0 group">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 group-hover:border-primary/60 transition-colors">
                  <span className="text-xs font-bold text-primary">{getInitials(user.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{user.name}</div>
                  <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Settings className="w-2.5 h-2.5" /> Settings
                  </div>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 w-7 h-7 text-muted-foreground hover:text-destructive"
                onClick={logout}
                title="Sign out"
                data-testid="btn-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Theme + version */}
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-sm font-medium text-muted-foreground">Theme</span>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
          <div className="px-2 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>DB Version</span>
              <span className="font-mono">24.11.832</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>App Version</span>
              <span className="font-mono">15.2.1</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Mobile header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 md:hidden">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <span className="text-lg font-bold">SecureShield</span>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{getInitials(user.name)}</span>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
