import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  MessageSquare,
  Menu,
  X,
  Building2,
  Globe,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { useClerk } from "@clerk/react";
import { cn } from "@/lib/utils";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/positions", label: "Positions", icon: Briefcase },
  { href: "/interviews", label: "Interviews", icon: Calendar },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
];

function SignOutButton() {
  const { signOut } = useClerk();
  if (!PUBLISHABLE_KEY) return null;
  return (
    <button
      onClick={() => {
        void signOut({ redirectUrl: `${basePath}/sign-in` });
      }}
      data-testid="button-sign-out"
      className="flex items-center gap-2 text-xs text-sidebar-accent-foreground hover:text-sidebar-foreground transition-colors"
    >
      <LogOut className="w-3.5 h-3.5" />
      Sign out
    </button>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-200 lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-sidebar-primary">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground tracking-tight">Vera</p>
            <p className="text-xs text-sidebar-accent-foreground">Talent Acquisition</p>
          </div>
          <button
            data-testid="button-close-sidebar"
            className="ml-auto lg:hidden text-sidebar-accent-foreground hover:text-sidebar-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                data-testid={`nav-${label.toLowerCase()}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}

          <div className="mt-4 pt-4 border-t border-sidebar-border space-y-1">
            <Link
              href="/help"
              data-testid="nav-help"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                location.startsWith("/help")
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
              onClick={() => setMobileOpen(false)}
            >
              <HelpCircle className="w-4 h-4 flex-shrink-0" />
              Ayuda
            </Link>
            <a
              href={`${basePath}/portal`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="nav-portal"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              <Globe className="w-4 h-4 flex-shrink-0" />
              Portal de Candidatos
            </a>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sidebar-border space-y-2">
          <SignOutButton />
          <p className="text-xs text-sidebar-accent-foreground">Vera Hiring Tracker v1.0</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center gap-4 px-4 py-3 bg-card border-b border-border lg:hidden">
          <button
            data-testid="button-open-sidebar"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-foreground">Vera Talent Acquisition</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
