import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import BottomNav from './BottomNav';
import { Heart } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const appId = typeof window !== 'undefined' ? encodeURIComponent(window.location.hostname) : 'animal-pashu-bazar';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white sticky top-0 z-40 shadow-md" style={{ pointerEvents: 'auto' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <img
              src="/assets/generated/app-logo.dim_64x64.png"
              alt="Animal Pashu Bazar Logo"
              className="h-9 w-9 rounded-full object-cover border-2 border-white/30"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col items-start">
              <span className="font-display font-bold text-base leading-tight">🐄 Animal Pashu Bazar</span>
              <span className="text-xs text-white/70 leading-tight">Buy & Sell Animals</span>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">v55</span>
            {identity && (
              <button
                onClick={() => navigate({ to: '/admin' })}
                className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500 pb-24">
        <p>© {new Date().getFullYear()} Animal Pashu Bazar — Version 55</p>
        <p className="mt-1">
          Built with <Heart className="inline h-3 w-3 text-red-500 fill-red-500" /> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
