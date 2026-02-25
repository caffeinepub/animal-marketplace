import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { useIsAdmin, useIsManagementUser, useIsOwnerUser, useIsCattleTrackerUser } from "../hooks/useQueries";
import {
  Menu,
  X,
  Home,
  PlusCircle,
  MessageSquare,
  User,
  Phone,
  FileText,
  ShieldCheck,
  Activity,
  Heart,
  Settings,
  Eye,
  Tractor,
  LayoutDashboard,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin } = useIsAdmin();
  const isManagementUser = useIsManagementUser();
  const isOwnerUser = useIsOwnerUser();
  const isCattleTrackerUser = useIsCattleTrackerUser();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: "/" });
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { to: "/", label: "Home", icon: <Home size={18} /> },
    { to: "/post-ad", label: "Post Ad", icon: <PlusCircle size={18} /> },
    { to: "/messages", label: "Messages", icon: <MessageSquare size={18} /> },
    { to: "/profile", label: "Profile", icon: <User size={18} /> },
    { to: "/helpline", label: "Helpline", icon: <Phone size={18} /> },
    { to: "/terms", label: "Terms", icon: <FileText size={18} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/assets/generated/goat-logo.dim_64x64.png"
                alt="Pashu Mandi"
                className="h-9 w-9 rounded-lg object-cover"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-display font-bold text-lg text-primary">
                  Pashu Mandi
                </span>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  Buy & Sell Animals
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* ADMIN PANEL button — cattle tracker principal only, desktop */}
              {isCattleTrackerUser && (
                <Link
                  to="/tracker"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors mr-2 shadow-sm"
                  activeProps={{ className: "bg-blue-700" }}
                >
                  <LayoutDashboard size={18} />
                  ADMIN PANEL
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors mr-1"
                  activeProps={{ className: "bg-primary/90" }}
                >
                  <Activity size={18} />
                  View All Activity
                </Link>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  activeProps={{ className: "bg-primary/10 text-primary" }}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors ml-1"
                  activeProps={{ className: "bg-primary/90" }}
                >
                  <ShieldCheck size={18} />
                  Admin Dashboard
                </Link>
              )}
              {isManagementUser && (
                <Link
                  to="/management"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-colors ml-1"
                  activeProps={{ className: "bg-primary/10" }}
                >
                  <Settings size={18} />
                  Management
                </Link>
              )}
              {isOwnerUser && (
                <Link
                  to="/owner-view"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-colors ml-1"
                  activeProps={{ className: "bg-primary/10" }}
                >
                  <Eye size={18} />
                  Owner View
                </Link>
              )}
            </nav>

            {/* Auth Button + Mobile Menu Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAuth}
                disabled={isLoggingIn}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 bg-primary text-white hover:bg-primary/90"
              >
                {isLoggingIn
                  ? "Logging in..."
                  : isAuthenticated
                  ? "Logout"
                  : "Login"}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-foreground hover:bg-muted transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-white shadow-lg">
            <nav className="px-4 py-3 flex flex-col gap-1">

              {/* ── ADMIN PANEL — cattle tracker principal only, at the very top ── */}
              {isCattleTrackerUser && (
                <Link
                  to="/tracker"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors mb-2 shadow-sm"
                  activeProps={{ className: "bg-blue-700" }}
                >
                  <LayoutDashboard size={20} />
                  ADMIN PANEL
                </Link>
              )}

              {/* View All Activity — admin only */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-colors mb-1"
                  activeProps={{ className: "bg-primary/90" }}
                >
                  <Activity size={18} />
                  View All Activity
                </Link>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  activeProps={{ className: "bg-primary/10 text-primary" }}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              {/* Admin Dashboard link in mobile menu */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors mt-1"
                  activeProps={{ className: "bg-primary/90" }}
                >
                  <ShieldCheck size={18} />
                  Admin Dashboard
                </Link>
              )}

              {/* Management link — management user only */}
              {isManagementUser && (
                <Link
                  to="/management"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-colors mt-1"
                  activeProps={{ className: "bg-primary/10" }}
                >
                  <Settings size={18} />
                  Management
                </Link>
              )}

              {/* Owner View link — owner principal only */}
              {isOwnerUser && (
                <Link
                  to="/owner-view"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-colors mt-1"
                  activeProps={{ className: "bg-primary/10" }}
                >
                  <Eye size={18} />
                  Owner View
                </Link>
              )}

              {/* Cattle Tracker legacy link — same principal, kept for discoverability */}
              {isCattleTrackerUser && (
                <Link
                  to="/tracker"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors mt-1"
                  activeProps={{ className: "bg-blue-50" }}
                >
                  <Tractor size={18} />
                  Cattle Tracker
                </Link>
              )}

              <div className="pt-2 border-t border-border mt-1">
                <button
                  onClick={() => {
                    handleAuth();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 bg-primary text-white hover:bg-primary/90"
                >
                  {isLoggingIn
                    ? "Logging in..."
                    : isAuthenticated
                    ? "Logout"
                    : "Login"}
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <img
                  src="/assets/generated/goat-logo.dim_64x64.png"
                  alt="Pashu Mandi"
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <span className="font-display font-bold text-primary">
                  Pashu Mandi
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                India's trusted platform for buying and selling animals.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Quick Links
              </h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Browse Animals
                  </Link>
                </li>
                <li>
                  <Link
                    to="/post-ad"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Post an Ad
                  </Link>
                </li>
                <li>
                  <Link
                    to="/helpline"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Helpline
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Contact</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li>📞 7829297025</li>
                <li>📞 8431207976</li>
                <li>✉️ irfankhansingboard1998@gmail.com</li>
                <li>🕐 10 AM – 6 PM</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Pashu Mandi. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Built with{" "}
              <Heart size={12} className="text-red-500 fill-red-500" /> using{" "}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== "undefined"
                    ? window.location.hostname
                    : "pashu-mandi"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
