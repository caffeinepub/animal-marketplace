import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetMobileNumber, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle, User, LogIn, LogOut, Menu, X, UserPlus, HeadphonesIcon, Phone, Heart, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isAuthenticated = !!identity;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: mobileNumber, isLoading: mobileLoading } = useGetMobileNumber();
  const { data: isAdmin } = useIsCallerAdmin();
  const showSignUpLink = isAuthenticated && !mobileLoading && !mobileNumber;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { to: '/', label: 'Browse', icon: null },
    { to: '/post-ad', label: 'Post Ad', icon: <Plus className="w-4 h-4" /> },
    { to: '/messages', label: 'Messages', icon: <MessageCircle className="w-4 h-4" /> },
    { to: '/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { to: '/helpline', label: 'Helpline', icon: <HeadphonesIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-50 shadow-md"
        style={{
          position: 'sticky',
          backgroundImage: 'url(/assets/FB_IMG_1771449311220-1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/70 pointer-events-none" style={{ zIndex: 0 }} />

        <div className="relative container mx-auto px-4 h-16 flex items-center justify-between" style={{ zIndex: 1 }}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/assets/generated/goat-logo.dim_64x64.png"
              alt="Pashu Mandi"
              className="w-9 h-9 rounded-full object-cover"
            />
            <span className="font-display font-bold text-xl text-white group-hover:text-white/90 transition-colors drop-shadow-md">
              Pashu Mandi
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  currentPath === link.to
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  currentPath === '/admin'
                    ? 'bg-white/20 text-white'
                    : 'text-yellow-200 hover:text-white hover:bg-white/10'
                )}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Link>
            )}
            {showSignUpLink && (
              <Link
                to="/signup"
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  currentPath === '/signup'
                    ? 'bg-white/20 text-white'
                    : 'text-yellow-200 hover:text-white hover:bg-white/10'
                )}
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Link>
            )}
          </nav>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant={isAuthenticated ? 'outline' : 'secondary'}
              size="sm"
              className={cn(
                'gap-2',
                isAuthenticated
                  ? 'border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white'
                  : 'bg-white text-primary hover:bg-white/90'
              )}
            >
              {isLoggingIn ? (
                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : isAuthenticated ? (
                <LogOut className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="relative md:hidden border-t border-white/20 bg-black/80 px-4 py-3 flex flex-col gap-1" style={{ zIndex: 1 }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  currentPath === link.to
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  currentPath === '/admin'
                    ? 'bg-white/20 text-white'
                    : 'text-yellow-200 hover:text-white hover:bg-white/10'
                )}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Link>
            )}
            {showSignUpLink && (
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  currentPath === '/signup'
                    ? 'bg-white/20 text-white'
                    : 'text-yellow-200 hover:text-white hover:bg-white/10'
                )}
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Link>
            )}
            <div className="pt-2 border-t border-white/20 mt-1">
              <Button
                onClick={() => { handleAuth(); setMobileMenuOpen(false); }}
                disabled={isLoggingIn}
                size="sm"
                className={cn(
                  'w-full gap-2',
                  isAuthenticated
                    ? 'border border-white/40 text-white bg-transparent hover:bg-white/10'
                    : 'bg-white text-primary hover:bg-white/90'
                )}
              >
                {isLoggingIn ? (
                  <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                ) : isAuthenticated ? (
                  <LogOut className="w-4 h-4" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/goat-logo.dim_64x64.png"
                alt="Pashu Mandi"
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="font-display font-semibold text-foreground">Pashu Mandi</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
              <nav className="flex flex-wrap justify-center gap-4">
                <Link to="/" className="hover:text-foreground transition-colors">Browse</Link>
                <Link to="/post-ad" className="hover:text-foreground transition-colors">Post Ad</Link>
                <Link to="/messages" className="hover:text-foreground transition-colors">Messages</Link>
                <Link to="/helpline" className="hover:text-foreground transition-colors">Helpline</Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              </nav>
              <a
                href="tel:7829297025"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                7829297025 / 8431207976
              </a>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              © {new Date().getFullYear()} Built with{' '}
              <Heart className="w-3.5 h-3.5 text-primary fill-primary inline" />{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'pashu-mandi')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline underline-offset-2"
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
