import { useState } from "react";
import {
  useGetAllListingsAdmin,
  useGetAllMobileNumbers,
  useGetAllUsersWithActivity,
  useGetTotalLoginsCount,
  useGetPendingListings,
  useApproveListing,
  useRejectListing,
  useDeleteListingAdmin,
  useGetTotalListingsCount,
  useGetPendingListingsCount,
  useGetApprovedListingsCount,
  useGetTotalUsersCount,
} from "../hooks/useQueries";
import { ListingStatus } from "../backend";
import { Principal } from "@dfinity/principal";
import {
  ShieldCheck,
  Users,
  ListChecks,
  Clock,
  CheckCircle,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Phone,
  LogIn,
  Activity,
  CalendarClock,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex items-center gap-4 shadow-card">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ListingStatus }) {
  if (status === ListingStatus.approved) {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200">
        Approved
      </Badge>
    );
  }
  if (status === ListingStatus.rejected) {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200">
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
      Pending
    </Badge>
  );
}

function formatLastLogin(timestampNs: bigint): string {
  const ms = Number(timestampNs) / 1_000_000;
  if (ms === 0) return "Never";
  try {
    return new Date(ms).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown";
  }
}

function truncatePrincipal(principal: Principal): string {
  const str = principal.toString();
  if (str.length <= 16) return str;
  return `${str.slice(0, 8)}...${str.slice(-4)}`;
}

export default function AdminDashboardPage() {
  const { data: allListings = [], isLoading: listingsLoading } =
    useGetAllListingsAdmin();
  const { data: mobileNumbers = [], isLoading: mobileLoading } =
    useGetAllMobileNumbers();
  const { data: usersWithActivity = [], isLoading: activityLoading } =
    useGetAllUsersWithActivity();
  const { data: totalLogins = BigInt(0) } = useGetTotalLoginsCount();
  const { data: pendingListings = [], isLoading: pendingLoading } =
    useGetPendingListings();
  const { data: totalListingsCount = BigInt(0) } = useGetTotalListingsCount();
  const { data: pendingCount = BigInt(0) } = useGetPendingListingsCount();
  const { data: approvedCount = BigInt(0) } = useGetApprovedListingsCount();
  const { data: totalUsersCount = BigInt(0) } = useGetTotalUsersCount();

  const approveMutation = useApproveListing();
  const rejectMutation = useRejectListing();
  const deleteMutation = useDeleteListingAdmin();

  // Build a map of principal -> mobile number for cross-referencing
  const mobileMap = new Map<string, string>(
    mobileNumbers.map(([p, m]) => [p.toString(), m])
  );

  const [activeTab, setActiveTab] = useState<
    "stats" | "pending" | "all" | "users" | "activity"
  >("stats");

  const tabs = [
    { id: "stats" as const, label: "App Statistics", icon: <BarChart3 size={16} /> },
    {
      id: "pending" as const,
      label: `Pending (${Number(pendingCount)})`,
      icon: <Clock size={16} />,
    },
    {
      id: "all" as const,
      label: `All Listings (${Number(totalListingsCount)})`,
      icon: <ListChecks size={16} />,
    },
    {
      id: "users" as const,
      label: `Registered Users (${Number(totalUsersCount)})`,
      icon: <Users size={16} />,
    },
    {
      id: "activity" as const,
      label: `User Activity (${usersWithActivity.length})`,
      icon: <Activity size={16} />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ShieldCheck size={28} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage listings, users, and platform statistics
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-white border border-border text-foreground hover:bg-primary/10 hover:text-primary"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* App Statistics Tab */}
      {activeTab === "stats" && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Platform Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <StatCard
              icon={<ListChecks size={22} className="text-blue-600" />}
              label="Total Listings"
              value={Number(totalListingsCount)}
              color="bg-blue-50"
            />
            <StatCard
              icon={<Tag size={22} className="text-indigo-600" />}
              label="Total Ads Posted"
              value={allListings.length}
              color="bg-indigo-50"
            />
            <StatCard
              icon={<Clock size={22} className="text-yellow-600" />}
              label="Pending"
              value={Number(pendingCount)}
              color="bg-yellow-50"
            />
            <StatCard
              icon={<CheckCircle size={22} className="text-green-600" />}
              label="Approved"
              value={Number(approvedCount)}
              color="bg-green-50"
            />
            <StatCard
              icon={<Users size={22} className="text-purple-600" />}
              label="Total Users"
              value={Number(totalUsersCount)}
              color="bg-purple-50"
            />
            <StatCard
              icon={<LogIn size={22} className="text-primary" />}
              label="Total Successful Logins"
              value={Number(totalLogins)}
              color="bg-primary/10"
            />
          </div>
        </div>
      )}

      {/* Pending Listings Tab */}
      {activeTab === "pending" && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Pending Listings
          </h2>
          {pendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : pendingListings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Clock size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No pending listings</p>
              <p className="text-sm">All listings have been reviewed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingListings.map((listing) => (
                <div
                  key={listing.id.toString()}
                  className="bg-white rounded-xl border border-border p-4 shadow-card"
                >
                  {listing.photoUrls.length > 0 && (
                    <img
                      src={listing.photoUrls[0]}
                      alt={listing.title}
                      className="w-full h-36 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <h3 className="font-semibold text-foreground truncate">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate mb-1">
                    {listing.location}
                  </p>
                  <p className="text-primary font-bold mb-3">
                    ₹{Number(listing.price).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3 break-all">
                    Owner: {listing.owner.toString().slice(0, 20)}...
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => approveMutation.mutate(listing.id)}
                      disabled={
                        approveMutation.isPending &&
                        approveMutation.variables === listing.id
                      }
                    >
                      <ThumbsUp size={14} className="mr-1" />
                      {approveMutation.isPending &&
                      approveMutation.variables === listing.id
                        ? "Approving..."
                        : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => rejectMutation.mutate(listing.id)}
                      disabled={
                        rejectMutation.isPending &&
                        rejectMutation.variables === listing.id
                      }
                    >
                      <ThumbsDown size={14} className="mr-1" />
                      {rejectMutation.isPending &&
                      rejectMutation.variables === listing.id
                        ? "Rejecting..."
                        : "Reject"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Listings Tab */}
      {activeTab === "all" && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            All Listings Management
          </h2>
          {listingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : allListings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ListChecks size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No listings found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allListings.map((listing) => (
                <div
                  key={listing.id.toString()}
                  className="bg-white rounded-xl border border-border p-4 shadow-card"
                >
                  {listing.photoUrls.length > 0 && (
                    <img
                      src={listing.photoUrls[0]}
                      alt={listing.title}
                      className="w-full h-36 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-foreground truncate flex-1 mr-2">
                      {listing.title}
                    </h3>
                    <StatusBadge status={listing.status} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate mb-1">
                    {listing.location}
                  </p>
                  <p className="text-primary font-bold mb-2">
                    ₹{Number(listing.price).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3 break-all">
                    Owner: {listing.owner.toString().slice(0, 20)}...
                  </p>
                  <div className="flex gap-2">
                    {listing.status !== ListingStatus.approved && (
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => approveMutation.mutate(listing.id)}
                        disabled={approveMutation.isPending}
                      >
                        <ThumbsUp size={14} className="mr-1" />
                        Approve
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{listing.title}". This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={() => deleteMutation.mutate(listing.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Registered Users Tab (Mobile Numbers) */}
      {activeTab === "users" && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Registered Users — Mobile Numbers
          </h2>
          {mobileLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : mobileNumbers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No registered users with mobile numbers</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      #
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Principal ID
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      <div className="flex items-center gap-1">
                        <Phone size={14} />
                        Mobile Number
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mobileNumbers.map(([principal, mobile], index) => (
                    <tr
                      key={principal.toString()}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground break-all max-w-xs">
                        {principal.toString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {mobile}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* User Activity Tab */}
      {activeTab === "activity" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              User Activity — Login Tracking
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5">
              <Activity size={14} className="text-primary" />
              <span>{usersWithActivity.length} users tracked</span>
            </div>
          </div>

          {activityLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : usersWithActivity.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Activity size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No user activity data yet</p>
              <p className="text-sm">Activity will appear once users log in.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border overflow-x-auto shadow-card">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      #
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Principal ID
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        Name
                      </div>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      <div className="flex items-center gap-1">
                        <Phone size={14} />
                        Mobile Number
                      </div>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarClock size={14} />
                        Last Login
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithActivity.map(([principal, displayName, lastLoginTime], index) => {
                    const principalStr = principal.toString();
                    const mobile = mobileMap.get(principalStr) ?? "—";
                    return (
                      <tr
                        key={principalStr}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {truncatePrincipal(principal)}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {displayName || "—"}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {mobile}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatLastLogin(lastLoginTime)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
