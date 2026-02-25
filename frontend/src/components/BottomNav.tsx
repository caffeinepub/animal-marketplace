import { useNavigate, useLocation } from '@tanstack/react-router';
import { Home, MessageCircle, Plus, List, User } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity } = useInternetIdentity();

  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const tabs = [
    {
      label: 'Home',
      icon: Home,
      path: '/',
      onClick: () => navigate({ to: '/' }),
    },
    {
      label: 'Chats',
      icon: MessageCircle,
      path: '/messages',
      onClick: () => {
        if (identity) {
          navigate({ to: '/messages' });
        } else {
          navigate({ to: '/signup' });
        }
      },
    },
    {
      label: 'Sell',
      icon: Plus,
      path: '/post-ad',
      isSell: true,
      onClick: () => navigate({ to: '/post-ad' }),
    },
    {
      label: 'My Ads',
      icon: List,
      path: '/dashboard',
      onClick: () => {
        if (identity) {
          navigate({ to: '/dashboard' });
        } else {
          navigate({ to: '/signup' });
        }
      },
    },
    {
      label: 'Account',
      icon: User,
      path: '/profile',
      onClick: () => {
        if (identity) {
          navigate({ to: '/profile' });
        } else {
          navigate({ to: '/signup' });
        }
      },
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
      style={{ zIndex: 999 }}
    >
      <div className="max-w-2xl mx-auto flex items-end justify-around px-2" style={{ height: '60px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          if (tab.isSell) {
            return (
              <button
                key={tab.label}
                onClick={tab.onClick}
                className="flex flex-col items-center justify-end pb-1 relative"
                style={{
                  zIndex: 999,
                  pointerEvents: 'auto',
                  position: 'relative',
                  marginBottom: '0px',
                }}
                aria-label="Sell"
              >
                {/* Outer yellow/gold ring — pointer-events-none so it doesn't block siblings */}
                <div
                  className="absolute flex items-center justify-center rounded-full"
                  style={{
                    width: '72px',
                    height: '72px',
                    bottom: '8px',
                    background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #FBBF24 100%)',
                    boxShadow: '0 4px 16px rgba(251,191,36,0.5), 0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 999,
                    pointerEvents: 'none',
                  }}
                >
                  {/* Inner blue button — pointer-events-none, parent button handles click */}
                  <div
                    className="flex flex-col items-center justify-center rounded-full bg-primary text-white"
                    style={{
                      width: '62px',
                      height: '62px',
                      border: '3px solid #1D4ED8',
                      pointerEvents: 'none',
                    }}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-[10px] font-bold leading-none mt-0.5">Sell</span>
                  </div>
                </div>
                {/* Spacer to keep layout */}
                <div style={{ width: '72px', height: '72px', visibility: 'hidden' }} />
              </button>
            );
          }

          return (
            <button
              key={tab.label}
              onClick={tab.onClick}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors h-full ${
                active ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{
                zIndex: 999,
                pointerEvents: 'auto',
                position: 'relative',
              }}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-gray-500'}`} />
              <span className={`text-xs mt-0.5 font-medium ${active ? 'text-primary' : 'text-gray-500'}`}>
                {tab.label}
              </span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
