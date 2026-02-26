import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ListingDetailPage from './pages/ListingDetailPage';
import PostAdPage from './pages/PostAdPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import SignUpPage from './pages/SignUpPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserDashboardPage from './pages/UserDashboardPage';
import HelplinePage from './pages/HelplinePage';
import TermsPage from './pages/TermsPage';
import ManagementPage from './pages/ManagementPage';
import OwnerViewPage from './pages/OwnerViewPage';
import CattleTrackerPage from './pages/CattleTrackerPage';

// The specific admin principal allowed to access /tracker and /admin
const CATTLE_TRACKER_PRINCIPAL = 'rhoqt-xhqg1-66ofc-khas4-fm4w6-73h56-vt55b-5bfnp-adgps-qxwoy-iqe';
const ADMIN_PRINCIPAL = 'rhoqt-xhqg1-66ofc-khas4-fm4w6-73h56-vt55b-5bfnp-adgps-qxwoy-iqe';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }
  if (!identity) {
    window.location.href = '/signup';
    return null;
  }
  return <>{children}</>;
}

function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();

  // Only wait for the very initial auth check — no backend calls needed
  if (isInitializing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fff' }}>
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  // Not logged in — redirect to signup
  if (!identity) {
    window.location.href = '/signup';
    return null;
  }

  // FORCE ACCESS: Check principal directly — no backend call, no delay
  const principalStr = identity.getPrincipal().toText();
  const isPrincipalAdmin = principalStr === ADMIN_PRINCIPAL;

  if (!isPrincipalAdmin) {
    // Not the admin principal — redirect to home
    window.location.href = '/';
    return null;
  }

  // Principal matches — grant access immediately
  return <>{children}</>;
}

function ManagementRouteGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing, loginStatus } = useInternetIdentity();
  const isLoadingAuth = isInitializing || loginStatus === 'logging-in';

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!identity) {
    window.location.href = '/signup';
    return null;
  }

  return <>{children}</>;
}

function OwnerViewRouteGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing, loginStatus } = useInternetIdentity();
  const isLoadingAuth = isInitializing || loginStatus === 'logging-in';

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!identity) {
    window.location.href = '/signup';
    return null;
  }

  return <>{children}</>;
}

function CattleTrackerRouteGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing, loginStatus } = useInternetIdentity();

  // Show spinner while auth state is still loading — prevents premature redirect
  const isLoadingAuth = isInitializing || loginStatus === 'logging-in';

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <p className="text-sm text-gray-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not logged in at all
  if (!identity) {
    window.location.href = '/signup';
    return null;
  }

  // Check principal directly from identity context — no async backend call needed
  const callerPrincipal = identity.getPrincipal().toText();

  // Allow the designated cattle tracker principal
  if (callerPrincipal !== CATTLE_TRACKER_PRINCIPAL) {
    window.location.href = '/';
    return null;
  }

  return <>{children}</>;
}

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const listingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/listing/$id',
  component: ListingDetailPage,
});

const postAdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/post-ad',
  component: PostAdPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages',
  component: MessagesPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignUpPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AdminRouteGuard>
      <AdminDashboardPage />
    </AdminRouteGuard>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <AuthGuard>
      <UserDashboardPage />
    </AuthGuard>
  ),
});

const helplineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/helpline',
  component: HelplinePage,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: TermsPage,
});

const managementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/management',
  component: () => (
    <ManagementRouteGuard>
      <ManagementPage />
    </ManagementRouteGuard>
  ),
});

const ownerViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner-view',
  component: () => (
    <OwnerViewRouteGuard>
      <OwnerViewPage />
    </OwnerViewRouteGuard>
  ),
});

const cattleTrackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tracker',
  component: () => (
    <CattleTrackerRouteGuard>
      <CattleTrackerPage />
    </CattleTrackerRouteGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  listingDetailRoute,
  postAdRoute,
  profileRoute,
  messagesRoute,
  signupRoute,
  adminRoute,
  dashboardRoute,
  helplineRoute,
  termsRoute,
  managementRoute,
  ownerViewRoute,
  cattleTrackerRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
