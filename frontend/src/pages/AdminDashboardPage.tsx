import { useGetPendingListings, useApproveListing, useRejectListing } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { type Listing, AnimalCategory } from '../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Clock, MapPin, Tag, User, Crown, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_LABELS: Record<AnimalCategory, string> = {
  [AnimalCategory.dog]: '🐕 Dog',
  [AnimalCategory.cat]: '🐈 Cat',
  [AnimalCategory.bird]: '🦜 Bird',
  [AnimalCategory.fish]: '🐟 Fish',
  [AnimalCategory.reptile]: '🦎 Reptile',
  [AnimalCategory.smallAnimal]: '🐹 Small Animal',
  [AnimalCategory.other]: '🐾 Other',
  [AnimalCategory.cow]: '🐄 Cow',
  [AnimalCategory.buffalo]: '🐃 Buffalo',
  [AnimalCategory.goat]: '🐐 Goat',
  [AnimalCategory.sheep]: '🐑 Sheep',
};

function formatPrincipal(principal: { toString(): string }): string {
  const str = principal.toString();
  if (str.length <= 16) return str;
  return `${str.slice(0, 8)}...${str.slice(-6)}`;
}

function PendingListingCard({ listing }: { listing: Listing }) {
  const { mutateAsync: approve, isPending: isApproving } = useApproveListing();
  const { mutateAsync: reject, isPending: isRejecting } = useRejectListing();
  const isActing = isApproving || isRejecting;

  const handleApprove = async () => {
    try {
      await approve(listing.id);
      toast.success(`"${listing.title}" has been approved and is now live.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve listing.';
      toast.error(message);
    }
  };

  const handleReject = async () => {
    try {
      await reject(listing.id);
      toast.success(`"${listing.title}" has been rejected.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject listing.';
      toast.error(message);
    }
  };

  const firstPhoto = listing.photoUrls[0];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {firstPhoto ? (
          <img
            src={firstPhoto}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
            <Tag className="w-12 h-12" />
          </div>
        )}
        {listing.isVip && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            <Crown className="w-3 h-3" />
            VIP
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs font-semibold">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-2">
            {listing.title}
          </h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{listing.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Tag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{CATEGORY_LABELS[listing.category]}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-primary col-span-2">
            <span className="text-base">₹{listing.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="font-mono truncate">{formatPrincipal(listing.owner)}</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Submitted: {new Date(Number(listing.timestamp) / 1_000_000).toLocaleString()}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            onClick={handleApprove}
            disabled={isActing}
            className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
          >
            {isApproving ? (
              <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Approve
          </Button>
          <Button
            onClick={handleReject}
            disabled={isActing}
            variant="destructive"
            className="flex-1 gap-2"
            size="sm"
          >
            {isRejecting ? (
              <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: pendingListings, isLoading, isError } = useGetPendingListings();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Admin Access Required
        </h2>
        <p className="text-muted-foreground max-w-sm">
          You must be logged in as an admin to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Review and moderate new listings before they go live on Pashu Mandi.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-4 mb-8 flex items-center gap-3">
        <Clock className="w-5 h-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isLoading
              ? 'Loading pending listings...'
              : `${pendingListings?.length ?? 0} listing${(pendingListings?.length ?? 0) !== 1 ? 's' : ''} awaiting review`}
          </p>
          <p className="text-xs text-muted-foreground">
            Approve to make a listing public, or reject to remove it from the queue.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldAlert className="w-12 h-12 text-destructive/50 mb-4" />
          <h3 className="font-semibold text-foreground mb-1">Access Denied</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            You don't have permission to view pending listings. This page is only accessible to the admin.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && pendingListings?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            All caught up!
          </h3>
          <p className="text-muted-foreground max-w-sm">
            No pending listings to review. New submissions will appear here for your approval.
          </p>
        </div>
      )}

      {/* Listings Grid */}
      {!isLoading && !isError && pendingListings && pendingListings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingListings.map((listing) => (
            <PendingListingCard key={listing.id.toString()} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
