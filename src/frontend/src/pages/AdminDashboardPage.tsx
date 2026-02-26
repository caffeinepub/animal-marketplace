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
  RefreshCw,
} from "lucide-react";

// Forced solid styles — overrides any parent transparency
const PAGE_STYLE: React.CSSProperties = {
  background: '#ffffff',
  backgroundColor: '#ffffff',
  opacity: 1,
  visibility: 'visible',
  position: 'relative',
  zIndex: 100,
  minHeight: '100vh',
  padding: '16px 16px 120px 16px',
  pointerEvents: 'auto',
};

const BTN_APPROVE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  flex: 1,
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: 700,
  background: '#16a34a',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  pointerEvents: 'auto',
  zIndex: 9999,
  position: 'relative',
};

const BTN_REJECT: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  flex: 1,
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: 700,
  background: '#dc2626',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  pointerEvents: 'auto',
  zIndex: 9999,
  position: 'relative',
};

const BTN_DELETE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  flex: 1,
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: 700,
  background: '#7f1d1d',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  pointerEvents: 'auto',
  zIndex: 9999,
  position: 'relative',
};

const CARD_STYLE: React.CSSProperties = {
  background: '#ffffff',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '12px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  position: 'relative',
  zIndex: 10,
};

const TAB_ACTIVE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 14px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  background: '#1D4ED8',
  color: '#ffffff',
  border: 'none',
  cursor: 'pointer',
  pointerEvents: 'auto',
  whiteSpace: 'nowrap',
};

const TAB_INACTIVE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 14px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  background: '#ffffff',
  color: '#374151',
  border: '1px solid #d1d5db',
  cursor: 'pointer',
  pointerEvents: 'auto',
  whiteSpace: 'nowrap',
};

const STAT_CARD: React.CSSProperties = {
  background: '#ffffff',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
};

function formatLastLogin(timestampNs: bigint | number): string {
  const ms = typeof timestampNs === 'bigint'
    ? Number(timestampNs) / 1_000_000
    : Number(timestampNs);
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
  const { data: allListings = [], isLoading: listingsLoading, refetch: refetchAll } =
    useGetAllListingsAdmin();
  const { data: mobileNumbers = [], isLoading: mobileLoading } =
    useGetAllMobileNumbers();
  const { data: usersWithActivity = [], isLoading: activityLoading, refetch: refetchActivity } =
    useGetAllUsersWithActivity();
  const { data: totalLogins = BigInt(0) } = useGetTotalLoginsCount();
  const { data: pendingListings = [], isLoading: pendingLoading, refetch: refetchPending } =
    useGetPendingListings();
  const { data: totalListingsCount = BigInt(0) } = useGetTotalListingsCount();
  const { data: pendingCount = BigInt(0) } = useGetPendingListingsCount();
  const { data: approvedCount = BigInt(0) } = useGetApprovedListingsCount();
  const { data: totalUsersCount = BigInt(0) } = useGetTotalUsersCount();

  const approveMutation = useApproveListing();
  const rejectMutation = useRejectListing();
  const deleteMutation = useDeleteListingAdmin();

  const mobileMap = new Map<string, string>(
    mobileNumbers.map(([p, m]) => [p.toString(), m])
  );

  const [activeTab, setActiveTab] = useState<"stats" | "pending" | "all" | "users" | "activity">("pending");

  const tabs = [
    { id: "stats" as const, label: "Stats", icon: <BarChart3 size={15} /> },
    { id: "pending" as const, label: `Pending (${Number(pendingCount)})`, icon: <Clock size={15} /> },
    { id: "all" as const, label: `All Ads (${Number(totalListingsCount)})`, icon: <ListChecks size={15} /> },
    { id: "users" as const, label: `Users (${Number(totalUsersCount)})`, icon: <Users size={15} /> },
    { id: "activity" as const, label: `Activity (${usersWithActivity.length})`, icon: <Activity size={15} /> },
  ];

  function handleRefresh() {
    refetchAll();
    refetchPending();
    refetchActivity();
  }

  return (
    <div style={PAGE_STYLE}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#EFF6FF', padding: '8px', borderRadius: '10px' }}>
            <ShieldCheck size={26} color="#1D4ED8" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>Admin Dashboard</h1>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Manage listings, users, and activity</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#374151', pointerEvents: 'auto' }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={activeTab === tab.id ? TAB_ACTIVE : TAB_INACTIVE}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== STATS TAB ===== */}
      {activeTab === "stats" && (
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>Platform Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {[
              { label: 'Total Listings', value: Number(totalListingsCount), icon: <ListChecks size={20} color="#2563EB" />, bg: '#EFF6FF' },
              { label: 'Total Ads', value: allListings.length, icon: <Tag size={20} color="#7C3AED" />, bg: '#F5F3FF' },
              { label: 'Pending Review', value: Number(pendingCount), icon: <Clock size={20} color="#D97706" />, bg: '#FFFBEB' },
              { label: 'Approved', value: Number(approvedCount), icon: <CheckCircle size={20} color="#16A34A" />, bg: '#F0FDF4' },
              { label: 'Total Users', value: Number(totalUsersCount), icon: <Users size={20} color="#7C3AED" />, bg: '#F5F3FF' },
              { label: 'Total Logins', value: Number(totalLogins), icon: <LogIn size={20} color="#1D4ED8" />, bg: '#EFF6FF' },
            ].map((stat) => (
              <div key={stat.label} style={STAT_CARD}>
                <div style={{ background: stat.bg, padding: '10px', borderRadius: '8px' }}>{stat.icon}</div>
                <div>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{stat.label}</p>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: 0 }}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== PENDING TAB ===== */}
      {activeTab === "pending" && (
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
            Pending Listings — Approve or Reject
          </h2>
          {pendingLoading ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Loading pending listings...</p>
          ) : pendingListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <Clock size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontWeight: 600, margin: 0 }}>No pending listings</p>
              <p style={{ fontSize: '13px', margin: '4px 0 0' }}>All caught up! Nothing to review.</p>
            </div>
          ) : (
            pendingListings.map((listing) => (
              <div key={listing.id.toString()} style={CARD_STYLE}>
                {listing.photoUrls.length > 0 && (
                  <img
                    src={listing.photoUrls[0]}
                    alt={listing.title}
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{listing.title}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 2px' }}>{listing.location}</p>
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#1D4ED8', margin: '0 0 8px' }}>
                  ₹{Number(listing.price).toLocaleString('en-IN')}
                </p>
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 12px', wordBreak: 'break-all' }}>
                  Owner: {listing.owner.toString().slice(0, 24)}...
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    style={BTN_APPROVE}
                    onClick={() => approveMutation.mutate(listing.id)}
                    disabled={approveMutation.isPending}
                  >
                    <ThumbsUp size={15} />
                    {approveMutation.isPending ? 'Approving...' : 'APPROVE'}
                  </button>
                  <button
                    type="button"
                    style={BTN_REJECT}
                    onClick={() => rejectMutation.mutate(listing.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <ThumbsDown size={15} />
                    {rejectMutation.isPending ? 'Rejecting...' : 'REJECT'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== ALL LISTINGS TAB ===== */}
      {activeTab === "all" && (
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
            All Listings Management
          </h2>
          {listingsLoading ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Loading all listings...</p>
          ) : allListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <ListChecks size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontWeight: 600, margin: 0 }}>No listings yet</p>
            </div>
          ) : (
            allListings.map((listing) => {
              const statusColor = listing.status === ListingStatus.approved
                ? '#16a34a' : listing.status === ListingStatus.rejected
                ? '#dc2626' : '#d97706';
              const statusLabel = listing.status === ListingStatus.approved
                ? 'Approved' : listing.status === ListingStatus.rejected
                ? 'Rejected' : 'Pending';
              return (
                <div key={listing.id.toString()} style={CARD_STYLE}>
                  {listing.photoUrls.length > 0 && (
                    <img
                      src={listing.photoUrls[0]}
                      alt={listing.title}
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0, flex: 1, marginRight: '8px' }}>{listing.title}</h3>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor, background: `${statusColor}15`, padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                      {statusLabel}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 2px' }}>{listing.location}</p>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#1D4ED8', margin: '0 0 8px' }}>
                    ₹{Number(listing.price).toLocaleString('en-IN')}
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {listing.status !== ListingStatus.approved && (
                      <button
                        type="button"
                        style={BTN_APPROVE}
                        onClick={() => approveMutation.mutate(listing.id)}
                        disabled={approveMutation.isPending}
                      >
                        <ThumbsUp size={14} />
                        Approve
                      </button>
                    )}
                    <button
                      type="button"
                      style={BTN_DELETE}
                      onClick={() => {
                        if (window.confirm(`Delete "${listing.title}"? This cannot be undone.`)) {
                          deleteMutation.mutate(listing.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ===== USERS TAB ===== */}
      {activeTab === "users" && (
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
            Registered Users — Mobile Numbers
          </h2>
          {mobileLoading ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Loading users...</p>
          ) : mobileNumbers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <Users size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontWeight: 600, margin: 0 }}>No registered users yet</p>
            </div>
          ) : (
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
              {mobileNumbers.map(([principal, mobile], index) => (
                <div
                  key={principal.toString()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: index < mobileNumbers.length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: '#ffffff',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>User #{index + 1}</p>
                    <p style={{ fontSize: '11px', color: '#d1d5db', margin: 0, fontFamily: 'monospace' }}>
                      {truncatePrincipal(principal)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="#1D4ED8" />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{mobile}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== ACTIVITY TAB ===== */}
      {activeTab === "activity" && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
              User Activity — Login Tracking
            </h2>
            <span style={{ fontSize: '12px', color: '#1D4ED8', background: '#EFF6FF', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
              {usersWithActivity.length} users
            </span>
          </div>
          {activityLoading ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Loading activity...</p>
          ) : usersWithActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <Activity size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontWeight: 600, margin: 0 }}>No activity data yet</p>
              <p style={{ fontSize: '13px', margin: '4px 0 0' }}>Will appear after users log in.</p>
            </div>
          ) : (
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
              {usersWithActivity.map(([principal, displayName, lastLoginTime], index) => {
                const principalStr = principal.toString();
                const mobile = mobileMap.get(principalStr) ?? '—';
                return (
                  <div
                    key={principalStr}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '8px',
                      padding: '12px 16px',
                      borderBottom: index < usersWithActivity.length - 1 ? '1px solid #f3f4f6' : 'none',
                      background: '#ffffff',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>{displayName || '—'}</p>
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, fontFamily: 'monospace' }}>{truncatePrincipal(principal)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={12} color="#1D4ED8" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{mobile}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CalendarClock size={12} color="#6b7280" />
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>{formatLastLogin(lastLoginTime)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
