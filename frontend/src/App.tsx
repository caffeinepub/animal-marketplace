import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ListingDetailPage from "./pages/ListingDetailPage";
import PostAdPage from "./pages/PostAdPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import HelplinePage from "./pages/HelplinePage";
import TermsPage from "./pages/TermsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import SignUpPage from "./pages/SignUpPage";
import ManagementPage from "./pages/ManagementPage";
import OwnerViewPage from "./pages/OwnerViewPage";
import CattleTrackerPage from "./pages/CattleTrackerPage";
import { useIsAdmin, useIsManagementUser, useIsOwnerUser, useIsCattleTrackerUser } from "./hooks/useQueries";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

// Suppress unused import warning
void redirect;

// Spinner component for loading states
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// Admin route guard component
function AdminRouteGuard() {
  const { isAdmin, isLoading } = useIsAdmin();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isAdmin) {
        navigate({ to: "/" });
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <AdminDashboardPage />;
}

// Management route guard component
function ManagementRouteGuard() {
  const isManagementUser = useIsManagementUser();
  const { identity, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  // Wait for both 'initializing' and 'logging-in' states to resolve
  const isLoading = loginStatus === "initializing" || loginStatus === "logging-in";

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isManagementUser) {
        navigate({ to: "/" });
      }
    }
  }, [isLoading, isAuthenticated, isManagementUser, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !isManagementUser) {
    return null;
  }

  return <ManagementPage />;
}

// Owner View route guard component
function OwnerViewRouteGuard() {
  const isOwnerUser = useIsOwnerUser();
  const { identity, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  // Wait for both 'initializing' and 'logging-in' states to resolve
  const isLoading = loginStatus === "initializing" || loginStatus === "logging-in";

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isOwnerUser) {
        navigate({ to: "/" });
      }
    }
  }, [isLoading, isAuthenticated, isOwnerUser, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !isOwnerUser) {
    return null;
  }

  return <OwnerViewPage />;
}

// Cattle Tracker route guard component
function CattleTrackerRouteGuard() {
  const isCattleTrackerUser = useIsCattleTrackerUser();
  const { identity, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  // CRITICAL: Must wait for BOTH 'initializing' AND 'logging-in' to resolve
  // before making any access decision. 'initializing' is the initial state
  // before the stored identity is loaded from local storage.
  const isLoading = loginStatus === "initializing" || loginStatus === "logging-in";

  useEffect(() => {
    // Only redirect once auth state is fully resolved (not initializing or logging-in)
    if (!isLoading) {
      if (!isAuthenticated || !isCattleTrackerUser) {
        navigate({ to: "/" });
      }
    }
  }, [isLoading, isAuthenticated, isCattleTrackerUser, navigate]);

  // Show spinner while auth state is loading — never redirect prematurely
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Auth resolved but access denied — return null (redirect triggered by useEffect)
  if (!isAuthenticated || !isCattleTrackerUser) {
    return null;
  }

  return <CattleTrackerPage />;
}

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const listingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listing/$id",
  component: ListingDetailPage,
});

const postAdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post-ad",
  component: PostAdPage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: MessagesPage,
});

const messagesWithPrincipalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages/$principal",
  component: MessagesPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignUpPage,
});

const helplineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/helpline",
  component: HelplinePage,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminRouteGuard,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: UserDashboardPage,
});

const managementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/management",
  component: ManagementRouteGuard,
});

const ownerViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/owner-view",
  component: OwnerViewRouteGuard,
});

const cattleTrackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tracker",
  component: CattleTrackerRouteGuard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  listingDetailRoute,
  postAdRoute,
  messagesRoute,
  messagesWithPrincipalRoute,
  profileRoute,
  signUpRoute,
  helplineRoute,
  termsRoute,
  adminRoute,
  dashboardRoute,
  managementRoute,
  ownerViewRoute,
  cattleTrackerRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
