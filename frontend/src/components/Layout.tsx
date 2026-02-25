import React, { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X, Shield, BarChart2, Eye, Tractor, HelpCircle, FileText, UserPlus } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { useIsAdmin } from "../hooks/useQueries";
import { useIsManagementUser, useIsOwnerUser, useIsCattleTrackerUser } from "../hooks/useQueries";
import BottomNav from "./BottomNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { isAdmin } = useIsAdmin();
  const isManagement = useIsManagementUser();
  const isOwner = useIsOwnerUser();
  const isCattleTracker = useIsCattleTrackerUser();

  const hasPrivilegedAccess = isAdmin || isManagement || isOwner || isCattleTracker;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: "/" });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const navLinkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-white/20 text-white"
        : "text-white/80 hover:text-white hover:bg-white/10"
    }`;

  const mobileNavLinkClass = (path: string) =>
    `flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-primary/10 text-primary"
        : "text-foreground/70 hover:text-foreground hover:bg-muted"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header — clean solid Professional Blue, OLX-style */}
      <header className="sticky top-0 z-50 bg-primary shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img
                src="/assets/generated/app-logo.dim_64x64.png"
                alt="Animal Pashu Bazar"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/40 shadow"
              />
              <span className="font-display font-bold text-lg text-white leading-tight hidden sm:block">
                Animal Pashu Bazar
              </span>
            </Link>

            {/* Desktop Nav — only privileged items */}
            {hasPrivilegedAccess && (
              <nav className="hidden md:flex items-center gap-1">
                {isAuthenticated && isAdmin && (
                  <Link to="/admin" className={navLinkClass("/admin")}>
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                {isAuthenticated && isManagement && (
                  <Link to="/management" className={navLinkClass("/management")}>
                    <BarChart2 className="w-4 h-4" />
                    Management
                  </Link>
                )}
                {isAuthenticated && isOwner && (
                  <Link to="/owner-view" className={navLinkClass("/owner-view")}>
                    <Eye className="w-4 h-4" />
                    Owner View
                  </Link>
                )}
                {isAuthenticated && isCattleTracker && (
                  <Link to="/tracker" className={navLinkClass("/tracker")}>
                    <Tractor className="w-4 h-4" />
                    Cattle Tracker
                  </Link>
                )}
              </nav>
            )}

            {/* Desktop Auth + utility links */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/helpline"
                className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Help
              </Link>
              <Link
                to="/terms"
                className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors"
              >
                <FileText className="w-4 h-4" />
                Terms
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="px-4 py-1.5 rounded-lg text-sm font-medium border border-white/60 text-white hover:bg-white/10 transition-colors"
                >
                  Sign Up
                </Link>
              )}
              <button
                onClick={handleAuth}
                disabled={isLoggingIn}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  isAuthenticated
                    ? "bg-white/20 hover:bg-white/30 text-white"
                    : "bg-white hover:bg-white/90 text-primary"
                }`}
              >
                {isLoggingIn ? "Logging in…" : isAuthenticated ? "Logout" : "Login"}
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-primary px-4 py-3 space-y-1">
            <Link
              to="/helpline"
              className={mobileNavLinkClass("/helpline")}
              onClick={() => setMobileMenuOpen(false)}
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </Link>
            <Link
              to="/terms"
              className={mobileNavLinkClass("/terms")}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText className="w-4 h-4" />
              Terms
            </Link>

            {/* Privileged nav items in mobile menu */}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={mobileNavLinkClass("/admin")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
            {isAuthenticated && isManagement && (
              <Link
                to="/management"
                className={mobileNavLinkClass("/management")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart2 className="w-4 h-4" />
                Management
              </Link>
            )}
            {isAuthenticated && isOwner && (
              <Link
                to="/owner-view"
                className={mobileNavLinkClass("/owner-view")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Eye className="w-4 h-4" />
                Owner View
              </Link>
            )}
            {isAuthenticated && isCattleTracker && (
              <Link
                to="/tracker"
                className={mobileNavLinkClass("/tracker")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Tractor className="w-4 h-4" />
                Cattle Tracker
              </Link>
            )}

            <div className="pt-2 border-t border-white/20 space-y-2">
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium border border-white/60 text-white hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              )}
              <button
                onClick={handleAuth}
                disabled={isLoggingIn}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  isAuthenticated
                    ? "bg-white/20 hover:bg-white/30 text-white"
                    : "bg-white hover:bg-white/90 text-primary"
                }`}
              >
                {isLoggingIn ? "Logging in…" : isAuthenticated ? "Logout" : "Login"}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content — extra bottom padding for fixed bottom nav */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/20">
                <img
                  src="/assets/generated/app-logo.dim_64x64.png"
                  alt="Animal Pashu Bazar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-display font-semibold text-sm text-foreground">Animal Pashu Bazar</p>
                <p className="text-xs text-muted-foreground">Version 49</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link to="/helpline" className="hover:text-foreground transition-colors">
                Helpline
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>

            {/* Attribution */}
            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} Animal Pashu Bazar. Built with{" "}
              <span className="text-destructive">♥</span> using{" "}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.hostname : "animal-pashu-bazar"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
